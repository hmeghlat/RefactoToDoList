import React from 'react';
import type { Notification, NotificationType } from '../hooks/useNotifications';

interface Props {
    notifications: Notification[];
    onDismiss: (id: number) => void;
}

const LABELS: Record<NotificationType, { icon: string; color: string; text: (n: Notification) => string }> = {
    'task.created':      { icon: '📝', color: '#2563eb', text: (n) => `Tâche #${n.taskId} créée` },
    'task.started':      { icon: '▶️',  color: '#0891b2', text: (n) => `Tâche #${n.taskId} démarrée` },
    'task.completed':    { icon: '✅', color: '#16a34a', text: (n) => `Tâche #${n.taskId} terminée` },
    'task.cancelled':    { icon: '🚫', color: '#dc2626', text: (n) => `Tâche #${n.taskId} annulée` },
    'task.deleted':      { icon: '🗑️', color: '#6b7280', text: (n) => `Tâche #${n.taskId} supprimée` },
    'task.reopened':     { icon: '🔄', color: '#d97706', text: (n) => `Tâche #${n.taskId} réouverte` },
    'project.completed': { icon: '🎉', color: '#7c3aed', text: (n) => `Projet #${n.projectId} terminé — toutes les tâches sont complétées !` },
};

const containerStyle: React.CSSProperties = {
    position: 'fixed',
    bottom: '24px',
    right: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    zIndex: 1000,
    pointerEvents: 'none',
};

function toastStyle(color: string): React.CSSProperties {
    return {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        backgroundColor: '#ffffff',
        borderLeft: `4px solid ${color}`,
        borderRadius: '8px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
        padding: '12px 16px',
        minWidth: '280px',
        maxWidth: '360px',
        fontFamily: "'Inter', sans-serif",
        pointerEvents: 'all',
        animation: 'slideIn 0.2s ease',
    };
}

const iconStyle: React.CSSProperties = { fontSize: '1.2rem', flexShrink: 0 };
const textStyle: React.CSSProperties = { fontSize: '0.875rem', color: '#1f2937', flex: 1, lineHeight: 1.4 };
const closeStyle: React.CSSProperties = {
    background: 'none', border: 'none', cursor: 'pointer',
    color: '#9ca3af', fontSize: '1rem', padding: 0, flexShrink: 0, lineHeight: 1,
};

export default function NotificationToast({ notifications, onDismiss }: Props) {
    if (notifications.length === 0) return null;

    return (
        <>
            <style>{`
                @keyframes slideIn {
                    from { transform: translateX(110%); opacity: 0; }
                    to   { transform: translateX(0);    opacity: 1; }
                }
            `}</style>
            <div style={containerStyle}>
                {notifications.map(n => {
                    const config = LABELS[n.type] ?? { icon: '🔔', color: '#6b7280', text: () => n.type };
                    return (
                        <div key={n.id} style={toastStyle(config.color)}>
                            <span style={iconStyle}>{config.icon}</span>
                            <span style={textStyle}>{config.text(n)}</span>
                            <button style={closeStyle} onClick={() => onDismiss(n.id)}>✕</button>
                        </div>
                    );
                })}
            </div>
        </>
    );
}
