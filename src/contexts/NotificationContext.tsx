import React, {
    createContext,
    useState,
    useContext,
    useEffect,
    type ReactNode,
    useCallback,
    useRef,
} from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext'; 

export interface Notification {
    id: number;
    type: 'SYSTEM' | 'ORDER' | 'COMIC' | 'COMMUNITY' | 'RECHARGE';
    title: string;
    message: string;
    isRead: number;
    createdAt: string;
    imageUrl?: string;
    referenceId?: number;
    referenceType?: string;
}

interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    loading: boolean;
    markAsRead: (id: number) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    fetchNotifications: () => Promise<void>;
    showNotification: (message: string, type?: 'success' | 'error' | 'info' | 'warning', duration?: number) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
const SOCKET_URL = API_URL.replace('/api', '');

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { currentUser, token } = useAuth();
    const { showToast } = useToast();

    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);

    const socketRef = useRef<Socket | null>(null);

    const getToastType = (type: Notification['type']): 'success' | 'error' | 'info' | 'warning' => {
        switch (type) {
            case 'ORDER':
            case 'RECHARGE':
                return 'success';
            case 'SYSTEM':
                return 'warning';
            case 'COMMUNITY':
            case 'COMIC':
            default:
                return 'info';
        }
    };

    const showNotification = useCallback((message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info', duration = 3000) => {
        showToast(message, type, duration);
    }, [showToast]);

    const fetchNotifications = useCallback(async () => {
        if (!currentUser || !token) return;
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/notifications?limit=20`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                setNotifications(data.notifications || []);
                setUnreadCount(data.unreadCount || 0);
            }
        } catch (err) {
            console.error('Lỗi tải thông báo:', err);
        } finally {
            setLoading(false);
        }
    }, [currentUser, token]);

    const markAsRead = async (id: number) => {
        if (!token) return;
        try {
            setNotifications((prev) =>
                prev.map((n) => (n.id === id ? { ...n, isRead: 1 } : n)),
            );
            setUnreadCount((prev) => Math.max(0, prev - 1));

            await fetch(`${API_URL}/notifications/${id}/read`, {
                method: 'PUT',
                headers: { Authorization: `Bearer ${token}` },
            });
        } catch (err) {
            console.error('Lỗi đánh dấu đã đọc:', err);
            fetchNotifications();
        }
    };

    const markAllAsRead = async () => {
        if (!token) return;
        try {
            setNotifications((prev) => prev.map((n) => ({ ...n, isRead: 1 })));
            setUnreadCount(0);

            await fetch(`${API_URL}/notifications/read-all`, {
                method: 'PUT',
                headers: { Authorization: `Bearer ${token}` },
            });
        } catch (err) {
            console.error('Lỗi đánh dấu tất cả:', err);
            fetchNotifications();
        }
    };

    useEffect(() => {
        if (currentUser) {
            fetchNotifications();

            socketRef.current = io(SOCKET_URL, {
                transports: ['websocket', 'polling'],
                withCredentials: true,
                reconnection: true,
                reconnectionAttempts: 5,
                reconnectionDelay: 1000,
                query: {
                    userId: currentUser.id,
                },
            });

            socketRef.current.on('connect', () => {
                console.log('✅ Connected to Notification Socket:', socketRef.current?.id);
                socketRef.current?.emit('join_user_room', currentUser.id);
            });

            socketRef.current.on('connect_error', (err) => {
                console.error('❌ Socket Connection Error:', err.message);
            });

            socketRef.current.on('new_notification', (newNotif: Notification) => {
                console.log('🔔 New Notification:', newNotif);

                setNotifications((prev) => [newNotif, ...prev]);
                setUnreadCount((prev) => prev + 1);

                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = newNotif.message;
                const plainMessage = tempDiv.textContent || tempDiv.innerText || newNotif.message;

                const toastType = getToastType(newNotif.type);
                showToast(plainMessage, toastType, 5000);
            });

            return () => {
                if (socketRef.current) {
                    socketRef.current.disconnect();
                    console.log('🔌 Socket disconnected');
                }
            };
        }
    }, [currentUser, token, fetchNotifications, showToast]);

    return (
        <NotificationContext.Provider
            value={{
                notifications,
                unreadCount,
                loading,
                markAsRead,
                markAllAsRead,
                fetchNotifications,
                showNotification, 
            }}
        >
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};