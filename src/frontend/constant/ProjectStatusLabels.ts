import type { ProjectStatus } from '../interface/Project/ProjectStatus';

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
    NOT_STARTED: 'Non démarré',
    PENDING: 'En attente',
    IN_PROGRESS: 'En cours',
    DONE: 'Terminé',
};
