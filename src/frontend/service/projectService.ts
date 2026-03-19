import { getToken } from './authService';
import type { Project } from '../interface/Project/Project';
import type { ProjectStatus } from '../interface/Project/ProjectStatus';
import type { CreateProjectPayload } from '../interface/Project/CreateProjectPayload';
import type { UpdateProjectPayload } from '../interface/Project/UpdateProjectPayload';

export type { Project, ProjectStatus, CreateProjectPayload, UpdateProjectPayload };

const PROJECT_BASE = '/projects';

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

export async function updateProject(id: number, payload: UpdateProjectPayload): Promise<Project> {
    const res = await fetch(`${PROJECT_BASE}/${id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(payload),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message ?? 'Erreur lors de la mise à jour du projet');
    }
    const data = await res.json();
    return data.project;
}

export async function deleteProject(id: number): Promise<void> {
    const res = await fetch(`${PROJECT_BASE}/${id}`, {
        method: 'DELETE',
        headers: authHeaders(),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message ?? 'Erreur lors de la suppression du projet');
    }
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
