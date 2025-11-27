import React from 'react';
import { Link } from 'react-router-dom';
import { FiUser, FiBook, FiMapPin, FiClock, FiLogOut } from 'react-icons/fi';
import '../../assets/styles/ProfileSideBar.css';

// [QUAN TRỌNG]: Interface phải khớp với props truyền từ ProfilePage
interface SidebarProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    onLogout: () => void;
}

const ProfileSideBar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, onLogout }) => {
    return (
        <div className="profile-sidebar">
            <div className="sidebar-menu">
                <button 
                    className={`sidebar-item ${activeTab === 'info' ? 'active' : ''}`}
                    onClick={() => setActiveTab('info')}
                >
                    <FiUser className="sidebar-icon" />
                    <span>Thông tin tài khoản</span>
                </button>

                <button 
                    className={`sidebar-item ${activeTab === 'address' ? 'active' : ''}`}
                    onClick={() => setActiveTab('address')}
                >
                    <FiMapPin className="sidebar-icon" />
                    <span>Quản lý Địa chỉ</span>
                </button>

                <button 
                    className={`sidebar-item ${activeTab === 'history' ? 'active' : ''}`}
                    onClick={() => setActiveTab('history')}
                >
                    <FiClock className="sidebar-icon" />
                    <span>Lịch sử giao dịch</span>
                </button>

                <Link to="/my-library" className="sidebar-item">
                    <FiBook className="sidebar-icon" />
                    <span>Thư viện số</span>
                </Link>

                <button className="sidebar-item logout" onClick={onLogout}>
                    <FiLogOut className="sidebar-icon" />
                    <span>Đăng xuất</span>
                </button>
            </div>
        </div>
    );
};

export default ProfileSideBar;