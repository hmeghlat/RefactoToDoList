import connectDB from "./config/bd.js";
import { createApp } from "./app.js";
import { connectRabbit } from "./messaging/rabbitmq.js";
import { startTaskEventsConsumer } from "./messaging/taskEventsConsumer.js";

const port = process.env.PORT || 3001;
const db = connectDB();
const app = createApp(db);

const server = app.listen(port, () => console.log("serveur demarré sur le port : " + port));

const rabbit = await connectRabbit();
startTaskEventsConsumer({ db, rabbit }).catch((err) => {
	console.error("Failed to start task events consumer:", err);
});

const shutdown = async () => {
	server.close(() => {});
	await rabbit.close().catch(() => {});
	db.end(() => {});
	process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
