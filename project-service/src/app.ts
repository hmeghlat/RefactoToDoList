import express from "express";
import cors from "cors";
import type { Connection } from "mysql2";
import type { RequestHandler } from "express";
import { ProjectsRouter } from "./routes/projects.js";

export const createApp = (db: Connection, authMiddlewareOverride?: RequestHandler) => {
	const app = express();

	app.use(express.json());
	app.use(express.urlencoded({ extended: false }));
	app.use(cors());

	app.get("/health", (_req, res) => {
		res.status(200).json({ status: "ok" });
	});

	app.use("/projects", ProjectsRouter(db, authMiddlewareOverride));

	app.use((err: unknown, req: express.Request, res: express.Response, next: express.NextFunction) => {
		if (err instanceof SyntaxError) {
			res.status(400).json({ message: "Invalid JSON" });
			return;
		}
		next(err);
	});

	return app;
};
