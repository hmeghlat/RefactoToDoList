import React from 'react';
import { logout } from '../../service/authService';

interface Props {
    onLogout: () => void;
}

export default function Home({ onLogout }: Props) {
    const handleLogout = () => {
        logout();
        onLogout();
    };

    return (
        <div style={{ padding: '2rem' }}>
            <h1>Bienvenue sur TRAVAIL</h1>
            <p>Vous êtes connecté.</p>
            <button onClick={handleLogout}>Se déconnecter</button>
        </div>
    );
}
