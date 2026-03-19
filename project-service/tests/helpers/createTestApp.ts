import Database from "better-sqlite3";
import type { Connection } from "mysql2";
import type { RequestHandler } from "express";
import { createApp } from "../../src/app.js";

const SCHEMA = `
  CREATE TABLE IF NOT EXISTS projects (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    owner_user_id INTEGER NOT NULL,
    name          TEXT    NOT NULL,
    description   TEXT,
    start_date    TEXT,
    due_date      TEXT,
    budget        REAL    DEFAULT 0,
    status        TEXT    DEFAULT 'NOT_STARTED',
    created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at    DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS project_tasks (
    project_id INTEGER NOT NULL,
    task_id    INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`;

const serializeParam = (p: unknown): unknown => {
	if (p instanceof Date) return p.toISOString();
	return p;
};

const normalizeSql = (sql: string) => sql.replace(/NOW\(\)/gi, "CURRENT_TIMESTAMP");

const createSQLiteAdapter = (db: Database.Database): Connection => {
	const promise = () => ({
		query: async (sql: string, params: unknown[] = []) => {
			const stmt = db.prepare(normalizeSql(sql));
			const rows = stmt.all(...params.map(serializeParam));
			return [rows, []];
		},
		execute: async (sql: string, params: unknown[] = []) => {
			const stmt = db.prepare(normalizeSql(sql));
			const info = stmt.run(...params.map(serializeParam));
			return [{ insertId: Number(info.lastInsertRowid), affectedRows: info.changes }, []];
		},
	});

	return { promise } as unknown as Connection;
};

export const fakeAuth: RequestHandler = (req, _res, next) => {
	req.auth = { userId: "1", email: "olivier.dick@test.com" };
	next();
};

export const createTestApp = () => {
	const sqlite = new Database(":memory:");
	sqlite.exec(SCHEMA);
	const db = createSQLiteAdapter(sqlite);
	const app = createApp(db, fakeAuth);
	return { app, sqlite };
};
