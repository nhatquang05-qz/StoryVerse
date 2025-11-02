import React from 'react';
import { FiCheckCircle, FiX } from 'react-icons/fi';
import '../../styles/SuccessPopup.css';

interface RechargeSuccessPopupProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number; 
  newBalance: number; 
}

const RechargeSuccessPopup: React.FC<RechargeSuccessPopupProps> = ({ isOpen, onClose, amount, newBalance }) => {
  if (!isOpen) {
    return null;
  }

  const formatCoins = (coins: number) => {
    return new Intl.NumberFormat('vi-VN').format(coins);
  };

  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-content success-popup" onClick={(e) => e.stopPropagation()}>
        <button className="popup-close-btn" onClick={onClose}>
          <FiX />
        </button>
        <FiCheckCircle className="popup-icon success-icon" />
        <h2 className="popup-title">Nạp Xu Thành Công!</h2>
        <p className="popup-message">
          Bạn đã nạp thành công <strong>{formatCoins(amount)} Xu</strong> vào tài khoản.
        </p>
        <p className="popup-message">
          Số dư mới của bạn là: <strong>{formatCoins(newBalance)} Xu</strong>.
        </p>
        <button className="popup-action-btn" onClick={onClose}>
          OK
        </button>
      </div>
    </div>
  );
};

export default RechargeSuccessPopup;