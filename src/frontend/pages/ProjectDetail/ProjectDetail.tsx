import React from 'react';
import style from './ProjectDetail.module.css';
import { logout, getUser } from '../../service/authService';
import { type Project, type ProjectStatus } from '../../service/projectService';
import {
    getTasksByProject,
    createTask,
    updateTaskStatus,
    type Task,
    type TaskStatus,
    type CreateTaskPayload,
} from '../../service/taskService';

interface Props {
    project: Project;
    onBack: () => void;
    onLogout: () => void;
}

const COLUMNS: { status: TaskStatus; label: string }[] = [
    { status: 'TODO',        label: 'À faire' },
    { status: 'IN_PROGRESS', label: 'Commencé' },
    { status: 'CANCELLED',   label: 'Annulé' },
    { status: 'DONE',        label: 'Terminé' },
];

const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
    NOT_STARTED: 'Non démarré',
    PENDING: 'En attente',
    IN_PROGRESS: 'En cours',
    DONE: 'Terminé',
};

const EMPTY_FORM = { name: '', description: '', status: 'TODO' as TaskStatus, dueDate: '' };

function formatDate(value: string | null | undefined): string {
    if (!value) return '';
    return new Date(value).toLocaleDateString('fr-FR');
}

export default function ProjectDetail({ project, onBack, onLogout }: Props) {
    const user = getUser();
    const [tasks, setTasks] = React.useState<Task[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const [showModal, setShowModal] = React.useState(false);
    const [form, setForm] = React.useState(EMPTY_FORM);
    const [formError, setFormError] = React.useState<string | null>(null);
    const [submitting, setSubmitting] = React.useState(false);
    const [dragOverCol, setDragOverCol] = React.useState<TaskStatus | null>(null);
    const dragTaskId = React.useRef<number | null>(null);

    React.useEffect(() => {
        setLoading(true);
        getTasksByProject(project.id)
            .then(setTasks)
            .catch(err => setError(err instanceof Error ? err.message : 'Erreur inconnue'))
            .finally(() => setLoading(false));
    }, [project.id]);

    const handleLogout = () => { logout(); onLogout(); };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleCreateTask = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setFormError(null);
        setSubmitting(true);
        try {
            const payload: CreateTaskPayload = {
                projectId: project.id,
                userId: Number(user.id),
                name: form.name,
                ...(form.description ? { description: form.description } : {}),
                status: form.status,
                ...(form.dueDate ? { dueDate: form.dueDate } : {}),
            };
            const created = await createTask(payload);
            setTasks(prev => [created, ...prev]);
            setShowModal(false);
            setForm(EMPTY_FORM);
        } catch (err) {
            setFormError(err instanceof Error ? err.message : 'Erreur inconnue');
        } finally {
            setSubmitting(false);
        }
    };

    // ── Drag & Drop ──────────────────────────────────────────────────
    const handleDragStart = (taskId: number) => {
        dragTaskId.current = taskId;
    };

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

    const initials = user ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase() : '?';
    const fullName = user ? `${user.firstName} ${user.lastName}` : '';

    return (
        <div className={style.page}>

            {/* ── Header ── */}
            <header className={style.header}>
                <div className={style.headerLeft}>
                    <button className={style.backBtn} onClick={onBack} title="Retour">←</button>
                    <span className={style.brand}>TRAVAIL</span>
                </div>
                <div className={style.userArea}>
                    <div className={style.avatar}>{initials}</div>
                    <span className={style.userName}>{fullName}</span>
                    <button className={style.logoutBtn} onClick={handleLogout}>Se déconnecter</button>
                </div>
            </header>

            {/* ── Project info ── */}
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
                <button className={style.newTaskBtn} onClick={() => setShowModal(true)}>
                    + Nouvelle tâche
                </button>
            </div>

            {error && <div className={style.error}>{error}</div>}

            {/* ── Kanban board ── */}
            {loading ? (
                <div style={{ padding: '60px', textAlign: 'center', color: '#9ca3af' }}>Chargement...</div>
            ) : (
                <div className={style.board}>
                    {COLUMNS.map(col => {
                        const colTasks = tasks.filter(t => t.status === col.status);
                        return (
                            <div
                                key={col.status}
                                className={`${style.column}${dragOverCol === col.status ? ' ' + style.dragOver : ''}`}
                                onDragOver={e => { e.preventDefault(); setDragOverCol(col.status); }}
                                onDragLeave={() => setDragOverCol(null)}
                                onDrop={() => handleDrop(col.status)}
                            >
                                <div className={style.columnHeader}>
                                    <span className={style.columnTitle}>{col.label}</span>
                                    <span className={style.columnCount}>{colTasks.length}</span>
                                </div>

                                {colTasks.length === 0 ? (
                                    <div className={style.emptyCol}>Aucune tâche</div>
                                ) : (
                                    colTasks.map(task => (
                                        <div
                                            key={task.id}
                                            className={style.taskCard}
                                            draggable
                                            onDragStart={() => handleDragStart(task.id)}
                                            onDragEnd={() => setDragOverCol(null)}
                                        >
                                            <p className={style.taskName}>{task.name}</p>
                                            {task.description && (
                                                <p className={style.taskDesc}>{task.description}</p>
                                            )}
                                            {task.dueDate && (
                                                <p className={style.taskDue}>
                                                    Échéance : {formatDate(task.dueDate)}
                                                </p>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ── Modal nouvelle tâche ── */}
            {showModal && (
                <div className={style.overlay} onClick={() => setShowModal(false)}>
                    <div className={style.modal} onClick={e => e.stopPropagation()}>
                        <div className={style.modalHeader}>
                            <h2 className={style.modalTitle}>Nouvelle tâche</h2>
                            <button className={style.closeBtn} onClick={() => setShowModal(false)}>✕</button>
                        </div>

                        {formError && <div className={style.error}>{formError}</div>}

                        <form onSubmit={handleCreateTask}>
                            <div className={style.field}>
                                <label className={style.label}>Nom *</label>
                                <input
                                    className={style.input}
                                    name="name"
                                    value={form.name}
                                    onChange={handleFormChange}
                                    placeholder="Nom de la tâche"
                                    required
                                />
                            </div>

                            <div className={style.field}>
                                <label className={style.label}>Description</label>
                                <textarea
                                    className={style.textarea}
                                    name="description"
                                    value={form.description}
                                    onChange={handleFormChange}
                                    placeholder="Description optionnelle..."
                                    rows={3}
                                />
                            </div>

                            <div className={style.row}>
                                <div className={style.field}>
                                    <label className={style.label}>Statut</label>
                                    <select
                                        className={style.input}
                                        name="status"
                                        value={form.status}
                                        onChange={handleFormChange}
                                    >
                                        {COLUMNS.map(c => (
                                            <option key={c.status} value={c.status}>{c.label}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className={style.field}>
                                    <label className={style.label}>Échéance</label>
                                    <input
                                        className={style.input}
                                        type="date"
                                        name="dueDate"
                                        value={form.dueDate}
                                        onChange={handleFormChange}
                                    />
                                </div>
                            </div>

                            <div className={style.modalActions}>
                                <button type="button" className={style.cancelBtn} onClick={() => setShowModal(false)}>
                                    Annuler
                                </button>
                                <button type="submit" className={style.submitBtn} disabled={submitting}>
                                    {submitting ? 'Création...' : 'Créer'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
