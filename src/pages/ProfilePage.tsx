import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import ProfileSideBar from '../components/common/ProfileSideBar';
import { useNotification } from '../contexts/NotificationContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiUpload, FiLoader } from 'react-icons/fi';
import '../assets/styles/ProfilePage.css';
import LoadingPage from '../components/common/Loading/LoadingScreen';
import TransactionHistory from '../components/common/TransactionHistory';
import AddressManagementPage from './AddressManagementPage';
import defaultAvatarImg from '../assets/images/defaultAvatar.webp';
import { getTextColorForBackground } from '../utils/authUtils';
import MyLibraryPage from './MyLibraryPage';

interface LevelSelectorProps {
    currentUserLevel: number;
    currentSystemKey: string;
    onSystemChange: (newSystemKey: string) => void;
    currentLevelColor: string;
}

const LevelSystemSelector: React.FC<LevelSelectorProps> = React.lazy(
    () => import('../components/common/LevelSystemSelector'),
);

const ProfilePage: React.FC = () => {
    const {
        currentUser,
        updateProfile,
        updateAvatar,
        getLevelColor,
        selectedSystemKey,
        updateSelectedSystemKey,
        getEquivalentLevelTitle,
        loading,
        logout,
        token,
    } = useAuth();
    const { showNotification } = useNotification();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();
    const location = useLocation();
    const [activeTab, setActiveTab] = useState('info');
    
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const tabParam = params.get('tab');
        if (tabParam && ['info', 'history', 'addresses', 'my-library'].includes(tabParam)) {
            setActiveTab(tabParam);
        } else {
            setActiveTab('info');
        }
    }, [location.search]);

    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
    });
    const [isSaving, setIsSaving] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);  
        
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

    const getAvatarSrc = (url: string | null | undefined) => {
        if (!url || url === 'defaultAvatar.webp') return defaultAvatarImg;
        return url;
    };

    if (loading) return <LoadingPage />;

    if (!currentUser) {
        return (
            <div className="profile-page-not-logged">
                <h2>Bạn cần đăng nhập để xem thông tin hồ sơ.</h2>
                <Link to="/login" className="detail-order-btn" style={{ marginTop: '1rem' }}>
                    Đi đến trang đăng nhập
                </Link>
            </div>
        );
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleLevelSystemChange = async (newSystemKey: string) => {
        try {
            if (!token) {
                showNotification('Bạn chưa đăng nhập hoặc phiên làm việc hết hạn.', 'error');
                return;
            }
            const response = await fetch(`${apiUrl}/users/level-system`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ systemKey: newSystemKey }),
            });

            if (!response.ok) {
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.indexOf('application/json') !== -1) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Lỗi khi cập nhật hệ thống cấp bậc');
                } else {
                    const textError = await response.text();
                    throw new Error(textError || `Lỗi máy chủ (${response.status})`);
                }
            }
            updateSelectedSystemKey(newSystemKey);
            showNotification(`Đã đổi hệ thống cấp bậc thành ${newSystemKey}`, 'success');
        } catch (error: any) {
            console.error('Lỗi cập nhật level system:', error);
            showNotification(error.message || 'Không thể lưu thay đổi hệ thống cấp bậc.', 'error');
        }
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

        setIsSaving(true);
        
        
        const formDataUpload = new FormData();
        formDataUpload.append('image', avatarFile);
        
        
        formDataUpload.append('uploadType', 'user_avatar');
        
        
        const userId = currentUser.id;
        if (userId) {
            formDataUpload.append('userId', userId);
        }

        try {
            
            const response = await fetch(`${apiUrl}/upload`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`, 
                },
                body: formDataUpload,
            });

            const data = await response.json();

            if (!response.ok) throw new Error(data.error || 'Tải ảnh thất bại.');

            
            const newAvatarUrl = data.imageUrl;

            if (newAvatarUrl) {
                await updateAvatar(newAvatarUrl);
                showNotification('Cập nhật avatar thành công!', 'success');
                setAvatarFile(null);
                setAvatarPreview(newAvatarUrl);
            } else {
                throw new Error('Không nhận được URL từ server.');
            }
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

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const levelColor = getLevelColor(currentUser.level);
    const levelTextColor = getTextColorForBackground(levelColor);
    const isNeonActive = currentUser.level >= 8;
    const isProfileChanged =
        formData.fullName !== (currentUser.fullName || '') ||
        formData.phone !== (currentUser.phone || '');
    const hasAvatarChanged = avatarFile !== null;
    const equivalentLevelTextOnBadge = getEquivalentLevelTitle(currentUser.level);

    return (
        <div className="profile-page-container">
            <ProfileSideBar activeTab={activeTab} onLogout={handleLogout} />

            <div className="profile-content">
                {activeTab === 'info' && (
                    <>
                        <h1>Thông Tin Hồ Sơ</h1>

                        <div className="profile-info-card profile-avatar-card">
                            <h3>Ảnh Đại Diện</h3>
                            <div className="avatar-display-section">
                                <img
                                    src={
                                        avatarPreview
                                            ? avatarPreview.startsWith('data:')
                                                ? avatarPreview
                                                : getAvatarSrc(avatarPreview)
                                            : getAvatarSrc(currentUser.avatarUrl)
                                    }
                                    alt="Avatar"
                                    className="profile-avatar-img"
                                />
                                <input
                                    type="file"
                                    accept="image/*"
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
                                        style={{
                                            marginLeft: '1rem',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                        }}
                                    >
                                        {isSaving ? (
                                            <FiLoader className="animate-spin" />
                                        ) : (
                                            <FiUpload />
                                        )}{' '}
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
                                    style={
                                        {
                                            '--progress-bar-color': levelColor,
                                            '--level-color': levelColor,
                                        } as React.CSSProperties
                                    }
                                >
                                    <span
                                        className="level-badge"
                                        style={{
                                            backgroundColor: levelColor,
                                            color: levelTextColor,
                                        }}
                                    >
                                        {equivalentLevelTextOnBadge}
                                    </span>
                                </span>
                            </div>
                            <div
                                className="exp-progress-bar-container"
                                style={
                                    { '--progress-bar-color': levelColor } as React.CSSProperties
                                }
                            >
                                <div
                                    className="exp-progress-bar-fill"
                                    style={{ width: `${currentUser.exp}%` }}
                                ></div>
                            </div>
                            <div className="exp-text">
                                <span>{currentUser.exp.toFixed(2)}%</span>
                                <span>{(100 - currentUser.exp).toFixed(2)}% cần để lên cấp</span>
                            </div>
                            <React.Suspense fallback={<div>Đang tải...</div>}>
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
                                    <label>Email</label>
                                    <input type="text" value={currentUser.email} disabled />
                                </div>
                                <div className="form-group">
                                    <label>Họ tên</label>
                                    <input
                                        type="text"
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>SĐT</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="profile-actions" style={{ marginTop: '2rem' }}>
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
                                            onClick={() =>
                                                setFormData({
                                                    fullName: currentUser.fullName || '',
                                                    phone: currentUser.phone || '',
                                                })
                                            }
                                            disabled={isSaving}
                                        >
                                            Hủy
                                        </button>
                                    )}
                                </div>
                            </div>
                        </form>
                    </>
                )}

                {activeTab === 'addresses' && <AddressManagementPage />}
                {activeTab === 'history' && <TransactionHistory />}
                {activeTab === 'my-library' && <MyLibraryPage />}
            </div>
        </div>
    );
};

export default ProfilePage;