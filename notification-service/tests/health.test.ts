import { describe, it, expect, beforeEach, afterEach } from "vitest";
import request from "supertest";
import { createApp } from "../src/app.js";

describe("GET /health", () => {
	let app: ReturnType<typeof createApp>["app"];
	let httpServer: ReturnType<typeof createApp>["httpServer"];

	beforeEach(() => {
		({ app, httpServer } = createApp());
	});

	afterEach(
		() =>
			new Promise<void>((resolve) => {
				httpServer.close(() => resolve());
			}),
	);

	it("retourne 200 + status ok", async () => {
		const res = await request(app).get("/health");

		expect(res.status).toBe(200);
		expect(res.body).toEqual({ status: "ok" });
	});
});
