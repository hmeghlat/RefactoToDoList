import type { Request, Response } from "express";
import type { Connection, ResultSetHeader, RowDataPacket } from "mysql2";
import bcrypt from "bcrypt";
import jwt, { type Secret, type SignOptions } from "jsonwebtoken";

import {
	toPublicUser,
	toUser,
	type AuthTokenPayload,
	type LoginInput,
	type RegisterInput,
	type UserRow,
} from "../models/User.js";

type UserRowPacket = RowDataPacket & UserRow;

const getJwtSecret = (): string => {
	const secret = process.env.JWT_SECRET;
	if (!secret) {
		throw new Error("JWT_SECRET is missing in environment");
	}
	return secret;
};

const signToken = (payload: AuthTokenPayload): string => {
	const secret: Secret = getJwtSecret();
	const expiresIn = (process.env.JWT_EXPIRES_IN || "1h") as SignOptions["expiresIn"];
	return jwt.sign(payload, secret, { expiresIn } as SignOptions);
};

const normalizeEmail = (email: string): string => email.trim().toLowerCase();

const getUserByEmail = async (db: Connection, email: string) => {
	const [rows] = await db
		.promise()
		.query<UserRowPacket[]>(
			"SELECT id, email, first_name, last_name, password_hash, created_at FROM users WHERE email = ? LIMIT 1",
			[email]
		);

	const firstRow = rows[0];
	if (!firstRow) return null;
	return toUser(firstRow);
};

const getUserById = async (db: Connection, id: number) => {
	const [rows] = await db
		.promise()
		.query<UserRowPacket[]>(
			"SELECT id, email, first_name, last_name, password_hash, created_at FROM users WHERE id = ? LIMIT 1",
			[id]
		);

	const firstRow = rows[0];
	if (!firstRow) return null;
	return toUser(firstRow);
};

const createUser = async (
	db: Connection,
	input: { email: string; firstName: string; lastName: string; passwordHash: string }
) => {
	const [result] = await db
		.promise()
		.execute<ResultSetHeader>(
			"INSERT INTO users (email, first_name, last_name, password_hash) VALUES (?, ?, ?, ?)",
			[input.email, input.firstName, input.lastName, input.passwordHash]
		);

	const user = await getUserById(db, result.insertId);
	if (!user) {
		throw new Error("User creation failed");
	}
	return user;
};

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

