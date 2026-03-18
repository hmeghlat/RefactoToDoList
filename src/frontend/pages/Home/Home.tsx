import React from 'react';
import style from './Home.module.css';
import { logout, getUser } from '../../service/authService';
import { getAllProjects, createProject, type Project, type CreateProjectPayload, type ProjectStatus } from '../../service/projectService';

interface Props {
    onLogout: () => void;
    onOpenProject: (project: Project) => void;
}

const STATUS_LABELS: Record<ProjectStatus, string> = {
    NOT_STARTED: 'Non démarré',
    PENDING: 'En attente',
    IN_PROGRESS: 'En cours',
    DONE: 'Terminé',
};

const STATUS_OPTIONS: ProjectStatus[] = ['NOT_STARTED', 'PENDING', 'IN_PROGRESS', 'DONE'];

function formatDate(value: string | null): string {
    if (!value) return '—';
    return new Date(value).toLocaleDateString('fr-FR');
}

const EMPTY_FORM: CreateProjectPayload = {
    name: '',
    description: '',
    startDate: '',
    dueDate: '',
    budget: 0,
    status: 'NOT_STARTED',
};

export default function Home({ onLogout, onOpenProject }: Props) {
    const user = getUser();
    const [projects, setProjects] = React.useState<Project[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const [showModal, setShowModal] = React.useState(false);
    const [form, setForm] = React.useState<CreateProjectPayload>(EMPTY_FORM);
    const [formError, setFormError] = React.useState<string | null>(null);
    const [submitting, setSubmitting] = React.useState(false);

    const loadProjects = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getAllProjects();
            setProjects(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erreur inconnue');
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        loadProjects();
    }, []);

    const handleLogout = () => {
        logout();
        onLogout();
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: name === 'budget' ? Number(value) : value }));
    };

    const handleCreateProject = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);
        setSubmitting(true);
        try {
            const payload: CreateProjectPayload = {
                name: form.name,
                ...(form.description ? { description: form.description } : {}),
                ...(form.startDate ? { startDate: form.startDate } : {}),
                ...(form.dueDate ? { dueDate: form.dueDate } : {}),
                ...(form.budget ? { budget: form.budget } : {}),
                status: form.status,
            };
            const created = await createProject(payload);
            setProjects(prev => [created, ...prev]);
            setShowModal(false);
            setForm(EMPTY_FORM);
        } catch (err) {
            setFormError(err instanceof Error ? err.message : 'Erreur inconnue');
        } finally {
            setSubmitting(false);
        }
    };

    const initials = user ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase() : '?';
    const fullName = user ? `${user.firstName} ${user.lastName}` : 'Utilisateur';

    return (
        <div className={style.page}>

            {/* ── Header ── */}
            <header className={style.header}>
                <span className={style.brand}>TRAVAIL</span>
                <div className={style.userArea}>
                    <div className={style.avatar}>{initials}</div>
                    <span className={style.userName}>{fullName}</span>
                    <button className={style.logoutBtn} onClick={handleLogout}>
                        Se déconnecter
                    </button>
                </div>
            </header>

            {/* ── Contenu ── */}
            <main className={style.main}>
                <div className={style.topBar}>
                    <div>
                        <h1 className={style.title}>Mes projets</h1>
                        <p className={style.subtitle}>{projects.length} projet{projects.length !== 1 ? 's' : ''}</p>
                    </div>
                    <button className={style.newBtn} onClick={() => setShowModal(true)}>
                        + Nouveau projet
                    </button>
                </div>

                {error && <div className={style.error}>{error}</div>}

                {loading ? (
                    <div className={style.empty}>Chargement...</div>
                ) : projects.length === 0 ? (
                    <div className={style.emptyState}>
                        <p className={style.emptyIcon}>📋</p>
                        <p className={style.emptyText}>Aucun projet pour l'instant</p>
                        <p className={style.emptyHint}>Créez votre premier projet pour commencer</p>
                    </div>
                ) : (
                    <div className={style.grid}>
                        {projects.map(p => (
                            <div key={p.id} className={style.card} onClick={() => onOpenProject(p)} style={{ cursor: 'pointer' }}>
                                <div className={style.cardHeader}>
                                    <h2 className={style.cardName}>{p.name}</h2>
                                    <span className={`${style.badge} ${style[`badge_${p.status}`]}`}>
                                        {STATUS_LABELS[p.status]}
                                    </span>
                                </div>
                                {p.description && (
                                    <p className={style.cardDesc}>{p.description}</p>
                                )}
                                <div className={style.cardMeta}>
                                    <span>📅 {formatDate(p.startDate)} → {formatDate(p.dueDate)}</span>
                                    {p.budget > 0 && <span>💰 {p.budget.toLocaleString('fr-FR')} €</span>}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* ── Modal création ── */}
            {showModal && (
                <div className={style.overlay} onClick={() => setShowModal(false)}>
                    <div className={style.modal} onClick={e => e.stopPropagation()}>
                        <div className={style.modalHeader}>
                            <h2 className={style.modalTitle}>Nouveau projet</h2>
                            <button className={style.closeBtn} onClick={() => setShowModal(false)}>✕</button>
                        </div>

                        {formError && <div className={style.error}>{formError}</div>}

                        <form onSubmit={handleCreateProject}>
                            <div className={style.field}>
                                <label className={style.label}>Nom *</label>
                                <input
                                    className={style.input}
                                    name="name"
                                    value={form.name}
                                    onChange={handleFormChange}
                                    placeholder="Mon projet"
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
                                    <label className={style.label}>Date de début</label>
                                    <input
                                        className={style.input}
                                        type="date"
                                        name="startDate"
                                        value={form.startDate}
                                        onChange={handleFormChange}
                                    />
                                </div>
                                <div className={style.field}>
                                    <label className={style.label}>Date de fin</label>
                                    <input
                                        className={style.input}
                                        type="date"
                                        name="dueDate"
                                        value={form.dueDate}
                                        onChange={handleFormChange}
                                    />
                                </div>
                            </div>

                            <div className={style.row}>
                                <div className={style.field}>
                                    <label className={style.label}>Budget (€)</label>
                                    <input
                                        className={style.input}
                                        type="number"
                                        name="budget"
                                        value={form.budget}
                                        onChange={handleFormChange}
                                        min={0}
                                        placeholder="0"
                                    />
                                </div>
                                <div className={style.field}>
                                    <label className={style.label}>Statut</label>
                                    <select
                                        className={style.input}
                                        name="status"
                                        value={form.status}
                                        onChange={handleFormChange}
                                    >
                                        {STATUS_OPTIONS.map(s => (
                                            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className={style.modalActions}>
                                <button type="button" className={style.cancelBtn} onClick={() => setShowModal(false)}>
                                    Annuler
                                </button>
                                <button type="submit" className={style.submitBtn} disabled={submitting}>
                                    {submitting ? 'Création...' : 'Créer le projet'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
