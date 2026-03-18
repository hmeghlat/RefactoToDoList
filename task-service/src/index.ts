import "dotenv/config";

import express from "express";
import cors from "cors";

import { connectRabbit } from "./messaging/rabbitmq.js";
import { createTasksRouter } from "./routes/tasks.js";
import connectDB from "./config/bd.js";
import { createTasksRepository } from "./repository/tasksRepository.js";

const app = express();
const port = process.env.PORT || 3002;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

const rabbit = await connectRabbit();
const db = connectDB();
const repo = createTasksRepository(db);

app.use("/tasks", createTasksRouter({ rabbit, repo }));

const server = app.listen(port, () => {
  console.log("task-service started on port:", port);
});

const shutdown = async () => {
  server.close(() => {});
  await rabbit.close().catch(() => {});
  db.end(() => {});
  process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
