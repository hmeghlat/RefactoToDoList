import React from 'react';
import style from './ProjectDetail.module.css';
import { logout, getUser } from '../../service/authService';
import {
    updateProject,
    deleteProject,
    type Project,
    type ProjectStatus,
    type UpdateProjectPayload,
} from '../../service/projectService';
import {
    getTasksByProject,
    createTask,
    updateTask,
    deleteTask,
    updateTaskStatus,
    type Task,
    type TaskStatus,
    type TaskPriority,
    type CreateTaskPayload,
    type UpdateTaskPayload,
} from '../../service/taskService';

interface Props {
    project: Project;
    onBack: () => void;
    onLogout: () => void;
    onProjectUpdated?: (p: Project) => void;
    onProjectDeleted?: () => void;
}

const COLUMNS: { status: TaskStatus; label: string }[] = [
    { status: 'TODO',        label: 'À faire' },
    { status: 'IN_PROGRESS', label: 'Commencé' },
    { status: 'DONE',        label: 'Terminé' },
    { status: 'CANCELLED',   label: 'Annulé' },
];

const PRIORITY_DOT: Record<TaskPriority, { color: string; title: string }> = {
    LOW:    { color: '#10b981', title: 'Priorité basse' },
    MEDIUM: { color: '#f59e0b', title: 'Priorité moyenne' },
    HIGH:   { color: '#ef4444', title: 'Priorité haute' },
};

const PRIORITIES: { value: TaskPriority; label: string }[] = [
    { value: 'LOW',    label: 'Basse' },
    { value: 'MEDIUM', label: 'Moyenne' },
    { value: 'HIGH',   label: 'Haute' },
];

const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
    NOT_STARTED: 'Non démarré',
    PENDING: 'En attente',
    IN_PROGRESS: 'En cours',
    DONE: 'Terminé',
};

const EMPTY_FORM = { name: '', description: '', priority: 'MEDIUM' as TaskPriority, status: 'TODO' as TaskStatus, dueDate: '' };

function formatDate(value: string | null | undefined): string {
    if (!value) return '';
    return new Date(value).toLocaleDateString('fr-FR');
}

export default function ProjectDetail({ project, onBack, onLogout, onProjectUpdated, onProjectDeleted }: Props) {
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

    const [currentProject, setCurrentProject] = React.useState<Project>(project);
    const [showSettings, setShowSettings] = React.useState(false);
    const [settingsForm, setSettingsForm] = React.useState<UpdateProjectPayload & { startDate: string; dueDate: string; budget: string }>({
        name: '', description: '', status: 'NOT_STARTED', startDate: '', dueDate: '', budget: '',
    });
    const [settingsError, setSettingsError] = React.useState<string | null>(null);
    const [settingsSubmitting, setSettingsSubmitting] = React.useState(false);
    const [confirmDeleteProject, setConfirmDeleteProject] = React.useState(false);

    const [editTask, setEditTask] = React.useState<Task | null>(null);
    const [editForm, setEditForm] = React.useState<UpdateTaskPayload & { dueDate: string }>({
        name: '', description: '', priority: 'MEDIUM', status: 'TODO', dueDate: '',
    });
    const [editError, setEditError] = React.useState<string | null>(null);
    const [editSubmitting, setEditSubmitting] = React.useState(false);
    const [confirmDelete, setConfirmDelete] = React.useState(false);

    React.useEffect(() => {
        setLoading(true);
        getTasksByProject(currentProject.id)
            .then(setTasks)
            .catch(err => setError(err instanceof Error ? err.message : 'Erreur inconnue'))
            .finally(() => setLoading(false));
    }, [currentProject.id]);

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
                projectId: currentProject.id,
                userId: Number(user.id),
                name: form.name,
                ...(form.description ? { description: form.description } : {}),
                priority: form.priority,
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

    const openSettings = () => {
        setSettingsForm({
            name: currentProject.name,
            description: currentProject.description ?? '',
            status: currentProject.status,
            startDate: currentProject.startDate ? currentProject.startDate.slice(0, 10) : '',
            dueDate: currentProject.dueDate ? currentProject.dueDate.slice(0, 10) : '',
            budget: currentProject.budget != null ? String(currentProject.budget) : '',
        });
        setSettingsError(null);
        setConfirmDeleteProject(false);
        setShowSettings(true);
    };

    const handleSettingsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setSettingsForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSettingsSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSettingsError(null);
        setSettingsSubmitting(true);
        try {
            const payload: UpdateProjectPayload = {
                name: settingsForm.name,
                description: settingsForm.description || undefined,
                status: settingsForm.status,
                startDate: settingsForm.startDate || null,
                dueDate: settingsForm.dueDate || null,
                budget: settingsForm.budget ? Number(settingsForm.budget) : undefined,
            };
            const updated = await updateProject(currentProject.id, payload);
            setCurrentProject(updated);
            onProjectUpdated?.(updated);
            setShowSettings(false);
        } catch (err) {
            setSettingsError(err instanceof Error ? err.message : 'Erreur inconnue');
        } finally {
            setSettingsSubmitting(false);
        }
    };

    const handleDeleteProject = async () => {
        setSettingsSubmitting(true);
        try {
            await deleteProject(currentProject.id);
            onProjectDeleted?.();
            onBack();
        } catch (err) {
            setSettingsError(err instanceof Error ? err.message : 'Erreur inconnue');
            setSettingsSubmitting(false);
        }
    };

    const openEditModal = (task: Task) => {
        setEditTask(task);
        setEditForm({
            name: task.name,
            description: task.description ?? '',
            priority: task.priority,
            status: task.status,
            dueDate: task.dueDate ? task.dueDate.slice(0, 10) : '',
        });
        setEditError(null);
        setConfirmDelete(false);
    };

    const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setEditForm(prev => ({ ...prev, [name]: value }));
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editTask) return;
        setEditError(null);
        setEditSubmitting(true);
        try {
            const payload: UpdateTaskPayload = {
                name: editForm.name,
                ...(editForm.description ? { description: editForm.description } : { description: '' }),
                priority: editForm.priority as TaskPriority,
                status: editForm.status as TaskStatus,
                dueDate: editForm.dueDate || null,
            };
            const updated = await updateTask(editTask.id, payload);
            setTasks(prev => prev.map(t => t.id === updated.id ? updated : t));
            setEditTask(null);
        } catch (err) {
            setEditError(err instanceof Error ? err.message : 'Erreur inconnue');
        } finally {
            setEditSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!editTask) return;
        setEditSubmitting(true);
        try {
            await deleteTask(editTask.id);
            setTasks(prev => prev.filter(t => t.id !== editTask.id));
            setEditTask(null);
        } catch (err) {
            setEditError(err instanceof Error ? err.message : 'Erreur inconnue');
        } finally {
            setEditSubmitting(false);
        }
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
                    <h1 className={style.projectTitle}>{currentProject.name}</h1>
                    <div className={style.projectMeta}>
                        <span className={`${style.badge} ${style[`badge_${currentProject.status}`]}`}>
                            {PROJECT_STATUS_LABELS[currentProject.status]}
                        </span>
                        {currentProject.description && (
                            <p className={style.projectDesc}>{currentProject.description}</p>
                        )}
                        {(currentProject.startDate || currentProject.dueDate) && (
                            <span className={style.projectDate}>
                                {formatDate(currentProject.startDate)} — {formatDate(currentProject.dueDate)}
                            </span>
                        )}
                    </div>
                </div>
                <div className={style.projectBarActions}>
                    <button className={style.settingsBtn} onClick={openSettings} title="Paramètres du projet">
                        ⚙
                    </button>
                    <button className={style.newTaskBtn} onClick={() => setShowModal(true)}>
                        + Nouvelle tâche
                    </button>
                </div>
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
                                className={[
                                    style.column,
                                    style[`column_${col.status}`],
                                    dragOverCol === col.status ? style.dragOver : '',
                                ].filter(Boolean).join(' ')}
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
                                            onClick={() => openEditModal(task)}
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
                                    <label className={style.label}>Priorité</label>
                                    <select
                                        className={style.input}
                                        name="priority"
                                        value={form.priority}
                                        onChange={handleFormChange}
                                    >
                                        {PRIORITIES.map(p => (
                                            <option key={p.value} value={p.value}>{p.label}</option>
                                        ))}
                                    </select>
                                </div>
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
            {/* ── Modal paramètres projet ── */}
            {showSettings && (
                <div className={style.overlay} onClick={() => setShowSettings(false)}>
                    <div className={style.modal} onClick={e => e.stopPropagation()}>
                        <div className={style.modalHeader}>
                            <h2 className={style.modalTitle}>Paramètres du projet</h2>
                            <button className={style.closeBtn} onClick={() => setShowSettings(false)}>✕</button>
                        </div>

                        {settingsError && <div className={style.error}>{settingsError}</div>}

                        {confirmDeleteProject ? (
                            <div className={style.confirmDelete}>
                                <p className={style.confirmText}>Supprimer définitivement ce projet et toutes ses tâches ?</p>
                                <div className={style.modalActions}>
                                    <button className={style.cancelBtn} onClick={() => setConfirmDeleteProject(false)} disabled={settingsSubmitting}>
                                        Annuler
                                    </button>
                                    <button className={style.deleteConfirmBtn} onClick={handleDeleteProject} disabled={settingsSubmitting}>
                                        {settingsSubmitting ? 'Suppression...' : 'Supprimer'}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleSettingsSubmit}>
                                <div className={style.field}>
                                    <label className={style.label}>Nom *</label>
                                    <input
                                        className={style.input}
                                        name="name"
                                        value={settingsForm.name}
                                        onChange={handleSettingsChange}
                                        required
                                    />
                                </div>

                                <div className={style.field}>
                                    <label className={style.label}>Description</label>
                                    <textarea
                                        className={style.textarea}
                                        name="description"
                                        value={settingsForm.description ?? ''}
                                        onChange={handleSettingsChange}
                                        rows={3}
                                    />
                                </div>

                                <div className={style.row}>
                                    <div className={style.field}>
                                        <label className={style.label}>Statut</label>
                                        <select className={style.input} name="status" value={settingsForm.status} onChange={handleSettingsChange}>
                                            {Object.entries(PROJECT_STATUS_LABELS).map(([val, label]) => (
                                                <option key={val} value={val}>{label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className={style.field}>
                                        <label className={style.label}>Budget (€)</label>
                                        <input
                                            className={style.input}
                                            type="number"
                                            name="budget"
                                            value={settingsForm.budget}
                                            onChange={handleSettingsChange}
                                            min={0}
                                        />
                                    </div>
                                </div>

                                <div className={style.row}>
                                    <div className={style.field}>
                                        <label className={style.label}>Date de début</label>
                                        <input className={style.input} type="date" name="startDate" value={settingsForm.startDate} onChange={handleSettingsChange} />
                                    </div>
                                    <div className={style.field}>
                                        <label className={style.label}>Échéance</label>
                                        <input className={style.input} type="date" name="dueDate" value={settingsForm.dueDate} onChange={handleSettingsChange} />
                                    </div>
                                </div>

                                <div className={style.modalActionsSpread}>
                                    <button type="button" className={style.deleteBtn} onClick={() => setConfirmDeleteProject(true)}>
                                        Supprimer le projet
                                    </button>
                                    <div className={style.modalActions}>
                                        <button type="button" className={style.cancelBtn} onClick={() => setShowSettings(false)}>
                                            Annuler
                                        </button>
                                        <button type="submit" className={style.submitBtn} disabled={settingsSubmitting}>
                                            {settingsSubmitting ? 'Enregistrement...' : 'Enregistrer'}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}

            {/* ── Modal édition tâche ── */}
            {editTask && (
                <div className={style.overlay} onClick={() => setEditTask(null)}>
                    <div className={style.modal} onClick={e => e.stopPropagation()}>
                        <div className={style.modalHeader}>
                            <h2 className={style.modalTitle}>Modifier la tâche</h2>
                            <button className={style.closeBtn} onClick={() => setEditTask(null)}>✕</button>
                        </div>

                        {editError && <div className={style.error}>{editError}</div>}

                        {confirmDelete ? (
                            <div className={style.confirmDelete}>
                                <p className={style.confirmText}>Supprimer définitivement cette tâche ?</p>
                                <div className={style.modalActions}>
                                    <button className={style.cancelBtn} onClick={() => setConfirmDelete(false)} disabled={editSubmitting}>
                                        Annuler
                                    </button>
                                    <button className={style.deleteConfirmBtn} onClick={handleDelete} disabled={editSubmitting}>
                                        {editSubmitting ? 'Suppression...' : 'Supprimer'}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleEditSubmit}>
                                <div className={style.field}>
                                    <label className={style.label}>Nom *</label>
                                    <input
                                        className={style.input}
                                        name="name"
                                        value={editForm.name}
                                        onChange={handleEditFormChange}
                                        required
                                    />
                                </div>

                                <div className={style.field}>
                                    <label className={style.label}>Description</label>
                                    <textarea
                                        className={style.textarea}
                                        name="description"
                                        value={editForm.description ?? ''}
                                        onChange={handleEditFormChange}
                                        rows={3}
                                    />
                                </div>

                                <div className={style.row}>
                                    <div className={style.field}>
                                        <label className={style.label}>Statut</label>
                                        <select className={style.input} name="status" value={editForm.status} onChange={handleEditFormChange}>
                                            {COLUMNS.map(c => (
                                                <option key={c.status} value={c.status}>{c.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className={style.field}>
                                        <label className={style.label}>Priorité</label>
                                        <select className={style.input} name="priority" value={editForm.priority} onChange={handleEditFormChange}>
                                            {PRIORITIES.map(p => (
                                                <option key={p.value} value={p.value}>{p.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className={style.field}>
                                    <label className={style.label}>Échéance</label>
                                    <input
                                        className={style.input}
                                        type="date"
                                        name="dueDate"
                                        value={editForm.dueDate}
                                        onChange={handleEditFormChange}
                                    />
                                </div>

                                <div className={style.modalActionsSpread}>
                                    <button type="button" className={style.deleteBtn} onClick={() => setConfirmDelete(true)}>
                                        Supprimer
                                    </button>
                                    <div className={style.modalActions}>
                                        <button type="button" className={style.cancelBtn} onClick={() => setEditTask(null)}>
                                            Annuler
                                        </button>
                                        <button type="submit" className={style.submitBtn} disabled={editSubmitting}>
                                            {editSubmitting ? 'Enregistrement...' : 'Enregistrer'}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
