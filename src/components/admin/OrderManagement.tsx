import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEye, FaTimes, FaCheckDouble } from 'react-icons/fa';
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
		} finally {
			setLoading(false);
		}
	};

	const handleStatusUpdate = async (orderId: number, newStatus: string) => {
		let confirmMsg = `Bạn có chắc muốn chuyển đơn hàng #${orderId} sang trạng thái ${newStatus}?`;

		if (newStatus === 'COMPLETED') {
			confirmMsg = `Xác nhận ĐÃ NHẬN TIỀN và HOÀN TẤT đơn hàng #${orderId}?`;
		}

		if (!confirm(confirmMsg)) return;

		try {
			await axios.put(
				`${API_BASE_URL}/orders/admin/${orderId}/status`,
				{ status: newStatus },
				config,
			);
			alert('Cập nhật thành công!');
			fetchOrders();
		} catch (error) {
			alert('Lỗi cập nhật trạng thái');
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
		}
	};

	const getStatusBadge = (status: string) => {
		switch (status) {
			case 'COMPLETED':
				return <span className="badge badge-success">Hoàn thành</span>;
			case 'PAID':
				return <span className="badge badge-info">Đã thanh toán</span>;
			case 'PENDING':
				return <span className="badge badge-warning">Chờ thanh toán</span>;
			case 'CANCELLED':
				return <span className="badge badge-danger">Đã hủy</span>;
			default:
				return <span className="badge badge-secondary">{status}</span>;
		}
	};

	return (
		<div className="order-mgmt-container">
			<h2 className="mgmt-title">Quản lý Đơn hàng</h2>

			<div className="order-table-wrapper">
				<table className="order-table">
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
												? 'trans-code'
												: 'trans-code-placeholder'
										}
									>
										{order.transactionCode || '---'}
									</span>
								</td>
								<td>
									<div className="customer-info">
										<span className="cust-name">{order.fullName}</span>
										<span className="cust-phone">{order.phone}</span>
									</div>
								</td>
								<td className="total-amount">
									{Number(order.totalAmount).toLocaleString()}đ
								</td>
								<td>
									<span
										className={`pay-badge ${order.paymentMethod === 'COD' ? 'pay-badge-cod' : 'pay-badge-online'}`}
									>
										{order.paymentMethod}
									</span>
								</td>
								<td>{new Date(order.createdAt).toLocaleDateString('vi-VN')}</td>
								<td>{getStatusBadge(order.status)}</td>
								<td>
									<div className="action-buttons">
										<button
											onClick={() => viewDetails(order)}
											className="btn-icon btn-view"
											title="Xem chi tiết"
										>
											<FaEye />
										</button>

										{order.paymentMethod === 'COD' &&
											order.status !== 'COMPLETED' &&
											order.status !== 'CANCELLED' && (
												<button
													onClick={() =>
														handleStatusUpdate(order.id, 'COMPLETED')
													}
													className="btn-icon btn-complete"
													title="Xác nhận đã nhận tiền & Hoàn tất"
												>
													<FaCheckDouble />
												</button>
											)}

										{order.status !== 'CANCELLED' &&
											order.status !== 'COMPLETED' && (
												<button
													onClick={() =>
														handleStatusUpdate(order.id, 'CANCELLED')
													}
													className="btn-icon o-btn-cancel"
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

			<div className="pagination-controls">
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
				<div className="modal-overlay">
					<div className="modal-content">
						<div className="modal-header">
							<h3>
								Chi tiết đơn:{' '}
								{selectedOrder.transactionCode || `#${selectedOrder.id}`}
							</h3>
							<button onClick={() => setShowModal(false)} className="close-modal">
								×
							</button>
						</div>
						<div className="modal-body">
							<div className="order-info-grid">
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

							<h4 className="mt-4 mb-2">Sản phẩm</h4>
							<ul className="item-list">
								{orderItems.map((item: any, idx) => (
									<li key={idx} className="order-item-row">
										<img
											src={item.coverImageUrl}
											alt=""
											className="item-thumb"
										/>
										<div className="item-details">
											<span className="item-title">{item.title}</span>
											<span className="item-qty">
												Số lượng: {item.quantity}
											</span>
											<span className="item-price">
												{Number(item.price).toLocaleString()}đ
											</span>
										</div>
									</li>
								))}
							</ul>
							<div className="modal-total">
								Tổng cộng:{' '}
								<span>{Number(selectedOrder.totalAmount).toLocaleString()}đ</span>
							</div>
						</div>
						<div className="modal-footer">
							{selectedOrder.paymentMethod === 'COD' &&
								selectedOrder.status !== 'COMPLETED' &&
								selectedOrder.status !== 'CANCELLED' && (
									<button
										onClick={() => {
											handleStatusUpdate(selectedOrder.id, 'COMPLETED');
											setShowModal(false);
										}}
										className="btn-modal-action"
									>
										Xác nhận Hoàn tất
									</button>
								)}
							<button onClick={() => setShowModal(false)} className="btn-close">
								Đóng
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default OrderManagement;
