import React from 'react';
import style from '../../pages/ProjectDetail/ProjectDetail.module.css';
import type { Task } from '../../interface/Task/Task';
import { PRIORITY_DOT } from '../../constant/PriorityDot';
import { formatDate } from '../../utils/formatDate';

interface Props {
    task: Task;
    onDragStart: (id: number) => void;
    onDragEnd: () => void;
    onClick: (task: Task) => void;
}

export default function TaskCard({ task, onDragStart, onDragEnd, onClick }: Props) {
    return (
        <div
            className={style.taskCard}
            draggable
            onDragStart={() => onDragStart(task.id)}
            onDragEnd={onDragEnd}
            onClick={() => onClick(task)}
        >
            <div className={style.taskCardHeader}>
                <p className={style.taskName}>{task.name}</p>
                {task.priority && PRIORITY_DOT[task.priority] && (
                    <span
                        className={style.priorityDot}
                        style={{ backgroundColor: PRIORITY_DOT[task.priority].color }}
                        title={PRIORITY_DOT[task.priority].title}
                    />
                )}
            </div>
            {task.description && (
                <p className={style.taskDesc}>{task.description}</p>
            )}
            {task.dueDate && (
                <p className={style.taskDue}>Échéance : {formatDate(task.dueDate)}</p>
            )}
        </div>
    );
}
