import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircleFill, XCircleFill } from 'react-bootstrap-icons';
import '../../assets/styles/SuccessPopup.css';

interface LoginSuccessPopupProps {
	isOpen: boolean;
	onClose: () => void;
	username: string;
}

const LoginSuccessPopup: React.FC<LoginSuccessPopupProps> = ({ isOpen, onClose, username }) => {
	const navigate = useNavigate();
	const timerRef = useRef<number | null>(null);

	useEffect(() => {
		if (isOpen) {
			timerRef.current = window.setTimeout(() => {
				onClose();
				navigate('/', { replace: true });
			}, 3000);
		}
		return () => {
			if (timerRef.current) {
				clearTimeout(timerRef.current);
			}
		};
	}, [isOpen, onClose, navigate]);

	if (!isOpen) return null;

	const handleImmediateClose = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (timerRef.current) {
			clearTimeout(timerRef.current);
		}
		onClose();
	};

	return (
		<div className={`popup-overlay ${isOpen ? 'show' : ''}`} onClick={handleImmediateClose}>
			<div className="popup-content login-success-popup" onClick={(e) => e.stopPropagation()}>
				<button className="popup-close-btn" onClick={handleImmediateClose}>
					<XCircleFill />
				</button>

				<div className="popup-icon success-icon">
					<CheckCircleFill />
				</div>

				<h3 className="popup-title">Đăng Nhập Thành Công!</h3>
				<p className="popup-message">
					Chào mừng trở lại, <strong>{username}</strong>!
					<br />
					Bạn sẽ được chuyển hướng sau giây lát...
				</p>

				<button className="popup-action-btn primary-btn" onClick={handleImmediateClose}>
					Tiếp tục
				</button>
			</div>
		</div>
	);
};

export default LoginSuccessPopup;
