import React from 'react';
import { FiAward, FiX } from 'react-icons/fi'; 
import { useAuth } from '../../contexts/AuthContext'; 
import '../../styles/SuccessPopup.css';

interface LevelUpPopupProps {
  isOpen: boolean;
  onClose: () => void;
  newLevel: number;
  levelTitle: string; 
}

const LevelUpPopup: React.FC<LevelUpPopupProps> = ({ isOpen, onClose, newLevel, levelTitle }) => {
  const { getLevelColor } = useAuth();

  if (!isOpen) {
    return null;
  }

  const levelColor = getLevelColor(newLevel); 

  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-content success-popup" onClick={(e) => e.stopPropagation()} style={{ borderColor: levelColor, boxShadow: `0 0 15px ${levelColor}` }}>
        <button className="popup-close-btn" onClick={onClose}>
          <FiX />
        </button>
        <FiAward className="popup-icon" style={{ color: levelColor }} />
        <h2 className="popup-title" style={{ color: levelColor }}>Chúc Mừng Lên Cấp!</h2>
        <p className="popup-message">
          Bạn đã đạt đến cấp độ mới:
        </p>
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