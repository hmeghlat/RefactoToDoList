import type { TaskPriority } from '../interface/Task/TaskPriority';

export const PRIORITY_DOT: Record<TaskPriority, { color: string; title: string }> = {
    LOW:    { color: '#10b981', title: 'Priorité basse' },
    MEDIUM: { color: '#f59e0b', title: 'Priorité moyenne' },
    HIGH:   { color: '#ef4444', title: 'Priorité haute' },
};
