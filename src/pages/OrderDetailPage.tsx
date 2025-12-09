import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
	FiArrowLeft, FiMapPin, FiPackage, FiCreditCard, FiCalendar,
	FiBox, FiClock, FiCheckCircle, FiXCircle, FiTruck, FiAlertCircle,
    FiMessageSquare, FiStar
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
    const [isReviewed, setIsReviewed] = useState(false);
    const [showComplaintModal, setShowComplaintModal] = useState(false);
    const [showReviewModal, setShowReviewModal] = useState(false);

	const fetchOrderData = async () => {
		if (!token || !orderId) return;
		try {
			const res = await fetch(`${API_URL}/orders/${orderId}`, {
				headers: { Authorization: `Bearer ${token}` },
			});

			if (!res.ok) throw new Error('Không thể tải đơn hàng');
			const json = await res.json();
			setOrder(json.data || json);  

             
            try {
                const resComp = await axios.get(`${API_URL}/complaints/order/${orderId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setComplaint(resComp.data.complaint);
            } catch { setComplaint(null); }

             
            try {
                const resRev = await axios.get(`${API_URL}/reviews/check-order/${orderId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setIsReviewed(resRev.data.reviewed);
            } catch { setIsReviewed(false); }

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
			hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric',
		});

	const renderStatusBadge = (status: string) => {
		let badgeClass = 'status-badge ';
		let icon = <FiAlertCircle />;
		let text = status;
		let style = {};

		switch (status) {
			case 'PENDING':
				badgeClass += 'pending'; icon = <FiClock />; text = 'Chờ thanh toán';
				style = { backgroundColor: 'var(--clr-warning-bg)', color: 'var(--clr-warning-text)' }; break;
			case 'PAID':
			case 'PROCESSING':
				badgeClass += 'processing'; icon = <FiBox />; text = 'Đang xử lý';
				style = { backgroundColor: 'var(--clr-info-bg)', color: 'var(--clr-info-text)' }; break;
			case 'SHIPPING':
				badgeClass += 'shipping'; icon = <FiTruck />; text = 'Đang giao hàng';
				style = { backgroundColor: 'var(--clr-info-bg)', color: 'var(--clr-info-text)' }; break;
			case 'COMPLETED':
			case 'SUCCESS':  
				badgeClass += 'completed'; icon = <FiCheckCircle />; text = 'Hoàn thành';
				style = { backgroundColor: 'var(--clr-success-bg)', color: 'var(--clr-success-text)' }; break;
			case 'CANCELLED':
				badgeClass += 'cancelled'; icon = <FiXCircle />; text = 'Đã hủy';
				style = { backgroundColor: 'var(--clr-error-bg)', color: 'var(--clr-error-text)' }; break;
			default:
				style = { backgroundColor: 'var(--clr-card-bg)', color: 'var(--clr-text)' };
		}
		return <span className={badgeClass} style={style}>{icon} {text}</span>;
	};

	if (loading) return <div className="loading-container">Đang tải...</div>;
	if (!order) return <div className="error-container">Không tìm thấy đơn hàng</div>;

	const isPaid = order.status === 'PAID' || order.status === 'COMPLETED' || order.status === 'SUCCESS';
    const isCompleted = order.status === 'COMPLETED' || order.status === 'SUCCESS';
    
     
    const showReviewBtn = isCompleted && !complaint && !isReviewed;
    const showComplaintBtn = isCompleted && (complaint || !isReviewed);

	return (
		<div className="order-detail-container">
			<button onClick={() => navigate('/orders')} className="btn-back">
				<FiArrowLeft /> Quay lại danh sách
			</button>

			<div className="order-detail-card">
				<div className="od-header">
					<div className="od-title">
						<h2>Chi Tiết Đơn Hàng</h2>
						<p className="od-id">Mã vận đơn: <span className="od-transaction-code">{order.transactionCode || `#${order.id}`}</span></p>
					</div>
					<div className="od-status">
						{renderStatusBadge(order.status)}
						<p className="od-date"><FiCalendar /> {formatDate(order.createdAt)}</p>
					</div>
				</div>

				<div className="od-info-grid">
					<div className="info-section">
						<h4><FiMapPin /> Địa Chỉ Nhận Hàng</h4>
						<div className="info-box">
							<div className="info-row"><span className="info-value" style={{ fontWeight: 700 }}>{order.fullName}</span></div>
							<div className="info-row"><span className="info-value">{order.phone}</span></div>
							<div className="info-row"><span className="info-value" style={{ color: 'var(--clr-text-secondary)' }}>{order.address}</span></div>
						</div>
					</div>
					<div className="info-section">
						<h4><FiCreditCard /> Thanh Toán</h4>
						<div className="info-box">
							<div className="info-row"><span className="info-label">Phương thức:</span> <span className="info-value">{order.paymentMethod}</span></div>
							<div className="info-row"><span className="info-label">Trạng thái:</span> <span className={`payment-status ${isPaid ? 'paid' : 'unpaid'}`}>{isPaid ? 'Đã thanh toán' : 'Chưa thanh toán'}</span></div>
						</div>
					</div>
				</div>

				<div className="od-items-section">
					<h4><FiPackage /> Sản Phẩm ({order.items ? order.items.length : 0})</h4>
					<div className="od-items-list">
						{order.items?.map((item, index) => (
							<div key={index} className="od-item">
								<img src={getImageUrl(item.coverImageUrl)} alt={item.title} className="item-image" onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/60x90?text=Error'; }}/>
								<div className="item-details">
									<h5 className="item-title">{item.title}</h5>
									<p className="item-quantity">Số lượng: x{item.quantity}</p>
								</div>
								<div className="item-price">{formatPrice(item.price)}</div>
							</div>
						))}
					</div>
				</div>

				<div className="od-footer">
					<div className="total-summary">
						<div className="summary-row final"><span>Tổng tiền:</span><span>{formatPrice(order.totalAmount)}</span></div>
					</div>
				</div>

                { }
                <div className="od-actions" style={{display:'flex', justifyContent:'flex-end', gap:'15px', marginTop:'20px', paddingTop:'20px', borderTop:'1px solid var(--clr-border-light)'}}>
                    {showReviewBtn && (
                        <button className="detail-order-btn" onClick={() => setShowReviewModal(true)} style={{display:'flex', alignItems:'center', gap:'8px'}}>
                            <FiStar /> Đánh giá
                        </button>
                    )}
                    {showComplaintBtn && (
                        <button 
                            className={complaint ? 'detail-order-btn' : 'cancel-btn'}
                            style={!complaint ? {backgroundColor: 'var(--clr-error-bg)', color: 'var(--clr-error-text)', borderColor: 'var(--clr-error-border)'} : {}}
                            onClick={() => setShowComplaintModal(true)}
                        >
                            <FiMessageSquare /> {complaint ? (complaint.status === 'PENDING' ? 'Xem khiếu nại (Chờ)' : 'Kết quả khiếu nại') : 'Khiếu nại'}
                        </button>
                    )}
                </div>
			</div>

            { }
            <ComplaintModal 
                isOpen={showComplaintModal} 
                onClose={() => setShowComplaintModal(false)} 
                orderId={order.id} 
                token={token || ''} 
                existingData={complaint} 
                onSuccess={fetchOrderData} 
            />
            <ReviewModal 
                isOpen={showReviewModal} 
                onClose={() => setShowReviewModal(false)} 
                orderId={order.id} 
                items={order.items} 
                token={token || ''} 
                onSuccess={fetchOrderData} 
            />
		</div>
	);
};

export default OrderDetailPage;