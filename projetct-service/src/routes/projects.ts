import express from "express";
import type { Connection } from "mysql2";

import {
	createProjectController,
	getAllProjectsController,
	getProjectController,
} from "../controllers/ProjectController.js";

import { createProjectTasksController } from "../controllers/ProjectTasksController.js";

import { requireAuthViaAuthService } from "../middleware/requireAuthViaAuthService.js";

export const ProjectsRouter = (db: Connection) => {
	const router = express.Router();
	const createController = createProjectController(db);
	const getController = getProjectController(db);
	const getAllController = getAllProjectsController(db);
	const tasksController = createProjectTasksController(db);

	router.use(requireAuthViaAuthService);

	router.post("/create", createController.createProject);
	router.get("/", getAllController.getAllProjects);
	router.get("/:id", getController.getProject);
	router.post("/:id/tasks", tasksController.createTaskForProject);
	router.get("/:id/tasks", tasksController.listTasksForProject);

	return router;
};

