import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
	FiArrowLeft,
	FiMapPin,
	FiPackage,
	FiCreditCard,
	FiCalendar,
	FiBox,
	FiClock,
	FiCheckCircle,
	FiXCircle,
	FiTruck,
	FiAlertCircle,
} from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import '../assets/styles/OrderDetailPage.css';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
const getImageUrl = (url: string) => {
	if (!url) return 'https://via.placeholder.com/150';
	if (url.startsWith('http')) return url;
	const baseUrl = API_URL.replace('/api', '');
	return `${baseUrl}/${url}`;
};

interface OrderItem {
	id: number;
	title: string;
	coverImageUrl: string;
	quantity: number;
	price: number;
}

interface OrderDetail {
	id: number;
	transactionCode: string;
	totalAmount: number;
	createdAt: string;
	address: string;
	fullName: string;
	phone: string;
	status: string;
	paymentMethod: string;
	items: OrderItem[];
}

const OrderDetailPage: React.FC = () => {
	const { orderId } = useParams<{ orderId: string }>();
	const { token } = useAuth();
	const navigate = useNavigate();
	const [order, setOrder] = useState<OrderDetail | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchOrderDetail = async () => {
			if (!token || !orderId) return;
			try {
				const res = await fetch(`${API_URL}/orders/${orderId}`, {
					headers: { Authorization: `Bearer ${token}` },
				});

				if (!res.ok) throw new Error('Không thể tải đơn hàng');
				const json = await res.json();
				setOrder(json.data || json);
			} catch (error) {
				console.error('Lỗi tải chi tiết:', error);
			} finally {
				setLoading(false);
			}
		};
		fetchOrderDetail();
	}, [orderId, token]);

	const formatPrice = (p: number) =>
		new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);
	const formatDate = (d: string) =>
		new Date(d).toLocaleDateString('vi-VN', {
			hour: '2-digit',
			minute: '2-digit',
			day: '2-digit',
			month: '2-digit',
			year: 'numeric',
		});

	const renderStatusBadge = (status: string) => {
		let badgeClass = 'status-badge ';
		let icon = <FiAlertCircle />;
		let text = status;
		let style = {};

		switch (status) {
			case 'PENDING':
				badgeClass += 'pending';
				icon = <FiClock />;
				text = 'Chờ thanh toán';
				style = { backgroundColor: '#fff7ed', color: '#c2410c' };
				break;
			case 'PAID':
			case 'PROCESSING':
				badgeClass += 'processing';
				icon = <FiBox />;
				text = 'Đang xử lý';
				style = { backgroundColor: '#eff6ff', color: '#1d4ed8' };
				break;
			case 'SHIPPING':
				badgeClass += 'shipping';
				icon = <FiTruck />;
				text = 'Đang giao hàng';
				style = { backgroundColor: '#f0fdf4', color: '#15803d' };
				break;
			case 'COMPLETED':
				badgeClass += 'completed';
				icon = <FiCheckCircle />;
				text = 'Hoàn thành';
				style = { backgroundColor: '#ecfdf5', color: '#047857' };
				break;
			case 'CANCELLED':
				badgeClass += 'cancelled';
				icon = <FiXCircle />;
				text = 'Đã hủy';
				style = { backgroundColor: '#fef2f2', color: '#b91c1c' };
				break;
			default:
				style = { backgroundColor: '#f3f4f6', color: '#374151' };
		}

		return (
			<span className={badgeClass} style={style}>
				{icon} {text}
			</span>
		);
	};

	if (loading) return <div className="loading-container">Đang tải chi tiết đơn hàng...</div>;
	if (!order)
		return (
			<div className="error-container">
				<h2 className="error-title">Không tìm thấy đơn hàng</h2>
				<Link to="/orders" className="btn-home">
					Quay lại danh sách
				</Link>
			</div>
		);

	const isPaid = order.status === 'PAID' || order.status === 'COMPLETED';

	return (
		<div className="order-detail-container">
			<button onClick={() => navigate('/orders')} className="btn-back">
				<FiArrowLeft /> Quay lại danh sách
			</button>

			<div className="order-detail-card">
				<div className="od-header">
					<div className="od-title">
						<h2>Chi Tiết Đơn Hàng</h2>
						<p className="od-id">
							Mã vận đơn:{' '}
							<span className="od-transaction-code">
								{order.transactionCode || `#${order.id}`}
							</span>
						</p>
					</div>
					<div className="od-status">
						{renderStatusBadge(order.status)}
						<p className="od-date">
							<FiCalendar /> {formatDate(order.createdAt)}
						</p>
					</div>
				</div>

				<div className="od-info-grid">
					<div className="info-section">
						<h4>
							<FiMapPin /> Địa Chỉ Nhận Hàng
						</h4>
						<div className="info-box">
							<div className="info-row">
								<span className="info-value" style={{ fontWeight: 700 }}>
									{order.fullName}
								</span>
							</div>
							<div className="info-row">
								<span className="info-value">{order.phone}</span>
							</div>
							<div className="info-row">
								<span
									className="info-value"
									style={{ color: 'var(--clr-text-secondary)' }}
								>
									{order.address}
								</span>
							</div>
						</div>
					</div>

					<div className="info-section">
						<h4>
							<FiCreditCard /> Thanh Toán
						</h4>
						<div className="info-box">
							<div className="info-row">
								<span className="info-label">Phương thức:</span>
								<span className="info-value">
									{order.paymentMethod === 'COD'
										? 'Thanh toán khi nhận hàng (COD)'
										: order.paymentMethod}
								</span>
							</div>
							<div className="info-row">
								<span className="info-label">Trạng thái:</span>
								<span className={`payment-status ${isPaid ? 'paid' : 'unpaid'}`}>
									{isPaid ? 'Đã thanh toán' : 'Chưa thanh toán'}
								</span>
							</div>
						</div>
					</div>
				</div>

				<div className="od-items-section">
					<h4>
						<FiPackage /> Sản Phẩm ({order.items ? order.items.length : 0})
					</h4>

					<div className="od-items-list">
						{order.items && order.items.length > 0 ? (
							order.items.map((item, index) => (
								<div key={index} className="od-item">
									<img
										src={getImageUrl(item.coverImageUrl)}
										alt={item.title}
										className="item-image"
										onError={(e) => {
											(e.target as HTMLImageElement).src =
												'https://via.placeholder.com/60x90?text=Error';
										}}
									/>
									<div className="item-details">
										<h5 className="item-title">{item.title}</h5>
										<p className="item-quantity">Số lượng: x{item.quantity}</p>
									</div>
									<div className="item-price">{formatPrice(item.price)}</div>
								</div>
							))
						) : (
							<div className="empty-items">Không có thông tin sản phẩm</div>
						)}
					</div>
				</div>

				<div className="od-footer">
					<div className="total-summary">
						<div className="summary-row">
							<span>Tạm tính:</span>
							<span>{formatPrice(order.totalAmount)}</span>
						</div>
						<div className="summary-row final">
							<span>Tổng tiền:</span>
							<span>{formatPrice(order.totalAmount)}</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default OrderDetailPage;
