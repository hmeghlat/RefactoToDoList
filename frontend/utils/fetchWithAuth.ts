import { getToken } from '../service/authService';

export const UNAUTHORIZED_EVENT = 'app:unauthorized';

export async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
    const res = await fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${getToken()}`,
            ...options.headers,
        },
    });

    if (res.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
    }

    return res;
}
