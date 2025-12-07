import React, { useState, useEffect } from 'react';
import { FiEdit, FiTrash2, FiPlus, FiCopy, FiCheck, FiX } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import ConfirmModal from '../popups/ConfirmModal';
import '../../assets/styles/GiftCodeManagement.css';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

interface GiftCode {
	id: number;
	code: string;
	coinReward: number;
	expReward: number;
	voucherId: number | null;
	usageLimit: number;
	usedCount: number;
	expiryDate: string;
	isActive: number;
}

const GiftCodeManagement: React.FC = () => {
	const [giftCodes, setGiftCodes] = useState<GiftCode[]>([]);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editingCode, setEditingCode] = useState<GiftCode | null>(null);
	const { token } = useAuth();
	const { showToast } = useToast();

	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [codeToDelete, setCodeToDelete] = useState<GiftCode | null>(null);

	const [formData, setFormData] = useState({
		code: '',
		coinReward: 0,
		expReward: 0,
		voucherId: '',
		usageLimit: 100,
		expiryDate: '',
		isActive: 1,
	});

	useEffect(() => {
		fetchGiftCodes();
	}, []);

	const fetchGiftCodes = async () => {
		try {
			const res = await fetch(`${API_URL}/giftcode`, {
				headers: { Authorization: `Bearer ${token}` },
			});
			const data = await res.json();
			if (Array.isArray(data)) setGiftCodes(data);
		} catch (err) {
			console.error(err);
			showToast('Lỗi tải danh sách giftcode', 'error');
		}
	};

	const handleDeleteClick = (code: GiftCode) => {
		setCodeToDelete(code);
		setIsDeleteModalOpen(true);
	};

	const handleConfirmDelete = async () => {
		if (!codeToDelete) return;
		try {
			const res = await fetch(`${API_URL}/giftcode/${codeToDelete.id}`, {
				method: 'DELETE',
				headers: { Authorization: `Bearer ${token}` },
			});

			if (res.ok) {
				showToast('Đã xóa giftcode', 'success');
				fetchGiftCodes();
			} else {
				showToast('Lỗi khi xóa', 'error');
			}
		} catch (err) {
			showToast('Lỗi khi xóa', 'error');
		} finally {
			setIsDeleteModalOpen(false);
			setCodeToDelete(null);
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		const url = editingCode ? `${API_URL}/giftcode/${editingCode.id}` : `${API_URL}/giftcode`;
		const method = editingCode ? 'PUT' : 'POST';

		const payload = {
			...formData,
			voucherId: formData.voucherId ? parseInt(formData.voucherId) : null,
		};

		try {
			const res = await fetch(url, {
				method,
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify(payload),
			});
			if (res.ok) {
				showToast(editingCode ? 'Cập nhật thành công' : 'Tạo mã thành công', 'success');
				setIsModalOpen(false);
				setEditingCode(null);
				resetForm();
				fetchGiftCodes();
			} else {
				showToast('Có lỗi xảy ra (Có thể trùng mã)', 'error');
			}
		} catch (err) {
			console.error(err);
			showToast('Lỗi kết nối server', 'error');
		}
	};

	const openEdit = (code: GiftCode) => {
		setEditingCode(code);
		setFormData({
			code: code.code,
			coinReward: code.coinReward,
			expReward: code.expReward,
			voucherId: code.voucherId ? code.voucherId.toString() : '',
			usageLimit: code.usageLimit,
			expiryDate: code.expiryDate ? new Date(code.expiryDate).toISOString().slice(0, 16) : '',
			isActive: code.isActive,
		});
		setIsModalOpen(true);
	};

	const resetForm = () => {
		setFormData({
			code: '',
			coinReward: 0,
			expReward: 0,
			voucherId: '',
			usageLimit: 100,
			expiryDate: '',
			isActive: 1,
		});
	};

	const generateRandomCode = () => {
		const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
		let result = '';
		for (let i = 0; i < 8; i++) {
			result += chars.charAt(Math.floor(Math.random() * chars.length));
		}
		setFormData({ ...formData, code: 'SV-' + result });
	};

	return (
		<div className="giftmgmt-container">
			<div className="giftmgmt-action-bar">
				<button
					className="giftmgmt-btn giftmgmt-btn-create"
					onClick={() => {
						setEditingCode(null);
						resetForm();
						setIsModalOpen(true);
					}}
				>
					<FiPlus /> Thêm Giftcode Mới
				</button>
			</div>

			<div className="giftmgmt-table-container">
				<table className="giftmgmt-table">
					<thead>
						<tr>
							<th>Mã Code</th>
							<th>Thưởng</th>
							<th>Voucher ID</th>
							<th>Lượt dùng</th>
							<th>Hết hạn</th>
							<th>Trạng thái</th>
							<th>Hành động</th>
						</tr>
					</thead>
					<tbody>
						{giftCodes.length === 0 ? (
							<tr>
								<td colSpan={7} className="giftmgmt-empty-message">
									Chưa có giftcode nào
								</td>
							</tr>
						) : (
							giftCodes.map((gc) => (
								<tr key={gc.id}>
									<td className="giftmgmt-code-cell">{gc.code}</td>
									<td>
										{gc.coinReward > 0 && (
											<div className="giftmgmt-reward-coin">
												+{gc.coinReward} Xu
											</div>
										)}
										{gc.expReward > 0 && (
											<div className="giftmgmt-reward-exp">
												+{gc.expReward} EXP
											</div>
										)}
										{gc.coinReward === 0 && gc.expReward === 0 && (
											<span style={{ color: '#999' }}>-</span>
										)}
									</td>
									<td>{gc.voucherId || '-'}</td>
									<td>
										{gc.usedCount} / {gc.usageLimit}
									</td>
									<td style={{ fontSize: '0.9rem' }}>
										{gc.expiryDate
											? new Date(gc.expiryDate).toLocaleDateString('vi-VN')
											: 'Vĩnh viễn'}
									</td>
									<td>
										{gc.isActive ? (
											<span className="giftmgmt-status active">
												<FiCheck /> Hoạt động
											</span>
										) : (
											<span className="giftmgmt-status banned">
												<FiX /> Khóa
											</span>
										)}
									</td>
									<td className="giftmgmt-actions-cell">
										<button
											className="giftmgmt-btn giftmgmt-btn-edit"
											onClick={() => openEdit(gc)}
										>
											<FiEdit />
										</button>
										<button
											className="giftmgmt-btn giftmgmt-btn-delete"
											onClick={() => handleDeleteClick(gc)}
										>
											<FiTrash2 />
										</button>
									</td>
								</tr>
							))
						)}
					</tbody>
				</table>
			</div>

			{isModalOpen && (
				<div className="giftmgmt-modal-overlay">
					<div className="giftmgmt-form-wrapper">
						<h3 className="giftmgmt-form-title">
							{editingCode ? 'Sửa Giftcode' : 'Thêm Giftcode'}
						</h3>
						<form onSubmit={handleSubmit} className="giftmgmt-form">
							<div className="giftmgmt-form-group">
								<label className="giftmgmt-label">Mã Code:</label>
								<div style={{ display: 'flex', gap: '10px' }}>
									<input
										type="text"
										className="giftmgmt-input"
										placeholder="VD: TET2025"
										value={formData.code}
										onChange={(e) =>
											setFormData({
												...formData,
												code: e.target.value.toUpperCase(),
											})
										}
										required
										style={{ flex: 1 }}
									/>
									<button
										type="button"
										onClick={generateRandomCode}
										className="giftmgmt-btn-random"
										title="Tạo mã ngẫu nhiên"
									>
										<FiCopy /> Random
									</button>
								</div>
							</div>

							<div className="giftmgmt-form-row">
								<div className="giftmgmt-form-group" style={{ flex: 1 }}>
									<label className="giftmgmt-label">Thưởng Xu:</label>
									<input
										type="number"
										className="giftmgmt-input"
										value={formData.coinReward}
										onChange={(e) =>
											setFormData({
												...formData,
												coinReward: parseInt(e.target.value),
											})
										}
									/>
								</div>
								<div className="giftmgmt-form-group" style={{ flex: 1 }}>
									<label className="giftmgmt-label">Thưởng EXP:</label>
									<input
										type="number"
										className="giftmgmt-input"
										value={formData.expReward}
										onChange={(e) =>
											setFormData({
												...formData,
												expReward: parseInt(e.target.value),
											})
										}
									/>
								</div>
							</div>

							<div className="giftmgmt-form-group">
								<label className="giftmgmt-label">Voucher ID (Tùy chọn):</label>
								<input
									type="number"
									className="giftmgmt-input"
									placeholder="Nhập ID Voucher nếu có"
									value={formData.voucherId}
									onChange={(e) =>
										setFormData({ ...formData, voucherId: e.target.value })
									}
								/>
								<small style={{ color: '#718096', fontSize: '0.85rem' }}>
									* Mỗi user chỉ nhận voucher này 1 lần duy nhất.
								</small>
							</div>

							<div className="giftmgmt-form-row">
								<div className="giftmgmt-form-group" style={{ flex: 1 }}>
									<label className="giftmgmt-label">Giới hạn lượt dùng:</label>
									<input
										type="number"
										className="giftmgmt-input"
										value={formData.usageLimit}
										onChange={(e) =>
											setFormData({
												...formData,
												usageLimit: parseInt(e.target.value),
											})
										}
									/>
								</div>
								<div className="giftmgmt-form-group" style={{ flex: 1 }}>
									<label className="giftmgmt-label">Ngày hết hạn:</label>
									<input
										type="datetime-local"
										className="giftmgmt-input"
										value={formData.expiryDate}
										onChange={(e) =>
											setFormData({ ...formData, expiryDate: e.target.value })
										}
									/>
								</div>
							</div>

							<div className="giftmgmt-form-group">
								<label className="giftmgmt-checkbox-group">
									<input
										type="checkbox"
										className="giftmgmt-checkbox"
										checked={formData.isActive === 1}
										onChange={(e) =>
											setFormData({
												...formData,
												isActive: e.target.checked ? 1 : 0,
											})
										}
									/>
									<span className="giftmgmt-label">Đang hoạt động</span>
								</label>
							</div>

							<div className="giftmgmt-form-actions">
								<button type="submit" className="giftmgmt-btn giftmgmt-btn-save">
									Lưu
								</button>
								<button
									type="button"
									onClick={() => setIsModalOpen(false)}
									className="giftmgmt-btn giftmgmt-btn-cancel"
								>
									Hủy
								</button>
							</div>
						</form>
					</div>
				</div>
			)}

			<ConfirmModal
				isOpen={isDeleteModalOpen}
				title="Xác nhận xóa Giftcode"
				message={`Bạn có chắc chắn muốn xóa mã "${codeToDelete?.code}"? Người dùng sẽ không thể sử dụng mã này nữa.`}
				confirmText="Xóa vĩnh viễn"
				cancelText="Hủy"
				onConfirm={handleConfirmDelete}
				onClose={() => setIsDeleteModalOpen(false)}
				isDestructive={true}
			/>
		</div>
	);
};

export default GiftCodeManagement;
