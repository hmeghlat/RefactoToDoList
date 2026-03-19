import express from "express";
import type { RequestHandler } from "express";
import type { Connection } from "mysql2";

import {
	createProjectController,
	getAllProjectsController,
	getProjectController,
	updateProjectController,
	deleteProjectController,
} from "../controllers/ProjectController.js";

import { createProjectTasksController } from "../controllers/ProjectTasksController.js";

import { requireAuthViaAuthService } from "../middleware/requireAuthViaAuthService.js";

export const ProjectsRouter = (db: Connection, authMiddlewareOverride?: RequestHandler) => {
	const router = express.Router();
	const createController = createProjectController(db);
	const getController = getProjectController(db);
	const getAllController = getAllProjectsController(db);
	const updateController = updateProjectController(db);
	const deleteController = deleteProjectController(db);
	const tasksController = createProjectTasksController(db);

	router.use(authMiddlewareOverride ?? requireAuthViaAuthService);

	router.post("/create", createController.createProject);
	router.get("/", getAllController.getAllProjects);
	router.get("/:id", getController.getProject);
	router.put("/:id", updateController.updateProject);
	router.delete("/:id", deleteController.deleteProject);
	router.post("/:id/tasks", tasksController.createTaskForProject);
	router.get("/:id/tasks", tasksController.listTasksForProject);

	return router;
};

