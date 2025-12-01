import React from 'react';
import { FiBookOpen, FiArchive, FiUsers, FiBarChart2, FiGift, FiZap, FiClipboard } from 'react-icons/fi';
import { type AdminView } from '../../pages/AdminPage'; 

interface AdminSidebarProps {
    activeView: AdminView;
    onNavigate: (view: AdminView) => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ activeView, onNavigate }) => {
    return (
        <nav className="admin-sidebar">
            <h3>STORYVERSE</h3>
            <h4>Bảng Điều Khiển</h4>
            
            <button
                className={`sidebar-btn ${activeView === 'dashboard' ? 'active' : ''}`}
                onClick={() => onNavigate('dashboard')}
            >
                <FiBarChart2 /> Tổng Quan
            </button>
            
            <button
                className={`sidebar-btn ${activeView === 'digital' ? 'active' : ''}`}
                onClick={() => onNavigate('digital')}
            >
                <FiBookOpen /> Truyện Online
            </button>

            <button
                className={`sidebar-btn ${activeView === 'physical' ? 'active' : ''}`}
                onClick={() => onNavigate('physical')}
            >
                <FiArchive /> Truyện In
            </button>

            <button
                className={`sidebar-btn ${activeView === 'orders' ? 'active' : ''}`}
                onClick={() => onNavigate('orders')}
            >
                <FiClipboard /> Quản lý Đơn hàng
            </button>

            <button
                className={`sidebar-btn ${activeView === 'users' ? 'active' : ''}`}
                onClick={() => onNavigate('users')}
            >
                <FiUsers /> Quản lý Người Dùng
            </button>

            <button
                className={`sidebar-btn ${activeView === 'packs' ? 'active' : ''}`}
                onClick={() => onNavigate('packs')}
            >
                <FiGift /> Gói Nạp & Ưu Đãi
            </button>

            <button
                className={`sidebar-btn ${activeView === 'flash-sales' ? 'active' : ''}`}
                onClick={() => onNavigate('flash-sales')}
            >
                <FiZap /> Flash Sale
            </button>
            
        </nav>
    );
};

export default AdminSidebar;