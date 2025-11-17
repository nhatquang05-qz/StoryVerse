import React from 'react';
import { FiX, FiAlertTriangle } from 'react-icons/fi';
import '../../assets/styles/ErrorPopup.css'; 

interface ErrorPopupProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
}

const ErrorPopup: React.FC<ErrorPopupProps> = ({ isOpen, onClose, title, message }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-content success-popup" onClick={(e) => e.stopPropagation()} style={{ borderColor: 'var(--clr-error-text)', boxShadow: `0 0 15px var(--clr-error-border)` }}>
        <button className="popup-close-btn" onClick={onClose}>
          <FiX />
        </button>
        <FiAlertTriangle className="popup-icon" style={{ color: 'var(--clr-error-text)' }} />
        <h2 className="popup-title" style={{ color: 'var(--clr-error-text)' }}>{title}</h2>
        <p className="popup-message">
          {message}
        </p>
        <button className="popup-action-btn" onClick={onClose} style={{ backgroundColor: 'var(--clr-error-text)' }}>
          Đã hiểu
        </button>
      </div>
    </div>
  );
};

export default ErrorPopup;