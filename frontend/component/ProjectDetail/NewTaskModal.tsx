import React from 'react';
import style from '../../pages/ProjectDetail/ProjectDetail.module.css';
import { createTask } from '../../service/taskService';
import type { Task } from '../../interface/Task/Task';
import type { TaskStatus } from '../../interface/Task/TaskStatus';
import type { TaskPriority } from '../../interface/Task/TaskPriority';
import type { CreateTaskPayload } from '../../interface/Task/CreateTaskPayload';
import { COLUMNS } from '../../constant/Columns';
import { PRIORITIES } from '../../constant/Priorities';
import { EMPTY_TASK_FORM } from '../../constant/EmptyTaskForm';

interface Props {
    projectId: number;
    userId: number;
    onClose: () => void;
    onCreated: (task: Task) => void;
}

export default function NewTaskModal({ projectId, userId, onClose, onCreated }: Props) {
    const [form, setForm] = React.useState(EMPTY_TASK_FORM);
    const [formError, setFormError] = React.useState<string | null>(null);
    const [submitting, setSubmitting] = React.useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);
        setSubmitting(true);
        try {
            const payload: CreateTaskPayload = {
                projectId,
                userId,
                name: form.name,
                ...(form.description ? { description: form.description } : {}),
                priority: form.priority as TaskPriority,
                status: form.status as TaskStatus,
                ...(form.dueDate ? { dueDate: form.dueDate } : {}),
            };
            const created = await createTask(payload);
            onCreated(created);
            onClose();
        } catch (err) {
            setFormError(err instanceof Error ? err.message : 'Erreur inconnue');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className={style.overlay} onClick={onClose}>
            <div className={style.modal} onClick={e => e.stopPropagation()}>
                <div className={style.modalHeader}>
                    <h2 className={style.modalTitle}>Nouvelle tâche</h2>
                    <button className={style.closeBtn} onClick={onClose}>✕</button>
                </div>

                {formError && <div className={style.error}>{formError}</div>}

                <form onSubmit={handleSubmit}>
                    <div className={style.field}>
                        <label className={style.label}>Nom *</label>
                        <input
                            className={style.input}
                            name="name"
                            value={form.name}
                            onChange={handleChange}
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
                            onChange={handleChange}
                            placeholder="Description optionnelle..."
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

                    <div className={style.modalActions}>
                        <button type="button" className={style.cancelBtn} onClick={onClose}>
                            Annuler
                        </button>
                        <button type="submit" className={style.submitBtn} disabled={submitting}>
                            {submitting ? 'Création...' : 'Créer'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
