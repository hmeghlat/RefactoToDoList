export type TaskId = number;
export type ProjectId = number;

export type Task = {
  id: TaskId;
  projectId: ProjectId;
  name: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type TaskRow = {
  id: number;
  project_id: number;
  name: string;
  completed: 0 | 1 | boolean;
  created_at: Date | string;
  updated_at: Date | string;
};

const toDate = (value: Date | string): Date => (value instanceof Date ? value : new Date(value));

export const toTask = (row: TaskRow): Task => ({
  id: Number(row.id),
  projectId: Number(row.project_id),
  name: row.name,
  completed: Boolean(row.completed),
  createdAt: toDate(row.created_at),
  updatedAt: toDate(row.updated_at),
});
