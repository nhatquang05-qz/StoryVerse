import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
	FiBox,
	FiCalendar,
	FiClock,
	FiCheckCircle,
	FiXCircle,
	FiTruck,
	FiAlertCircle,
} from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import '../assets/styles/OrdersPage.css';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
const SERVER_URL = API_URL.replace('/api', '');

interface OrderItem {
	id: number;
	title: string;
	coverImageUrl: string;
	quantity: number;
	price: number;
}

interface Order {
	id: number;
	transactionCode?: string;
	createdAt: string;
	totalAmount: number;
	status: string;
	items: OrderItem[];
}

const OrdersPage: React.FC = () => {
	const { token } = useAuth();
	const [orders, setOrders] = useState<Order[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchOrders = async () => {
			if (!token) return;
			try {
				const response = await fetch(`${API_URL}/orders/my-orders`, {
					headers: { Authorization: `Bearer ${token}` },
				});

				if (response.ok) {
					const data = await response.json();
					setOrders(data);
				}
			} catch (error) {
				console.error('Lỗi tải đơn hàng:', error);
			} finally {
				setLoading(false);
			}
		};

		fetchOrders();
	}, [token]);

	const formatPrice = (price: number) => {
		return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString('vi-VN', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		});
	};

	const getImageUrl = (url: string) => {
		if (!url) return 'https://via.placeholder.com/150';
		if (url.startsWith('http')) return url;
		return `${SERVER_URL}/${url}`;
	};

	const renderStatusBadge = (status: string) => {
		switch (status) {
			case 'PENDING':
				return (
					<span className="status-badge pending">
						<FiClock /> Chờ thanh toán
					</span>
				);
			case 'PAID':
			case 'PROCESSING':
				return (
					<span className="status-badge processing">
						<FiBox /> Đang xử lý
					</span>
				);
			case 'SHIPPING':
				return (
					<span className="status-badge shipping">
						<FiTruck /> Đang giao hàng
					</span>
				);
			case 'COMPLETED':
				return (
					<span className="status-badge completed">
						<FiCheckCircle /> Hoàn thành
					</span>
				);
			case 'CANCELLED':
				return (
					<span className="status-badge cancelled">
						<FiXCircle /> Đã hủy
					</span>
				);
			default:
				return (
					<span className="status-badge pending">
						<FiAlertCircle /> {status}
					</span>
				);
		}
	};

	if (loading) {
		return (
			<div className="orders-page-container">
				<div className="loading-state">
					<div
						className="animate-spin"
						style={{ display: 'inline-block', marginBottom: '10px' }}
					>
						⏳
					</div>
					<p>Đang tải lịch sử đơn hàng...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="orders-page-container">
			<div className="page-title">
				<FiBox size={28} color="var(--clr-primary)" />
				Lịch Sử Mua Hàng
			</div>

			{orders.length === 0 ? (
				<div className="empty-state">
					<h3>Bạn chưa có đơn hàng nào</h3>
					<p>Hãy khám phá kho truyện tranh vật lý của chúng tôi nhé!</p>
					<Link to="/physical-comics" className="btn-shop-now">
						Mua sắm ngay
					</Link>
				</div>
			) : (
				<div className="orders-list">
					{orders.map((order) => (
						<div key={order.id} className="order-card">
							<div className="order-header">
								<div className="order-info-group">
									<div className="order-id">
										<span className="label-id">Mã vận đơn</span>
										<span className="value-id">
											{order.transactionCode || `#${order.id}`}
										</span>
									</div>
								</div>
								<div className="order-date">
									<FiCalendar size={14} /> {formatDate(order.createdAt)}
								</div>
								<div className="order-status">
									{renderStatusBadge(order.status)}
								</div>
							</div>

							{order.items && order.items.length > 0 && (
								<div className="order-body">
									<div className="orders-items-preview">
										{order.items.slice(0, 2).map((item, idx) => (
											<div key={idx} className="item-row">
												<img
													src={getImageUrl(item.coverImageUrl)}
													alt={item.title}
													className="item-thumb"
													onError={(e) => {
														(e.target as HTMLImageElement).src =
															'https://via.placeholder.com/60x90?text=No+Img';
													}}
												/>
												<div className="item-info">
													<h4 className="item-name">{item.title}</h4>
													<div className="item-meta">
														<span>x{item.quantity}</span>
														<span style={{ margin: '0 8px' }}>|</span>
														<span className="item-price">
															{formatPrice(item.price)}
														</span>
													</div>
												</div>
											</div>
										))}
										{order.items.length > 2 && (
											<div
												style={{
													marginTop: '10px',
													fontSize: '0.9rem',
													color: 'var(--clr-primary)',
													fontStyle: 'italic',
												}}
											>
												...và {order.items.length - 2} sản phẩm khác
											</div>
										)}
									</div>
								</div>
							)}

							<div className="order-footer">
								<div className="total-section">
									<span className="label-total">Tổng tiền:</span>
									<span className="value-total">
										{formatPrice(order.totalAmount)}
									</span>
								</div>
								<Link to={`/orders/${order.id}`} className="btn-detail">
									Xem Chi Tiết
								</Link>
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
};

export default OrdersPage;
