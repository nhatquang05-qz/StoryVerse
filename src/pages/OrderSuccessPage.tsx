import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiCheckCircle } from 'react-icons/fi';
import { getOrderById, type Order } from '../data/mockData';
import { useAuth } from '../contexts/AuthContext';

const OrderSuccessPage: React.FC = () => {
    const { orderId } = useParams<{ orderId: string }>();
    const { currentUser } = useAuth();
    const [order, setOrder] = useState<Order | null>(null);

    useEffect(() => {
        if (orderId && currentUser) {
            setTimeout(() => {
                const foundOrder = getOrderById(orderId);
                if (foundOrder && foundOrder.userId === currentUser.id) {
                    setOrder(foundOrder);
                }
            }, 500);
        }
    }, [orderId, currentUser]);
    
    const defaultAddress = currentUser?.addresses.find(a => a.isDefault);

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    if (!order) {
        return (
            <div className="auth-page" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                <h2>Đang xử lý đơn hàng...</h2>
                <p>Nếu không tự chuyển, bạn có thể kiểm tra lại tại <Link to="/orders">Lịch sử mua hàng</Link>.</p>
            </div>
        );
    }

    return (
        <div className="auth-page" style={{ padding: '2rem 1rem' }}>
            <div className="auth-container" style={{ maxWidth: '600px', textAlign: 'center' }}>
                <FiCheckCircle style={{ color: '#28a745', fontSize: '4rem', marginBottom: '1rem' }} />
                <h1 style={{ color: '#28a745' }}>ĐẶT HÀNG THÀNH CÔNG!</h1>
                <p style={{ fontSize: '1.1rem', marginBottom: '1.5rem' }}>
                    Cảm ơn bạn đã mua hàng tại StoryVerse. Đơn hàng của bạn đã được tiếp nhận và đang được xử lý.
                </p>

                <div style={{ background: '#f8f9fa', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem' }}>
                    <p><strong>Mã Đơn Hàng:</strong> #{order.id}</p>
                    <p><strong>Ngày Đặt:</strong> {order.date}</p>
                    <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>
                        Tổng Cộng: {formatPrice(order.total)}
                    </p>
                </div>
                
                {defaultAddress && (
                    <div style={{ border: '1px solid #e0e0e0', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem', textAlign: 'left' }}>
                        <h4>Địa Chỉ Giao Hàng</h4>
                        <p style={{ margin: '0' }}>{currentUser?.fullName} - {currentUser?.phone}</p>
                        <p style={{ margin: '0' }}>{defaultAddress.street}, {defaultAddress.ward}, {defaultAddress.district}, {defaultAddress.city}</p>
                    </div>
                )}


                <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                    <Link to="/orders" className="detail-order-btn" style={{ padding: '0.8rem 1.5rem' }}>Xem Chi Tiết Đơn</Link>
                    <Link to="/" className="checkout-btn" style={{ background: '#6c757d', padding: '0.8rem 1.5rem' }}>Tiếp Tục Mua Sắm</Link>
                </div>
            </div>
        </div>
    );
};

export default OrderSuccessPage;