import type { TaskStatus } from '../interface/Task/TaskStatus';

export const COLUMNS: { status: TaskStatus; label: string }[] = [
    { status: 'TODO',        label: 'À faire' },
    { status: 'IN_PROGRESS', label: 'Commencé' },
    { status: 'DONE',        label: 'Terminé' },
    { status: 'CANCELLED',   label: 'Annulé' },
];
