import React from 'react';
import { FiCheckCircle, FiX } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import '../../assets/styles/SuccessPopup.css';

interface RegisterSuccessPopupProps {
	isOpen: boolean;
	onClose: () => void;
}

const RegisterSuccessPopup: React.FC<RegisterSuccessPopupProps> = ({ isOpen, onClose }) => {
	if (!isOpen) {
		return null;
	}

	return (
		<div className="popup-overlay" onClick={onClose}>
			<div className="popup-content success-popup" onClick={(e) => e.stopPropagation()}>
				<button className="popup-close-btn" onClick={onClose}>
					<FiX />
				</button>
				<FiCheckCircle className="popup-icon success-icon" />
				<h2 className="popup-title">Đăng Ký Thành Công!</h2>
				<p className="popup-message">Tài khoản của bạn đã được tạo.</p>
				<p className="popup-message">Vui lòng đăng nhập để tiếp tục.</p>
				<Link to="/login" className="popup-action-btn" onClick={onClose}>
					Đến Trang Đăng Nhập
				</Link>
			</div>
		</div>
	);
};

export default RegisterSuccessPopup;
