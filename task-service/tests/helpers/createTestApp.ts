import Database from "better-sqlite3";
import { vi } from "vitest";
import type { Connection } from "mysql2";
import { createTasksRepository } from "../../src/repository/tasksRepository.js";
import { createApp } from "../../src/app.js";

const SCHEMA = `
  CREATE TABLE IF NOT EXISTS tasks (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id  INTEGER NOT NULL,
    user_id     INTEGER NOT NULL,
    name        TEXT    NOT NULL,
    description TEXT,
    priority    TEXT    DEFAULT 'MEDIUM',
    status      TEXT    DEFAULT 'TODO',
    due_date    TEXT,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`;

const serializeParam = (p: unknown): unknown => {
	if (p instanceof Date) return p.toISOString();
	return p;
};

const createSQLiteAdapter = (db: Database.Database): Connection => {
	const promise = () => ({
		query: async (sql: string, params: unknown[] = []) => {
			const stmt = db.prepare(sql);
			const rows = stmt.all(...params.map(serializeParam));
			return [rows, []];
		},
		execute: async (sql: string, params: unknown[] = []) => {
			const stmt = db.prepare(sql);
			const info = stmt.run(...params.map(serializeParam));
			return [{ insertId: Number(info.lastInsertRowid), affectedRows: info.changes }, []];
		},
	});

	return { promise } as unknown as Connection;
};

export const createMockRabbit = () => ({
	publishEvent: vi.fn(),
	close: vi.fn(),
});

export const createTestApp = () => {
	const sqlite = new Database(":memory:");
	sqlite.exec(SCHEMA);
	const db = createSQLiteAdapter(sqlite);
	const repo = createTasksRepository(db);
	const rabbit = createMockRabbit();
	const app = createApp(repo, rabbit as any);
	return { app, sqlite, rabbit };
};
