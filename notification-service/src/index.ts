import "dotenv/config";

import express from "express";
import cors from "cors";

import { connectRabbit, safeJson, subscribe } from "./rabbitmq.js";

const app = express();
const port = process.env.PORT || 3003;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

const { connection, channel } = await connectRabbit();

await subscribe({
  channel,
  routingKeys: ["project.completed", "task.reopened", "task.completed", "task.created"],
  onMessage: (msg) => {
    const payload = safeJson(msg);
    const routingKey = msg.fields.routingKey;

    if (routingKey === "project.completed") {
      console.log("[NOTIF] Projet terminé:", payload);
      return;
    }

    if (routingKey === "task.reopened") {
      console.log("[NOTIF] Tâche réouverte:", payload);
      return;
    }

    if (routingKey === "task.completed") {
      console.log("[NOTIF] Tâche complétée:", payload);
      return;
    }

    if (routingKey === "task.created") {
      console.log("[NOTIF] Tâche créée:", payload);
      return;
    }

    console.log("[NOTIF] Event:", routingKey, payload);
  },
});

const server = app.listen(port, () => {
  console.log("notification-service started on port:", port);
});

const shutdown = async () => {
  server.close(() => {});
  await channel.close().catch(() => {});
  await (connection as { close?: () => Promise<void> }).close?.().catch(() => {});
  process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
