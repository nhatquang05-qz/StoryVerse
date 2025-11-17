import React, { useState } from 'react';
import { stickerPacks, type Sticker } from '../../../utils/stickerUtils';
import '../../../assets/styles/StickerPicker.css';

interface StickerPickerProps {
  onStickerSelect: (sticker: Sticker) => void;
  onClose: () => void;
}

const StickerPicker: React.FC<StickerPickerProps> = ({ onStickerSelect, onClose }) => {
  const [activePackIndex, setActivePackIndex] = useState(0);

  if (stickerPacks.length === 0) {
    return <div className="sticker-picker">No sticker packs found.</div>;
  }

  const handleSelect = (sticker: Sticker) => {
    onStickerSelect(sticker);
    onClose(); 
  };

  return (
    <div className="sticker-picker">
       <button onClick={onClose} className="sticker-picker-close-btn">&times;</button>
      <div className="sticker-pack-tabs">
        {stickerPacks.map((pack, index) => (
          <button
            key={pack.name}
            className={`tab-btn ${index === activePackIndex ? 'active' : ''}`}
            onClick={() => setActivePackIndex(index)}
          >
            {pack.name.replace(/_/g, ' ')} 
          </button>
        ))}
      </div>
      <div className="sticker-grid">
        {stickerPacks[activePackIndex].stickers.map((sticker) => (
          <img
            key={sticker.id}
            src={sticker.url}
            alt={`Sticker ${sticker.id}`}
            className="sticker-item"
            onClick={() => handleSelect(sticker)}
          />
        ))}
      </div>
    </div>
  );
};

export default StickerPicker;