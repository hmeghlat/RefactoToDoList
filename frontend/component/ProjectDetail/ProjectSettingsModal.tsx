import React from 'react';
import style from '../../pages/ProjectDetail/ProjectDetail.module.css';
import { updateProject, deleteProject } from '../../service/projectService';
import type { Project } from '../../interface/Project/Project';
import type { UpdateProjectPayload } from '../../interface/Project/UpdateProjectPayload';
import { PROJECT_STATUS_LABELS } from '../../constant/ProjectStatusLabels';

interface Props {
    project: Project;
    onClose: () => void;
    onUpdated: (project: Project) => void;
    onDeleted: () => void;
}

export default function ProjectSettingsModal({ project, onClose, onUpdated, onDeleted }: Props) {
    const [form, setForm] = React.useState<UpdateProjectPayload & { startDate: string; dueDate: string; budget: string }>({
        name: project.name,
        description: project.description ?? '',
        status: project.status,
        startDate: project.startDate ? project.startDate.slice(0, 10) : '',
        dueDate: project.dueDate ? project.dueDate.slice(0, 10) : '',
        budget: project.budget != null ? String(project.budget) : '',
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
            const payload: UpdateProjectPayload = {
                name: form.name,
                description: form.description || undefined,
                status: form.status,
                startDate: form.startDate || null,
                dueDate: form.dueDate || null,
                budget: form.budget ? Number(form.budget) : undefined,
            };
            const updated = await updateProject(project.id, payload);
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
            await deleteProject(project.id);
            onDeleted();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erreur inconnue');
            setSubmitting(false);
        }
    };

    return (
        <div className={style.overlay} onClick={onClose}>
            <div className={style.modal} onClick={e => e.stopPropagation()}>
                <div className={style.modalHeader}>
                    <h2 className={style.modalTitle}>Paramètres du projet</h2>
                    <button className={style.closeBtn} onClick={onClose}>✕</button>
                </div>

                {error && <div className={style.error}>{error}</div>}

                {confirmDelete ? (
                    <div className={style.confirmDelete}>
                        <p className={style.confirmText}>Supprimer définitivement ce projet et toutes ses tâches ?</p>
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
                                value={form.description ?? ''}
                                onChange={handleChange}
                                rows={3}
                            />
                        </div>

                        <div className={style.row}>
                            <div className={style.field}>
                                <label className={style.label}>Statut</label>
                                <select className={style.input} name="status" value={form.status} onChange={handleChange}>
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
                                    value={form.budget}
                                    onChange={handleChange}
                                    min={0}
                                />
                            </div>
                        </div>

                        <div className={style.row}>
                            <div className={style.field}>
                                <label className={style.label}>Date de début</label>
                                <input className={style.input} type="date" name="startDate" value={form.startDate} onChange={handleChange} />
                            </div>
                            <div className={style.field}>
                                <label className={style.label}>Échéance</label>
                                <input className={style.input} type="date" name="dueDate" value={form.dueDate} onChange={handleChange} />
                            </div>
                        </div>

                        <div className={style.modalActionsSpread}>
                            <button type="button" className={style.deleteBtn} onClick={() => setConfirmDelete(true)}>
                                Supprimer le projet
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
