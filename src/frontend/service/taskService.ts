import { getToken } from './authService';
import type { Task } from '../interface/Task/Task';
import type { TaskStatus } from '../interface/Task/TaskStatus';
import type { TaskPriority } from '../interface/Task/TaskPriority';
import type { CreateTaskPayload } from '../interface/Task/CreateTaskPayload';
import type { UpdateTaskPayload } from '../interface/Task/UpdateTaskPayload';

export type { Task, TaskStatus, TaskPriority, CreateTaskPayload, UpdateTaskPayload };

const TASK_BASE = '/tasks';

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

export async function updateTask(id: number, payload: UpdateTaskPayload): Promise<Task> {
    const res = await fetch(`${TASK_BASE}/${id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(payload),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message ?? 'Erreur lors de la mise à jour');
    }
    const data = await res.json();
    return data.task;
}

export async function deleteTask(id: number): Promise<void> {
    const res = await fetch(`${TASK_BASE}/${id}`, {
        method: 'DELETE',
        headers: authHeaders(),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message ?? 'Erreur lors de la suppression');
    }
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
