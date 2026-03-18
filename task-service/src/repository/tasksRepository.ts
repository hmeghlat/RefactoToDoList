import type { Connection, ResultSetHeader, RowDataPacket } from "mysql2";

import type { Task, TaskRow } from "../models/task.js";
import { toTask } from "../models/task.js";

type TaskRowPacket = RowDataPacket & TaskRow;

export const createTasksRepository = (db: Connection) => {
  const create = async (input: { projectId: number; name: string }): Promise<Task> => {
    const [result] = await db
      .promise()
      .execute<ResultSetHeader>(
        "INSERT INTO tasks (project_id, name, completed) VALUES (?, ?, FALSE)",
        [input.projectId, input.name]
      );

    const created = await getById(Number(result.insertId));
    if (!created) throw new Error("Task creation failed");
    return created;
  };

  const getById = async (id: number): Promise<Task | null> => {
    const [rows] = await db
      .promise()
      .query<TaskRowPacket[]>(
        "SELECT id, project_id, name, completed, created_at, updated_at FROM tasks WHERE id = ? LIMIT 1",
        [id]
      );

    const row = rows[0];
    return row ? toTask(row) : null;
  };

  const list = async (filter?: { projectId?: number }): Promise<Task[]> => {
    if (filter?.projectId) {
      const [rows] = await db
        .promise()
        .query<TaskRowPacket[]>(
          "SELECT id, project_id, name, completed, created_at, updated_at FROM tasks WHERE project_id = ? ORDER BY id ASC",
          [filter.projectId]
        );
      return rows.map(toTask);
    }

    const [rows] = await db
      .promise()
      .query<TaskRowPacket[]>(
        "SELECT id, project_id, name, completed, created_at, updated_at FROM tasks ORDER BY id ASC"
      );
    return rows.map(toTask);
  };

  const update = async (
    id: number,
    patch: Partial<Pick<Task, "name" | "completed">>
  ): Promise<{ before: Task; after: Task } | null> => {
    const before = await getById(id);
    if (!before) return null;

    const name = patch.name ?? before.name;
    const completed = patch.completed ?? before.completed;

    await db
      .promise()
      .execute<ResultSetHeader>(
        "UPDATE tasks SET name = ?, completed = ? WHERE id = ?",
        [name, completed ? 1 : 0, id]
      );

    const after = await getById(id);
    if (!after) return null;

    return { before, after };
  };

  const remove = async (id: number): Promise<boolean> => {
    const [result] = await db
      .promise()
      .execute<ResultSetHeader>("DELETE FROM tasks WHERE id = ?", [id]);
    return result.affectedRows > 0;
  };

  return { create, getById, list, update, remove };
};

export type TasksRepository = ReturnType<typeof createTasksRepository>;
