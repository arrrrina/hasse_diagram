const API_URL = 'http://localhost:8080/api';

export interface AuthResponse {
    token: string;
    role: string;
    fullName: string;
    variantNumber: number | null;
}

export async function login(username: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
        if (response.status === 401) {
            throw new Error('Неверный логин или пароль');
        }
        throw new Error('Ошибка сервера');
    }

    return response.json();
}

export interface RegisterPayload {
    username: string;
    password: string;
    firstName: string;
    lastName: string;
    middleName: string;
    role: 'TEACHER' | 'STUDENT';
    groupNumber?: string;
    variantNumber?: number;
}

export async function register(payload: RegisterPayload): Promise<void> {
    const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const message = await response.text();
        throw new Error(message || 'Ошибка регистрации');
    }
}

export function getToken(): string | null {
    return localStorage.getItem('token');
}

export function getRole(): string | null {
    return localStorage.getItem('role');
}

export function getFullName(): string | null {
    return localStorage.getItem('fullName');
}

export function saveAuth(auth: AuthResponse): void {
    localStorage.setItem('token', auth.token);
    localStorage.setItem('role', auth.role);
    localStorage.setItem('fullName', auth.fullName);
    localStorage.setItem('variantNumber', auth.variantNumber === null ? '' : String(auth.variantNumber));
}

export function logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('fullName');
    localStorage.removeItem('variantNumber');
}

export function isAuthenticated(): boolean {
    return !!getToken();
}

export function getVariantNumber(): number | null {
    const value = localStorage.getItem('variantNumber');
    if (!value) {
        return null;
    }
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
}
