import { useEffect, useState } from 'react';

export type NotificationType =
    | 'task.created'
    | 'task.completed'
    | 'task.cancelled'
    | 'task.reopened'
    | 'task.started'
    | 'task.deleted'
    | 'project.completed';

export interface Notification {
    id: number;
    type: NotificationType;
    taskId?: number;
    projectId?: number;
}

const WS_URL = 'ws://localhost:3003';
const AUTO_DISMISS_MS = 5000;

let notifCounter = 0;

export function useNotifications() {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const dismiss = (id: number) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    useEffect(() => {
        let active = true;
        let ws: WebSocket | null = null;
        let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

        const connect = () => {
            if (!active) return;

            ws = new WebSocket(WS_URL);

            ws.onmessage = (event) => {
                if (!active) return;
                try {
                    // Structure : { type: "task.completed", data: { type: "TaskCompleted", occurredAt, data: { taskId, projectId } } }
                    const msg = JSON.parse(event.data);
                    if (!msg.type) return;

                    const inner = msg.data?.data ?? msg.data ?? {};

                    const notif: Notification = {
                        id: ++notifCounter,
                        type: msg.type as NotificationType,
                        taskId: inner.taskId,
                        projectId: inner.projectId ?? msg.data?.data?.projectId,
                    };

                    setNotifications(prev => [...prev, notif]);
                    setTimeout(() => {
                        if (active) setNotifications(prev => prev.filter(n => n.id !== notif.id));
                    }, AUTO_DISMISS_MS);
                } catch {
                    // message non-JSON ("Connexion WebSocket établie"), on ignore
                }
            };

            ws.onclose = () => {
                if (active) reconnectTimer = setTimeout(connect, 3000);
            };

            ws.onerror = () => ws?.close();
        };

        connect();

        return () => {
            active = false;
            if (reconnectTimer) clearTimeout(reconnectTimer);
            ws?.close();
        };
    }, []);

    return { notifications, dismiss };
}
