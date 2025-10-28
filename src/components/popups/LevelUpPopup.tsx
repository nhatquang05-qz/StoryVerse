// src/components/popups/LevelUpPopup.tsx
import React from 'react';
import { FiAward, FiX } from 'react-icons/fi'; // Hoặc FiStar, FiArrowUpCircle
import { useAuth } from '../../contexts/AuthContext'; // Import useAuth để lấy màu sắc
import './SuccessPopup.css'; // Sử dụng lại CSS chung

interface LevelUpPopupProps {
  isOpen: boolean;
  onClose: () => void;
  newLevel: number;
  levelTitle: string; // Tên cấp bậc tương ứng (ví dụ: 'Kim Đan', 'Bạch Kim')
}

const LevelUpPopup: React.FC<LevelUpPopupProps> = ({ isOpen, onClose, newLevel, levelTitle }) => {
  const { getLevelColor } = useAuth(); // Lấy hàm màu sắc từ context

  if (!isOpen) {
    return null;
  }

  const levelColor = getLevelColor(newLevel); // Lấy màu cho cấp độ mới

  return (
    <div className="popup-overlay" onClick={onClose}>
      {/* Thêm style inline để tùy chỉnh màu icon nếu cần */}
      <div className="popup-content success-popup" onClick={(e) => e.stopPropagation()} style={{ borderColor: levelColor, boxShadow: `0 0 15px ${levelColor}` }}>
        <button className="popup-close-btn" onClick={onClose}>
          <FiX />
        </button>
        {/* Sử dụng màu cấp độ cho icon */}
        <FiAward className="popup-icon" style={{ color: levelColor }} />
        <h2 className="popup-title" style={{ color: levelColor }}>Chúc Mừng Lên Cấp!</h2>
        <p className="popup-message">
          Bạn đã đạt đến cấp độ mới:
        </p>
        {/* Hiển thị cấp độ mới với màu sắc tương ứng */}
        <p className="popup-message" style={{ fontSize: '1.4rem', fontWeight: 'bold', color: levelColor, marginTop: '-0.5rem', marginBottom: '1.5rem' }}>
          {levelTitle} (Cấp {newLevel})
        </p>
        <button className="popup-action-btn" onClick={onClose} style={{ backgroundColor: levelColor }}>
          Tuyệt vời!
        </button>
      </div>
    </div>
  );
};

export default LevelUpPopup;