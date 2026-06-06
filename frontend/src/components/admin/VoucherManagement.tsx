import React, { useState, useEffect } from 'react';
import {
	FiPlus,
	FiEdit,
	FiTrash2,
	FiCheck,
	FiX,
	FiGift,
	FiFolder,
	FiChevronDown,
	FiChevronRight,
} from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import ConfirmModal from '../popups/ConfirmModal';
import '../../assets/styles/PackManagement.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

const VoucherManagement: React.FC = () => {
	const { token } = useAuth();
	const { showToast } = useToast();

	const [vouchers, setVouchers] = useState<any[]>([]);
	const [isEditingVoucher, setIsEditingVoucher] = useState<any>(null);
	const [showEventVouchers, setShowEventVouchers] = useState(false);
	const [voucherFormData, setVoucherFormData] = useState({
		code: '',
		discountType: 'PERCENT',
		discountValue: 0,
		minOrderValue: 0,
		maxDiscountAmount: 0,
		startDate: '',
		endDate: '',
		usageLimit: 0,
		isActive: true,
	});
	const [isDeleteVoucherModalOpen, setIsDeleteVoucherModalOpen] = useState(false);
	const [voucherToDelete, setVoucherToDelete] = useState<any>(null);

	useEffect(() => {
		fetchVouchers();
	}, []);

	const fetchVouchers = async () => {
		try {
			const res = await fetch(`${API_BASE_URL}/vouchers/admin`, {
				headers: { Authorization: `Bearer ${token}` },
			});
			const data = await res.json();
			setVouchers(Array.isArray(data) ? data : []);
		} catch (error) {
			console.error(error);
			showToast('Lỗi tải danh sách voucher', 'error');
		}
	};

	const adminVouchers = vouchers.filter((v) => !v.code.startsWith('GIFT'));
	const minigameVouchers = vouchers.filter((v) => v.code.startsWith('GIFT'));

	const handleVoucherSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			const url = isEditingVoucher.id
				? `${API_BASE_URL}/vouchers/${isEditingVoucher.id}`
				: `${API_BASE_URL}/vouchers`;
			const method = isEditingVoucher.id ? 'PUT' : 'POST';

			const payload = {
				...voucherFormData,
				startDate: voucherFormData.startDate || null,
				endDate: voucherFormData.endDate || null,
			};

			const res = await fetch(url, {
				method,
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify(payload),
			});

			if (res.ok) {
				showToast(
					isEditingVoucher.id ? 'Cập nhật voucher thành công' : 'Thêm voucher thành công',
					'success',
				);
				setIsEditingVoucher(null);
				fetchVouchers();
			} else {
				const err = await res.json();
				showToast(err.message || 'Lỗi lưu voucher', 'error');
			}
		} catch (error) {
			showToast('Có lỗi xảy ra', 'error');
		}
	};

	const handleDeleteVoucherClick = (voucher: any) => {
		setVoucherToDelete(voucher);
		setIsDeleteVoucherModalOpen(true);
	};

	const handleConfirmDeleteVoucher = async () => {
		if (!voucherToDelete) return;
		try {
			const res = await fetch(`${API_BASE_URL}/vouchers/${voucherToDelete.id}`, {
				method: 'DELETE',
				headers: { Authorization: `Bearer ${token}` },
			});
			if (res.ok) {
				showToast('Đã xóa voucher', 'success');
				fetchVouchers();
			} else {
				showToast('Lỗi xóa voucher', 'error');
			}
		} catch (error) {
			showToast('Lỗi kết nối khi xóa', 'error');
		} finally {
			setIsDeleteVoucherModalOpen(false);
			setVoucherToDelete(null);
		}
	};

	const openEditVoucher = (voucher: any) => {
		setIsEditingVoucher(voucher);
		setVoucherFormData({
			code: voucher.code,
			discountType: voucher.discountType,
			discountValue: voucher.discountValue,
			minOrderValue: voucher.minOrderValue,
			maxDiscountAmount: voucher.maxDiscountAmount,
			startDate: voucher.startDate
				? new Date(voucher.startDate).toISOString().slice(0, 16)
				: '',
			endDate: voucher.endDate ? new Date(voucher.endDate).toISOString().slice(0, 16) : '',
			usageLimit: voucher.usageLimit,
			isActive: voucher.isActive === 1 || voucher.isActive === true,
		});
	};

	const openAddVoucher = () => {
		setIsEditingVoucher({});
		setVoucherFormData({
			code: '',
			discountType: 'PERCENT',
			discountValue: 0,
			minOrderValue: 0,
			maxDiscountAmount: 0,
			startDate: '',
			endDate: '',
			usageLimit: 100,
			isActive: true,
		});
	};

	const renderVoucherTable = (list: any[], isMinigame = false) => (
		<div className="packmgmt-table-container">
			<table className="packmgmt-table">
				<thead>
					<tr>
						<th>Code</th>
						<th>Loại</th>
						<th>Giá trị</th>
						<th>Điều kiện</th>
						<th>Hạn dùng</th>
						<th>Lượt dùng</th>
						<th>Trạng thái</th>
						<th>Hành động</th>
					</tr>
				</thead>
				<tbody>
					{list.length === 0 ? (
						<tr>
							<td colSpan={8} className="packmgmt-empty-message">
								Không có dữ liệu
							</td>
						</tr>
					) : (
						list.map((voucher) => (
							<tr key={voucher.id}>
								<td style={{ fontWeight: 'bold', color: '#3b82f6' }}>
									{voucher.code}
									{isMinigame && (
										<span className="packmgmt-badge-event">Event</span>
									)}
								</td>
								<td>
									{voucher.discountType === 'PERCENT' ? 'Phần trăm' : 'Cố định'}
								</td>
								<td style={{ color: '#eab308', fontWeight: 'bold' }}>
									{voucher.discountType === 'PERCENT'
										? `${voucher.discountValue}%`
										: `${Number(voucher.discountValue).toLocaleString('vi-VN')}đ`}
								</td>
								<td style={{ fontSize: '0.85rem' }}>
									Min: {Number(voucher.minOrderValue).toLocaleString('vi-VN')}đ
									{voucher.maxDiscountAmount > 0 && (
										<>
											<br />
											{`Max giảm: ${Number(voucher.maxDiscountAmount).toLocaleString('vi-VN')}đ`}
										</>
									)}
								</td>
								<td style={{ fontSize: '0.85rem' }}>
									{voucher.startDate
										? new Date(voucher.startDate).toLocaleDateString('vi-VN')
										: '...'}
									{' - '}
									{voucher.endDate
										? new Date(voucher.endDate).toLocaleDateString('vi-VN')
										: '∞'}
								</td>
								<td>
									{voucher.usedCount} / {voucher.usageLimit || '∞'}
								</td>
								<td>
									{voucher.isActive ? (
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
										onClick={() => openEditVoucher(voucher)}
									>
										<FiEdit />
									</button>
									<button
										className="packmgmt-btn packmgmt-btn-delete"
										onClick={() => handleDeleteVoucherClick(voucher)}
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
	);

	return (
		<div className="packmgmt-container">
			<div className="packmgmt-header">
				<h2>
					<FiGift className="icon-mr" style={{ marginRight: '10px' }} />
					Quản lý Mã Giảm Giá
				</h2>
			</div>

			<div className="tab-content">
				{!isEditingVoucher && (
					<div className="packmgmt-action-bar">
						<button
							className="packmgmt-btn packmgmt-btn-create"
							onClick={openAddVoucher}
						>
							<FiPlus /> Tạo Voucher Mới
						</button>
					</div>
				)}

				{isEditingVoucher ? (
					<div className="packmgmt-form-wrapper wide-form">
						<h3 className="packmgmt-form-title">
							{isEditingVoucher.id ? 'Sửa Voucher' : 'Tạo Voucher Mới'}
						</h3>
						<form
							onSubmit={handleVoucherSubmit}
							className="packmgmt-form packmgmt-voucher-grid"
						>
							<div className="packmgmt-form-group full-width">
								<label className="packmgmt-label">Mã Voucher:</label>
								<input
									type="text"
									className="packmgmt-input"
									value={voucherFormData.code}
									onChange={(e) =>
										setVoucherFormData({
											...voucherFormData,
											code: e.target.value.toUpperCase(),
										})
									}
									required
									placeholder="VD: SALE50, TET2025"
								/>
							</div>
							<div className="packmgmt-form-group">
								<label className="packmgmt-label">Loại giảm giá:</label>
								<select
									className="packmgmt-input"
									value={voucherFormData.discountType}
									onChange={(e) =>
										setVoucherFormData({
											...voucherFormData,
											discountType: e.target.value,
										})
									}
								>
									<option value="PERCENT">Theo phần trăm (%)</option>
									<option value="FIXED">Số tiền cố định</option>
								</select>
							</div>
							<div className="packmgmt-form-group">
								<label className="packmgmt-label">Giá trị giảm:</label>
								<input
									type="number"
									className="packmgmt-input"
									value={voucherFormData.discountValue}
									onChange={(e) =>
										setVoucherFormData({
											...voucherFormData,
											discountValue: Number(e.target.value),
										})
									}
									required
								/>
							</div>
							<div className="packmgmt-form-group">
								<label className="packmgmt-label">Đơn tối thiểu:</label>
								<input
									type="number"
									className="packmgmt-input"
									value={voucherFormData.minOrderValue}
									onChange={(e) =>
										setVoucherFormData({
											...voucherFormData,
											minOrderValue: Number(e.target.value),
										})
									}
								/>
							</div>
							<div className="packmgmt-form-group">
								<label className="packmgmt-label">Giảm tối đa (Nếu là %):</label>
								<input
									type="number"
									className="packmgmt-input"
									value={voucherFormData.maxDiscountAmount}
									onChange={(e) =>
										setVoucherFormData({
											...voucherFormData,
											maxDiscountAmount: Number(e.target.value),
										})
									}
									placeholder="0 = Không giới hạn"
								/>
							</div>
							<div className="packmgmt-form-group">
								<label className="packmgmt-label">Ngày bắt đầu:</label>
								<input
									type="datetime-local"
									className="packmgmt-input"
									value={voucherFormData.startDate}
									onChange={(e) =>
										setVoucherFormData({
											...voucherFormData,
											startDate: e.target.value,
										})
									}
								/>
							</div>
							<div className="packmgmt-form-group">
								<label className="packmgmt-label">Ngày kết thúc:</label>
								<input
									type="datetime-local"
									className="packmgmt-input"
									value={voucherFormData.endDate}
									onChange={(e) =>
										setVoucherFormData({
											...voucherFormData,
											endDate: e.target.value,
										})
									}
								/>
							</div>
							<div className="packmgmt-form-group">
								<label className="packmgmt-label">Giới hạn sử dụng (Tổng):</label>
								<input
									type="number"
									className="packmgmt-input"
									value={voucherFormData.usageLimit}
									onChange={(e) =>
										setVoucherFormData({
											...voucherFormData,
											usageLimit: Number(e.target.value),
										})
									}
								/>
							</div>

							<div className="packmgmt-form-group full-width">
								<label className="packmgmt-checkbox-group">
									<input
										type="checkbox"
										className="packmgmt-checkbox-input"
										checked={voucherFormData.isActive}
										onChange={(e) =>
											setVoucherFormData({
												...voucherFormData,
												isActive: e.target.checked,
											})
										}
									/>
									<span className="packmgmt-label">Kích hoạt voucher này</span>
								</label>
							</div>

							<div className="packmgmt-form-actions full-width">
								<button type="submit" className="packmgmt-btn packmgmt-btn-save">
									Lưu Voucher
								</button>
								<button
									type="button"
									className="packmgmt-btn packmgmt-btn-cancel"
									onClick={() => setIsEditingVoucher(null)}
								>
									Hủy
								</button>
							</div>
						</form>
					</div>
				) : (
					<>
						{renderVoucherTable(adminVouchers)}

						<div className="packmgmt-folder-container">
							<div
								className="packmgmt-folder-header"
								onClick={() => setShowEventVouchers(!showEventVouchers)}
							>
								<div className="packmgmt-folder-left">
									<FiFolder
										size={20}
										color="#f59e0b"
										style={{ fill: '#fcd34d' }}
									/>
									<span className="packmgmt-folder-title">
										ChristmasEvent2025 Vouchers
									</span>
									<span className="packmgmt-folder-count">
										{minigameVouchers.length} mã
									</span>
								</div>
								{showEventVouchers ? (
									<FiChevronDown size={20} color="#64748b" />
								) : (
									<FiChevronRight size={20} color="#64748b" />
								)}
							</div>

							{showEventVouchers && (
								<div className="packmgmt-folder-body">
									{renderVoucherTable(minigameVouchers, true)}
								</div>
							)}
						</div>
					</>
				)}
			</div>

			<ConfirmModal
				isOpen={isDeleteVoucherModalOpen}
				title="Xác nhận xóa Voucher"
				message={`Bạn có chắc chắn muốn xóa voucher "${voucherToDelete?.code}"? Hành động này không thể hoàn tác.`}
				confirmText="Xóa Voucher"
				cancelText="Hủy"
				onConfirm={handleConfirmDeleteVoucher}
				onClose={() => setIsDeleteVoucherModalOpen(false)}
				isDestructive={true}
			/>
		</div>
	);
};

export default VoucherManagement;
