import React from 'react';
import { getFullName, getRole, logout } from '../../services/auth';
import './styles/AppHeader.css';

interface AppHeaderProps {
    onLogout: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ onLogout }) => {
    const fullName = getFullName();
    const role = getRole();

    const handleLogout = () => {
        logout();
        onLogout();
    };

    const roleLabel = role === 'TEACHER' ? 'Преподаватель' : 'Студент';

    return (
        <header className="app-header">
            <h1 className="app-header-title">БДЗ по теории графов</h1>
            <div className="app-header-user">
                <span className="app-header-name">
                    {fullName} ({roleLabel})
                </span>
                <button onClick={handleLogout} className="logout-button">
                    Выйти
                </button>
            </div>
        </header>
    );
};
