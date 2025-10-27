import React, { useState, useEffect, useMemo } from 'react';
import { useAuth, type User } from '../../contexts/AuthContext';
import ProfileSidebar from '../../components/common/ProfileSideBar';
import { useNotification } from '../../contexts/NotificationContext';
import { FiEdit3, FiChevronDown } from 'react-icons/fi';
import './ProfilePage.css';

interface LevelSystem {
    key: string;
    name: string;
    description: string;
    levels: string[];
    minLevels: number[];
}

const LEVEL_SYSTEMS: LevelSystem[] = [
    { key: 'Bình Thường', name: 'Bình Thường', description: 'Hệ thống cấp bậc cơ bản từ Cấp 0 đến Cấp 15+.', levels: ['Cấp 0', 'Cấp 1', 'Cấp 2', 'Cấp 3', 'Cấp 4', 'Cấp 5', 'Cấp 6', 'Cấp 7', 'Cấp 8', 'Cấp 9', 'Cấp 10', 'Cấp 11', 'Cấp 12', 'Cấp 13', 'Cấp 14', 'Cấp 15+'], minLevels: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15] },
    { key: 'Tu Tiên', name: 'Tu Tiên', description: 'Thế giới tu luyện linh khí, truy cầu trường sinh bất tử.', levels: ['Phàm nhân', 'Luyện Khí', 'Trúc Cơ', 'Kim Đan', 'Nguyên Anh', 'Hóa Thần', 'Hợp Thể', 'Đại Thừa', 'Phi Thăng', 'Tiên Nhân'], minLevels: [0, 1, 2, 4, 6, 7, 8, 10, 12, 15], },
    { key: 'Game', name: 'Game', description: 'Thế giới trò chơi, nhân vật thăng cấp, săn boss, vượt nhiệm vụ.', levels: ['Vô hạng', 'Đồng', 'Bạc', 'Vàng', 'Bạch Kim', 'Kim Cương', 'Huyền Thoại', 'Cao thủ', 'Thách đấu'], minLevels: [0, 1, 3, 5, 7, 9, 11, 13, 15], },
    { key: 'Ma Vương', name: 'Ma Vương', description: 'Thế giới hắc ám, ma giới, chiến đấu với anh hùng và thần linh.', levels: ['Ma thường', 'Ma Nhân', 'Ma Sĩ', 'Ma Tướng', 'Ma Tôn', 'Ma Đế', 'Ma Thần', 'Ma Vương', 'Hắc Ma Vạn Tôn'], minLevels: [0, 1, 3, 5, 7, 9, 11, 13, 15], },
    { key: 'Pháp Sư', name: 'Pháp Sư', description: 'Thế giới phép thuật, học viện, chiến đấu bằng ma pháp và trí tuệ.', levels: ['Học đồ', 'Pháp sư sơ cấp', 'Pháp sư trung cấp', 'Pháp sư cao cấp', 'Đại Pháp Sư', 'Pháp Thánh', 'Pháp Thần', 'Ma đạo sư'], minLevels: [0, 1, 3, 6, 9, 11, 13, 15], },
    { key: 'Tinh Không', name: 'Tinh Không', description: 'Thế giới vũ trụ, du hành giữa các hành tinh và hệ sao.', levels: ['Binh lính', 'Chiến Sĩ', 'Vệ Tinh', 'Tinh Vương', 'Tinh Hoàng', 'Tinh Đế', 'Tinh Tôn', 'Vũ Trụ Chi Chủ'], minLevels: [0, 1, 3, 6, 9, 11, 13, 15], }
];

interface LevelSelectorProps {
    currentUserLevel: number;
    currentSystemKey: string;
    onSystemChange: (newSystemKey: string) => void;
    currentLevelColor: string;
}

const LevelSystemSelector: React.FC<LevelSelectorProps> = ({ currentUserLevel, currentSystemKey, onSystemChange, currentLevelColor }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [tempSystemKey, setTempSystemKey] = useState(currentSystemKey);

    useEffect(() => {
        setTempSystemKey(currentSystemKey);
    }, [currentSystemKey]);

    const displaySystem = useMemo(() =>
        LEVEL_SYSTEMS.find(s => s.key === currentSystemKey) || LEVEL_SYSTEMS[0]
    , [currentSystemKey]);

    const liveSystem = useMemo(() =>
        LEVEL_SYSTEMS.find(s => s.key === tempSystemKey) || LEVEL_SYSTEMS[0]
    , [tempSystemKey]);

    const liveEquivalentLevel = useMemo(() => {
        const system = LEVEL_SYSTEMS.find(s => s.key === tempSystemKey) || LEVEL_SYSTEMS[0];
        let matchingLevel = system.levels[0];
        for (let i = system.minLevels.length - 1; i >= 0; i--) {
            if (currentUserLevel >= system.minLevels[i]) {
                matchingLevel = system.levels[i];
                break;
            }
        }
        return matchingLevel;
    }, [currentUserLevel, tempSystemKey]);


    const handleEditClick = () => {
        setTempSystemKey(currentSystemKey);
        setIsEditing(true);
    };

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newKey = e.target.value;
        setTempSystemKey(newKey);
        // Thay đổi trực tiếp khi chọn từ dropdown
        onSystemChange(newKey);
        setIsEditing(false); // Đóng chế độ edit sau khi chọn
    };

    const handleCancelClick = () => {
        setTempSystemKey(currentSystemKey);
        setIsEditing(false);
    };

    return (
        <div className="level-system-selector-wrapper">
            <div className="system-current-info">
                <span className="level-label">Loại cấp bậc:</span>
                 {!isEditing ? (
                    <>
                        <span
                            className="system-name-display"
                            style={{ color: currentLevelColor, borderColor: currentLevelColor }}
                            title={displaySystem.description}
                        >
                            {displaySystem.name}
                        </span>
                        <button
                            onClick={handleEditClick}
                            className="change-system-btn"
                            style={{ color: currentLevelColor, textDecoration: 'underline' }}
                            aria-label="Thay đổi loại cấp bậc"
                        >
                            Thay đổi
                        </button>
                    </>
                 ) : (
                    <div className="system-selector-form-inline-minimal">
                        <div className="select-wrapper">
                            <select
                                id="level-system-select"
                                value={tempSystemKey}
                                onChange={handleSelectChange}
                            >
                                {LEVEL_SYSTEMS.map(system => (
                                    <option key={system.key} value={system.key}>
                                        {system.name}
                                    </option>
                                ))}
                            </select>
                            <FiChevronDown className="select-arrow" />
                        </div>
                        {/* Nút hủy nếu cần */}
                        {/* <button onClick={handleCancelClick} className="cancel-btn-inline">Hủy</button> */}
                    </div>
                 )}
            </div>
             {!isEditing && (
                <div className="equivalent-level-display">
                    <span className="level-label">Cấp tương đương:</span>
                    <span className="level-value" style={{fontWeight: 'bold', color: 'var(--clr-text)'}}>
                        Cấp {currentUserLevel}
                    </span>
                </div>
             )}

             {isEditing && (
                 <div className="system-info-editing">
                    <p className="system-description">
                        **Mô tả:** {liveSystem.description}
                    </p>
                    <p className="equivalent-level-live">
                        <span className="level-label">Xem trước cấp tương đương:</span>
                        <span className="level-value-live">
                           {liveEquivalentLevel}
                        </span>
                    </p>
                </div>
             )}
        </div>
    );
};


const ProfilePage: React.FC = () => {
  const { currentUser, updateProfile, getLevelColor, selectedSystemKey, updateSelectedSystemKey, getEquivalentLevelTitle } = useAuth();
  const { showNotification } = useNotification();

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
  });
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

  // Hàm này giờ sẽ gọi context để cập nhật
  const handleLevelSystemChange = (newSystemKey: string) => {
      updateSelectedSystemKey(newSystemKey);
      showNotification(`Đã đổi hệ thống cấp bậc thành ${newSystemKey}`, 'success');
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
        // Không cần lưu systemKey ở đây nữa vì nó được cập nhật tức thì qua context
        showNotification('Cập nhật hồ sơ thành công!', 'success');
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
  const isNeonActive = currentUser.level >= 8;

  const isProfileChanged = formData.fullName !== currentUser.fullName || formData.phone !== currentUser.phone;
  // hasChanges giờ chỉ kiểm tra thông tin profile
  const hasChanges = isProfileChanged;

  // Lấy cấp bậc tương đương để hiển thị trên BADGE (dùng state từ context)
  const equivalentLevelTextOnBadge = getEquivalentLevelTitle(currentUser.level);

  return (
    <div className="profile-page-container">
      <ProfileSidebar activeLink="/profile" />
      <div className="profile-content">
        <h1>Thông Tin Hồ Sơ</h1>

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

            <LevelSystemSelector
                currentUserLevel={currentUser.level}
                currentSystemKey={selectedSystemKey} // Dùng state từ context
                onSystemChange={handleLevelSystemChange} // Dùng hàm cập nhật từ context
                currentLevelColor={levelColor}
            />

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
                        disabled={isSaving || !hasChanges}
                    >
                        {isSaving ? 'Đang lưu...' : 'Lưu Thay Đổi'}
                    </button>
                    {hasChanges && (
                        <button
                            type="button"
                            className="cancel-btn"
                            onClick={() => {
                                setFormData({
                                    fullName: currentUser.fullName,
                                    phone: currentUser.phone,
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