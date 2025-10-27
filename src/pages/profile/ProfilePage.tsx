import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import ProfileSidebar from '../../components/common/ProfileSideBar';
import { useNotification } from '../../contexts/NotificationContext';
import './ProfilePage.css'; 

const ProfilePage: React.FC = () => {
  const { currentUser, updateProfile, getLevelColor } = useAuth(); 
  const { showNotification } = useNotification();
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setFormData({
        fullName: currentUser.fullName,
        phone: currentUser.phone,
      });
    }
  }, [currentUser]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    if (!formData.fullName || !formData.phone) {
        showNotification('Vui lòng điền đầy đủ Họ tên và Số điện thoại.', 'warning');
        return;
    }

    setIsSaving(true);
    try {
        await updateProfile({ fullName: formData.fullName, phone: formData.phone }); 
        setIsEditing(false);
    } catch (error) {
        console.error('Lỗi khi cập nhật hồ sơ:', error);
        showNotification('Đã xảy ra lỗi khi cập nhật hồ sơ.', 'error');
    } finally {
        setIsSaving(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="profile-page-not-logged">
        <h2>Bạn cần đăng nhập để xem thông tin hồ sơ.</h2>
      </div>
    );
  }

  const levelColor = getLevelColor(currentUser.level);

  return (
    <div className="profile-page-container">
      <ProfileSidebar activeLink="/profile" />
      <div className="profile-content">
        <h1>Thông Tin Hồ Sơ</h1>

        
        <div className="profile-info-card level-exp-card">
            <h3>Cấp Độ & Kinh Nghiệm</h3>
            <div className="level-display">
                <span className="level-badge" style={{ backgroundColor: levelColor }}>
                    Cấp {currentUser.level}
                </span>
            </div>
            <div className="exp-progress-bar-container">
                <div
                    className="exp-progress-bar-fill"
                    style={{ width: `${currentUser.exp}%`, backgroundColor: levelColor }}
                ></div>
            </div>
            <div className="exp-text">
                <span>{currentUser.exp.toFixed(2)}%</span>
                <span>{(100 - currentUser.exp).toFixed(2)}% cần để lên cấp</span>
            </div>
            <p className="exp-info-note">
                Kinh nghiệm nhận được từ đọc truyện và nạp Xu. Tỉ lệ nhận giảm dần theo cấp độ.
            </p>
        </div>


        
        <form onSubmit={handleSave}>
            <div className="profile-info-card">
                <h3>Thông Tin Cá Nhân</h3>

                <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input type="text" id="email" value={currentUser.email} disabled />
                </div>

                <div className="form-group">
                    <label htmlFor="fullName">Họ và Tên</label>
                    <input
                        type="text"
                        id="fullName"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        disabled={!isEditing}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="phone">Số Điện Thoại</label>
                    <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        disabled={!isEditing}
                        required
                    />
                </div>

                <div className="profile-actions">
                    {!isEditing ? (
                        <button type="button" className="edit-btn" onClick={() => setIsEditing(true)}>Chỉnh Sửa</button>
                    ) : (
                        <>
                            <button
                                type="submit"
                                className="save-btn"
                                disabled={isSaving}
                            >
                                {isSaving ? 'Đang lưu...' : 'Lưu Thay Đổi'}
                            </button>
                            <button
                                type="button"
                                className="cancel-btn"
                                onClick={() => {
                                    setIsEditing(false);
                                    if(currentUser) {
                                        setFormData({
                                            fullName: currentUser.fullName,
                                            phone: currentUser.phone,
                                        });
                                    }
                                }}
                                disabled={isSaving}
                            >
                                Hủy
                            </button>
                        </>
                    )}
                </div>
            </div>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;