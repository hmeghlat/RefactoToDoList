import { getToken } from './authService';

const TASK_BASE = '/tasks';

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface Task {
    id: number;
    projectId: number;
    userId: number;
    name: string;
    description: string | null;
    priority: TaskPriority;
    status: TaskStatus;
    dueDate: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface CreateTaskPayload {
    projectId: number;
    userId: number;
    name: string;
    description?: string;
    status?: TaskStatus;
    dueDate?: string | null;
}

function authHeaders() {
    return {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`,
    };
}

export async function getTasksByProject(projectId: number): Promise<Task[]> {
    const res = await fetch(`${TASK_BASE}?projectId=${projectId}`, { headers: authHeaders() });
    if (!res.ok) throw new Error('Erreur lors du chargement des tâches');
    const data = await res.json();
    return data.tasks;
}

export async function createTask(payload: CreateTaskPayload): Promise<Task> {
    const res = await fetch(TASK_BASE, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(payload),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message ?? 'Erreur lors de la création de la tâche');
    }
    const data = await res.json();
    return data.task;
}

export async function updateTaskStatus(id: number, status: TaskStatus): Promise<Task> {
    const res = await fetch(`${TASK_BASE}/${id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ status }),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message ?? 'Erreur lors de la mise à jour');
    }
    const data = await res.json();
    return data.task;
}
