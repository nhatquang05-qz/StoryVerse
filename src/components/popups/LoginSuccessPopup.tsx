import React from 'react';
import { FiCheckCircle, FiX } from 'react-icons/fi';
import './SuccessPopup.css';

interface LoginSuccessPopupProps {
  isOpen: boolean;
  onClose: () => void;
  username: string;
}

const LoginSuccessPopup: React.FC<LoginSuccessPopupProps> = ({ isOpen, onClose, username }) => {
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
        <h2 className="popup-title">Đăng Nhập Thành Công!</h2>
        <p className="popup-message">Bạn sẽ được chuyển hướng sau giây lát...</p>
      </div>
    </div>
  );
};

export default LoginSuccessPopup;