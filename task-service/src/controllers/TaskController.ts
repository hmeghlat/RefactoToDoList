import type { Request, Response } from "express";

import type { RabbitClient } from "../messaging/rabbitmq.js";
import type { TasksRepository } from "../repository/tasksRepository.js";

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

const parsePositiveInt = (value: unknown): number | null => {
  if (typeof value === "number") {
    if (!Number.isInteger(value) || value <= 0) return null;
    return value;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed.length === 0) return null;
    const parsed = Number.parseInt(trimmed, 10);
    if (!Number.isFinite(parsed) || parsed <= 0) return null;
    return parsed;
  }

  return null;
};

export const createTaskController = (params: { repo: TasksRepository; rabbit: RabbitClient }) => {
  const { repo, rabbit } = params;

  const listTasks = async (req: Request, res: Response) => {
    try {
      const projectId = parsePositiveInt(req.query.projectId);
      const tasks = await repo.list(projectId ? { projectId } : undefined);
      res.status(200).json({ tasks });
    } catch (error) {
      console.error("listTasks error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };

  const createTask = async (req: Request, res: Response) => {
    try {
      const body = (req.body ?? {}) as Record<string, unknown>;
      const projectId = parsePositiveInt(body.projectId);
      const name = isNonEmptyString(body.name) ? body.name.trim() : "";

      if (!projectId || !name) {
        res.status(400).json({ message: "projectId and name are required" });
        return;
      }

      const task = await repo.create({ projectId, name });
      res.status(201).json({ task });
    } catch (error) {
      console.error("createTask error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };

  const getTask = async (req: Request, res: Response) => {
    try {
      const id = parsePositiveInt(req.params.id);
      if (!id) {
        res.status(400).json({ message: "Invalid task ID" });
        return;
      }

      const task = await repo.getById(id);
      if (!task) {
        res.status(404).json({ message: "Task not found" });
        return;
      }

      res.status(200).json({ task });
    } catch (error) {
      console.error("getTask error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };

  const updateTask = async (req: Request, res: Response) => {
    try {
      const id = parsePositiveInt(req.params.id);
      if (!id) {
        res.status(400).json({ message: "Invalid task ID" });
        return;
      }

      const body = (req.body ?? {}) as Record<string, unknown>;
      const name = body.name !== undefined ? (isNonEmptyString(body.name) ? body.name.trim() : "") : undefined;
      const completed = body.completed !== undefined ? Boolean(body.completed) : undefined;

      if (name !== undefined && !name) {
        res.status(400).json({ message: "name cannot be empty" });
        return;
      }

      const result = await repo.update(id, {
        ...(name !== undefined ? { name } : {}),
        ...(completed !== undefined ? { completed } : {}),
      });

      if (!result) {
        res.status(404).json({ message: "Task not found" });
        return;
      }

      const { before, after } = result;
      if (before.completed !== after.completed) {
        if (after.completed) {
          rabbit.publishEvent({
            type: "TaskCompleted",
            occurredAt: new Date().toISOString(),
            data: { taskId: after.id, projectId: after.projectId },
          });
        } else {
          rabbit.publishEvent({
            type: "TaskReopened",
            occurredAt: new Date().toISOString(),
            data: { taskId: after.id, projectId: after.projectId },
          });
        }
      }

      res.status(200).json({ task: after });
    } catch (error) {
      console.error("updateTask error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };

  const deleteTask = async (req: Request, res: Response) => {
    try {
      const id = parsePositiveInt(req.params.id);
      if (!id) {
        res.status(400).json({ message: "Invalid task ID" });
        return;
      }

      const deleted = await repo.remove(id);
      if (!deleted) {
        res.status(404).json({ message: "Task not found" });
        return;
      }

      res.status(204).send();
    } catch (error) {
      console.error("deleteTask error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };

  return { listTasks, createTask, getTask, updateTask, deleteTask };
};
