import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUser, FiBook, FiMapPin, FiClock, FiLogOut } from 'react-icons/fi';
import '../../assets/styles/ProfileSideBar.css';

interface SidebarProps {
	activeTab?: string;
	setActiveTab?: (tab: string) => void;
	onLogout: () => void;
}

const ProfileSideBar: React.FC<SidebarProps> = ({ activeTab, onLogout }) => {
	const navigate = useNavigate();

	const handleProfileTabClick = (tabName: string) => {
		navigate(`/profile?tab=${tabName}`);
	};

	return (
		<div className="profile-sidebar">
			<div className="sidebar-menu">
				<button
					className={`sidebar-item ${activeTab === 'info' ? 'active' : ''}`}
					onClick={() => handleProfileTabClick('info')}
				>
					<FiUser className="sidebar-icon" />
					<span>Thông tin tài khoản</span>
				</button>

				<button
					className={`sidebar-item ${activeTab === 'addresses' ? 'active' : ''}`}
					onClick={() => handleProfileTabClick('addresses')}
				>
					<FiMapPin className="sidebar-icon" />
					<span>Quản lý Địa chỉ</span>
				</button>

				<button
					className={`sidebar-item ${activeTab === 'history' ? 'active' : ''}`}
					onClick={() => handleProfileTabClick('history')}
				>
					<FiClock className="sidebar-icon" />
					<span>Lịch sử giao dịch</span>
				</button>

				<button
					className={`sidebar-item ${activeTab === 'my-library' ? 'active' : ''}`}
					onClick={() => handleProfileTabClick('my-library')}
				>
					<FiBook className="sidebar-icon" />
					<span>Thư viện số</span>
				</button>

				<button className="sidebar-item logout" onClick={onLogout}>
					<FiLogOut className="sidebar-icon" />
					<span>Đăng xuất</span>
				</button>
			</div>
		</div>
	);
};

export default ProfileSideBar;
