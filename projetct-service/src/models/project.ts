export type ProjectId = number;
export type TaskId = number;

// the user is only referenced by its id in project-service. details are owned by auth-service.
export type UserId = number;

export type ProjectStatus = "NOT_STARTED" | "PENDING" | "IN_PROGRESS" | "DONE";

export interface Project {
	id: ProjectId;
	ownerUserId: UserId;
	name: string;
	description: string | null;
	startDate: Date | null;
	dueDate: Date | null;
	budget: number;
	status: ProjectStatus;
	createdAt: Date;
	updatedAt: Date;
}

// task details are owned by task-service.
// project-service stores only the association (projectId <-> taskId).
export interface ProjectTaskLink {
	projectId: ProjectId;
	taskId: TaskId;
	createdAt: Date;
}

// Inputs (API / services)
export type CreateProjectInput = {
	ownerUserId: UserId;
	name: string;
	description?: string;
	startDate?: Date;
	dueDate?: Date;
	budget?: number;
	status?: ProjectStatus;
};

export type UpdateProjectInput = Partial<Omit<CreateProjectInput, "name">> & {
	name?: string;
};

export type LinkTaskToProjectInput = {
	projectId: ProjectId;
	taskId: TaskId;
};

// Representation BDD (snake_case)
export type ProjectRow = {
	id: number;
	owner_user_id: number;
	name: string;
	description: string | null;
	start_date: Date | string | null;
	due_date: Date | string | null;
	budget: number | string;
	status: ProjectStatus;
	created_at: Date | string;
	updated_at: Date | string;
};

export type ProjectTaskLinkRow = {
	project_id: number;
	task_id: number;
	created_at: Date | string;
};

const toDate = (value: Date | string): Date => (value instanceof Date ? value : new Date(value));

const toNullableDate = (value: Date | string | null): Date | null =>
	value === null ? null : toDate(value);

const toBudgetNumber = (value: number | string): number => {
	if (typeof value === "number") return value;
	const parsed = Number.parseFloat(value);
	return Number.isFinite(parsed) ? parsed : 0;
};

export const toProject = (row: ProjectRow): Project => ({
	id: row.id,
	ownerUserId: row.owner_user_id,
	name: row.name,
	description: row.description,
	startDate: toNullableDate(row.start_date),
	dueDate: toNullableDate(row.due_date),
	budget: toBudgetNumber(row.budget),
	status: row.status,
	createdAt: toDate(row.created_at),
	updatedAt: toDate(row.updated_at),
});

export const toProjectTaskLink = (row: ProjectTaskLinkRow): ProjectTaskLink => ({
	projectId: row.project_id,
	taskId: row.task_id,
	createdAt: toDate(row.created_at),
});
