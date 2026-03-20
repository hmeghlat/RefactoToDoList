import type { ProjectStatus } from './ProjectStatus';

export interface UpdateProjectPayload {
    name?: string;
    description?: string;
    startDate?: string | null;
    dueDate?: string | null;
    budget?: number;
    status?: ProjectStatus;
}
