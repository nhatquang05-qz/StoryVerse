import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit, FiTrash2, FiCheck, FiX, FiPackage } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import ConfirmModal from '../popups/ConfirmModal';
import '../../assets/styles/PackManagement.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

const PackManagement: React.FC = () => {
	const { token } = useAuth();
	const { showToast } = useToast();

	const [packs, setPacks] = useState<any[]>([]);
	const [isEditing, setIsEditing] = useState<any>(null);
	const [packFormData, setPackFormData] = useState({
		coins: 0,
		price: 0,
		bonus: 0,
		isActive: true,
	});
	const [isDeletePackModalOpen, setIsDeletePackModalOpen] = useState(false);
	const [packToDelete, setPackToDelete] = useState<any>(null);

	useEffect(() => {
		fetchPacks();
	}, []);

	const fetchPacks = async () => {
		try {
			const res = await fetch(`${API_BASE_URL}/packs/admin`, {
				headers: { Authorization: `Bearer ${token}` },
			});
			const data = await res.json();
			setPacks(Array.isArray(data) ? data : []);
		} catch (error) {
			console.error(error);
			showToast('Lỗi tải danh sách gói nạp', 'error');
		}
	};

	const handlePackSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			const url = isEditing.id
				? `${API_BASE_URL}/packs/${isEditing.id}`
				: `${API_BASE_URL}/packs`;
			const method = isEditing.id ? 'PUT' : 'POST';

			const res = await fetch(url, {
				method,
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify(packFormData),
			});

			if (res.ok) {
				showToast(isEditing.id ? 'Cập nhật thành công' : 'Thêm mới thành công', 'success');
				setIsEditing(null);
				fetchPacks();
			} else {
				showToast('Lỗi khi lưu gói nạp', 'error');
			}
		} catch (error) {
			showToast('Có lỗi xảy ra', 'error');
		}
	};

	const handleDeletePackClick = (pack: any) => {
		setPackToDelete(pack);
		setIsDeletePackModalOpen(true);
	};

	const handleConfirmDeletePack = async () => {
		if (!packToDelete) return;
		try {
			const res = await fetch(`${API_BASE_URL}/packs/${packToDelete.id}`, {
				method: 'DELETE',
				headers: { Authorization: `Bearer ${token}` },
			});
			if (res.ok) {
				showToast('Đã xóa gói nạp', 'success');
				fetchPacks();
			} else {
				showToast('Lỗi xóa gói nạp', 'error');
			}
		} catch (error) {
			showToast('Lỗi kết nối khi xóa', 'error');
		} finally {
			setIsDeletePackModalOpen(false);
			setPackToDelete(null);
		}
	};

	const openEditPack = (pack: any) => {
		setIsEditing(pack);
		setPackFormData({
			coins: pack.coins,
			price: pack.price,
			bonus: pack.bonus,
			isActive: pack.isActive === 1 || pack.isActive === true,
		});
	};

	const openAddPack = () => {
		setIsEditing({});
		setPackFormData({ coins: 0, price: 0, bonus: 0, isActive: true });
	};

	return (
		<div className="packmgmt-container">
			<div className="packmgmt-header">
				<h2>
					<FiPackage className="icon-mr" style={{ marginRight: '10px' }} />
					Quản lý Gói Nạp Xu
				</h2>
			</div>

			<div className="tab-content">
				{!isEditing && (
					<div className="packmgmt-action-bar">
						<button className="packmgmt-btn packmgmt-btn-create" onClick={openAddPack}>
							<FiPlus /> Thêm Gói Mới
						</button>
					</div>
				)}

				{isEditing ? (
					<div className="packmgmt-form-wrapper">
						<h3 className="packmgmt-form-title">
							{isEditing.id ? 'Sửa Gói Nạp' : 'Thêm Gói Nạp'}
						</h3>
						<form onSubmit={handlePackSubmit} className="packmgmt-form">
							<div className="packmgmt-form-group">
								<label className="packmgmt-label">Số Xu nhận được:</label>
								<input
									type="number"
									className="packmgmt-input"
									value={packFormData.coins}
									onChange={(e) =>
										setPackFormData({
											...packFormData,
											coins: Number(e.target.value),
										})
									}
									required
									placeholder="VD: 1000"
								/>
							</div>
							<div className="packmgmt-form-group">
								<label className="packmgmt-label">Giá tiền (VNĐ):</label>
								<input
									type="number"
									className="packmgmt-input"
									value={packFormData.price}
									onChange={(e) =>
										setPackFormData({
											...packFormData,
											price: Number(e.target.value),
										})
									}
									required
									placeholder="VD: 20000"
								/>
							</div>
							<div className="packmgmt-form-group">
								<label className="packmgmt-label">Xu thưởng thêm (Bonus):</label>
								<input
									type="number"
									className="packmgmt-input"
									value={packFormData.bonus}
									onChange={(e) =>
										setPackFormData({
											...packFormData,
											bonus: Number(e.target.value),
										})
									}
									placeholder="VD: 100"
								/>
							</div>
							<label className="packmgmt-checkbox-group">
								<input
									type="checkbox"
									className="packmgmt-checkbox-input"
									checked={packFormData.isActive}
									onChange={(e) =>
										setPackFormData({
											...packFormData,
											isActive: e.target.checked,
										})
									}
								/>
								<span className="packmgmt-label">Đang hoạt động</span>
							</label>
							<div className="packmgmt-form-actions">
								<button type="submit" className="packmgmt-btn packmgmt-btn-save">
									Lưu
								</button>
								<button
									type="button"
									className="packmgmt-btn packmgmt-btn-cancel"
									onClick={() => setIsEditing(null)}
								>
									Hủy
								</button>
							</div>
						</form>
					</div>
				) : (
					<div className="packmgmt-table-container">
						<table className="packmgmt-table">
							<thead>
								<tr>
									<th>ID</th>
									<th>Số Xu</th>
									<th>Giá (VNĐ)</th>
									<th>Bonus</th>
									<th>Tổng nhận</th>
									<th>Trạng thái</th>
									<th>Hành động</th>
								</tr>
							</thead>
							<tbody>
								{packs.map((pack) => (
									<tr key={pack.id}>
										<td>{pack.id}</td>
										<td style={{ color: '#eab308', fontWeight: 'bold' }}>
											{pack.coins}
										</td>
										<td>{Number(pack.price).toLocaleString('vi-VN')} đ</td>
										<td style={{ color: '#10b981' }}>+{pack.bonus}</td>
										<td style={{ fontWeight: 'bold' }}>
											{pack.coins + pack.bonus} Xu
										</td>
										<td>
											{pack.isActive ? (
												<span className="packmgmt-status active">
													<FiCheck /> Hiện
												</span>
											) : (
												<span className="packmgmt-status inactive">
													<FiX /> Ẩn
												</span>
											)}
										</td>
										<td className="packmgmt-actions-cell">
											<button
												className="packmgmt-btn packmgmt-btn-edit"
												onClick={() => openEditPack(pack)}
											>
												<FiEdit />
											</button>
											<button
												className="packmgmt-btn packmgmt-btn-delete"
												onClick={() => handleDeletePackClick(pack)}
											>
												<FiTrash2 />
											</button>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</div>

			<ConfirmModal
				isOpen={isDeletePackModalOpen}
				title="Xác nhận xóa gói nạp"
				message={`Bạn có chắc chắn muốn xóa gói nạp "${packToDelete?.coins} Xu" này không?`}
				confirmText="Xóa gói"
				cancelText="Hủy"
				onConfirm={handleConfirmDeletePack}
				onClose={() => setIsDeletePackModalOpen(false)}
				isDestructive={true}
			/>
		</div>
	);
};

export default PackManagement;
