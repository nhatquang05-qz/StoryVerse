import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getOrderById, type Order } from '../data/mockData';
import { useAuth } from '../contexts/AuthContext';
import ProfileSidebar from '../components/common/ProfileSideBar';
import '../assets/styles/ProfilePage.css';

const OrderDetailPage: React.FC = () => {
    const { orderId } = useParams<{ orderId: string }>();
    const { currentUser } = useAuth();
    const [order, setOrder] = useState<Order | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (orderId && currentUser) {
            setIsLoading(true);
            setTimeout(() => {
                const foundOrder = getOrderById(orderId);
                if (foundOrder && foundOrder.userId === currentUser.id) {
                    setOrder(foundOrder);
                } else {
                    setOrder(null);
                }
                setIsLoading(false);
            }, 500); 
        }
    }, [orderId, currentUser]);

    if (!currentUser) {
        return (
            <div className="profile-page-not-logged">
                <h2>Bạn cần đăng nhập để xem chi tiết đơn hàng.</h2>
            </div>
        );
    }
    
    if (isLoading) {
        return (
            <div className="profile-page-container">
                <ProfileSidebar activeLink="/orders" />
                <div className="profile-content">
                    <h1>Chi Tiết Đơn Hàng</h1>
                    <p>Đang tải chi tiết đơn hàng...</p>
                </div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="profile-page-container">
                <ProfileSidebar activeLink="/orders" />
                <div className="profile-content">
                    <h1>Không tìm thấy đơn hàng!</h1>
                    <p>Mã đơn hàng {orderId} không tồn tại hoặc không thuộc về tài khoản của bạn.</p>
                    <Link to="/orders" className="detail-order-btn">Quay lại Lịch sử mua hàng</Link>
                </div>
            </div>
        );
    }

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    const getStatusClass = (status: string) => {
        switch (status) {
          case 'Hoàn thành': return 'status-completed';
          case 'Đang giao hàng': return 'status-shipping';
          case 'Đã hủy': return 'status-cancelled';
          case 'Đang chờ': return 'status-pending'; 
          default: return '';
        }
    };

    return (
        <div className="detail-page-container">
            <div className="profile-page-container">
                <ProfileSidebar activeLink="/orders" />
                <div className="profile-content">
                    <h1>Chi Tiết Đơn Hàng #{order.id}</h1>
                    <div className="profile-info-card" style={{ marginBottom: '2rem' }}>
                        <p><strong>Ngày đặt hàng:</strong> {order.date}</p>
                        <p><strong>Tổng cộng:</strong> <span className="total-price" style={{ color: 'var(--primary-color)' }}>{formatPrice(order.total)}</span></p>
                        <p>
                            <strong>Trạng thái:</strong> 
                            <span className={`status-badge ${getStatusClass(order.status)}`} style={{ marginLeft: '10px' }}>
                                {order.status}
                            </span>
                        </p>
                    </div>

                    <h2>Danh sách sản phẩm</h2>
                    <table className="orders-table">
                        <thead>
                            <tr>
                                <th>Sản phẩm</th>
                                <th>Đơn giá</th>
                                <th>Số lượng</th>
                                <th>Thành tiền</th>
                            </tr>
                        </thead>
                        <tbody>
                            {order.items.map(item => (
                                <tr key={item.id}>
                                    <td data-label="Sản phẩm">
                                        <Link to={`/comic/${item.id}`} style={{ fontWeight: 'bold', color: 'var(--text-color-dark)' }}>
                                            {item.title}
                                        </Link>
                                        <p style={{ fontSize: '0.9rem', color: '#6c757d' }}>{item.author}</p>
                                    </td>
                                    <td data-label="Đơn giá">{formatPrice(item.price)}</td>
                                    <td data-label="Số lượng">{item.quantity}</td>
                                    <td data-label="Thành tiền">{formatPrice(item.price * item.quantity)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    
                    <Link to="/orders" className="detail-order-btn" style={{ marginTop: '2rem', display: 'inline-block' }}>Quay lại Lịch sử mua hàng</Link>
                </div>
            </div>
        </div>
    );
};

export default OrderDetailPage;