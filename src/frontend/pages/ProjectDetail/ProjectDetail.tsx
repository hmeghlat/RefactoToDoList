import React from 'react';
import style from './ProjectDetail.module.css';
import { logout, getUser } from '../../service/authService';
import type { Project } from '../../interface/Project/Project';
import { getTasksByProject, updateTaskStatus } from '../../service/taskService';
import type { Task } from '../../interface/Task/Task';
import type { TaskStatus } from '../../interface/Task/TaskStatus';

import ProjectHeader from '../../component/ProjectDetail/ProjectHeader';
import ProjectBar from '../../component/ProjectDetail/ProjectBar';
import KanbanBoard from '../../component/ProjectDetail/KanbanBoard';
import NewTaskModal from '../../component/ProjectDetail/NewTaskModal';
import EditTaskModal from '../../component/ProjectDetail/EditTaskModal';
import ProjectSettingsModal from '../../component/ProjectDetail/ProjectSettingsModal';

interface Props {
    project: Project;
    onBack: () => void;
    onLogout: () => void;
    onProjectUpdated?: (p: Project) => void;
    onProjectDeleted?: () => void;
}

export default function ProjectDetail({ project, onBack, onLogout, onProjectUpdated, onProjectDeleted }: Props) {
    const user = getUser();
    const [currentProject, setCurrentProject] = React.useState<Project>(project);
    const [tasks, setTasks] = React.useState<Task[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    const [showNewTask, setShowNewTask] = React.useState(false);
    const [showSettings, setShowSettings] = React.useState(false);
    const [editTask, setEditTask] = React.useState<Task | null>(null);

    const [dragOverCol, setDragOverCol] = React.useState<TaskStatus | null>(null);
    const dragTaskId = React.useRef<number | null>(null);

    React.useEffect(() => {
        setLoading(true);
        getTasksByProject(currentProject.id)
            .then(setTasks)
            .catch(err => setError(err instanceof Error ? err.message : 'Erreur inconnue'))
            .finally(() => setLoading(false));
    }, [currentProject.id]);

    const handleLogout = () => { logout(); onLogout(); };

    const handleDragStart = (taskId: number) => { dragTaskId.current = taskId; };

    const handleDrop = async (targetStatus: TaskStatus) => {
        const id = dragTaskId.current;
        if (!id) return;
        const task = tasks.find(t => t.id === id);
        if (!task || task.status === targetStatus) return;

        setTasks(prev => prev.map(t => t.id === id ? { ...t, status: targetStatus } : t));
        try {
            await updateTaskStatus(id, targetStatus);
        } catch {
            setTasks(prev => prev.map(t => t.id === id ? { ...t, status: task.status } : t));
        }
        dragTaskId.current = null;
        setDragOverCol(null);
    };

    const handleProjectUpdated = (updated: Project) => {
        setCurrentProject(updated);
        onProjectUpdated?.(updated);
    };

    const handleProjectDeleted = () => {
        onProjectDeleted?.();
        onBack();
    };

    const initials = user ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase() : '?';
    const fullName = user ? `${user.firstName} ${user.lastName}` : '';

    return (
        <div className={style.page}>
            <ProjectHeader
                initials={initials}
                fullName={fullName}
                onBack={onBack}
                onLogout={handleLogout}
            />

            <ProjectBar
                project={currentProject}
                onOpenSettings={() => setShowSettings(true)}
                onNewTask={() => setShowNewTask(true)}
            />

            {error && <div className={style.error}>{error}</div>}

            {loading ? (
                <div style={{ padding: '60px', textAlign: 'center', color: '#9ca3af' }}>Chargement...</div>
            ) : (
                <KanbanBoard
                    tasks={tasks}
                    dragOverCol={dragOverCol}
                    onDragStart={handleDragStart}
                    onDragEnd={() => setDragOverCol(null)}
                    onDragOver={setDragOverCol}
                    onDragLeave={() => setDragOverCol(null)}
                    onDrop={handleDrop}
                    onTaskClick={setEditTask}
                />
            )}

            {showNewTask && user && (
                <NewTaskModal
                    projectId={currentProject.id}
                    userId={Number(user.id)}
                    onClose={() => setShowNewTask(false)}
                    onCreated={task => setTasks(prev => [task, ...prev])}
                />
            )}

            {showSettings && (
                <ProjectSettingsModal
                    project={currentProject}
                    onClose={() => setShowSettings(false)}
                    onUpdated={handleProjectUpdated}
                    onDeleted={handleProjectDeleted}
                />
            )}

            {editTask && (
                <EditTaskModal
                    task={editTask}
                    onClose={() => setEditTask(null)}
                    onUpdated={updated => setTasks(prev => prev.map(t => t.id === updated.id ? updated : t))}
                    onDeleted={id => setTasks(prev => prev.filter(t => t.id !== id))}
                />
            )}
        </div>
    );
}
