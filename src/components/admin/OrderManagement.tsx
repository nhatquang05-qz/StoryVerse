import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEye, FaTimes, FaCheckDouble, FaTruck } from 'react-icons/fa';
import { useToast } from '../../contexts/ToastContext';
import ConfirmModal from '../popups/ConfirmModal';
import '../../assets/styles/OrderManagement.css';

const API_BASE_URL = 'http://localhost:3000/api';

const OrderManagement: React.FC = () => {
	const [orders, setOrders] = useState<any[]>([]);
	const [, setLoading] = useState(false);
	const [page, setPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);

	const [selectedOrder, setSelectedOrder] = useState<any>(null);
	const [orderItems, setOrderItems] = useState<any[]>([]);
	const [showModal, setShowModal] = useState(false);

	const { showToast } = useToast();

	const [confirmModal, setConfirmModal] = useState<{
		isOpen: boolean;
		orderId: number | null;
		newStatus: string | null;
		title: string;
		message: string;
	}>({
		isOpen: false,
		orderId: null,
		newStatus: null,
		title: '',
		message: '',
	});

	const token = localStorage.getItem('storyverse_token');
	const config = { headers: { Authorization: `Bearer ${token}` } };

	useEffect(() => {
		fetchOrders();
	}, [page]);

	const fetchOrders = async () => {
		setLoading(true);
		try {
			const res = await axios.get(
				`${API_BASE_URL}/orders/admin/all?page=${page}&limit=10`,
				config,
			);
			setOrders(res.data.data);
			setTotalPages(res.data.pagination.totalPages);
		} catch (error) {
			console.error(error);
			showToast('Lỗi tải danh sách đơn hàng', 'error');
		} finally {
			setLoading(false);
		}
	};

	const handleStatusUpdateClick = (orderId: number, newStatus: string) => {
		let title = 'Xác nhận cập nhật';
		let message = `Bạn có chắc muốn chuyển đơn hàng #${orderId} sang trạng thái ${newStatus}?`;

		if (newStatus === 'COMPLETED') {
			title = 'Xác nhận Hoàn tất';
			message = `Xác nhận ĐÃ NHẬN TIỀN và HOÀN TẤT đơn hàng #${orderId}? Hành động này không thể hoàn tác.`;
		} else if (newStatus === 'CANCELLED') {
			title = 'Xác nhận Hủy đơn';
			message = `Bạn có chắc muốn HỦY đơn hàng #${orderId} không?`;
		} else if (newStatus === 'DELIVERED') {
			title = 'Xác nhận Hàng đã tới';
			message = `Xác nhận đơn hàng #${orderId} ĐÃ TỚI NƠI (Shipper đã giao)? Khách hàng sẽ thấy nút "Đã nhận hàng".`;
		}

		setConfirmModal({
			isOpen: true,
			orderId,
			newStatus,
			title,
			message,
		});
	};

	const handleConfirmUpdate = async () => {
		const { orderId, newStatus } = confirmModal;
		if (!orderId || !newStatus) return;

		try {
			await axios.put(
				`${API_BASE_URL}/orders/admin/${orderId}/status`,
				{ status: newStatus },
				config,
			);
			showToast('Cập nhật trạng thái thành công!', 'success');
			fetchOrders();

			if (selectedOrder && selectedOrder.id === orderId) {
				setShowModal(false);
			}
		} catch (error) {
			showToast('Lỗi cập nhật trạng thái', 'error');
		} finally {
			setConfirmModal({ ...confirmModal, isOpen: false });
		}
	};

	const viewDetails = async (order: any) => {
		setSelectedOrder(order);
		try {
			const res = await axios.get(`${API_BASE_URL}/orders/admin/${order.id}/items`, config);
			setOrderItems(res.data);
			setShowModal(true);
		} catch (error) {
			console.error(error);
			showToast('Lỗi tải chi tiết đơn hàng', 'error');
		}
	};

	const getStatusBadge = (status: string) => {
		switch (status) {
			case 'COMPLETED':
				return <span className="ordermgmt-badge ordermgmt-badge--success">Hoàn thành</span>;
			case 'PAID':
				return <span className="ordermgmt-badge ordermgmt-badge--info">Đã thanh toán</span>;
			case 'PENDING':
				return (
					<span className="ordermgmt-badge ordermgmt-badge--warning">Chờ thanh toán</span>
				);
			case 'SHIPPING':
				return (
					<span className="ordermgmt-badge ordermgmt-badge--info">Đang giao</span>
				);
			case 'DELIVERED':
				return (
					<span className="ordermgmt-badge" style={{backgroundColor: '#d9f7be', color: '#389e0d'}}>Đã tới nơi</span>
				);
			case 'CANCELLED':
				return <span className="ordermgmt-badge ordermgmt-badge--danger">Đã hủy</span>;
			default:
				return <span className="ordermgmt-badge ordermgmt-badge--secondary">{status}</span>;
		}
	};

	return (
		<div className="ordermgmt-container">
			<h2 className="ordermgmt-title">Quản lý Đơn hàng</h2>

			<div className="ordermgmt-table-wrapper">
				<table className="ordermgmt-table">
					<thead>
						<tr>
							<th>Mã giao dịch</th>
							<th>Khách hàng</th>
							<th>Tổng tiền</th>
							<th>Thanh toán</th>
							<th>Ngày đặt</th>
							<th>Trạng thái</th>
							<th>Hành động</th>
						</tr>
					</thead>
					<tbody>
						{orders.map((order) => (
							<tr key={order.id}>
								<td>
									<span
										className={
											order.transactionCode
												? 'ordermgmt-trans-code'
												: 'ordermgmt-trans-placeholder'
										}
									>
										{order.transactionCode || '---'}
									</span>
								</td>
								<td>
									<div className="ordermgmt-customer-info">
										<span className="ordermgmt-cust-name">
											{order.fullName}
										</span>
										<span className="ordermgmt-cust-phone">{order.phone}</span>
									</div>
								</td>
								<td className="ordermgmt-total-amount">
									{Number(order.totalAmount).toLocaleString()}đ
								</td>
								<td>
									<span
										className={`ordermgmt-pay-badge ${
											order.paymentMethod === 'COD'
												? 'ordermgmt-pay-badge--cod'
												: 'ordermgmt-pay-badge--online'
										}`}
									>
										{order.paymentMethod}
									</span>
								</td>
								<td>{new Date(order.createdAt).toLocaleDateString('vi-VN')}</td>
								<td>{getStatusBadge(order.status)}</td>
								<td>
									<div className="ordermgmt-action-buttons">
										<button
											onClick={() => viewDetails(order)}
											className="ordermgmt-btn-icon ordermgmt-btn-view"
											title="Xem chi tiết"
										>
											<FaEye />
										</button>

										{/* SHIPPING -> DELIVERED */}
										{order.status === 'SHIPPING' && (
											<button
												onClick={() =>
													handleStatusUpdateClick(order.id, 'DELIVERED')
												}
												className="ordermgmt-btn-icon"
												style={{color: '#1890ff'}}
												title="Xác nhận hàng đã tới nơi (Chờ khách nhận)"
											>
												<FaTruck />
											</button>
										)}

										{order.paymentMethod === 'COD' &&
											order.status !== 'COMPLETED' &&
											order.status !== 'CANCELLED' && (
												<button
													onClick={() =>
														handleStatusUpdateClick(
															order.id,
															'COMPLETED',
														)
													}
													className="ordermgmt-btn-icon ordermgmt-btn-complete"
													title="Xác nhận đã nhận tiền & Hoàn tất"
												>
													<FaCheckDouble />
												</button>
											)}

										{order.status !== 'CANCELLED' &&
											order.status !== 'COMPLETED' && 
											order.status !== 'DELIVERED' && (
												<button
													onClick={() =>
														handleStatusUpdateClick(
															order.id,
															'CANCELLED',
														)
													}
													className="ordermgmt-btn-icon ordermgmt-btn-cancel"
													title="Hủy đơn"
												>
													<FaTimes />
												</button>
											)}
									</div>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			<div className="ordermgmt-pagination">
				<button disabled={page <= 1} onClick={() => setPage(page - 1)}>
					Trước
				</button>
				<span>
					Trang {page} / {totalPages}
				</span>
				<button disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
					Sau
				</button>
			</div>

			{showModal && selectedOrder && (
				<div className="ordermgmt-modal-overlay">
					<div className="ordermgmt-modal-content">
						<div className="ordermgmt-modal-header">
							<h3>
								Chi tiết đơn:{' '}
								{selectedOrder.transactionCode || `#${selectedOrder.id}`}
							</h3>
							<button
								onClick={() => setShowModal(false)}
								className="ordermgmt-close-modal"
							>
								×
							</button>
						</div>
						<div className="ordermgmt-modal-body">
							<div className="ordermgmt-info-grid">
								<p>
									<strong>Mã giao dịch:</strong>{' '}
									{selectedOrder.transactionCode || 'Chưa có'}
								</p>
								<p>
									<strong>Người nhận:</strong> {selectedOrder.fullName}
								</p>
								<p>
									<strong>SĐT:</strong> {selectedOrder.phone}
								</p>
								<p>
									<strong>Địa chỉ:</strong> {selectedOrder.address}
								</p>
								<p>
									<strong>Email:</strong> {selectedOrder.email}
								</p>
								<p>
									<strong>Thanh toán:</strong> {selectedOrder.paymentMethod}
								</p>
								<p>
									<strong>Trạng thái:</strong> {selectedOrder.status}
								</p>
							</div>

							<h4 style={{ marginTop: '1rem', marginBottom: '0.5rem' }}>Sản phẩm</h4>
							<ul className="ordermgmt-item-list">
								{orderItems.map((item: any, idx) => (
									<li key={idx} className="ordermgmt-item-row">
										<img
											src={item.coverImageUrl}
											alt=""
											className="ordermgmt-item-thumb"
										/>
										<div className="ordermgmt-item-details">
											<span className="ordermgmt-item-title">
												{item.title}
											</span>
											<span className="ordermgmt-item-qty">
												Số lượng: {item.quantity}
											</span>
											<span className="ordermgmt-item-price">
												{Number(item.price).toLocaleString()}đ
											</span>
										</div>
									</li>
								))}
							</ul>
							<div className="ordermgmt-modal-total">
								Tổng cộng:{' '}
								<span>{Number(selectedOrder.totalAmount).toLocaleString()}đ</span>
							</div>
						</div>
						<div className="ordermgmt-modal-footer">
							<button
								onClick={() => setShowModal(false)}
								className="ordermgmt-btn-close"
							>
								Đóng
							</button>
						</div>
					</div>
				</div>
			)}

			<ConfirmModal
				isOpen={confirmModal.isOpen}
				title={confirmModal.title}
				message={confirmModal.message}
				confirmText="Xác nhận"
				cancelText="Quay lại"
				onConfirm={handleConfirmUpdate}
				onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
				isDestructive={confirmModal.newStatus === 'CANCELLED'}
			/>
		</div>
	);
};

export default OrderManagement;