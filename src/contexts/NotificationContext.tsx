import React, { createContext, useState, useContext, type ReactNode, useCallback } from 'react';

type NotificationType = 'success' | 'error' | 'info' | 'warning';

interface NotificationState {
	message: string;
	type: NotificationType;
	isVisible: boolean;
}

interface NotificationContextType {
	showNotification: (message: string, type?: NotificationType) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const AUTO_HIDE_DURATION = 3000;

const ToastNotification: React.FC<NotificationState> = ({ message, type, isVisible }) => {
	if (!isVisible) return null;

	return <div className={`toast-notification ${type} ${isVisible ? 'show' : ''}`}>{message}</div>;
};

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
	const [notification, setNotification] = useState<NotificationState>({
		message: '',
		type: 'info',
		isVisible: false,
	});

	const showNotification = useCallback((message: string, type: NotificationType = 'info') => {
		setNotification({ message, type, isVisible: true });

		setTimeout(() => {
			setNotification((prev) => ({ ...prev, isVisible: false }));
		}, AUTO_HIDE_DURATION);
	}, []);

	return (
		<NotificationContext.Provider value={{ showNotification }}>
			{children}
			<ToastNotification
				message={notification.message}
				type={notification.type}
				isVisible={notification.isVisible}
			/>
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
