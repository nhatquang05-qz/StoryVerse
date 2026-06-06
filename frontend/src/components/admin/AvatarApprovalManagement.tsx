import React, { useState, useEffect } from 'react';
import { FiCheck, FiX } from 'react-icons/fi';
import { useToast } from '../../contexts/ToastContext';
import ConfirmModal from '../popups/ConfirmModal';
import '../../assets/styles/AvatarApprovalManagement.css';
import defaultAvatarImg from '../../assets/images/defaultAvatar.webp';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

interface PendingAvatarUser {
	id: number;
	fullName: string;
	email: string;
	avatarUrl: string;
	pendingAvatarUrl: string;
}

const getAvatarSrc = (url: string | null | undefined) => {
	if (!url || url === 'defaultAvatar.webp') return defaultAvatarImg;
	return url;
};

const AvatarApprovalManagement: React.FC = () => {
	const [pendingUsers, setPendingUsers] = useState<PendingAvatarUser[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const { showToast } = useToast();
	const token = localStorage.getItem('storyverse_token');

	const [confirmModal, setConfirmModal] = useState<{
		isOpen: boolean;
		action: 'approve' | 'reject' | null;
		userId: number | null;
		userName: string;
	}>({
		isOpen: false,
		action: null,
		userId: null,
		userName: '',
	});

	useEffect(() => {
		fetchPendingAvatars();
	}, []);

	const fetchPendingAvatars = async () => {
		try {
			const res = await fetch(`${API_URL}/users/admin/avatars/pending`, {
				headers: { Authorization: `Bearer ${token}` },
			});
			if (res.ok) {
				const data = await res.json();
				setPendingUsers(data);
			}
		} catch (error) {
			console.error(error);
			showToast('Lỗi tải danh sách avatar', 'error');
		} finally {
			setIsLoading(false);
		}
	};

	const openConfirmModal = (action: 'approve' | 'reject', user: PendingAvatarUser) => {
		setConfirmModal({
			isOpen: true,
			action,
			userId: user.id,
			userName: user.fullName,
		});
	};

	const handleConfirmAction = async () => {
		const { action, userId } = confirmModal;
		if (!userId || !action) return;

		try {
			const endpoint =
				action === 'approve'
					? `${API_URL}/users/admin/avatars/${userId}/approve`
					: `${API_URL}/users/admin/avatars/${userId}/reject`;

			const res = await fetch(endpoint, {
				method: 'POST',
				headers: { Authorization: `Bearer ${token}` },
			});

			if (res.ok) {
				showToast(
					action === 'approve' ? 'Đã duyệt avatar thành công' : 'Đã từ chối avatar',
					action === 'approve' ? 'success' : 'info',
				);
				setPendingUsers((prev) => prev.filter((u) => u.id !== userId));
			} else {
				showToast('Có lỗi xảy ra khi xử lý yêu cầu', 'error');
			}
		} catch (error) {
			showToast('Lỗi kết nối server', 'error');
		} finally {
			setConfirmModal({ ...confirmModal, isOpen: false });
		}
	};

	if (isLoading)
		return (
			<div className="avatar-mgmt-loading">
				<span>Đang tải danh sách chờ duyệt...</span>
			</div>
		);

	return (
		<div className="avatar-mgmt-container">
			<h2 className="avatar-mgmt-title">Xét Duyệt Ảnh Đại Diện ({pendingUsers.length})</h2>

			{pendingUsers.length === 0 ? (
				<div className="avatar-mgmt-empty-state">
					<p>Hiện không có yêu cầu thay đổi ảnh đại diện nào.</p>
				</div>
			) : (
				<div className="avatar-mgmt-table-container">
					<table className="avatar-mgmt-table">
						<thead>
							<tr>
								<th>ID</th>
								<th>Người dùng</th>
								<th style={{ textAlign: 'center' }}>Ảnh Hiện Tại</th>
								<th style={{ textAlign: 'center' }}>Ảnh Mới (Chờ duyệt)</th>
								<th style={{ textAlign: 'center' }}>Hành Động</th>
							</tr>
						</thead>
						<tbody>
							{pendingUsers.map((user) => (
								<tr key={user.id}>
									<td>#{user.id}</td>
									<td>
										<div className="avatar-mgmt-user-info">
											<strong>{user.fullName}</strong>
											<span>{user.email}</span>
										</div>
									</td>
									<td>
										<div className="avatar-mgmt-cell">
											<img
												src={getAvatarSrc(user.avatarUrl)}
												alt="Current"
												className="avatar-mgmt-img"
											/>
											<div className="avatar-mgmt-label current">
												Hiện tại
											</div>
										</div>
									</td>
									<td>
										<div className="avatar-mgmt-cell">
											<img
												src={user.pendingAvatarUrl}
												alt="Pending"
												className="avatar-mgmt-img pending"
												onClick={() =>
													window.open(user.pendingAvatarUrl, '_blank')
												}
												title="Nhấn để xem ảnh gốc"
											/>
											<div className="avatar-mgmt-label new">Mới</div>
										</div>
									</td>
									<td>
										<div className="avatar-mgmt-actions">
											<button
												className="avatar-mgmt-btn avatar-mgmt-btn-approve"
												onClick={() => openConfirmModal('approve', user)}
												title="Chấp thuận ảnh này"
											>
												<FiCheck /> Duyệt
											</button>
											<button
												className="avatar-mgmt-btn avatar-mgmt-btn-reject"
												onClick={() => openConfirmModal('reject', user)}
												title="Từ chối ảnh này"
											>
												<FiX /> Từ chối
											</button>
										</div>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}

			<ConfirmModal
				isOpen={confirmModal.isOpen}
				title={
					confirmModal.action === 'approve'
						? 'Xác nhận duyệt ảnh'
						: 'Xác nhận từ chối ảnh'
				}
				message={
					confirmModal.action === 'approve'
						? `Bạn có chắc chắn muốn duyệt ảnh đại diện mới cho người dùng "${confirmModal.userName}"?`
						: `Bạn có chắc chắn muốn từ chối ảnh đại diện này của người dùng "${confirmModal.userName}"?`
				}
				confirmText={confirmModal.action === 'approve' ? 'Duyệt ngay' : 'Từ chối'}
				cancelText="Hủy bỏ"
				onConfirm={handleConfirmAction}
				onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
				isDestructive={false}
			/>
		</div>
	);
};

export default AvatarApprovalManagement;
