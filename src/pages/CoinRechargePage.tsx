import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth, type User } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import '../pages/AuthPage.css';
import './CoinRechargePage.css';

const rechargePacks = [
    { id: 1, coins: 1000, price: 100000, bonus: 0 },
    { id: 2, coins: 2500, price: 250000, bonus: 100 },
    { id: 3, coins: 5000, price: 500000, bonus: 300 },
    { id: 4, coins: 10000, price: 1000000, bonus: 800 },
];

const CoinRechargePage: React.FC = () => {
    const { currentUser, updateProfile } = useAuth();
    const { showNotification } = useNotification();
    const [isProcessing, setIsProcessing] = useState(false);
    const [selectedPack, setSelectedPack] = useState<number | null>(null);
    
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

            const newBalance = currentUser.coinBalance + pack.coins + pack.bonus;
            
            const updatedProfile: Partial<User> = { coinBalance: newBalance };
            await updateProfile(updatedProfile);
            
            showNotification(`Nạp thành công ${pack.coins + pack.bonus} Xu! Số dư mới: ${newBalance}`, 'success');

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
                            {currentUser.coinBalance} <span className="coin-text">Xu</span>
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
                    *Đây là chức năng giả lập. Giao dịch sẽ được ghi nhận ngay lập tức vào số dư Xu của bạn.
                </p>
            </div>
        </div>
    );
};

export default CoinRechargePage;