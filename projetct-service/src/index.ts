//accès a la lib express
import express from "express";
import connectDB from "./config/bd.js";
import cors from "cors";

import { ProjectsRouter } from "./routes/projects.js";
import { connectRabbit } from "./messaging/rabbitmq.js";
import { startTaskEventsConsumer } from "./messaging/taskEventsConsumer.js";


const app = express();
const port = process.env.PORT || 3001;

//connection a la bdd
const db = connectDB();

//middlware qui permet de traiter les données de la requete 
app.use(express.json()); 
app.use(express.urlencoded({extended :false}));
app.use(cors());

app.get("/health", (_req, res) => {
	res.status(200).json({ status: "ok" });
});

app.use("/projects", ProjectsRouter(db));


app.use((err: unknown, req: express.Request, res: express.Response, next: express.NextFunction) => {
	if (err instanceof SyntaxError) {
		res.status(400).json({ message: "Invalid JSON" });
		return;
	}
	next(err);
});



//lancer le serveur 
const server = app.listen(port,() => console.log("serveur demarré sur le port : "+port));

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