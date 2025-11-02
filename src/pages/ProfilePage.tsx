import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import ProfileSidebar from '../components/common/ProfileSideBar';
import { useNotification } from '../contexts/NotificationContext';
import { FiChevronDown, FiUpload, FiLoader } from 'react-icons/fi';
import '../styles/ProfilePage.css';
import { Link } from 'react-router-dom';
import { getLevelColor, getEquivalentLevelTitle as getEquivalentLevelTitleUtil, LEVEL_SYSTEMS } from '../utils/authUtils'; 
import LoadingPage from '../components/common/Loading/LoadingScreen';

interface LevelSystem {
    key: string;
    name: string;
    description: string;
    levels: string[];
    minLevels: number[];
}

interface LevelSelectorProps {
    currentUserLevel: number;
    currentSystemKey: string;
    onSystemChange: (newSystemKey: string) => void;
    currentLevelColor: string;
}

const LevelSystemSelector: React.FC<LevelSelectorProps> = React.lazy(() => import('../components/common/LevelSystemSelector'));


const ProfilePage: React.FC = () => {
  const { currentUser, updateProfile, updateAvatar, getLevelColor, selectedSystemKey, updateSelectedSystemKey, getEquivalentLevelTitle, loading } = useAuth();
  const { showNotification } = useNotification();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  if (loading) {
    return <LoadingPage />;
  }

  if (!currentUser) {
    return (
      <div className="profile-page-not-logged">
        <h2>Bạn cần đăng nhập để xem thông tin hồ sơ.</h2>
        <Link to="/login" className="detail-order-btn" style={{marginTop: '1rem'}}>Đi đến trang đăng nhập</Link>
      </div>
    );
  }

  useEffect(() => {
    if (currentUser) {
      setFormData({
        fullName: currentUser.fullName || '',
        phone: currentUser.phone || '',
      });
      setAvatarPreview(currentUser.avatarUrl);
      setAvatarFile(null);
    }
  }, [currentUser]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLevelSystemChange = (newSystemKey: string) => {
      updateSelectedSystemKey(newSystemKey);
      showNotification(`Đã đổi hệ thống cấp bậc thành ${newSystemKey}`, 'success');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.fullName || !formData.phone) {
        showNotification('Vui lòng điền đầy đủ Họ tên và Số điện thoại.', 'warning');
        return;
    }

    setIsSaving(true);
    try {
        await updateProfile({ fullName: formData.fullName, phone: formData.phone });
    } catch (error) {
        console.error('Lỗi khi cập nhật hồ sơ:', error);
    } finally {
        setIsSaving(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          setAvatarFile(file);
          const reader = new FileReader();
          reader.onloadend = () => {
              setAvatarPreview(reader.result as string);
          };
          reader.readAsDataURL(file);
      }
  };

  const handleAvatarUpdate = async () => {
      if (!avatarFile) {
          showNotification('Bạn chưa chọn ảnh mới.', 'warning');
          return;
      }
      if (!CLOUD_NAME || !UPLOAD_PRESET) {
          console.error('Cloudinary config is missing. Check .env file.');
          showNotification('Lỗi cấu hình upload ảnh.', 'error');
          return;
      }

      setIsSaving(true);

      const formDataUpload = new FormData();
      formDataUpload.append('file', avatarFile);
      formDataUpload.append('upload_preset', UPLOAD_PRESET);

      try {
          const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
              method: 'POST',
              body: formDataUpload,
          });

          if (!response.ok) {
              throw new Error('Tải ảnh lên Cloudinary thất bại.');
          }

          const data = await response.json();
          const newAvatarUrl = data.secure_url;

          if (newAvatarUrl) {
              await updateAvatar(newAvatarUrl);
          } else {
              throw new Error('Không nhận được URL từ Cloudinary.');
          }

          setAvatarFile(null);

      } catch (error) {
          console.error('Lỗi khi cập nhật avatar:', error);
          const errorMessage = error instanceof Error ? error.message : String(error);
          showNotification(`Lỗi cập nhật avatar: ${errorMessage}`, 'error');
          setAvatarPreview(currentUser.avatarUrl);
          setAvatarFile(null);
      } finally {
          setIsSaving(false);
      }
  };


  const levelColor = getLevelColor(currentUser.level);
  const isNeonActive = currentUser.level >= 8;

  const isProfileChanged = formData.fullName !== (currentUser.fullName || '') || formData.phone !== (currentUser.phone || '');
  const hasAvatarChanged = avatarFile !== null;
  const hasChanges = isProfileChanged || hasAvatarChanged;

  const equivalentLevelTextOnBadge = getEquivalentLevelTitle(currentUser.level);

  return (
    <div className="profile-page-container">
      <ProfileSidebar activeLink="/profile" />
      <div className="profile-content">
        <h1>Thông Tin Hồ Sơ</h1>

        <div className="profile-info-card profile-avatar-card">
             <h3>Ảnh Đại Diện</h3>
             <div className="avatar-display-section">
                <img
                    src={avatarPreview || currentUser.avatarUrl}
                    alt="Ảnh đại diện"
                    className="profile-avatar-img"
                />
                <input
                    type="file"
                    accept="image/png, image/jpeg, image/gif"
                    ref={fileInputRef}
                    onChange={handleAvatarChange}
                    style={{ display: 'none' }}
                />
                <button
                    type="button"
                    className="change-avatar-btn"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isSaving}
                >
                    <FiUpload /> {avatarFile ? 'Chọn ảnh khác' : 'Thay đổi ảnh'}
                </button>
                 {avatarFile && (
                    <button
                        type="button"
                        className="save-btn"
                        onClick={handleAvatarUpdate}
                        disabled={isSaving || !hasAvatarChanged}
                        style={{ marginLeft: '1rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                         {isSaving ? <FiLoader className="animate-spin" /> : <FiUpload />}
                         {isSaving ? 'Đang tải lên...' : 'Lưu ảnh mới'}
                    </button>
                 )}
             </div>
        </div>

        <div className="profile-info-card level-exp-card">
            <h3>Cấp Độ & Kinh Nghiệm</h3>
            <div className="level-display">
                <span
                    className={`level-badge-wrapper ${isNeonActive ? 'neon-active' : ''}`}
                    style={{'--progress-bar-color': levelColor, '--level-color': levelColor} as React.CSSProperties}
                >
                    <span className="level-badge" style={{ backgroundColor: levelColor }}>
                        {equivalentLevelTextOnBadge}
                    </span>
                </span>
            </div>
            <div className="exp-progress-bar-container" style={{'--progress-bar-color': levelColor} as React.CSSProperties}>
                <div
                    className="exp-progress-bar-fill"
                    style={{ width: `${currentUser.exp}%` }}
                ></div>
            </div>
            <div className="exp-text">
                <span>{currentUser.exp.toFixed(2)}%</span>
                <span>{(100 - currentUser.exp).toFixed(2)}% cần để lên cấp</span>
            </div>
            <p className="exp-info-note">
                Kinh nghiệm nhận được từ đọc truyện và nạp Xu. Tỉ lệ nhận giảm dần theo cấp độ.
            </p>
            <React.Suspense fallback={<div>Đang tải bộ chọn cấp độ...</div>}>
                <LevelSystemSelector
                    currentUserLevel={currentUser.level}
                    currentSystemKey={selectedSystemKey}
                    onSystemChange={handleLevelSystemChange}
                    currentLevelColor={levelColor}
                />
            </React.Suspense>
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
                        required
                    />
                </div>
                <div className="profile-actions">
                    <button
                        type="submit"
                        className="save-btn"
                        disabled={isSaving || !isProfileChanged}
                    >
                        {isSaving ? 'Đang lưu...' : 'Lưu Thông Tin'}
                    </button>
                    {isProfileChanged && (
                        <button
                            type="button"
                            className="cancel-btn"
                            onClick={() => {
                                setFormData({
                                    fullName: currentUser.fullName || '',
                                    phone: currentUser.phone || '',
                                });
                            }}
                            disabled={isSaving}
                        >
                            Hủy
                        </button>
                    )}
                </div>
            </div>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;