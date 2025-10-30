import React, { useEffect, useRef } from 'react';
import { FiCheckCircle, FiX } from 'react-icons/fi';
import './SuccessPopup.css';

interface LoginSuccessPopupProps {
  isOpen: boolean;
  onClose: () => void;
  username: string;
}

const LoginSuccessPopup: React.FC<LoginSuccessPopupProps> = ({ isOpen, onClose, username }) => {
  
  const timerRef = useRef<number | null>(null);
  
  useEffect(() => {
    if (isOpen) {
      timerRef.current = window.setTimeout(() => {
        onClose(); 
      }, 2000); 
    }
    
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }
  
  const handleImmediateClose = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (timerRef.current) {
          clearTimeout(timerRef.current);
      }
      onClose();
  };

  return (
    <div className="popup-overlay" onClick={handleImmediateClose}>
      <div className="popup-content success-popup" onClick={(e) => e.stopPropagation()}>
        <button className="popup-close-btn" onClick={handleImmediateClose}>
          <FiX />
        </button>
        <FiCheckCircle className="popup-icon success-icon" />
        <h2 className="popup-title">Đăng Nhập Thành Công!</h2>
        <p className="popup-message">Chào mừng trở lại, **{username}**!</p>
        <p className="popup-message">
            Bạn sẽ được chuyển hướng sau giây lát...
        </p>
        <button 
            className="popup-action-btn" 
            onClick={handleImmediateClose} 
            style={{ marginTop: '0.5rem' }}
        >
          Tiếp tục
        </button>
      </div>
    </div>
  );
};

export default LoginSuccessPopup;