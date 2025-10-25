import React from 'react';
import { Link } from 'react-router-dom';
import { FiUser, FiBook, FiList, FiMapPin } from 'react-icons/fi';
import './ProfileSidebar.css';

interface ProfileSidebarProps {
    activeLink: string;
}

const ProfileSidebar: React.FC<ProfileSidebarProps> = ({ activeLink }) => {
  const links = [
    { path: '/profile', icon: <FiUser />, label: 'Thông tin cá nhân' },
    { path: '/addresses', icon: <FiMapPin />, label: 'Quản lý Địa chỉ' },
    { path: '/my-library', icon: <FiBook />, label: 'Thư viện số của tôi' },
    { path: '/orders', icon: <FiList />, label: 'Lịch sử mua hàng' },
  ];

  return (
    <div className="profile-sidebar">
      {links.map((link) => (
        <Link 
          key={link.path}
          to={link.path}
          className={`sidebar-link ${activeLink === link.path ? 'active' : ''}`}
        >
          <span className="sidebar-icon">{link.icon}</span>
          <span className="sidebar-label">{link.label}</span>
        </Link>
      ))}
    </div>
  );
};

export default ProfileSidebar;