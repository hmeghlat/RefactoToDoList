import type { TaskStatus } from './TaskStatus';
import type { TaskPriority } from './TaskPriority';

export interface CreateTaskPayload {
    projectId: number;
    userId: number;
    name: string;
    description?: string;
    priority?: TaskPriority;
    status?: TaskStatus;
    dueDate?: string | null;
}
