import "dotenv/config";

import express from "express";
import cors from "cors";
import { WebSocketServer } from 'ws';
import http from 'http';
import { connectRabbit, safeJson, subscribe } from "./rabbitmq.js";

const app = express();
const port = process.env.PORT || 3003;
const httpServer = http.createServer(app);

const wss = new WebSocketServer({ server: httpServer });

wss.on('connection', (ws) => {
  console.log('Client connecté');
  ws.send('Connexion WebSocket établie');
});


app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

const { connection, channel } = await connectRabbit();

await subscribe({
  channel,
  routingKeys: [
    "project.completed",
    "task.created",
    "task.completed",
    "task.cancelled",
    "task.reopened",
    "task.started",
    "task.deleted",
  ],
  onMessage: (msg) => {
    const payload = safeJson(msg);
    const routingKey = msg.fields.routingKey;

    const knownKeys = [
      "project.completed",
      "task.created",
      "task.completed",
      "task.cancelled",
      "task.reopened",
      "task.started",
      "task.deleted",
    ];

    if (knownKeys.includes(routingKey)) {
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
// Fonction pour envoyer une notification à tous les clients connectés
export function sendNotificationToAllClients(notification: any) {
  wss.clients.forEach((client) => {
    if (client.readyState === client.OPEN) {
      client.send(JSON.stringify(notification));
    }
  });
}