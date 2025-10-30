import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { FiGift, FiX, FiCheckCircle, FiTag } from 'react-icons/fi';
import { useAuth} from '../../../contexts/AuthContext';
import { dailyRewardsData } from '../../../utils/authUtils';
import './DailyRewardModal.css';

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
        <div className="countdown-timer">
            Thời gian nhận quà tiếp theo: 
            <span className="time-group">
                <span className="time-value">{String(hours).padStart(2, '0')}</span>: 
                <span className="time-value">{String(minutes).padStart(2, '0')}</span>: 
                <span className="time-value">{String(seconds).padStart(2, '0')}</span>
            </span>
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
    const nextClaimDayDisplay = currentStreak + 1; 


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

            if(currentStreak === 0 && !isTodayClaimed && index === 0) {
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
        <div className="daily-modal-overlay" onClick={onClose}>
            <div className="daily-modal-content large-modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="daily-modal-close-btn" onClick={onClose}><FiX /></button>
                
                <div className="daily-modal-header">
                    <FiGift className="modal-gift-icon" />
                    <h2>PHẦN THƯỞNG ĐĂNG NHẬP</h2>
                    <p className="modal-streak-info">Chuỗi hiện tại: <span className="streak-count">{currentStreak} Ngày</span></p>
                </div>

                <div className="daily-reward-grid">
                    {displayedRewards.map((reward, index) => (
                        <div key={index} className={`reward-calendar-day ${reward.status}`}>
                            <div className="calendar-header">
                                Ngày {reward.displayDay}
                            </div>
                            <div className="reward-content">
                                <img 
                                    src={reward.type === 'Xu' ? reward.icon : undefined} 
                                    alt={reward.type}
                                    className={`reward-icon ${reward.type !== 'Xu' ? 'icon-placeholder' : ''}`}
                                />
                                {reward.type !== 'Xu' && <FiTag className="reward-icon non-coin-icon"/>}
                                <span className="reward-amount-text">{reward.amount} {reward.type === 'Xu' ? 'Xu' : 'Voucher'}</span>
                            </div>
                            <div className="reward-status">
                                {reward.status === 'claimed' && <FiCheckCircle />}
                                {reward.status === 'claimable' && <span className='claimable-text-tag'>SẴN SÀNG</span>}
                                {reward.status === 'pending' && <span>CHƯA TỚI</span>}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="daily-modal-action-footer">
                    {isTodayClaimed ? (
                        <>
                            <button onClick={onClose} className="auth-button claim-btn claimed-btn">
                                Đã Nhận Thưởng Hôm Nay
                            </button>
                            <CountdownTimer />
                        </>
                    ) : (
                        <button onClick={handleClaim} className="auth-button claim-btn" disabled={!currentUser || isTodayClaimed}>
                            NHẬN THƯỞNG NGÀY {currentStreak + 1} 
                        </button>
                    )}
                </div>

                <div className="daily-modal-footer">
                    <p>Số dư hiện tại: <span className="coin-balance-footer">{coinBalance} Xu</span></p>
                </div>
            </div>
        </div>
    );
};

export default DailyRewardModal;