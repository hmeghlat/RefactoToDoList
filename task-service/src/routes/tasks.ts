import { Router } from "express";

import type { RabbitClient } from "../messaging/rabbitmq.js";
import type { TasksRepository } from "../repository/tasksRepository.js";
import { createTaskController } from "../controllers/TaskController.js";

export const createTasksRouter = (params: { rabbit: RabbitClient; repo: TasksRepository }) => {
  const { rabbit, repo } = params;
  const router = Router();

  const controller = createTaskController({ repo, rabbit });

  router.get("/", controller.listTasks);
  router.post("/", controller.createTask);
  router.get("/:id", controller.getTask);
  router.put("/:id", controller.updateTask);
  router.delete("/:id", controller.deleteTask);

  return router;
};
