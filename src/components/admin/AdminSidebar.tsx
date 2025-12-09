import React from 'react';
import {
	FiBarChart2,
	FiBookOpen,
	FiClipboard,
	FiUsers,
	FiShield,
	FiGift,
	FiChevronRight,
	FiLifeBuoy,
} from 'react-icons/fi';
import { type AdminView } from '../../pages/AdminPage';
import '../../assets/styles/AdminSidebar.css';

interface AdminSidebarProps {
	activeView: AdminView;
	onNavigate: (view: AdminView) => void;
}

interface AdminMenuItem {
	id: string;
	label: string;
	icon: React.ElementType;
	view?: AdminView;
	children?: { id: string; label: string; view: AdminView }[];
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ activeView, onNavigate }) => {
	const menuItems: AdminMenuItem[] = [
		{
			id: 'dashboard',
			label: 'Tổng quan',
			icon: FiBarChart2,
			view: 'dashboard',
		},
		{
			id: 'comics',
			label: 'Quản lí truyện',
			icon: FiBookOpen,
			children: [
				{ id: 'digital', label: 'Truyện online', view: 'digital' },
				{ id: 'physical', label: 'Truyện giấy', view: 'physical' },
			],
		},
		{
			id: 'orders',
			label: 'Quản lí đơn hàng',
			icon: FiClipboard,
			view: 'orders',
		},
		{
			id: 'users',
			label: 'Quản lí người dùng',
			icon: FiUsers,
			view: 'users',
		},

		{
			id: 'support',
			label: 'Trung tâm hỗ trợ',
			icon: FiLifeBuoy,
			children: [
				{ id: 'contact', label: 'Hộp thư góp ý', view: 'contact' },
				{ id: 'complaints', label: 'Giải quyết khiếu nại', view: 'complaints' },
			],
		},
		{
			id: 'moderation',
			label: 'Kiểm duyệt',
			icon: FiShield,
			children: [
				{ id: 'avatars', label: 'Duyệt Avatar', view: 'avatars' },
				{ id: 'reports', label: 'Quản lý Báo cáo', view: 'reports' },
			],
		},
		{
			id: 'marketing',
			label: 'Marketing & Ưu đãi',
			icon: FiGift,
			children: [
				{ id: 'packs', label: 'Gói nạp Xu', view: 'packs' },
				{ id: 'vouchers', label: 'Mã giảm giá', view: 'vouchers' },
				{ id: 'giftcodes', label: 'Giftcode', view: 'giftcodes' },
				{ id: 'flash-sales', label: 'Flash Sale', view: 'flash-sales' },
			],
		},
	];

	return (
		<nav className="admin-sidebar-container">
			{}
			<div className="admin-sidebar-header">
				<h3 className="admin-brand">STORYVERSE</h3>
				<h4 className="admin-subtitle">Admin Portal</h4>
			</div>

			<div className="admin-sidebar-menu">
				{menuItems.map((item) => {
					const isActive =
						item.view === activeView ||
						(item.children && item.children.some((child) => child.view === activeView));

					return (
						<div
							key={item.id}
							className={`admin-menu-group ${isActive ? 'active-group' : ''}`}
						>
							<div
								className={`admin-menu-item ${activeView === item.view ? 'active' : ''}`}
								onClick={() => item.view && onNavigate(item.view)}
							>
								<item.icon className="admin-menu-icon" />
								<span className="admin-menu-label">{item.label}</span>
								{item.children && <FiChevronRight className="admin-menu-arrow" />}
							</div>

							{item.children && (
								<div className="admin-submenu">
									{item.children.map((child) => (
										<button
											key={child.id}
											className={`admin-submenu-item ${activeView === child.view ? 'active' : ''}`}
											onClick={(e) => {
												e.stopPropagation();
												onNavigate(child.view);
											}}
										>
											{child.label}
										</button>
									))}
								</div>
							)}
						</div>
					);
				})}
			</div>
		</nav>
	);
};

export default AdminSidebar;
