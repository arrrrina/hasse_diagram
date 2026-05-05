import React, { useState } from 'react';
import { login, register, saveAuth } from '../../services/auth';
import './styles/LoginPage.css';

interface LoginPageProps {
    onLoginSuccess: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
    const [mode, setMode] = useState<'login' | 'register'>('login');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<'TEACHER' | 'STUDENT'>('TEACHER');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [middleName, setMiddleName] = useState('');
    const [groupNumber, setGroupNumber] = useState('');
    const [variantNumber, setVariantNumber] = useState('');
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLoginSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');
        setLoading(true);

        try {
            const auth = await login(username, password);
            saveAuth(auth);
            onLoginSuccess();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Ошибка авторизации');
        } finally {
            setLoading(false);
        }
    };

    const handleRegisterSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');
        setLoading(true);

        try {
            await register({
                username,
                password,
                role,
                firstName,
                lastName,
                middleName,
                groupNumber: role === 'STUDENT' ? groupNumber : undefined,
                variantNumber: role === 'STUDENT' ? Number(variantNumber) : undefined,
            });

            setSuccessMessage('Регистрация прошла успешно. Теперь войдите в систему.');
            setMode('login');
            setPassword('');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Ошибка регистрации');
        } finally {
            setLoading(false);
        }
    };

    const isRegisterFormValid = Boolean(
        username.trim() &&
        password.trim() &&
        firstName.trim() &&
        lastName.trim() &&
        middleName.trim() &&
        (role === 'TEACHER' || (groupNumber.trim() && Number(variantNumber) > 0))
    );

    return (
        <div className="login-page">
            <div className="login-card">
                <h1 className="login-title">БДЗ по теории графов</h1>
                <p className="login-subtitle">{mode === 'login' ? 'Вход в систему' : 'Регистрация'}</p>

                <div className="auth-tabs">
                    <button
                        type="button"
                        className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
                        onClick={() => {
                            setMode('login');
                            setError('');
                            setSuccessMessage('');
                        }}
                    >
                        Вход
                    </button>
                    <button
                        type="button"
                        className={`auth-tab ${mode === 'register' ? 'active' : ''}`}
                        onClick={() => {
                            setMode('register');
                            setError('');
                            setSuccessMessage('');
                        }}
                    >
                        Регистрация
                    </button>
                </div>

                <form onSubmit={mode === 'login' ? handleLoginSubmit : handleRegisterSubmit} className="login-form">
                    <div className="login-field">
                        <label htmlFor="username">Логин</label>
                        <input
                            id="username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Введите логин"
                            autoFocus
                        />
                    </div>

                    <div className="login-field">
                        <label htmlFor="password">Пароль</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Введите пароль"
                        />
                    </div>

                    {mode === 'register' && (
                        <>
                            <div className="login-field">
                                <label htmlFor="lastName">Фамилия</label>
                                <input id="lastName" type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                            </div>

                            <div className="login-field">
                                <label htmlFor="firstName">Имя</label>
                                <input id="firstName" type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                            </div>

                            <div className="login-field">
                                <label htmlFor="middleName">Отчество</label>
                                <input id="middleName" type="text" value={middleName} onChange={(e) => setMiddleName(e.target.value)} />
                            </div>

                            <div className="login-field">
                                <label htmlFor="role">Роль</label>
                                <select id="role" value={role} onChange={(e) => setRole(e.target.value as 'TEACHER' | 'STUDENT')}>
                                    <option value="TEACHER">Преподаватель</option>
                                    <option value="STUDENT">Студент</option>
                                </select>
                            </div>

                            {role === 'STUDENT' && (
                                <>
                                    <div className="login-field">
                                        <label htmlFor="groupNumber">Номер группы</label>
                                        <input id="groupNumber" type="text" value={groupNumber} onChange={(e) => setGroupNumber(e.target.value)} placeholder="Например: Б22-524" />
                                    </div>
                                    <div className="login-field">
                                        <label htmlFor="variantNumber">Номер варианта</label>
                                        <input id="variantNumber" type="number" min={1} value={variantNumber} onChange={(e) => setVariantNumber(e.target.value)} />
                                    </div>
                                </>
                            )}
                        </>
                    )}

                    {error && <div className="login-error">{error}</div>}
                    {successMessage && <div className="login-success">{successMessage}</div>}

                    <button
                        type="submit"
                        className="login-button"
                        disabled={loading || (mode === 'login' ? !username || !password : !isRegisterFormValid)}
                    >
                        {loading ? (mode === 'login' ? 'Вход...' : 'Регистрация...') : (mode === 'login' ? 'Войти' : 'Зарегистрироваться')}
                    </button>
                </form>
            </div>
        </div>
    );
};
