import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import '../assets/styles/Toast.css';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
	id: string;
	type: ToastType;
	title?: string;
	message: string;
	duration: number;
	isClosing?: boolean;
}

interface ToastContextType {
	showToast: (message: string, type?: ToastType, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
	const context = useContext(ToastContext);
	if (!context) {
		throw new Error('useToast must be used within a ToastProvider');
	}
	return context;
};

const ToastItem: React.FC<{
	toast: Toast;
	onClose: (id: string) => void;
}> = ({ toast, onClose }) => {
	const [isPaused, setIsPaused] = useState(false);

	useEffect(() => {
		if (isPaused) return;

		const timer = setTimeout(() => {
			onClose(toast.id);
		}, toast.duration);

		return () => clearTimeout(timer);
	}, [toast.id, toast.duration, isPaused, onClose]);

	const getIcon = () => {
		switch (toast.type) {
			case 'success':
				return (
					<svg
						width="20"
						height="20"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
					>
						<path
							d="M22 11.08V12a10 10 0 1 1-5.93-9.14"
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
						<path
							d="M22 4L12 14.01l-3-3"
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
					</svg>
				);
			case 'error':
				return (
					<svg
						width="20"
						height="20"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
					>
						<circle
							cx="12"
							cy="12"
							r="10"
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
						<line
							x1="15"
							y1="9"
							x2="9"
							y2="15"
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
						<line
							x1="9"
							y1="9"
							x2="15"
							y2="15"
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
					</svg>
				);
			case 'warning':
				return (
					<svg
						width="20"
						height="20"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
					>
						<path
							d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
						<line
							x1="12"
							y1="9"
							x2="12"
							y2="13"
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
						<line
							x1="12"
							y1="17"
							x2="12.01"
							y2="17"
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
					</svg>
				);
			case 'info':
			default:
				return (
					<svg
						width="20"
						height="20"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
					>
						<circle
							cx="12"
							cy="12"
							r="10"
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
						<line
							x1="12"
							y1="16"
							x2="12"
							y2="12"
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
						<line
							x1="12"
							y1="8"
							x2="12.01"
							y2="8"
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
					</svg>
				);
		}
	};

	const getTitle = () => {
		if (toast.title) return toast.title;
		switch (toast.type) {
			case 'success':
				return 'Thành công';
			case 'error':
				return 'Thất bại';
			case 'warning':
				return 'Cảnh báo';
			case 'info':
				return 'Thông báo';
			default:
				return 'Thông báo';
		}
	};

	return (
		<div
			className={`toast-item toast-${toast.type} ${toast.isClosing ? 'closing' : ''}`}
			onMouseEnter={() => setIsPaused(true)}
			onMouseLeave={() => setIsPaused(false)}
		>
			<div className="toast-icon">{getIcon()}</div>
			<div className="toast-content">
				<div className="toast-title">{getTitle()}</div>
				<div className="toast-message">{toast.message}</div>
			</div>
			<button className="toast-close" onClick={() => onClose(toast.id)}>
				<svg
					width="16"
					height="16"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
				>
					<line
						x1="18"
						y1="6"
						x2="6"
						y2="18"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
					<line
						x1="6"
						y1="6"
						x2="18"
						y2="18"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
				</svg>
			</button>
			<div className="toast-progress">
				<div
					className="toast-progress-bar"
					style={{
						animationName: 'countdown',
						animationDuration: `${toast.duration}ms`,
						animationTimingFunction: 'linear',
						animationPlayState: isPaused ? 'paused' : 'running',
					}}
				/>
			</div>
		</div>
	);
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [toasts, setToasts] = useState<Toast[]>([]);

	const removeToast = useCallback((id: string) => {
		setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, isClosing: true } : t)));
		setTimeout(() => {
			setToasts((prev) => prev.filter((toast) => toast.id !== id));
		}, 300);
	}, []);

	const showToast = useCallback((message: string, type: ToastType = 'info', duration = 3000) => {
		const id = Date.now().toString();
		setToasts((prev) => [...prev, { id, type, message, duration }]);
	}, []);

	return (
		<ToastContext.Provider value={{ showToast }}>
			{children}
			<div className="toast-container">
				{toasts.map((toast) => (
					<ToastItem key={toast.id} toast={toast} onClose={removeToast} />
				))}
			</div>
		</ToastContext.Provider>
	);
};
