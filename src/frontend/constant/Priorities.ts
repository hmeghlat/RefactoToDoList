import type { TaskPriority } from '../interface/Task/TaskPriority';

export const PRIORITIES: { value: TaskPriority; label: string }[] = [
    { value: 'LOW',    label: 'Basse' },
    { value: 'MEDIUM', label: 'Moyenne' },
    { value: 'HIGH',   label: 'Haute' },
];
