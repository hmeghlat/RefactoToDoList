import type { TaskStatus } from './TaskStatus';
import type { TaskPriority } from './TaskPriority';

export interface UpdateTaskPayload {
    name?: string;
    description?: string;
    priority?: TaskPriority;
    status?: TaskStatus;
    dueDate?: string | null;
}
