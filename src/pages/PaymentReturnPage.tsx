import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import RechargeSuccessPopup from '../components/popups/RechargeSuccessPopup';
import '../assets/styles/CoinRechargePage.css';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

const PaymentReturnPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { fetchUser, showLevelUpPopup } = useAuth();
    const { clearCart } = useCart(); 
    const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
    const [message, setMessage] = useState('Đang xử lý kết quả thanh toán...');
    const [rechargeInfo, setRechargeInfo] = useState({ amount: 0, newBalance: 0 });
    const [showRechargePopup, setShowRechargePopup] = useState(false);

    useEffect(() => {
        const verifyPayment = async () => {
            const params = Object.fromEntries(searchParams.entries());

            try {
                const response = await fetch(`${API_URL}/payment/vnpay_return`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(params)
                });
                
                const data = await response.json();

                if (data.status === 'success') {
                    setStatus('success');                                       
                    if (data.type === 'RECHARGE') {
                        setMessage('Nạp xu thành công!');
                        setRechargeInfo({ amount: data.data.amount, newBalance: data.data.newBalance });
                        setShowRechargePopup(true);
                        
                        await fetchUser(); 
                        if (data.data.levelUpOccurred) {
                            showLevelUpPopup(data.data.level);
                        }

                    } else if (data.type === 'PURCHASE') {
                        setMessage('Thanh toán đơn hàng thành công! Đang chuyển hướng...');
                        clearCart(); 
                        setTimeout(() => {
                            navigate(`/order-success/${data.data.orderId}`);
                        }, 2000);
                    }

                } else {
                    setStatus('error');
                    setMessage(data.message || 'Giao dịch thất bại.');
                }
            } catch (error) {
                console.error(error);
                setStatus('error');
                setMessage('Lỗi kết nối đến máy chủ.');
            }
        };

        if (status === 'processing') {
             verifyPayment();
        }
    }, []);

    const handleCloseRechargePopup = () => {
        setShowRechargePopup(false);
        navigate('/recharge'); 
    };

    return (
        <div className="recharge-page-container" style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <h2>Kết Quả Giao Dịch</h2>
            
            {status === 'processing' && <div className="loading-spinner" style={{margin: '20px'}}></div>}
            
            <p className={`status-message ${status}`} style={{ fontSize: '1.2rem', marginTop: '20px', color: status === 'error' ? 'red' : 'green', fontWeight: 'bold' }}>
                {message}
            </p>

            {status === 'error' && (
                 <button onClick={() => navigate('/')} className="auth-button" style={{ marginTop: '20px', maxWidth: '200px' }}>
                     Về trang chủ
                 </button>
            )}

            <RechargeSuccessPopup
                isOpen={showRechargePopup}
                onClose={handleCloseRechargePopup}
                amount={rechargeInfo.amount}
                newBalance={rechargeInfo.newBalance}
            />
        </div>
    );
};

export default PaymentReturnPage;