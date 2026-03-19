import express from "express";
import cors from "cors";
import http from "http";
import { WebSocketServer } from "ws";

export const createApp = () => {
	const app = express();
	app.use(express.json());
	app.use(express.urlencoded({ extended: false }));
	app.use(cors());

	app.get("/health", (_req, res) => {
		res.status(200).json({ status: "ok" });
	});

	const httpServer = http.createServer(app);
	const wss = new WebSocketServer({ server: httpServer });

	wss.on("connection", (ws) => {
		ws.send("Connexion WebSocket établie");
	});

	const sendNotificationToAllClients = (notification: unknown) => {
		wss.clients.forEach((client) => {
			if (client.readyState === client.OPEN) {
				client.send(JSON.stringify(notification));
			}
		});
	};

	return { app, httpServer, wss, sendNotificationToAllClients };
};
