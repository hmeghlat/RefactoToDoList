import express from "express";
import cors from "cors";
import type { Pool as Connection } from "mysql2";
import createAuthRouter from "./routes/auth.js";

export const createApp = (db: Connection) => {
	const app = express();

	app.use(express.json());
	app.use(express.urlencoded({ extended: false }));
	app.use(cors());

	app.get("/health", (_req, res) => {
		res.status(200).json({ status: "ok" });
	});

	app.use("/auth", createAuthRouter(db));

	app.use((err: unknown, req: express.Request, res: express.Response, next: express.NextFunction) => {
		if (err instanceof SyntaxError) {
			res.status(400).json({ message: "Invalid JSON" });
			return;
		}
		next(err);
	});

	return app;
};
