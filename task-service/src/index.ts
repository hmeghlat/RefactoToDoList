import "dotenv/config";
import connectDB from "./config/bd.js";
import { createApp } from "./app.js";
import { connectRabbit } from "./messaging/rabbitmq.js";
import { createTasksRepository } from "./repository/tasksRepository.js";

const port = process.env.PORT || 3002;

const rabbit = await connectRabbit();
const db = connectDB();
const repo = createTasksRepository(db);
const app = createApp(repo, rabbit);

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
