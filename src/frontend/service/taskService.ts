import { fetchWithAuth } from '../utils/fetchWithAuth';
import type { Task } from '../interface/Task/Task';
import type { TaskStatus } from '../interface/Task/TaskStatus';
import type { TaskPriority } from '../interface/Task/TaskPriority';
import type { CreateTaskPayload } from '../interface/Task/CreateTaskPayload';
import type { UpdateTaskPayload } from '../interface/Task/UpdateTaskPayload';

export type { Task, TaskStatus, TaskPriority, CreateTaskPayload, UpdateTaskPayload };

const TASK_BASE = '/tasks';

export async function getTasksByProject(projectId: number): Promise<Task[]> {
    const res = await fetchWithAuth(`${TASK_BASE}?projectId=${projectId}`);
    if (!res.ok) throw new Error('Erreur lors du chargement des tâches');
    const data = await res.json();
    return data.tasks;
}

export async function createTask(payload: CreateTaskPayload): Promise<Task> {
    const res = await fetchWithAuth(TASK_BASE, {
        method: 'POST',
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
    const res = await fetchWithAuth(`${TASK_BASE}/${id}`, {
        method: 'PUT',
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
    const res = await fetchWithAuth(`${TASK_BASE}/${id}`, { method: 'DELETE' });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message ?? 'Erreur lors de la suppression');
    }
}

export async function updateTaskStatus(id: number, status: TaskStatus): Promise<Task> {
    const res = await fetchWithAuth(`${TASK_BASE}/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message ?? 'Erreur lors de la mise à jour');
    }
    const data = await res.json();
    return data.task;
}
