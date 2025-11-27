import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiUser, FiBook, FiMapPin, FiClock, FiLogOut } from 'react-icons/fi';
import '../../assets/styles/ProfileSideBar.css';

interface SidebarProps {
    activeTab?: string;
    setActiveTab?: (tab: string) => void;
    onLogout: () => void;
}

const ProfileSideBar: React.FC<SidebarProps> = ({ activeTab, onLogout }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const handleProfileTabClick = (tabName: string) => {
        navigate(`/profile?tab=${tabName}`);
    };

    return (
        <div className="profile-sidebar">
            <div className="sidebar-menu">
                {/* 1. Thông tin tài khoản */}
                <button 
                    className={`sidebar-item ${activeTab === 'info' && location.pathname === '/profile' ? 'active' : ''}`}
                    onClick={() => handleProfileTabClick('info')}
                >
                    <FiUser className="sidebar-icon" />
                    <span>Thông tin tài khoản</span>
                </button>

                {/* 2. Quản lý Địa chỉ */}
                <Link 
                    to="/addresses" 
                    className={`sidebar-item ${location.pathname === '/addresses' ? 'active' : ''}`}
                >
                    <FiMapPin className="sidebar-icon" />
                    <span>Quản lý Địa chỉ</span>
                </Link>

                {/* 3. Lịch sử giao dịch */}
                <button 
                    className={`sidebar-item ${activeTab === 'history' && location.pathname === '/profile' ? 'active' : ''}`}
                    onClick={() => handleProfileTabClick('history')}
                >
                    <FiClock className="sidebar-icon" />
                    <span>Lịch sử giao dịch</span>
                </button>

                {/* 4. Thư viện số */}
                <Link 
                    to="/my-library" 
                    className={`sidebar-item ${location.pathname === '/my-library' ? 'active' : ''}`}
                >
                    <FiBook className="sidebar-icon" />
                    <span>Thư viện số</span>
                </Link>

                {/* 5. Đăng xuất */}
                <button className="sidebar-item logout" onClick={onLogout}>
                    <FiLogOut className="sidebar-icon" />
                    <span>Đăng xuất</span>
                </button>
            </div>
        </div>
    );
};

export default ProfileSideBar;