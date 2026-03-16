import React from 'react';
import style from './Register.module.css';
import { register, saveToken } from '../../../service/authService';

const FEATURES = [
    { icon: '✓', label: 'Créez et organisez vos tâches en quelques clics' },
    { icon: '↻', label: 'Suivez votre progression en temps réel' },
    { icon: '⊙', label: 'Accédez à vos listes depuis n\'importe où' },
];

interface Props {
    onGoToLogin: () => void;
    onSuccess: () => void;
}

export default function Register({ onGoToLogin, onSuccess }: Props) {
    const [firstName, setFirstName] = React.useState('');
    const [lastName, setLastName] = React.useState('');
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [error, setError] = React.useState<string | null>(null);
    const [loading, setLoading] = React.useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const { token } = await register({ firstName, lastName, email, password });
            saveToken(token);
            onSuccess();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Une erreur est survenue');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={style.page}>

            {/* ── Panneau gauche ── */}
            <div className={style.left}>
                <div className={style.decoCircle} style={{ width: 400, height: 400, top: -120, right: -120 }} />
                <div className={style.decoCircle} style={{ width: 220, height: 220, bottom: 80, right: 60 }} />

                <span className={style.brand}>TRAVAIL</span>

                <div className={style.leftBody}>
                    <h1 className={style.headline}>
                        Organisez vos<br />tâches,<br />simplement.
                    </h1>
                    <p className={style.tagline}>
                        Un outil pensé pour vous aider à rester concentré,
                        prioriser l'essentiel et accomplir plus chaque jour.
                    </p>
                    <div className={style.features}>
                        {FEATURES.map((f, i) => (
                            <div key={i} className={style.feature}>
                                <span className={style.featureIcon}>{f.icon}</span>
                                {f.label}
                            </div>
                        ))}
                    </div>
                </div>

                <span className={style.footer}>© 2025 TRAVAIL — Tous droits réservés</span>
            </div>

            {/* ── Panneau droit ── */}
            <div className={style.right}>
                <div className={style.card}>
                    <h2 className={style.cardTitle}>Créer un compte</h2>
                    <p className={style.cardSubtitle}>Remplissez le formulaire pour commencer</p>

                    {error && <div className={style.error}>{error}</div>}

                    <form onSubmit={handleSubmit}>
                        <div className={style.row}>
                            <div className={style.field}>
                                <label className={style.label} htmlFor="firstName">Prénom</label>
                                <input
                                    className={style.input}
                                    id="firstName"
                                    type="text"
                                    placeholder="Jean"
                                    value={firstName}
                                    onChange={e => setFirstName(e.target.value)}
                                    required
                                />
                            </div>
                            <div className={style.field}>
                                <label className={style.label} htmlFor="lastName">Nom</label>
                                <input
                                    className={style.input}
                                    id="lastName"
                                    type="text"
                                    placeholder="Dupont"
                                    value={lastName}
                                    onChange={e => setLastName(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className={style.field}>
                            <label className={style.label} htmlFor="email">Adresse email</label>
                            <input
                                className={style.input}
                                id="email"
                                type="email"
                                placeholder="jean.dupont@email.com"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className={style.field}>
                            <label className={style.label} htmlFor="password">Mot de passe</label>
                            <input
                                className={style.input}
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <button className={style.button} type="submit" disabled={loading}>
                            {loading ? 'Inscription en cours...' : "S'inscrire"}
                        </button>
                    </form>

                    <p className={style.loginLink}>
                        Déjà un compte ?{' '}
                        <span className={style.link} onClick={onGoToLogin}>Se connecter</span>
                    </p>
                </div>
            </div>

        </div>
    );
}