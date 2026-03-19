import Database from "better-sqlite3";
import type { Pool } from "mysql2";
import { createApp } from "../../src/app.js";

const SCHEMA = `
  CREATE TABLE IF NOT EXISTS users (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    email      TEXT    NOT NULL UNIQUE,
    first_name TEXT    NOT NULL,
    last_name  TEXT    NOT NULL,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`;

const createSQLiteAdapter = (db: Database.Database): Pool => {
	const promise = () => ({
		query: async (sql: string, params: unknown[] = []) => {
			const stmt = db.prepare(sql);
			const rows = stmt.all(...params);
			return [rows, []];
		},
		execute: async (sql: string, params: unknown[] = []) => {
			const stmt = db.prepare(sql);
			const info = stmt.run(...params);
			return [{ insertId: Number(info.lastInsertRowid), affectedRows: info.changes }, []];
		},
	});

	return { promise } as unknown as Pool;
};

export const createTestApp = () => {
	const sqlite = new Database(":memory:");
	sqlite.exec(SCHEMA);

	const db = createSQLiteAdapter(sqlite);
	const app = createApp(db);

	return { app, sqlite };
};
