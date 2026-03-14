import { Router } from "express";
import type { Connection } from "mysql2";

import { createAuthController } from "../controllers/authController.js";
import { requireAuth } from "../middleware/requireAuth.js";

const createAuthRouter = (db: Connection) => {
	const router = Router();
	const controller = createAuthController(db);

	router.post("/register", controller.register);
	router.post("/login", controller.login);
	router.get("/me", requireAuth, controller.me);

	return router;
};

export default createAuthRouter;

