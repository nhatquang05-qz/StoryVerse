import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../../assets/styles/SuccessPopup.css';
import { FiAlertCircle } from 'react-icons/fi';

interface SessionExpiredPopupProps {
	isOpen: boolean;
	onClose: () => void;
}

const SessionExpiredPopup: React.FC<SessionExpiredPopupProps> = ({ isOpen, onClose }) => {
	const navigate = useNavigate();

	if (!isOpen) return null;

	const handleLoginRedirect = () => {
		onClose();
		navigate('/login');
	};

	return (
		<div className="popup-overlay">
			<div className="popup-content">
				<div className="popup-icon" style={{ color: '#e74c3c' }}>
					<FiAlertCircle />
				</div>
				<h2 className="popup-title">Phiên đăng nhập hết hạn</h2>
				<p className="popup-message">
					Phiên làm việc của bạn đã kết thúc.
					<br />
					Vui lòng đăng nhập lại để tiếp tục.
				</p>
				<button className="popup-button" onClick={handleLoginRedirect}>
					Đăng nhập lại
				</button>
			</div>
		</div>
	);
};

export default SessionExpiredPopup;
