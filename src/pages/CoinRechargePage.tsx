import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import RechargeSuccessPopup from '../components/popups/RechargeSuccessPopup'; 
import '../pages/AuthPage.css';
import './CoinRechargePage.css';

// THÊM: Import ErrorPopup
import ErrorPopup from '../components/popups/ErrorPopup';

const rechargePacks = [
    { id: 1, coins: 500, price: 20000, bonus: 50 },
    { id: 2, coins: 1500, price: 50000, bonus: 100 },
    { id: 3, coins: 3100, price: 100000, bonus: 300 },
    { id: 4, coins: 6500, price: 200000, bonus: 800 }, 
    { id: 5, coins: 20000, price: 500000, bonus: 1200 },
    { id: 6, coins: 45000, price: 1000000, bonus: 2000 },
];

const CoinRechargePage: React.FC = () => {
    // SỬA DÒNG NÀY: Thêm 'token'
    const { currentUser, addExp, token } = useAuth(); 
    const { showNotification } = useNotification();
    const [isProcessing, setIsProcessing] = useState(false);
    const [selectedPack, setSelectedPack] = useState<number | null>(null);
    const [isRechargeSuccessPopupOpen, setIsRechargeSuccessPopupOpen] = useState(false);
    const [rechargeInfo, setRechargeInfo] = useState({ amount: 0, newBalance: 0 });

    // THÊM: State cho popup lỗi
    const [showErrorPopup, setShowErrorPopup] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    const handleRecharge = async (packId: number) => {
        setIsProcessing(true);
        setSelectedPack(packId);

        // THÊM: Lấy thông tin gói nạp
        const pack = rechargePacks.find(p => p.id === packId);
        if (!pack) {
            setErrorMessage('Gói nạp không hợp lệ.');
            setShowErrorPopup(true);
            setIsProcessing(false);
            return;
        }

        // THÊM: Kiểm tra token (giờ đã có từ useAuth)
        if (!token) {
            setErrorMessage('Bạn cần đăng nhập để thực hiện nạp xu.');
            setShowErrorPopup(true);
            setIsProcessing(false);
            return;
        }

        // THAY THẾ LOGIC CŨ (setTimeout) BẰNG LOGIC GỌI API SEPAY
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/payment/create-coin-recharge`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` // Gửi token
                },
                body: JSON.stringify({ amount: pack.price }) // Gửi số tiền (price)
            });

            const data = await response.json();

            if (response.ok && data.paymentUrl) {
                // Nhận paymentUrl và chuyển hướng người dùng sang Sepay
                window.location.href = data.paymentUrl;
            } else {
                setErrorMessage(data.message || 'Tạo giao dịch thất bại.');
                setShowErrorPopup(true);
                setIsProcessing(false);
            }
        } catch (error) {
            console.error('Lỗi khi gọi API nạp xu:', error);
            setErrorMessage('Không thể kết nối đến máy chủ. Vui lòng thử lại sau.');
            setShowErrorPopup(true);
            setIsProcessing(false);
        }

        // Logic cũ (setTimeout) của bạn đã bị thay thế bằng logic fetch ở trên
    };

    return (
        <div className="auth-page recharge-page">
            <h1 style={{ marginBottom: '1rem', fontSize: '2rem' }}>Nạp Xu</h1>
            <p className="recharge-info">
                Nạp xu để mở khóa chương, ủng hộ tác giả và nhận điểm kinh nghiệm!
            </p>
            <p className="recharge-balance">
                Số dư xu: <span style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>{currentUser?.coinBalance?.toLocaleString() || 0}</span>
                <Link to="/profile" className="recharge-history-link">Lịch sử</Link>
            </p>

            <div className="recharge-container">
                <div className="recharge-packs-grid">
                    {rechargePacks.map((pack) => (
                        <div key={pack.id} className="recharge-pack-card">
                            <div className="recharge-pack-info">
                                <p className="recharge-coins">
                                    {pack.coins.toLocaleString()} Xu
                                </p>
                                {pack.bonus > 0 ? (
                                    <p className="recharge-bonus">
                                        + {pack.bonus.toLocaleString()} Xu (Thưởng)
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
                                {isProcessing && selectedPack === pack.id ? 'Đang xử lý...' : 'Nạp Ngay'}
                            </button>
                        </div>
                    ))}
                </div>

                <p className="recharge-info-note">
                    *Mỗi Xu nạp sẽ tăng kinh nghiệm (tỉ lệ giảm theo cấp).
                </p>
            </div>

            <RechargeSuccessPopup
              isOpen={isRechargeSuccessPopupOpen}
              onClose={() => setIsRechargeSuccessPopupOpen(false)}
              amount={rechargeInfo.amount}
              newBalance={rechargeInfo.newBalance}
            />

            {/* THÊM: Popup hiển thị lỗi */}
            {showErrorPopup && (
                <ErrorPopup
                    message={errorMessage}
                    onClose={() => setShowErrorPopup(false)} isOpen={false} title={''}                />
            )}
        </div>
    );
};

export default CoinRechargePage;