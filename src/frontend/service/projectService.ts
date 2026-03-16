import { getToken } from './authService';

const PROJECT_BASE = '/projects';

export type ProjectStatus = 'NOT_STARTED' | 'PENDING' | 'IN_PROGRESS' | 'DONE';

export interface Project {
    id: number;
    ownerUserId: number;
    name: string;
    description: string | null;
    startDate: string | null;
    dueDate: string | null;
    budget: number;
    status: ProjectStatus;
    createdAt: string;
    updatedAt: string;
}

export interface CreateProjectPayload {
    name: string;
    description?: string;
    startDate?: string;
    dueDate?: string;
    budget?: number;
    status?: ProjectStatus;
}

function authHeaders() {
    return {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`,
    };
}

export async function getAllProjects(): Promise<Project[]> {
    const res = await fetch(PROJECT_BASE, { headers: authHeaders() });
    if (!res.ok) throw new Error('Erreur lors du chargement des projets');
    const data = await res.json();
    return data.projects;
}

export async function createProject(payload: CreateProjectPayload): Promise<Project> {
    const res = await fetch(`${PROJECT_BASE}/create`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(payload),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message ?? 'Erreur lors de la création du projet');
    }
    const data = await res.json();
    return data.project;
}
