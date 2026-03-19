
import jwt, { type Secret, type SignOptions } from "jsonwebtoken";
import { AuthTokenPayload,toUser, UserRow} from "../models/User.js";
import type { Pool as Connection, ResultSetHeader, RowDataPacket } from "mysql2";


type UserRowPacket = RowDataPacket & UserRow;

const getJwtSecret = (): string => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error("JWT_SECRET is missing in environment");
    }
    return secret;
};

export const signToken = (payload: AuthTokenPayload): string => {
    const secret: Secret = getJwtSecret();
    const expiresIn = (process.env.JWT_EXPIRES_IN || "1h") as SignOptions["expiresIn"];
    return jwt.sign(payload, secret, { expiresIn } as SignOptions);
};

export const normalizeEmail = (email: string): string => email.trim().toLowerCase();

export const getUserByEmail = async (db: Connection, email: string) => {
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

export const getUserById = async (db: Connection, id: number) => {
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

export const createUser = async (
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