export type TaskId = number;
export type ProjectId = number;
export type UserId = number;

export type TaskPriority = "LOW" | "MEDIUM" | "HIGH";
export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE" | "CANCELLED";

export type Task = {
  id: TaskId;
  projectId: ProjectId;
  name: string;
  description: string | null;
  userId: UserId | null;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type TaskRow = {
  id: number;
  project_id: number;
  name: string;
  description: string | null;
  user_id: number | null;
  priority: TaskPriority;
  status: TaskStatus;
  due_date: Date | string | null;
  created_at: Date | string;
  updated_at: Date | string;
};

const toDate = (value: Date | string): Date => (value instanceof Date ? value : new Date(value));

const toNullableDate = (value: Date | string | null): Date | null => {
  if (value === null) return null;
  return toDate(value);
};

export const toTask = (row: TaskRow): Task => ({
  id: Number(row.id),
  projectId: Number(row.project_id),
  name: row.name,
  description: row.description,
  userId: row.user_id === null ? null : Number(row.user_id),
  priority: row.priority,
  status: row.status,
  dueDate: toNullableDate(row.due_date),
  createdAt: toDate(row.created_at),
  updatedAt: toDate(row.updated_at),
});
