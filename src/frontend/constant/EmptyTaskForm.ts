import type { TaskPriority } from '../interface/Task/TaskPriority';
import type { TaskStatus } from '../interface/Task/TaskStatus';

export const EMPTY_TASK_FORM: { name: string; description: string; priority: TaskPriority; status: TaskStatus; dueDate: string } = {
    name: '',
    description: '',
    priority: 'MEDIUM',
    status: 'TODO',
    dueDate: '',
};
