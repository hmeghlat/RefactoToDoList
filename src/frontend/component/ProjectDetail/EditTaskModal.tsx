import React from 'react';
import style from '../../pages/ProjectDetail/ProjectDetail.module.css';
import { updateTask, deleteTask } from '../../service/taskService';
import type { Task } from '../../interface/Task/Task';
import type { TaskPriority } from '../../interface/Task/TaskPriority';
import type { TaskStatus } from '../../interface/Task/TaskStatus';
import type { UpdateTaskPayload } from '../../interface/Task/UpdateTaskPayload';
import { COLUMNS } from '../../constant/Columns';
import { PRIORITIES } from '../../constant/Priorities';

interface Props {
    task: Task;
    onClose: () => void;
    onUpdated: (task: Task) => void;
    onDeleted: (taskId: number) => void;
}

export default function EditTaskModal({ task, onClose, onUpdated, onDeleted }: Props) {
    const [form, setForm] = React.useState({
        name: task.name,
        description: task.description ?? '',
        priority: task.priority,
        status: task.status,
        dueDate: task.dueDate ? task.dueDate.slice(0, 10) : '',
    });
    const [error, setError] = React.useState<string | null>(null);
    const [submitting, setSubmitting] = React.useState(false);
    const [confirmDelete, setConfirmDelete] = React.useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSubmitting(true);
        try {
            const payload: UpdateTaskPayload = {
                name: form.name,
                ...(form.description ? { description: form.description } : { description: '' }),
                priority: form.priority as TaskPriority,
                status: form.status as TaskStatus,
                dueDate: form.dueDate || null,
            };
            const updated = await updateTask(task.id, payload);
            onUpdated(updated);
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erreur inconnue');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        setSubmitting(true);
        try {
            await deleteTask(task.id);
            onDeleted(task.id);
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erreur inconnue');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className={style.overlay} onClick={onClose}>
            <div className={style.modal} onClick={e => e.stopPropagation()}>
                <div className={style.modalHeader}>
                    <h2 className={style.modalTitle}>Modifier la tâche</h2>
                    <button className={style.closeBtn} onClick={onClose}>✕</button>
                </div>

                {error && <div className={style.error}>{error}</div>}

                {confirmDelete ? (
                    <div className={style.confirmDelete}>
                        <p className={style.confirmText}>Supprimer définitivement cette tâche ?</p>
                        <div className={style.modalActions}>
                            <button className={style.cancelBtn} onClick={() => setConfirmDelete(false)} disabled={submitting}>
                                Annuler
                            </button>
                            <button className={style.deleteConfirmBtn} onClick={handleDelete} disabled={submitting}>
                                {submitting ? 'Suppression...' : 'Supprimer'}
                            </button>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div className={style.field}>
                            <label className={style.label}>Nom *</label>
                            <input
                                className={style.input}
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className={style.field}>
                            <label className={style.label}>Description</label>
                            <textarea
                                className={style.textarea}
                                name="description"
                                value={form.description}
                                onChange={handleChange}
                                rows={3}
                            />
                        </div>

                        <div className={style.row}>
                            <div className={style.field}>
                                <label className={style.label}>Statut</label>
                                <select className={style.input} name="status" value={form.status} onChange={handleChange}>
                                    {COLUMNS.map(c => (
                                        <option key={c.status} value={c.status}>{c.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div className={style.field}>
                                <label className={style.label}>Priorité</label>
                                <select className={style.input} name="priority" value={form.priority} onChange={handleChange}>
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
                                onChange={handleChange}
                            />
                        </div>

                        <div className={style.modalActionsSpread}>
                            <button type="button" className={style.deleteBtn} onClick={() => setConfirmDelete(true)}>
                                Supprimer
                            </button>
                            <div className={style.modalActions}>
                                <button type="button" className={style.cancelBtn} onClick={onClose}>
                                    Annuler
                                </button>
                                <button type="submit" className={style.submitBtn} disabled={submitting}>
                                    {submitting ? 'Enregistrement...' : 'Enregistrer'}
                                </button>
                            </div>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
