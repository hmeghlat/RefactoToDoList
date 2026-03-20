import React from 'react';
import style from '../../pages/ProjectDetail/ProjectDetail.module.css';
import type { Project } from '../../interface/Project/Project';
import { PROJECT_STATUS_LABELS } from '../../constant/ProjectStatusLabels';
import { formatDate } from '../../utils/formatDate';

interface Props {
    project: Project;
    onOpenSettings: () => void;
    onNewTask: () => void;
}

export default function ProjectBar({ project, onOpenSettings, onNewTask }: Props) {
    return (
        <div className={style.projectBar}>
            <div>
                <h1 className={style.projectTitle}>{project.name}</h1>
                <div className={style.projectMeta}>
                    <span className={`${style.badge} ${style[`badge_${project.status}`]}`}>
                        {PROJECT_STATUS_LABELS[project.status]}
                    </span>
                    {project.description && (
                        <p className={style.projectDesc}>{project.description}</p>
                    )}
                    {(project.startDate || project.dueDate) && (
                        <span className={style.projectDate}>
                            {formatDate(project.startDate)} — {formatDate(project.dueDate)}
                        </span>
                    )}
                </div>
            </div>
            <div className={style.projectBarActions}>
                <button className={style.settingsBtn} onClick={onOpenSettings} title="Paramètres du projet">
                    ⚙
                </button>
                <button className={style.newTaskBtn} onClick={onNewTask}>
                    + Nouvelle tâche
                </button>
            </div>
        </div>
    );
}
