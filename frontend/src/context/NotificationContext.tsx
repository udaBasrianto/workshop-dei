import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

type NotificationType = 'success' | 'error' | 'info' | 'warning';

interface Notification {
    id: number;
    type: NotificationType;
    message: string;
}

interface NotificationContextType {
    showNotification: (type: NotificationType, message: string) => void;
    success: (message: string) => void;
    error: (message: string) => void;
    info: (message: string) => void;
    warning: (message: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const removeNotification = useCallback((id: number) => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, []);

    const showNotification = useCallback((type: NotificationType, message: string) => {
        const id = Date.now();
        setNotifications((prev) => [...prev, { id, type, message }]);
        setTimeout(() => removeNotification(id), 5000);
    }, [removeNotification]);

    const success = (msg: string) => showNotification('success', msg);
    const error = (msg: string) => showNotification('error', msg);
    const info = (msg: string) => showNotification('info', msg);
    const warning = (msg: string) => showNotification('warning', msg);

    return (
        <NotificationContext.Provider value={{ showNotification, success, error, info, warning }}>
            {children}
            {/* Toast Container */}
            <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 w-full max-w-[400px] px-4 sm:px-0">
                {notifications.map((n) => (
                    <div
                        key={n.id}
                        className={`
                            flex items-center gap-3 p-4 rounded-2xl shadow-2xl border backdrop-blur-md
                            animate-in slide-in-from-right-full duration-300
                            ${n.type === 'success' ? 'bg-green-500/90 border-green-400 text-white' : ''}
                            ${n.type === 'error' ? 'bg-red-500/90 border-red-400 text-white' : ''}
                            ${n.type === 'warning' ? 'bg-amber-500/90 border-amber-400 text-white' : ''}
                            ${n.type === 'info' ? 'bg-blue-500/90 border-blue-400 text-white' : ''}
                        `}
                    >
                        <div className="shrink-0">
                            {n.type === 'success' && <CheckCircle className="w-6 h-6" />}
                            {n.type === 'error' && <XCircle className="w-6 h-6" />}
                            {n.type === 'warning' && <AlertCircle className="w-6 h-6" />}
                            {n.type === 'info' && <Info className="w-6 h-6" />}
                        </div>
                        <p className="flex-1 font-semibold text-sm leading-tight">{n.message}</p>
                        <button
                            onClick={() => removeNotification(n.id)}
                            className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>
        </NotificationContext.Provider>
    );
};

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};
