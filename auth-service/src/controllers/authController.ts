import type { Request, Response } from "express";
import type { Pool as Connection, ResultSetHeader, RowDataPacket } from "mysql2";
import bcrypt from "bcrypt";

import {
	toPublicUser,
	type LoginInput,
	type RegisterInput,
} from "../models/User.js";
import { createUser,getUserByEmail,normalizeEmail,getUserById,signToken } from "../service/authService.js";

export const createAuthController = (db: Connection) => {
	const register = async (req: Request, res: Response) => {
		const body = req.body as Partial<RegisterInput>;
		if (!body.email || !body.password || !body.firstName || !body.lastName) {
			res.status(400).json({
				message: "email, password, firstName, lastName are required",
				received: {
					contentType: req.header("content-type"),
					keys: Object.keys((req.body ?? {}) as Record<string, unknown>),
				},
			});
			return;
		}

		const email = normalizeEmail(body.email);
		const password = body.password;
		const firstName = body.firstName.trim();
		const lastName = body.lastName.trim();

		// Vérification robustesse du mot de passe
		const passwordValid =
			password.length >= 8 &&
			/[A-Z]/.test(password) &&
			/[a-z]/.test(password) &&
			/[0-9]/.test(password) 
		if (!passwordValid) {
			res.status(400).json({
				message:
					"Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial."
			});
			return;
		}

		const existing = await getUserByEmail(db, email);
		if (existing) {
			res.status(409).json({ message: "Email already registered" });
			return;
		}

		const passwordHash = await bcrypt.hash(password, 10);
		const user = await createUser(db, { email, firstName, lastName, passwordHash });

		const token = signToken({ sub: String(user.id), email: user.email });
		res.status(201).json({ user: toPublicUser(user), token });
	};

	const login = async (req: Request, res: Response) => {
		const body = req.body as Partial<LoginInput>;
		if (!body.email || !body.password) {
			res.status(400).json({
				message: "email and password are required",
				received: {
					contentType: req.header("content-type"),
					keys: Object.keys((req.body ?? {}) as Record<string, unknown>),
				},
			});
			return;
		}

		const email = normalizeEmail(body.email);
		const user = await getUserByEmail(db, email);
		if (!user) {
			res.status(401).json({ message: "Invalid credentials" });
			return;
		}

		const ok = await bcrypt.compare(body.password, user.passwordHash);
		if (!ok) {
			res.status(401).json({ message: "Invalid credentials" });
			return;
		}

		const token = signToken({ sub: String(user.id), email: user.email });
		res.json({ user: toPublicUser(user), token });
	};

	const me = async (req: Request, res: Response) => {
		const auth = req.auth;
		if (!auth) {
			res.status(401).json({ message: "Unauthorized" });
			return;
		}

		const userId = Number(auth.userId);
		if (!Number.isFinite(userId)) {
			res.status(401).json({ message: "Unauthorized" });
			return;
		}

		const user = await getUserById(db, userId);
		if (!user) {
			res.status(404).json({ message: "User not found" });
			return;
		}

		res.json({ user: toPublicUser(user) });
	};

	return { register, login, me };
};

