import express from "express";
import cors from "cors";
import type { RabbitClient } from "./messaging/rabbitmq.js";
import type { TasksRepository } from "./repository/tasksRepository.js";
import { createTasksRouter } from "./routes/tasks.js";

export const createApp = (repo: TasksRepository, rabbit: RabbitClient) => {
  const app = express();

  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(cors());

  app.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok" });
  });

  app.use("/tasks", createTasksRouter({ rabbit, repo }));

  app.use((err: unknown, req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (err instanceof SyntaxError) {
      res.status(400).json({ message: "Invalid JSON" });
      return;
    }
    next(err);
  });

  return app;
};
