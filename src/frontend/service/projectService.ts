import { fetchWithAuth } from '../utils/fetchWithAuth';
import type { Project } from '../interface/Project/Project';
import type { ProjectStatus } from '../interface/Project/ProjectStatus';
import type { CreateProjectPayload } from '../interface/Project/CreateProjectPayload';
import type { UpdateProjectPayload } from '../interface/Project/UpdateProjectPayload';

export type { Project, ProjectStatus, CreateProjectPayload, UpdateProjectPayload };
const API_BASE = "http://localhost:8080";
const PROJECT_BASE = `${API_BASE}/projects/`;

export async function getAllProjects(): Promise<Project[]> {
    const res = await fetchWithAuth(PROJECT_BASE);
    if (!res.ok) throw new Error('Erreur lors du chargement des projets');
    const data = await res.json();
    return data.projects;
}

export async function updateProject(id: number, payload: UpdateProjectPayload): Promise<Project> {
    const res = await fetchWithAuth(`${PROJECT_BASE}${id}`, {
        method: 'PUT',
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
    const res = await fetchWithAuth(`${PROJECT_BASE}${id}`, { method: 'DELETE' });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message ?? 'Erreur lors de la suppression du projet');
    }
}

export async function createProject(payload: CreateProjectPayload): Promise<Project> {
    const res = await fetchWithAuth(`${PROJECT_BASE}create`, {
        method: 'POST',
        body: JSON.stringify(payload),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message ?? 'Erreur lors de la création du projet');
    }
    const data = await res.json();
    return data.project;
}
