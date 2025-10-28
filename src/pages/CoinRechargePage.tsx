import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import RechargeSuccessPopup from '../components/popups/RechargeSuccessPopup'; 
import '../pages/AuthPage.css';
import './CoinRechargePage.css';

const rechargePacks = [
    { id: 1, coins: 500, price: 20000, bonus: 50 },
    { id: 2, coins: 1500, price: 50000, bonus: 100 },
    { id: 3, coins: 3100, price: 100000, bonus: 300 },
    { id: 4, coins: 6500, price: 200000, bonus: 800 }, 
    { id: 5, coins: 20000, price: 500000, bonus: 1200 },
    { id: 6, coins: 45000, price: 1000000, bonus: 2000 },
];

const CoinRechargePage: React.FC = () => {
    const { currentUser, updateProfile, addExp } = useAuth();
    const { showNotification } = useNotification();
    const [isProcessing, setIsProcessing] = useState(false);
    const [selectedPack, setSelectedPack] = useState<number | null>(null);
    const [isRechargeSuccessPopupOpen, setIsRechargeSuccessPopupOpen] = useState(false); 
    const [rechargeInfo, setRechargeInfo] = useState({ amount: 0, newBalance: 0 }); 

    const handleRecharge = async (packId: number) => {
        if (!currentUser) {
            showNotification('Vui lòng đăng nhập để nạp xu.', 'warning');
            return;
        }

        const pack = rechargePacks.find(p => p.id === packId);
        if (!pack) return;

        if (isProcessing) return;

        setIsProcessing(true);
        setSelectedPack(packId);

        try {
            await new Promise(resolve => setTimeout(resolve, 1500));
            const totalCoinsAdded = pack.coins + pack.bonus;
            const newBalance = currentUser.coinBalance + totalCoinsAdded;
            await updateProfile({ coinBalance: newBalance });
            await addExp(totalCoinsAdded, 'recharge');

            setRechargeInfo({ amount: totalCoinsAdded, newBalance: newBalance });
            setIsRechargeSuccessPopupOpen(true);

        } catch (error) {
            console.error('Lỗi khi nạp xu:', error);
            showNotification('Nạp xu thất bại. Vui lòng thử lại.', 'error');
        } finally {
            setIsProcessing(false);
            setSelectedPack(null);
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    if (!currentUser) {
        return (
            <div className="auth-page">
                <div className="auth-container">
                    <h2>Vui lòng đăng nhập</h2>
                    <p>Bạn cần đăng nhập để nạp Xu vào tài khoản.</p>
                    <Link to="/login" className="auth-button">Đăng Nhập Ngay</Link>
                </div>
            </div>
        );
    }

    const CoinIcon: React.FC<React.ImgHTMLAttributes<HTMLImageElement>> = (props) => (
        <img src="../src/assets/images/coin.png" alt="Xu" {...props} />
    );

    return (
        <div className="recharge-page-container">
            <div className="recharge-card-wrapper">
                <h2>
                    Nạp Xu Vào Tài Khoản
                </h2>

                <div className="current-balance-info">
                    <p>
                        Số dư hiện tại: <span className="coin-amount-display">
                            {currentUser.coinBalance} <pre className="coin-text"> Xu</pre>
                        </span>
                    </p>
                </div>

                <h3 className="pack-selection-title">Chọn Gói Nạp</h3>

                <div className="recharge-grid">
                    {rechargePacks.map(pack => (
                        <div
                            key={pack.id}
                            className="recharge-card"
                        >
                            <div className="recharge-content">
                                <div className="recharge-coin-display">
                                    <span className="coin-amount-large">{pack.coins}</span> <CoinIcon className="coin-icon-large" />
                                </div>

                                {pack.bonus > 0 ? (
                                    <p className="recharge-bonus">
                                        Tặng {pack.bonus} Xu
                                    </p>
                                ) : (
                                    <div className="recharge-bonus-placeholder"></div>
                                )}

                                <p className="recharge-price">
                                    {formatPrice(pack.price)}
                                </p>
                            </div>
                            <button
                                className="auth-button"
                                onClick={() => handleRecharge(pack.id)}
                                disabled={isProcessing && selectedPack === pack.id}
                                style={{ background: 'var(--primary-color)' }}
                            >
                                {isProcessing && selectedPack === pack.id ? 'Đang thanh toán...' : 'Nạp Ngay'}
                            </button>
                        </div>
                    ))}
                </div>

                <p className="recharge-info-note">
                    *Mỗi Xu nạp sẽ tăng {(BASE_EXP_PER_COIN * Math.pow(EXP_RATE_REDUCTION_FACTOR, currentUser.level - 1)).toFixed(4)}% kinh nghiệm (tỉ lệ giảm theo cấp).
                </p>
            </div>

            <RechargeSuccessPopup
              isOpen={isRechargeSuccessPopupOpen}
              onClose={() => setIsRechargeSuccessPopupOpen(false)}
              amount={rechargeInfo.amount}
              newBalance={rechargeInfo.newBalance}
            />
        </div>
    );
};

const BASE_EXP_PER_COIN = 0.2;
const EXP_RATE_REDUCTION_FACTOR = 0.5;

export default CoinRechargePage;