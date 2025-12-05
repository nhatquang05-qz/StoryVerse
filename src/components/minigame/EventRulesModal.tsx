import React from 'react';
import '../../assets/styles/minigame/EventRulesModal.css'; 

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

const EventRulesModal: React.FC<Props> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="gift-modal-overlay">
            <div className="rules-modal-content">
                <button className="close-rules-btn" onClick={onClose}>✕</button>
                <h2 className="rules-header">THỂ LỆ SỰ KIỆN</h2>
                
                <div className="rules-body">
                    <div className="rules-section-title title-red">
                        🎁 1. Hộp Quà Bí Ẩn
                    </div>
                    <p>Mỗi lượt mở quà tốn <strong>20 Xu</strong> hoặc <strong>1 lượt quay miễn phí</strong>.</p>
                    <p>Cơ cấu giải thưởng:</p>
                    <ul className="rules-list">
                        <li>1 - 10 Xu (60%)</li>
                        <li>11 - 100 Xu (20%)</li>
                        <li>101 - 1000 Xu (15%)</li>
                        <li>Giải đặc biệt: 2412 Xu (4.99%)</li>
                        <li>Jackpot: 24120 Xu (0.01%)</li>
                    </ul>

                    <div className="rules-section-title title-green">
                        🎄 2. Cây Thông Lời Chúc
                    </div>
                    <p>Mỗi ngày bạn được gửi <strong>1 lời chúc miễn phí</strong> lên cây thông.</p>
                    <p>Khi gửi lời chúc thành công, bạn sẽ nhận được một lượng Xu ngẫu nhiên từ hệ thống.</p>
                </div>
            </div>
        </div>
    );
};

export default EventRulesModal;