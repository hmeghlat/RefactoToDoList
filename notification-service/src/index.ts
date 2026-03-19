import "dotenv/config";

import { createApp } from "./app.js";
import { connectRabbit, safeJson, subscribe } from "./rabbitmq.js";

const port = process.env.PORT || 3003;

const { httpServer, sendNotificationToAllClients } = createApp();

const { connection, channel } = await connectRabbit();

const routingKeys = [
	"project.completed",
	"task.created",
	"task.completed",
	"task.cancelled",
	"task.reopened",
	"task.started",
	"task.deleted",
] as const;

await subscribe({
	channel,
	routingKeys: [...routingKeys],
	onMessage: (msg) => {
		const payload = safeJson(msg);
		const routingKey = msg.fields.routingKey;

		if ((routingKeys as readonly string[]).includes(routingKey)) {
			console.log(`[NOTIF] ${routingKey}:`, payload);
			sendNotificationToAllClients({ type: routingKey, data: payload });
			return;
		}

		console.log("[NOTIF] Event inconnu:", routingKey, payload);
	},
});

httpServer.listen(port, () => {
	console.log("notification-service started on port:", port);
});

const shutdown = async () => {
	httpServer.close(() => {});
	await channel.close().catch(() => {});
	await (connection as { close?: () => Promise<void> }).close?.().catch(() => {});
	process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
