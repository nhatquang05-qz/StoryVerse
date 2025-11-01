import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import LoadingScreen from '../components/common/Loading/LoadingScreen';

const PaymentCallbackPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    useEffect(() => {
        // Lấy các params từ URL mà Sepay redirect về
        const status = searchParams.get('status');
        const order_id = searchParams.get('order_id');
        const message = searchParams.get('message'); // Sepay có thể trả về message

        // Trang này KHÔNG gọi API verify, chỉ hiển thị kết quả
        // Việc xác thực đã được IPN xử lý ở backend
        
        if (status === '1') {
            // Thanh toán thành công (theo góc nhìn của Sepay)
            setSuccessMessage(message || 'Giao dịch đã được ghi nhận thành công.');
            setIsLoading(false);
            
            // Tự động chuyển hướng sau 3 giây
            setTimeout(() => {
                if (order_id?.startsWith('COIN_')) {
                    navigate('/profile'); // Về trang hồ sơ/ví
                } else if (order_id?.startsWith('ORDER_')) {
                    navigate('/orders'); // Về trang danh sách đơn hàng
                } else {
                    navigate('/');
                }
            }, 3000);

        } else {
            // Thanh toán thất bại (status != 1)
            setError(message || 'Giao dịch thất bại hoặc đã bị huỷ.');
            setIsLoading(false);
        }

    }, [searchParams, navigate]);

    if (isLoading) {
        return <LoadingScreen />;
    }

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', textAlign: 'center', padding: '20px' }}>
            <div>
                {error && (
                    <>
                        <h1 style={{ color: 'red', fontSize: '24px', fontWeight: 'bold' }}>Thanh toán thất bại</h1>
                        <p style={{ fontSize: '16px', margin: '20px 0' }}>{error}</p>
                        <Link to="/" style={{ padding: '10px 20px', cursor: 'pointer', background: '#f0f0f0', color: '#333', borderRadius: '5px', textDecoration: 'none' }}>
                            Về trang chủ
                        </Link>
                    </>
                )}
                {successMessage && (
                    <>
                        <h1 style={{ color: 'green', fontSize: '24px', fontWeight: 'bold' }}>Thanh toán thành công!</h1>
                        <p style={{ fontSize: '16px', margin: '20px 0' }}>{successMessage}</p>
                        <p style={{ fontSize: '14px', color: '#555' }}>Tài khoản của bạn sẽ được cập nhật sau ít phút (nếu là nạp xu).</p>
                        <p style={{ fontSize: '14px', color: '#555' }}>Bạn sẽ được tự động chuyển hướng sau 3 giây...</p>
                    </>
                )}
            </div>
        </div>
    );
};

export default PaymentCallbackPage;