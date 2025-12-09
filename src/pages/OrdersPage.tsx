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
	FiStar,
	FiX,
	FiVideo,
	FiImage,
} from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import '../assets/styles/OrdersPage.css';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
const SERVER_URL = API_URL.replace('/api', '');

interface OrderItem {
	id: number;
	comicId: number;
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

type TabType = 'ALL' | 'PENDING' | 'SHIPPING' | 'COMPLETED' | 'CANCELLED';

const OrdersPage: React.FC = () => {
	const { token } = useAuth();
	const { showToast } = useToast();
	const [orders, setOrders] = useState<Order[]>([]);
	const [loading, setLoading] = useState(true);
	const [activeTab, setActiveTab] = useState<TabType>('ALL');

	const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
	const [selectedOrderForReview, setSelectedOrderForReview] = useState<Order | null>(null);
	const [reviewRating, setReviewRating] = useState(5);
	const [reviewComment, setReviewComment] = useState('');
	const [reviewImages, setReviewImages] = useState<File[]>([]);
	const [reviewVideo, setReviewVideo] = useState<File | null>(null);
	const [isSubmittingReview, setIsSubmittingReview] = useState(false);

	useEffect(() => {
		fetchOrders();
	}, [token]);

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

	const getFilteredOrders = () => {
		if (activeTab === 'ALL') return orders;
		if (activeTab === 'PENDING') {
			return orders.filter((o) => ['PENDING', 'PAID', 'PROCESSING'].includes(o.status));
		}
		if (activeTab === 'SHIPPING') {
			return orders.filter((o) => ['SHIPPING', 'DELIVERED'].includes(o.status));
		}
		return orders.filter((o) => o.status === activeTab);
	};

	const filteredOrders = getFilteredOrders();

	const handleReceiveOrder = async (orderId: number) => {
		if (!confirm('Xác nhận bạn đã nhận được hàng và hàng nguyên vẹn?')) return;

		try {
			const response = await fetch(`${API_URL}/orders/${orderId}/status`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({ status: 'COMPLETED' }),
			});

			if (response.ok) {
				showToast('Xác nhận nhận hàng thành công!', 'success');
				fetchOrders();
			} else {
				showToast('Có lỗi xảy ra.', 'error');
			}
		} catch (error) {
			showToast('Lỗi kết nối.', 'error');
		}
	};

	const openReviewModal = (order: Order) => {
		setSelectedOrderForReview(order);
		setReviewRating(5);
		setReviewComment('');
		setReviewImages([]);
		setReviewVideo(null);
		setIsReviewModalOpen(true);
	};

	const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files) {
			const filesArray = Array.from(e.target.files);
			if (reviewImages.length + filesArray.length > 3) {
				showToast('Chỉ được chọn tối đa 3 ảnh.', 'warning');
				return;
			}
			setReviewImages((prev) => [...prev, ...filesArray]);
		}
	};

	const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files[0]) {
			const file = e.target.files[0];
			if (file.size > 50 * 1024 * 1024) {
				showToast('Video không được quá 50MB.', 'warning');
				return;
			}
			setReviewVideo(file);
		}
	};

	const removeImage = (index: number) => {
		setReviewImages((prev) => prev.filter((_, i) => i !== index));
	};

	const handleSubmitReview = async () => {
		if (!selectedOrderForReview) return;
		if (reviewComment.trim().length < 10) {
			showToast('Nội dung đánh giá phải có ít nhất 10 ký tự.', 'warning');
			return;
		}

		setIsSubmittingReview(true);
		try {
			for (const item of selectedOrderForReview.items) {
				const formData = new FormData();
				formData.append('rating', reviewRating.toString());
				formData.append('comment', reviewComment);

				reviewImages.forEach((img) => formData.append('images', img));
				if (reviewVideo) formData.append('video', reviewVideo);

				const res = await fetch(`${API_URL}/comics/${item.comicId}/reviews`, {
					method: 'POST',
					headers: {
						Authorization: `Bearer ${token}`,
					},
					body: formData,
				});

				if (!res.ok) throw new Error('Review failed');
			}

			showToast('Đánh giá thành công!', 'success');
			setIsReviewModalOpen(false);
		} catch (error) {
			console.error(error);
			showToast('Lỗi khi gửi đánh giá. Vui lòng thử lại.', 'error');
		} finally {
			setIsSubmittingReview(false);
		}
	};

	const formatPrice = (price: number) =>
		new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

	const formatDate = (dateString: string) =>
		new Date(dateString).toLocaleDateString('vi-VN', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		});

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
			case 'DELIVERED':
				return (
					<span
						className="status-badge delivered"
						style={{ backgroundColor: '#d9f7be', color: '#389e0d' }}
					>
						<FiBox /> Đã đến nơi
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

			<div className="orders-tabs">
				<button
					className={`tab-btn ${activeTab === 'ALL' ? 'active' : ''}`}
					onClick={() => setActiveTab('ALL')}
				>
					Tất cả
				</button>
				<button
					className={`tab-btn ${activeTab === 'PENDING' ? 'active' : ''}`}
					onClick={() => setActiveTab('PENDING')}
				>
					Chờ xử lý
				</button>
				<button
					className={`tab-btn ${activeTab === 'SHIPPING' ? 'active' : ''}`}
					onClick={() => setActiveTab('SHIPPING')}
				>
					Vận chuyển
				</button>
				<button
					className={`tab-btn ${activeTab === 'COMPLETED' ? 'active' : ''}`}
					onClick={() => setActiveTab('COMPLETED')}
				>
					Hoàn thành
				</button>
				<button
					className={`tab-btn ${activeTab === 'CANCELLED' ? 'active' : ''}`}
					onClick={() => setActiveTab('CANCELLED')}
				>
					Đã hủy
				</button>
			</div>

			{filteredOrders.length === 0 ? (
				<div className="empty-state">
					<h3>Không tìm thấy đơn hàng nào</h3>
					<Link to="/physical-comics" className="btn-shop-now">
						Mua sắm ngay
					</Link>
				</div>
			) : (
				<div className="orders-list">
					{filteredOrders.map((order) => (
						<div key={order.id} className="order-card">
							<div className="order-header">
								<div className="order-info-group">
									<div className="order-id">
										<span className="label-id">Mã:</span>
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
											<div className="more-items-text">
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

								<div className="order-actions">
									<Link to={`/orders/${order.id}`} className="btn-detail">
										Chi Tiết
									</Link>

									{order.status === 'DELIVERED' && (
										<button
											className="btn-action btn-receive"
											onClick={() => handleReceiveOrder(order.id)}
										>
											Đã nhận hàng
										</button>
									)}

									{order.status === 'COMPLETED' && (
										<button
											className="btn-action btn-review"
											onClick={() => openReviewModal(order)}
										>
											Đánh giá
										</button>
									)}
								</div>
							</div>
						</div>
					))}
				</div>
			)}

			{isReviewModalOpen && selectedOrderForReview && (
				<div className="review-modal-overlay">
					<div className="review-modal">
						<button
							className="close-modal-btn"
							onClick={() => setIsReviewModalOpen(false)}
						>
							<FiX />
						</button>
						<h3>Đánh giá sản phẩm</h3>
						<p className="review-order-ref">
							Đơn hàng:{' '}
							{selectedOrderForReview.transactionCode ||
								`#${selectedOrderForReview.id}`}
						</p>

						<div className="rating-input-group">
							<p>Chất lượng sản phẩm:</p>
							<div className="star-rating-input">
								{[1, 2, 3, 4, 5].map((star) => (
									<FiStar
										key={star}
										size={24}
										className={
											star <= reviewRating ? 'star-filled' : 'star-empty'
										}
										onClick={() => setReviewRating(star)}
									/>
								))}
							</div>
						</div>

						<textarea
							className="review-textarea"
							placeholder="Hãy chia sẻ nhận xét của bạn về sản phẩm này..."
							value={reviewComment}
							onChange={(e) => setReviewComment(e.target.value)}
						/>

						<div className="media-upload-section">
							<div className="upload-btn-wrapper">
								<label htmlFor="img-upload" className="upload-label">
									<FiImage /> Thêm Ảnh ({reviewImages.length}/3)
								</label>
								<input
									id="img-upload"
									type="file"
									accept="image/*"
									multiple
									onChange={handleImageChange}
									hidden
									disabled={reviewImages.length >= 3}
								/>
							</div>

							<div className="upload-btn-wrapper">
								<label
									htmlFor="vid-upload"
									className={`upload-label ${reviewVideo ? 'disabled' : ''}`}
								>
									<FiVideo /> Thêm Video (Max 1)
								</label>
								<input
									id="vid-upload"
									type="file"
									accept="video/*"
									onChange={handleVideoChange}
									hidden
									disabled={!!reviewVideo}
								/>
							</div>
						</div>

						<div className="media-preview-container">
							{reviewImages.map((file, idx) => (
								<div key={idx} className="media-preview-item">
									<img src={URL.createObjectURL(file)} alt="preview" />
									<button
										className="remove-media-btn"
										onClick={() => removeImage(idx)}
									>
										×
									</button>
								</div>
							))}
							{reviewVideo && (
								<div className="media-preview-item">
									<video src={URL.createObjectURL(reviewVideo)} controls />
									<button
										className="remove-media-btn"
										onClick={() => setReviewVideo(null)}
									>
										×
									</button>
								</div>
							)}
						</div>

						<button
							className="submit-review-btn-modal"
							onClick={handleSubmitReview}
							disabled={isSubmittingReview}
						>
							{isSubmittingReview ? 'Đang gửi...' : 'Gửi Đánh Giá'}
						</button>
					</div>
				</div>
			)}
		</div>
	);
};

export default OrdersPage;
