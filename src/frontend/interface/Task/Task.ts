import type { TaskStatus } from './TaskStatus';
import type { TaskPriority } from './TaskPriority';

export interface Task {
    id: number;
    projectId: number;
    userId: number;
    name: string;
    description: string | null;
    priority: TaskPriority;
    status: TaskStatus;
    dueDate: string | null;
    createdAt: string;
    updatedAt: string;
}
