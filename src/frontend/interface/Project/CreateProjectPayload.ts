import type { ProjectStatus } from './ProjectStatus';

export interface CreateProjectPayload {
    name: string;
    description?: string;
    startDate?: string;
    dueDate?: string;
    budget?: number;
    status?: ProjectStatus;
}
