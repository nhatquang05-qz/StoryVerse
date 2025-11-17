import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ProfileSidebar from '../components/common/ProfileSideBar';
import { loadOrders, type Order } from '../data/mockData';
import '../assets/styles/ProfilePage.css'; 

const OrdersPage: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
        setIsLoading(true);
        setTimeout(() => {
            const userOrders = loadOrders(currentUser.id);
            setOrders(userOrders);
            setIsLoading(false);
        }, 500); 
    }
  }, [currentUser]);

  if (!currentUser) {
    return (
      <div className="profile-page-not-logged">
        <h2>Bạn cần đăng nhập để xem lịch sử mua hàng.</h2>
      </div>
    );
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'Hoàn thành':
        return 'status-completed';
      case 'Đang giao hàng':
        return 'status-shipping';
      case 'Đã hủy':
        return 'status-cancelled';
      case 'Đang chờ':
        return 'status-pending'; 
      default:
        return '';
    }
  };

  const handleViewDetail = (orderId: string) => {
    navigate(`/orders/${orderId}`);
  };

  return (
    <div className="profile-page-container">
      <ProfileSidebar activeLink="/orders" />
      <div className="profile-content">
        <h1>Lịch Sử Mua Hàng</h1>
        
        {isLoading ? (
            <p>Đang tải lịch sử đơn hàng...</p>
        ) : orders.length > 0 ? (
          <table className="orders-table">
            <thead>
              <tr>
                <th>Mã Đơn Hàng</th>
                <th>Ngày Đặt</th>
                <th>Số Lượng SP</th>
                <th>Tổng Cộng</th>
                <th>Trạng Thái</th>
                <th>Chi Tiết</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id}>
                  <td data-label="Mã Đơn Hàng">#{order.id}</td>
                  <td data-label="Ngày Đặt">{order.date}</td>
                  <td data-label="Số Lượng SP">{order.items.reduce((sum, item) => sum + item.quantity, 0)}</td>
                  <td data-label="Tổng Cộng">{formatPrice(order.total)}</td>
                  <td data-label="Trạng Thái">
                    <span className={`status-badge ${getStatusClass(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td>
                    <button className="detail-order-btn" onClick={() => handleViewDetail(order.id)}>Xem chi tiết</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-state">
            <p>Bạn chưa có đơn hàng nào.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;