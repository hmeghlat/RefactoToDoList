import React from 'react';
import style from './Login.module.css';
import { login, saveToken, saveUser } from '../../../service/authService';

const FEATURES = [
    { icon: '✓', label: 'Retrouvez toutes vos tâches en un clin d\'œil' },
    { icon: '↻', label: 'Reprenez là où vous vous étiez arrêté' },
    { icon: '⊙', label: 'Vos données synchronisées en temps réel' },
];

interface Props {
    onGoToRegister: () => void;
    onSuccess: () => void;
}

export default function Login({ onGoToRegister, onSuccess }: Props) {
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [error, setError] = React.useState<string | null>(null);
    const [loading, setLoading] = React.useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const { token, user } = await login({ email, password });
            saveToken(token);
            saveUser(user);
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
                        Bon retour<br />parmi nous.
                    </h1>
                    <p className={style.tagline}>
                        Connectez-vous pour retrouver vos tâches
                        et reprendre là où vous vous étiez arrêté.
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
                    <h2 className={style.cardTitle}>Se connecter</h2>
                    <p className={style.cardSubtitle}>Entrez vos identifiants pour continuer</p>

                    {error && <div className={style.error}>{error}</div>}

                    <form onSubmit={handleSubmit}>
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
                            {loading ? 'Connexion en cours...' : 'Se connecter'}
                        </button>
                    </form>

                    <p className={style.registerLink}>
                        Pas encore de compte ?{' '}
                        <span className={style.link} onClick={onGoToRegister}>S'inscrire</span>
                    </p>
                </div>
            </div>

        </div>
    );
}