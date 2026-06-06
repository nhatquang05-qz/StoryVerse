import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiCheck, FiLoader } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import '../assets/styles/OrderSuccessPage.css';

interface OrderDetail {
	id: number;
	transactionCode: string;
	totalAmount: number;
	createdAt: string;
	address: string;
	paymentMethod: string;
	status: string;
}

const OrderSuccessPage: React.FC = () => {
	const { orderId } = useParams<{ orderId: string }>();
	const { currentUser } = useAuth();
	const [order, setOrder] = useState<OrderDetail | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState('');

	const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

	useEffect(() => {
		const fetchOrder = async () => {
			if (!orderId || !currentUser) return;

			try {
				const token = localStorage.getItem('storyverse_token');
				const response = await fetch(`${API_URL}/orders/${orderId}`, {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				});

				if (!response.ok) {
					throw new Error('Không tìm thấy đơn hàng');
				}

				const data = await response.json();
				setOrder(data.data || data);
			} catch (err) {
				console.error('Lỗi lấy đơn hàng:', err);
				setError('Không thể tải thông tin đơn hàng.');
			} finally {
				setIsLoading(false);
			}
		};

		const timer = setTimeout(() => {
			fetchOrder();
		}, 800);

		return () => clearTimeout(timer);
	}, [orderId, currentUser]);

	const formatPrice = (price: number) => {
		return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString('vi-VN', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		});
	};

	if (isLoading) {
		return (
			<div className="order-success-page">
				<div className="loading-container">
					<FiLoader className="animate-spin" size={40} />
					<h2>Đang xử lý đơn hàng...</h2>
					<p>Vui lòng đợi trong giây lát</p>
				</div>
			</div>
		);
	}

	if (!order || error) {
		return (
			<div className="order-success-page">
				<div className="success-card">
					<h2 className="text-error">Không tìm thấy đơn hàng</h2>
					<p>{error || 'Có lỗi xảy ra hoặc bạn không có quyền xem đơn hàng này.'}</p>
					<div className="success-actions mt-4">
						<Link to="/" className="btn-secondary-solid">
							Về Trang Chủ
						</Link>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="order-success-page">
			<div className="success-card">
				<div className="success-icon-wrapper">
					<FiCheck className="success-icon" />
				</div>

				<h1 className="success-title">Đặt Hàng Thành Công!</h1>
				<p className="success-message">
					Cảm ơn bạn đã ủng hộ <strong>StoryVerse</strong>.<br />
					Đơn hàng của bạn đã được hệ thống ghi nhận.
				</p>

				<div className="order-details-box">
					<div className="detail-row">
						<span className="detail-label">Mã vận đơn:</span>
						<span className="detail-value highlight">
							{order.transactionCode || `#${order.id}`}
						</span>
					</div>
					<div className="detail-row">
						<span className="detail-label">Ngày đặt:</span>
						<span className="detail-value">{formatDate(order.createdAt)}</span>
					</div>
					<div className="detail-row">
						<span className="detail-label">Phương thức:</span>
						<span className="detail-value">
							{order.paymentMethod === 'COD'
								? 'Thanh toán khi nhận hàng'
								: order.paymentMethod}
						</span>
					</div>
					<div className="detail-row">
						<span className="detail-label">Tổng thanh toán:</span>
						<span className="detail-value total-value">
							{formatPrice(order.totalAmount)}
						</span>
					</div>
				</div>

				<div className="shipping-info">
					<h4>Thông tin nhận hàng</h4>
					<p>
						<strong>Người nhận:</strong> {currentUser?.fullName}
					</p>
					<p>
						<strong>Số điện thoại:</strong>{' '}
						{currentUser?.phone || order.address.split(',')[0]}
					</p>
					<p>
						<strong>Địa chỉ:</strong> {order.address}
					</p>
				</div>

				<div className="success-actions">
					<Link to={`/orders`} className="btn-primary-outline">
						Xem Chi Tiết
					</Link>
					<Link to="/" className="btn-secondary-solid">
						Tiếp Tục Mua Sắm
					</Link>
				</div>
			</div>
		</div>
	);
};

export default OrderSuccessPage;
