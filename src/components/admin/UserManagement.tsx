import React, { useState, useEffect, useMemo } from 'react';
import { useToast } from '../../contexts/ToastContext';
import {
	FiSearch,
	FiSlash,
	FiCheckCircle,
	FiDownload,
	FiEdit,
	FiTrash2,
	FiEye,
	FiClock,
	FiDollarSign,
	FiBook,
	FiX,
	FiShoppingCart,
	FiXCircle,
} from 'react-icons/fi';
import UserEditModal, { type AdminManagedUser } from './UserEditModal';
import ConfirmModal from '../popups/ConfirmModal';
import '../../assets/styles/UserManagement.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

const StatusBadge = ({ status }: { status: string }) => {
	const statusLower = status?.toLowerCase() || '';
	if (['success', 'completed', 'thành công'].includes(statusLower)) {
		return (
			<div className="usermodal-badge usermodal-badge--success">
				<FiCheckCircle /> <span>Thành công</span>
			</div>
		);
	}
	if (['failed', 'cancelled', 'thất bại'].includes(statusLower)) {
		return (
			<div className="usermodal-badge usermodal-badge--failed">
				<FiXCircle /> <span>Thất bại</span>
			</div>
		);
	}
	return (
		<div className="usermodal-badge usermodal-badge--pending">
			<FiClock /> <span>Đang xử lý</span>
		</div>
	);
};

interface UserDetailModalProps {
	userId: string;
	onClose: () => void;
	token: string;
}

const UserDetailModal: React.FC<UserDetailModalProps> = ({ userId, onClose, token }) => {
	const [details, setDetails] = useState<any>(null);
	const [loading, setLoading] = useState(true);
	const [activeTab, setActiveTab] = useState<'info' | 'deposits' | 'purchases' | 'library'>(
		'info',
	);

	useEffect(() => {
		const fetchDetails = async () => {
			try {
				const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/details`, {
					headers: { Authorization: `Bearer ${token}` },
				});
				if (response.ok) {
					const data = await response.json();
					setDetails(data);
				}
			} catch (error) {
				console.error('Failed to fetch user details', error);
			} finally {
				setLoading(false);
			}
		};
		fetchDetails();
	}, [userId, token]);

	const stats = useMemo(() => {
		if (!details)
			return {
				totalDepositedVND: 0,
				totalPurchasedVND: 0,
				totalSpentCoins: 0,
				totalDepositedCoins: 0,
			};

		let totalDepositedVND = 0;
		let totalPurchasedVND = 0;
		let totalSpentCoins = 0;

		if (details.transactions) {
			details.transactions.forEach((tx: any) => {
				const amount = Number(tx.amount) || 0;
				const type = tx.type?.toLowerCase() || '';
				const status = tx.status?.toLowerCase() || '';

				if (status === 'success' || status === 'completed' || status === 'thành công') {
					if (
						type.includes('nạp') ||
						type.includes('deposit') ||
						type.includes('recharge')
					) {
						totalDepositedVND += amount;
					} else if (
						type.includes('mua') ||
						type.includes('buy') ||
						type.includes('purchase')
					) {
						totalPurchasedVND += amount;
					}
				}
			});
		}

		if (details.library) {
			details.library.forEach((lib: any) => {
				totalSpentCoins += Number(lib.price) || 0;
			});
		}

		const currentBalance = Number(details.profile?.coinBalance) || 0;
		const totalDepositedCoins = currentBalance + totalSpentCoins;

		return { totalDepositedVND, totalPurchasedVND, totalSpentCoins, totalDepositedCoins };
	}, [details]);

	const depositHistory = useMemo(
		() =>
			details?.transactions?.filter(
				(tx: any) =>
					tx.type?.toLowerCase().includes('nạp') ||
					tx.type?.toLowerCase().includes('deposit') ||
					tx.type?.toLowerCase().includes('recharge'),
			) || [],
		[details],
	);

	const purchaseHistory = useMemo(
		() =>
			details?.transactions?.filter(
				(tx: any) =>
					tx.type?.toLowerCase().includes('mua') ||
					tx.type?.toLowerCase().includes('buy') ||
					tx.type?.toLowerCase().includes('purchase'),
			) || [],
		[details],
	);

	const handleExportUserCSV = () => {
		if (!details) return;
		const txHeaders = [
			'Transaction Code',
			'Type',
			'ItemName',
			'Description',
			'Amount',
			'Status',
			'Date',
		];

		const txRows =
			details.transactions?.map(
				(tx: any) =>
					`${tx.transactionCode || tx.orderId || tx.id},${tx.type},"${tx.purchasedItem || ''}","${tx.description || ''}",${tx.amount},${tx.status},${new Date(tx.createdAt).toISOString()}`,
			) || [];

		const content = `User Report for ${details.profile.fullName}\n\nTRANSACTIONS\n${txHeaders.join(',')}\n${txRows.join('\n')}`;
		const blob = new Blob([`\uFEFF${content}`], { type: 'text/csv;charset=utf-8;' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `user_detail_${details.profile.fullName}.csv`;
		a.click();
	};

	if (loading)
		return (
			<div className="usermodal-overlay">
				<div
					className="usermodal-content"
					style={{
						padding: '2rem',
						width: 'auto',
						minWidth: '300px',
						alignItems: 'center',
					}}
				>
					Đang tải...
				</div>
			</div>
		);
	if (!details) return null;

	return (
		<div className="usermodal-overlay">
			<div className="usermodal-content">
				<div className="usermodal-header">
					<div className="usermodal-user-info">
						<img
							src={details.profile.avatarUrl}
							className="usermodal-avatar"
							alt="Avatar"
						/>
						<div>
							<h3 className="usermodal-name">{details.profile.fullName}</h3>
							<span className="usermodal-id">
								ID: {details.profile.id} | {details.profile.email}
							</span>
						</div>
					</div>
					<button onClick={onClose} className="usermodal-close-btn">
						<FiX size={20} />
					</button>
				</div>

				<div className="usermodal-tabs">
					<button
						className={`usermodal-tab ${activeTab === 'info' ? 'active' : ''}`}
						onClick={() => setActiveTab('info')}
					>
						<FiCheckCircle /> Thông Tin
					</button>
					<button
						className={`usermodal-tab ${activeTab === 'deposits' ? 'active' : ''}`}
						onClick={() => setActiveTab('deposits')}
					>
						<FiDollarSign /> Lịch Sử Nạp ({depositHistory.length})
					</button>
					<button
						className={`usermodal-tab ${activeTab === 'purchases' ? 'active' : ''}`}
						onClick={() => setActiveTab('purchases')}
					>
						<FiShoppingCart /> Lịch Sử Mua ({purchaseHistory.length})
					</button>
					<button
						className={`usermodal-tab ${activeTab === 'library' ? 'active' : ''}`}
						onClick={() => setActiveTab('library')}
					>
						<FiBook /> Tủ Truyện ({details.library?.length})
					</button>
					<button className="usermodal-export-btn" onClick={handleExportUserCSV}>
						<FiDownload /> Xuất CSV
					</button>
				</div>

				<div className="usermodal-body">
					{activeTab === 'info' && (
						<div className="usermodal-info-grid">
							<div className="usermodal-detail-card">
								<h4>Thông tin cá nhân</h4>
								<div className="usermodal-info-row">
									<span className="usermodal-label">Email</span>
									<span className="usermodal-value">{details.profile.email}</span>
								</div>
								<div className="usermodal-info-row">
									<span className="usermodal-label">SĐT</span>
									<span className="usermodal-value">
										{details.profile.phone || '---'}
									</span>
								</div>
								<div className="usermodal-info-row">
									<span className="usermodal-label">Ngày tạo</span>
									<span className="usermodal-value">
										{new Date(
											details.profile.acc_created_at,
										).toLocaleDateString('vi-VN')}
									</span>
								</div>
							</div>
							<div className="usermodal-detail-card">
								<h4>Tài chính & Xu</h4>
								<div className="usermodal-info-row">
									<span className="usermodal-label">Số dư hiện tại</span>
									<span className="usermodal-value usermodal-text-orange">
										{Number(details.profile.coinBalance).toLocaleString(
											'vi-VN',
										)}{' '}
										Xu
									</span>
								</div>
								<div className="usermodal-info-row">
									<span className="usermodal-label">Tổng tiền đã nạp</span>
									<span className="usermodal-value usermodal-text-green">
										{stats.totalDepositedVND.toLocaleString('vi-VN')} VNĐ
									</span>
								</div>
								<div className="usermodal-info-row">
									<span className="usermodal-label">Tổng tiền mua hàng</span>
									<span className="usermodal-value usermodal-text-blue">
										{stats.totalPurchasedVND.toLocaleString('vi-VN')} VNĐ
									</span>
								</div>
								<div
									className="usermodal-info-row"
									style={{
										borderTop: '1px solid #eee',
										marginTop: '8px',
										paddingTop: '8px',
									}}
								>
									<span className="usermodal-label">Tổng xu tích lũy</span>
									<span className="usermodal-value usermodal-text-blue">
										{stats.totalDepositedCoins.toLocaleString('vi-VN')} Xu
									</span>
								</div>
								<div className="usermodal-info-row">
									<span className="usermodal-label">Tổng xu đã tiêu</span>
									<span className="usermodal-value usermodal-text-orange">
										{stats.totalSpentCoins.toLocaleString('vi-VN')} Xu
									</span>
								</div>
							</div>
						</div>
					)}

					{activeTab === 'deposits' && (
						<div>
							<div className="usermodal-summary-box">
								<div className="usermodal-summary-item usermodal-bg-green">
									<span className="usermodal-summary-label">Tổng tiền nạp</span>
									<span className="usermodal-summary-value">
										{stats.totalDepositedVND.toLocaleString('vi-VN')} đ
									</span>
								</div>
								<div className="usermodal-summary-item usermodal-bg-blue">
									<span className="usermodal-summary-label">
										Tổng xu nhận (Tích lũy)
									</span>
									<span className="usermodal-summary-value">
										{stats.totalDepositedCoins.toLocaleString('vi-VN')} xu
									</span>
								</div>
							</div>
							<div className="usermodal-table-wrapper">
								<table className="usermodal-table">
									<thead>
										<tr>
											<th>Mã GD</th>
											<th>Nội dung</th>
											<th>Số tiền (VNĐ)</th>
											<th>Trạng Thái</th>
											<th className="text-right">Thời Gian</th>
										</tr>
									</thead>
									<tbody>
										{depositHistory.map((tx: any) => (
											<tr key={tx.id}>
												<td
													style={{
														fontFamily: 'monospace',
														fontSize: '0.9em',
														color: '#555',
													}}
												>
													{tx.transactionCode ||
														tx.orderId ||
														`#${tx.id}`}
												</td>
												<td>{tx.description || 'Nạp xu'}</td>
												<td className="font-bold usermodal-text-green">
													+{Number(tx.amount).toLocaleString('vi-VN')} đ
												</td>
												<td>
													<StatusBadge status={tx.status} />
												</td>
												<td className="text-right text-gray">
													{new Date(tx.createdAt).toLocaleString('vi-VN')}
												</td>
											</tr>
										))}
										{depositHistory.length === 0 && (
											<tr>
												<td colSpan={5} className="usermodal-empty">
													Chưa có giao dịch nạp tiền
												</td>
											</tr>
										)}
									</tbody>
								</table>
							</div>
						</div>
					)}

					{activeTab === 'purchases' && (
						<div>
							<div className="usermodal-summary-box">
								<div className="usermodal-summary-item usermodal-bg-indigo">
									<span className="usermodal-summary-label">
										Tổng chi tiêu mua sắm
									</span>
									<span className="usermodal-summary-value">
										{stats.totalPurchasedVND.toLocaleString('vi-VN')} đ
									</span>
								</div>
							</div>
							<div className="usermodal-table-wrapper">
								<table className="usermodal-table">
									<thead>
										<tr>
											<th>Mã GD</th>
											<th>Sản phẩm</th>
											<th>Thanh toán (VNĐ)</th>
											<th>Trạng Thái</th>
											<th className="text-right">Thời Gian</th>
										</tr>
									</thead>
									<tbody>
										{purchaseHistory.map((tx: any) => (
											<tr key={tx.id}>
												<td
													style={{
														fontFamily: 'monospace',
														fontSize: '0.9em',
														color: '#555',
													}}
												>
													{tx.transactionCode ||
														tx.orderId ||
														`#${tx.id}`}
												</td>
												<td style={{ fontWeight: 500 }}>
													{tx.purchasedItem ||
														tx.description ||
														'Đơn hàng'}
												</td>
												<td className="font-bold usermodal-text-orange">
													-{Number(tx.amount).toLocaleString('vi-VN')} đ
												</td>
												<td>
													<StatusBadge status={tx.status} />
												</td>
												<td className="text-right text-gray">
													{new Date(tx.createdAt).toLocaleString('vi-VN')}
												</td>
											</tr>
										))}
										{purchaseHistory.length === 0 && (
											<tr>
												<td colSpan={5} className="usermodal-empty">
													Chưa có đơn hàng nào
												</td>
											</tr>
										)}
									</tbody>
								</table>
							</div>
						</div>
					)}

					{activeTab === 'library' && (
						<div>
							<div className="usermodal-summary-box">
								<div className="usermodal-summary-item usermodal-bg-orange">
									<span className="usermodal-summary-label">Tổng xu đã tiêu</span>
									<span className="usermodal-summary-value">
										{stats.totalSpentCoins.toLocaleString('vi-VN')} xu
									</span>
								</div>
							</div>
							<div className="usermodal-table-wrapper">
								<table className="usermodal-table">
									<thead>
										<tr>
											<th>Truyện</th>
											<th>Chapter</th>
											<th>Tiêu đề</th>
											<th>Giá mở khóa</th>
											<th className="text-right">Ngày mua</th>
										</tr>
									</thead>
									<tbody>
										{details.library?.map((lib: any, idx: number) => (
											<tr key={idx}>
												<td style={{ fontWeight: 500 }}>
													{lib.comicTitle}
												</td>
												<td>
													<span className="usermgmt-tag usermgmt-tag--active">
														Chap {lib.chapterNumber}
													</span>
												</td>
												<td>{lib.title}</td>
												<td className="font-bold usermodal-text-orange">
													{lib.price} xu
												</td>
												<td className="text-right text-gray">
													{new Date(lib.unlockedAt).toLocaleDateString(
														'vi-VN',
													)}
												</td>
											</tr>
										))}
										{(!details.library || details.library.length === 0) && (
											<tr>
												<td colSpan={5} className="usermodal-empty">
													Chưa mua chapter nào
												</td>
											</tr>
										)}
									</tbody>
								</table>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

const UserManagement: React.FC = () => {
	const { showToast } = useToast();
	const token = localStorage.getItem('storyverse_token');

	const [users, setUsers] = useState<AdminManagedUser[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [searchTerm, setSearchTerm] = useState('');
	const [selectedUser, setSelectedUser] = useState<AdminManagedUser | null>(null);
	const [isModalOpen, setIsModalOpen] = useState(false);

	const [viewDetailUserId, setViewDetailUserId] = useState<string | null>(null);

	const [isBanModalOpen, setIsBanModalOpen] = useState(false);
	const [userToBan, setUserToBan] = useState<AdminManagedUser | null>(null);

	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [userToDelete, setUserToDelete] = useState<AdminManagedUser | null>(null);

	const fetchUsers = async () => {
		setIsLoading(true);
		setError(null);
		try {
			const response = await fetch(`${API_BASE_URL}/users`, {
				headers: { Authorization: `Bearer ${token}` },
			});
			if (!response.ok) throw new Error('Không thể tải danh sách người dùng');
			const data: AdminManagedUser[] = await response.json();
			setUsers(data);
		} catch (err: any) {
			setError(err.message);
			showToast(err.message, 'error');
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchUsers();
	}, []);

	const filteredUsers = useMemo(() => {
		return users.filter(
			(user) =>
				user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
				user.email.toLowerCase().includes(searchTerm.toLowerCase()),
		);
	}, [users, searchTerm]);

	const stats = useMemo(() => {
		const totalUsers = users.length;
		const bannedUsers = users.filter((u) => u.isBanned).length;
		return { totalUsers, bannedUsers };
	}, [users]);

	const handleEditClick = (user: AdminManagedUser) => {
		setSelectedUser(user);
		setIsModalOpen(true);
	};

	const handleViewDetailClick = (userId: string) => {
		setViewDetailUserId(userId);
	};

	const handleModalClose = () => {
		setIsModalOpen(false);
		setSelectedUser(null);
	};

	const handleModalSave = (updatedUser: AdminManagedUser) => {
		setUsers(users.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
		handleModalClose();
	};

	const handleToggleBanClick = (user: AdminManagedUser) => {
		setUserToBan(user);
		setIsBanModalOpen(true);
	};

	const handleConfirmBan = async () => {
		if (!userToBan) return;
		const action = userToBan.isBanned ? 'Bỏ cấm' : 'Cấm';

		try {
			const response = await fetch(`${API_BASE_URL}/users/${userToBan.id}/ban`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({ isBanned: !userToBan.isBanned }),
			});
			if (!response.ok) throw new Error(`Thất bại khi ${action} tài khoản`);

			showToast(`${action} tài khoản thành công!`, 'success');
			setUsers(
				users.map((u) => (u.id === userToBan.id ? { ...u, isBanned: !u.isBanned } : u)),
			);
		} catch (error: any) {
			showToast(error.message, 'error');
		} finally {
			setIsBanModalOpen(false);
			setUserToBan(null);
		}
	};

	const handleDeleteClick = (user: AdminManagedUser) => {
		setUserToDelete(user);
		setIsDeleteModalOpen(true);
	};

	const handleConfirmDelete = async () => {
		if (!userToDelete) return;

		try {
			const response = await fetch(`${API_BASE_URL}/users/${userToDelete.id}`, {
				method: 'DELETE',
				headers: { Authorization: `Bearer ${token}` },
			});
			if (!response.ok) throw new Error('Xóa tài khoản thất bại');

			showToast('Xóa tài khoản thành công!', 'success');
			setUsers(users.filter((u) => u.id !== userToDelete.id));

			if (viewDetailUserId === userToDelete.id) {
				setViewDetailUserId(null);
			}
		} catch (error: any) {
			showToast(error.message, 'error');
		} finally {
			setIsDeleteModalOpen(false);
			setUserToDelete(null);
		}
	};

	const handleExportCSV = () => {
		const headers = ['ID', 'Username', 'Email', 'Coins', 'Level', 'EXP', 'IsBanned'];
		const csvRows = [headers.join(',')];

		filteredUsers.forEach((user) => {
			const values = [
				user.id,
				`"${user.fullName}"`,
				user.email,
				user.coinBalance,
				user.level,
				user.exp,
				user.isBanned,
			];
			csvRows.push(values.join(','));
		});

		const csvString = csvRows.join('\n');
		const blob = new Blob([`\uFEFF${csvString}`], { type: 'text/csv;charset=utf-8;' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `storyverse_users_report_${new Date().toISOString().split('T')[0]}.csv`;
		a.click();
		URL.revokeObjectURL(url);
		showToast('Đã xuất báo cáo CSV!', 'success');
	};

	if (isLoading) return <p>Đang tải danh sách người dùng...</p>;
	if (error) return <p style={{ color: 'var(--clr-error-text)' }}>{error}</p>;

	return (
		<div className="usermgmt-container">
			<h2>Quản Lý Người Dùng</h2>
			<div className="usermgmt-stats">
				<div className="usermgmt-stat-card">
					<h4>Tổng số tài khoản</h4>
					<p>{stats.totalUsers}</p>
				</div>
				<div className="usermgmt-stat-card is-banned">
					<h4>Đã cấm</h4>
					<p>{stats.bannedUsers}</p>
				</div>
			</div>

			<div className="usermgmt-filter-bar">
				<div className="usermgmt-search-group">
					<FiSearch />
					<input
						type="text"
						placeholder="Tìm theo tên hoặc email..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
					/>
				</div>
				<button className="usermgmt-btn usermgmt-btn-export" onClick={handleExportCSV}>
					<FiDownload /> Xuất Danh Sách
				</button>
			</div>

			<div className="usermgmt-table-wrapper">
				<table className="usermgmt-table">
					<thead>
						<tr>
							<th>ID</th>
							<th>Người dùng</th>
							<th>Email</th>
							<th>Xu</th>
							<th>Level</th>
							<th>Trạng thái</th>
							<th>Hành động</th>
						</tr>
					</thead>
					<tbody>
						{filteredUsers.map((user) => (
							<tr
								key={user.id}
								className={user.isBanned ? 'usermgmt-row-banned' : ''}
							>
								<td title={user.id}>{user.id.substring(0, 8)}</td>
								<td>
									<span
										onClick={() => handleViewDetailClick(user.id)}
										className="usermgmt-link"
										title="Xem chi tiết"
									>
										{user.fullName}
									</span>
								</td>
								<td>{user.email}</td>
								<td>{user.coinBalance}</td>
								<td>{user.level}</td>
								<td>
									{user.isBanned ? (
										<span className="usermgmt-tag usermgmt-tag--banned">
											<FiSlash /> Bị cấm
										</span>
									) : (
										<span className="usermgmt-tag usermgmt-tag--active">
											<FiCheckCircle /> Hoạt động
										</span>
									)}
								</td>
								<td className="usermgmt-actions">
									<button
										className="usermgmt-btn-icon usermgmt-btn-view"
										onClick={() => handleViewDetailClick(user.id)}
										title="Xem chi tiết"
									>
										<FiEye />
									</button>
									<button
										className="usermgmt-btn-icon usermgmt-btn-edit"
										onClick={() => handleEditClick(user)}
										title="Sửa"
									>
										<FiEdit />
									</button>
									<button
										className={`usermgmt-btn-icon ${user.isBanned ? 'usermgmt-btn-unban' : 'usermgmt-btn-ban'}`}
										onClick={() => handleToggleBanClick(user)}
										title={user.isBanned ? 'Bỏ cấm' : 'Cấm'}
									>
										{user.isBanned ? <FiCheckCircle /> : <FiSlash />}
									</button>
									<button
										className="usermgmt-btn-icon usermgmt-btn-delete"
										onClick={() => handleDeleteClick(user)}
										title="Xóa"
									>
										<FiTrash2 />
									</button>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			{}
			{isModalOpen && selectedUser && (
				<UserEditModal
					user={selectedUser}
					onClose={handleModalClose}
					onSave={handleModalSave}
					token={token || ''}
				/>
			)}

			{}
			{viewDetailUserId && token && (
				<UserDetailModal
					userId={viewDetailUserId}
					onClose={() => setViewDetailUserId(null)}
					token={token}
				/>
			)}

			{}
			<ConfirmModal
				isOpen={isBanModalOpen}
				title={userToBan?.isBanned ? 'Xác nhận bỏ cấm' : 'Xác nhận cấm tài khoản'}
				message={`Bạn có chắc chắn muốn ${userToBan?.isBanned ? 'BỎ CẤM' : 'CẤM'} tài khoản "${userToBan?.fullName}"?`}
				confirmText={userToBan?.isBanned ? 'Bỏ cấm' : 'Cấm ngay'}
				cancelText="Hủy"
				onConfirm={handleConfirmBan}
				onClose={() => setIsBanModalOpen(false)}
				isDestructive={!userToBan?.isBanned}
			/>

			{}
			<ConfirmModal
				isOpen={isDeleteModalOpen}
				title="Xác nhận xóa tài khoản"
				message={`HÀNH ĐỘNG NGUY HIỂM! Bạn có chắc chắn muốn XÓA VĨNH VIỄN tài khoản "${userToDelete?.fullName}"? Mọi dữ liệu sẽ bị mất và không thể khôi phục.`}
				confirmText="Xóa vĩnh viễn"
				cancelText="Hủy"
				onConfirm={handleConfirmDelete}
				onClose={() => setIsDeleteModalOpen(false)}
				isDestructive={true}
			/>
		</div>
	);
};

export default UserManagement;
