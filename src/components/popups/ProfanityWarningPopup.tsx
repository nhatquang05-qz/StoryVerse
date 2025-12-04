import React from 'react';
import { FiAlertTriangle, FiX } from 'react-icons/fi';
import '../../assets/styles/SuccessPopup.css';

interface ProfanityWarningPopupProps {
	isOpen: boolean;
	onClose: () => void;
}

const ProfanityWarningPopup: React.FC<ProfanityWarningPopupProps> = ({ isOpen, onClose }) => {
	if (!isOpen) {
		return null;
	}

	return (
		<div className="popup-overlay" onClick={onClose}>
			<div
				className="popup-content success-popup"
				onClick={(e) => e.stopPropagation()}
				style={{
					borderColor: 'var(--clr-error-text)',
					boxShadow: `0 0 15px var(--clr-error-border)`,
				}}
			>
				<button className="popup-close-btn" onClick={onClose}>
					<FiX />
				</button>
				<FiAlertTriangle
					className="popup-icon"
					style={{ color: 'var(--clr-error-text)' }}
				/>
				<h2 className="popup-title" style={{ color: 'var(--clr-error-text)' }}>
					Cảnh Báo Ngôn Từ
				</h2>
				<p className="popup-message">Tin nhắn của bạn chứa từ ngữ không phù hợp.</p>
				<p className="popup-message">Vui lòng sử dụng ngôn từ lịch sự khi trò chuyện.</p>
				<button
					className="popup-action-btn"
					onClick={onClose}
					style={{ backgroundColor: 'var(--clr-error-text)' }}
				>
					Đã hiểu
				</button>
			</div>
		</div>
	);
};

export default ProfanityWarningPopup;
