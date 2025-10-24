import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import ProfileSidebar from '../components/common/ProfileSideBar';
import '../pages/profile/ProfilePage.css'; 

const mockOrders = [
  { id: 1001, date: '2025-09-15', total: 120000, status: 'Hoàn thành', items: 4 },
  { id: 1002, date: '2025-10-01', total: 58000, status: 'Đang giao hàng', items: 2 },
  { id: 1003, date: '2025-10-18', total: 25000, status: 'Đã hủy', items: 1 },
];

const OrdersPage: React.FC = () => {
  const { currentUser } = useAuth();

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
      default:
        return '';
    }
  };

  return (
    <div className="profile-page-container">
      <ProfileSidebar activeLink="/orders" />
      <div className="profile-content">
        <h1>Lịch Sử Mua Hàng</h1>
        
        {mockOrders.length > 0 ? (
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
              {mockOrders.map(order => (
                <tr key={order.id}>
                  <td data-label="Mã Đơn Hàng">#{order.id}</td>
                  <td data-label="Ngày Đặt">{order.date}</td>
                  <td data-label="Số Lượng SP">{order.items}</td>
                  <td data-label="Tổng Cộng">{formatPrice(order.total)}</td>
                  <td data-label="Trạng Thái">
                    <span className={`status-badge ${getStatusClass(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td>
                    <button className="detail-order-btn">Xem chi tiết</button>
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