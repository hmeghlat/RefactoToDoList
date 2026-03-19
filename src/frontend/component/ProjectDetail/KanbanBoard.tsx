import React from 'react';
import style from '../../pages/ProjectDetail/ProjectDetail.module.css';
import type { Task } from '../../interface/Task/Task';
import type { TaskStatus } from '../../interface/Task/TaskStatus';
import { COLUMNS } from '../../constant/Columns';
import TaskCard from './TaskCard';

interface Props {
    tasks: Task[];
    dragOverCol: TaskStatus | null;
    onDragStart: (id: number) => void;
    onDragEnd: () => void;
    onDragOver: (status: TaskStatus) => void;
    onDragLeave: () => void;
    onDrop: (status: TaskStatus) => void;
    onTaskClick: (task: Task) => void;
}

export default function KanbanBoard({
    tasks,
    dragOverCol,
    onDragStart,
    onDragEnd,
    onDragOver,
    onDragLeave,
    onDrop,
    onTaskClick,
}: Props) {
    return (
        <div className={style.board}>
            {COLUMNS.map(col => {
                const colTasks = tasks.filter(t => t.status === col.status);
                return (
                    <div
                        key={col.status}
                        className={[
                            style.column,
                            style[`column_${col.status}`],
                            dragOverCol === col.status ? style.dragOver : '',
                        ].filter(Boolean).join(' ')}
                        onDragOver={e => { e.preventDefault(); onDragOver(col.status); }}
                        onDragLeave={onDragLeave}
                        onDrop={() => onDrop(col.status)}
                    >
                        <div className={style.columnHeader}>
                            <span className={style.columnTitle}>{col.label}</span>
                            <span className={style.columnCount}>{colTasks.length}</span>
                        </div>

                        {colTasks.length === 0 ? (
                            <div className={style.emptyCol}>Aucune tâche</div>
                        ) : (
                            colTasks.map(task => (
                                <TaskCard
                                    key={task.id}
                                    task={task}
                                    onDragStart={onDragStart}
                                    onDragEnd={onDragEnd}
                                    onClick={onTaskClick}
                                />
                            ))
                        )}
                    </div>
                );
            })}
        </div>
    );
}
