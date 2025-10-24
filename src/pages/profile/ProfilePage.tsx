import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import ProfileSidebar from '../../components/common/ProfileSideBar'; 
import './ProfilePage.css'; 

const ProfilePage: React.FC = () => {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return (
      <div className="profile-page-not-logged">
        <h2>Bạn cần đăng nhập để xem trang này.</h2>
      </div>
    );
  }

  return (
    <div className="profile-page-container">
      <ProfileSidebar activeLink="/profile" />
      <div className="profile-content">
        <h1>Xin chào, {currentUser.email}!</h1>
        <div className="profile-info-card">
            <h3>Thông tin tài khoản</h3>
            <p><strong>Email:</strong> {currentUser.email}</p>
            <p><strong>ID Người dùng:</strong> {currentUser.id}</p>
            <p>
                Đây là khu vực hiển thị thông tin cá nhân. Bạn có thể cập nhật tên, địa chỉ 
                hoặc thay đổi mật khẩu tại đây.
            </p>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
