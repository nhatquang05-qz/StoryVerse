import React, { useState, useEffect, useMemo } from 'react';
import { FiGift, FiX, FiCheck, FiLock, FiClock } from 'react-icons/fi'; 
import { useAuth } from '../../contexts/AuthContext';
import { dailyRewardsData } from '../../utils/authUtils';
import '../../assets/styles/DailyRewardModal.css';
import closeBtnImg from '../../assets/images/close-btn.avif';

interface DailyRewardModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const calculateTimeUntilMidnight = () => {
    const now = new Date();
    const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
    const diff = midnight.getTime() - now.getTime();
    return Math.max(0, diff);
};

const CountdownTimer: React.FC = () => {
    const [timeLeft, setTimeLeft] = useState(calculateTimeUntilMidnight());

    useEffect(() => {
        const timer = setInterval(() => {
            const newTimeLeft = calculateTimeUntilMidnight();
            setTimeLeft(newTimeLeft);
            if (newTimeLeft <= 0) {
                clearInterval(timer);
                window.location.reload();
            }
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

    return (
        <div className="countdown-timer-badge">
            <FiClock className="timer-icon" />
            <span>Quay lại sau: </span>
            <div className="timer-digits">
                <span>{String(hours).padStart(2, '0')}</span>:
                <span>{String(minutes).padStart(2, '0')}</span>:
                <span>{String(seconds).padStart(2, '0')}</span>
            </div>
        </div>
    );
};


const DailyRewardModal: React.FC<DailyRewardModalProps> = ({ isOpen, onClose }) => {
    const { currentUser, claimDailyReward } = useAuth();

    if (!isOpen || !currentUser) {
        return null;
    }

    const { consecutiveLoginDays, coinBalance, lastDailyLogin } = currentUser;

    const today = useMemo(() => new Date(), []);
    const lastLoginDate = useMemo(() => new Date(lastDailyLogin), [lastDailyLogin]);

    const isTodayClaimed = useMemo(() => {
        return (
            today.getFullYear() === lastLoginDate.getFullYear() &&
            today.getMonth() === lastLoginDate.getMonth() &&
            today.getDate() === lastLoginDate.getDate()
        );
    }, [today, lastLoginDate]);

    const currentStreak = consecutiveLoginDays;

    const todayRewardIndex = isTodayClaimed ? (currentStreak - 1) % dailyRewardsData.length : currentStreak % dailyRewardsData.length;

    const displayedRewards = useMemo(() => {
        return Array(7).fill(0).map((_, index) => {
            const rewardData = dailyRewardsData[index % dailyRewardsData.length];
            const displayDay = index + 1;

            let status: 'claimed' | 'claimable' | 'pending';

            if (index < todayRewardIndex) {
                status = 'claimed';
            } else if (index === todayRewardIndex) {
                status = isTodayClaimed ? 'claimed' : 'claimable';
            } else {
                status = 'pending';
            }

            if (currentStreak === 0 && !isTodayClaimed && index === 0) {
                status = 'claimable';
            } else if (currentStreak === 0 && !isTodayClaimed && index > 0) {
                status = 'pending';
            }


            return {
                ...rewardData,
                displayDay,
                status
            };
        });
    }, [currentStreak, isTodayClaimed, todayRewardIndex]);

    const handleClaim = async () => {
        if (!isTodayClaimed) {
            await claimDailyReward();
        }
    };

    return (
        <div className="daily-modal-overlay">
            <div className="daily-modal-container">
                <div className="modal-glow-effect"></div>

                <button className="daily-modal-close image-btn" onClick={onClose}>
                    <img 
                        src={closeBtnImg} 
                        alt="Đóng" 
                    />
                </button>

                <div className="daily-modal-header">
                    <div className="gift-icon-wrapper">
                        <FiGift className="header-main-icon" />
                    </div>
                    <h2>ĐIỂM DANH HẰNG NGÀY</h2>
                    <div className="streak-badge">
                        <span>Chuỗi hiện tại: <strong>{currentStreak} Ngày</strong></span>
                    </div>
                </div>

                <div className="daily-rewards-grid">
                    {displayedRewards.map((reward, index) => (
                        <div 
                            key={index} 
                            className={`reward-card ${reward.status} ${index === 6 ? 'big-reward' : ''}`}
                        >
                            {reward.status === 'claimable' && <div className="card-shine"></div>}

                            <div className="day-label">Ngày {reward.displayDay}</div>
                            
                            <div className="reward-visual">
                                <img
                                    src={reward.type === 'Xu' ? reward.icon : undefined}
                                    alt={reward.type}
                                    className={`reward-img ${reward.type !== 'Xu' ? 'hidden-img' : ''}`}
                                />
                                {reward.type !== 'Xu' && <FiGift className="reward-fallback-icon" />}
                                
                                <span className="reward-value">+{reward.amount}</span>
                            </div>

                            <div className="reward-status-icon">
                                {reward.status === 'claimed' && <FiCheck className="icon-check" />}
                                {reward.status === 'pending' && <FiLock className="icon-lock" />}
                                {reward.status === 'claimable' && <div className="pulse-dot"></div>}
                            </div>

                            {reward.status === 'claimed' && <div className="claimed-overlay"></div>}
                        </div>
                    ))}
                </div>

                <div className="daily-modal-footer-action">
                    <div className="balance-info">
                        <span>Số dư của bạn:</span>
                        <div className="coin-display">
                            <img src="/src/assets/images/coin.avif" alt="coin" width={20} />
                            <span>{coinBalance.toLocaleString()} Xu</span>
                        </div>
                    </div>

                    <div className="action-button-wrapper">
                        {isTodayClaimed ? (
                            <div className="claimed-state">
                                <button className="action-btn disabled" disabled>
                                    <FiCheck /> Đã Nhận Hôm Nay
                                </button>
                                <CountdownTimer />
                            </div>
                        ) : (
                            <button 
                                onClick={handleClaim} 
                                className="action-btn primary pulse-btn" 
                                disabled={!currentUser || isTodayClaimed}
                            >
                                NHẬN QUÀ NGAY
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DailyRewardModal;