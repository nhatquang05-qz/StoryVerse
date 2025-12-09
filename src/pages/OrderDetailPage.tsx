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
	FiMessageSquare,
	FiStar,
} from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import ComplaintModal from '../components/popups/ComplaintModal';
import ReviewModal from '../components/popups/ReviewModal';
import axios from 'axios';
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
	comicId: number;
	isReviewed: number | boolean;
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

	const [complaint, setComplaint] = useState<any>(null);
	const [showComplaintModal, setShowComplaintModal] = useState(false);

	const [showReviewModal, setShowReviewModal] = useState(false);
	const [selectedItem, setSelectedItem] = useState<OrderItem | null>(null);

	const fetchOrderData = async () => {
		if (!token || !orderId) return;
		try {
			const res = await axios.get(`${API_URL}/orders/${orderId}`, {
				headers: { Authorization: `Bearer ${token}` },
			});
			setOrder(res.data.data || res.data);

			try {
				const resComp = await axios.get(`${API_URL}/complaints/order/${orderId}`, {
					headers: { Authorization: `Bearer ${token}` },
				});
				setComplaint(resComp.data.complaint);
			} catch {
				setComplaint(null);
			}
		} catch (error) {
			console.error('Lỗi tải chi tiết:', error);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchOrderData();
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

	const handleOpenReview = (item: OrderItem) => {
		setSelectedItem(item);
		setShowReviewModal(true);
	};

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
				style = {
					backgroundColor: 'var(--clr-warning-bg)',
					color: 'var(--clr-warning-text)',
				};
				break;
			case 'PAID':
			case 'PROCESSING':
				badgeClass += 'processing';
				icon = <FiBox />;
				text = 'Đang xử lý';
				style = { backgroundColor: 'var(--clr-info-bg)', color: 'var(--clr-info-text)' };
				break;
			case 'SHIPPING':
				badgeClass += 'shipping';
				icon = <FiTruck />;
				text = 'Đang giao hàng';
				style = { backgroundColor: 'var(--clr-info-bg)', color: 'var(--clr-info-text)' };
				break;
			case 'COMPLETED':
			case 'SUCCESS':
				badgeClass += 'completed';
				icon = <FiCheckCircle />;
				text = 'Hoàn thành';
				style = {
					backgroundColor: 'var(--clr-success-bg)',
					color: 'var(--clr-success-text)',
				};
				break;
			case 'CANCELLED':
				badgeClass += 'cancelled';
				icon = <FiXCircle />;
				text = 'Đã hủy';
				style = { backgroundColor: 'var(--clr-error-bg)', color: 'var(--clr-error-text)' };
				break;
			default:
				style = { backgroundColor: 'var(--clr-card-bg)', color: 'var(--clr-text)' };
		}
		return (
			<span className={badgeClass} style={style}>
				{icon} {text}
			</span>
		);
	};

	if (loading) return <div className="loading-container">Đang tải...</div>;
	if (!order) return <div className="error-container">Không tìm thấy đơn hàng</div>;

	const isPaid =
		order.status === 'PAID' || order.status === 'COMPLETED' || order.status === 'SUCCESS';
	const isCompleted = order.status === 'COMPLETED' || order.status === 'SUCCESS';

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
								<span className="info-label">Phương thức:</span>{' '}
								<span className="info-value">{order.paymentMethod}</span>
							</div>
							<div className="info-row">
								<span className="info-label">Trạng thái:</span>{' '}
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
						{order.items?.map((item, index) => (
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

									{/* LOGIC HIỂN THỊ NÚT ĐÁNH GIÁ:
                                        Chỉ hiện khi đơn hoàn thành VÀ sản phẩm chưa được đánh giá (isReviewed == 0) 
                                    */}
									{isCompleted && !item.isReviewed && (
										<button
											className="btn-review-item"
											onClick={() => handleOpenReview(item)}
											style={{
												marginTop: '8px',
												padding: '6px 12px',
												fontSize: '0.85rem',
												backgroundColor: 'var(--clr-primary)',
												color: '#fff',
												border: 'none',
												borderRadius: '4px',
												cursor: 'pointer',
												display: 'flex',
												alignItems: 'center',
												gap: '5px',
												width: 'fit-content',
											}}
										>
											<FiStar /> Đánh giá ngay
										</button>
									)}

									{}
									{isCompleted && !!item.isReviewed && (
										<div
											style={{
												marginTop: '8px',
												color: 'var(--clr-success-text)',
												fontSize: '0.85rem',
												display: 'flex',
												alignItems: 'center',
												gap: '4px',
											}}
										>
											<FiCheckCircle /> Đã đánh giá
										</div>
									)}
								</div>
								<div className="item-price">{formatPrice(item.price)}</div>
							</div>
						))}
					</div>
				</div>

				<div className="od-footer">
					<div className="total-summary">
						<div className="summary-row final">
							<span>Tổng tiền:</span>
							<span>{formatPrice(order.totalAmount)}</span>
						</div>
					</div>
				</div>

				{}
				{isCompleted && (
					<div
						className="od-actions"
						style={{
							display: 'flex',
							justifyContent: 'flex-end',
							marginTop: '30px',
							paddingTop: '20px',
							borderTop: '1px solid var(--clr-border-light)',
						}}
					>
						<button
							className="btn-complaint-action"
							style={{
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								gap: '10px',
								padding: '12px 30px',
								fontSize: '1rem',
								fontWeight: 700,
								borderRadius: '8px',
								cursor: 'pointer',
								backgroundColor: complaint
									? 'var(--clr-info-bg)'
									: 'var(--clr-error-bg)',
								color: complaint ? 'var(--clr-info-text)' : 'var(--clr-error-text)',
								border: complaint
									? '1px solid var(--clr-info-border)'
									: '1px solid var(--clr-error-border)',
								transition: 'all 0.2s ease',
								minWidth: '200px',
							}}
							onClick={() => setShowComplaintModal(true)}
						>
							<FiMessageSquare size={20} />
							{complaint
								? complaint.status === 'PENDING'
									? 'ĐANG CHỜ XỬ LÝ KHIẾU NẠI'
									: 'XEM KẾT QUẢ KHIẾU NẠI'
								: 'BÁO CÁO / KHIẾU NẠI ĐƠN HÀNG'}
						</button>
					</div>
				)}
			</div>

			{}
			<ComplaintModal
				isOpen={showComplaintModal}
				onClose={() => setShowComplaintModal(false)}
				orderId={order.id}
				token={token || ''}
				existingData={complaint}
				onSuccess={fetchOrderData}
			/>

			{}
			{selectedItem && (
				<ReviewModal
					isOpen={showReviewModal}
					onClose={() => {
						setShowReviewModal(false);
						setSelectedItem(null);
					}}
					orderId={order.id}
					item={selectedItem}
					token={token || ''}
					onSuccess={() => {
						fetchOrderData();
					}}
				/>
			)}
		</div>
	);
};

export default OrderDetailPage;
