import { describe, it, expect, beforeAll, afterAll } from "vitest";
import type { AddressInfo } from "net";
import { createApp } from "../src/app.js";

interface WsClient {
	ws: WebSocket;
	nextMsg: () => Promise<string>;
	close: () => void;
}

// Crée une connexion WS avec une queue de messages pour éviter les race conditions
const connectWs = (port: number): Promise<WsClient> =>
	new Promise((resolve, reject) => {
		const ws = new globalThis.WebSocket(`ws://localhost:${port}`);
		const queue: string[] = [];
		const waiters: ((s: string) => void)[] = [];

		ws.addEventListener("message", (e: MessageEvent) => {
			const data = typeof e.data === "string" ? e.data : String(e.data);
			if (waiters.length > 0) {
				waiters.shift()!(data);
			} else {
				queue.push(data);
			}
		});

		const nextMsg = (): Promise<string> => {
			if (queue.length > 0) return Promise.resolve(queue.shift()!);
			return new Promise((res) => waiters.push(res));
		};

		ws.onopen = () => resolve({ ws, nextMsg, close: () => ws.close() });
		ws.onerror = (e) => reject(e);
	});

describe("WebSocket", () => {
	let httpServer: ReturnType<typeof createApp>["httpServer"];
	let wss: ReturnType<typeof createApp>["wss"];
	let sendNotificationToAllClients: ReturnType<
		typeof createApp
	>["sendNotificationToAllClients"];
	let port: number;

	beforeAll(
		() =>
			new Promise<void>((resolve) => {
				({ httpServer, wss, sendNotificationToAllClients } = createApp());
				httpServer.listen(0, () => {
					port = (httpServer.address() as AddressInfo).port;
					resolve();
				});
			}),
	);

	afterAll(
		() =>
			new Promise<void>((resolve) => {
				for (const client of wss.clients) {
					client.terminate();
				}
				httpServer.close(() => resolve());
			}),
	);

	it("connexion → message de bienvenue", async () => {
		const client = await connectWs(port);
		const msg = await client.nextMsg();
		client.close();

		expect(msg).toBe("Connexion WebSocket établie");
	});

	it("sendNotificationToAllClients → client reçoit la notification", async () => {
		const client = await connectWs(port);
		await client.nextMsg(); // bienvenue

		const msgPromise = client.nextMsg();
		sendNotificationToAllClients({ type: "task.created", data: { id: 1 } });
		const received = JSON.parse(await msgPromise);
		client.close();

		expect(received).toEqual({ type: "task.created", data: { id: 1 } });
	});

	it("plusieurs clients → tous reçoivent la notification", async () => {
		const [c1, c2] = await Promise.all([connectWs(port), connectWs(port)]);
		await Promise.all([c1.nextMsg(), c2.nextMsg()]); // bienvenus

		const p1 = c1.nextMsg();
		const p2 = c2.nextMsg();
		sendNotificationToAllClients({ type: "project.completed", data: {} });

		const [r1, r2] = await Promise.all([p1, p2]);
		c1.close();
		c2.close();

		expect(JSON.parse(r1).type).toBe("project.completed");
		expect(JSON.parse(r2).type).toBe("project.completed");
	});

	it("client déconnecté ne reçoit pas la notification", async () => {
		const client = await connectWs(port);
		await client.nextMsg(); // bienvenue
		client.close();

		await new Promise((r) => setTimeout(r, 50));

		expect(() =>
			sendNotificationToAllClients({ type: "task.deleted", data: {} }),
		).not.toThrow();
	});
});
