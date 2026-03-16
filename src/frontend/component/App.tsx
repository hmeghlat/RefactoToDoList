import React from 'react';
import Register from '../pages/Auth/Register/Register';
import Login from '../pages/Auth/Login/Login';
import Home from '../pages/Home/Home';
import { isAuthenticated } from '../service/authService';

type Page = 'register' | 'login' | 'home';

export default function App() {
    const [page, setPage] = React.useState<Page>(isAuthenticated() ? 'home' : 'register');

    if (page === 'home') {
        return <Home onLogout={() => setPage('login')} />;
    }

    if (page === 'login') {
        return <Login onGoToRegister={() => setPage('register')} onSuccess={() => setPage('home')} />;
    }

    return <Register onGoToLogin={() => setPage('login')} onSuccess={() => setPage('home')} />;
}