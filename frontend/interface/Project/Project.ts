import type { ProjectStatus } from './ProjectStatus';

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
