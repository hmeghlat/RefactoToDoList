const AUTH_BASE = '/auth';

import { RegisterPayload } from '../interface/Auth/RegisterPayload';
import { LoginPayload } from '../interface/Auth/LoginPayload';
import { AuthResponse } from '../interface/Auth/AuthResponse';

export async function register(payload: RegisterPayload): Promise<AuthResponse> {
    const response = await fetch(`${AUTH_BASE}/register`, {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message ?? 'Erreur lors de l\'inscription');
    }

    return response.json();
}

export async function login(payload: LoginPayload): Promise<AuthResponse> {
    const response = await fetch(`${AUTH_BASE}/login`, {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message ?? 'Email ou mot de passe incorrect');
    }

    return response.json();
}

export async function logout(): Promise<void> {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
}

export function saveUser(user: { id: string; firstName: string; lastName: string; email: string }): void {
    localStorage.setItem('user', JSON.stringify(user));
}

export function getUser(): { id: string; firstName: string; lastName: string; email: string } | null {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
}

export function getToken(): string | null {
    return localStorage.getItem('token');
}

export function saveToken(token: string): void {
    localStorage.setItem('token', token);
}

export function isAuthenticated(): boolean {
    return getToken() !== null;
}