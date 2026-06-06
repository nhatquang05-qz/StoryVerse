import React, { useState, useEffect } from 'react';
import { FaTimesCircle, FaEye } from 'react-icons/fa';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import '../../assets/styles/ContactManagement.css';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

interface Complaint {
	id: number;
	userId: number;
	orderId: number;
	orderDisplayId: number;
	transactionCode: string;
	fullName: string;
	email: string;
	description: string;
	images: string;
	video: string | null;
	status: 'PENDING' | 'RESOLVED' | 'REJECTED';
	adminReply: string | null;
	createdAt: string;
}

const ComplaintManagement: React.FC = () => {
	const [complaints, setComplaints] = useState<Complaint[]>([]);
	const [loading, setLoading] = useState(true);
	const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
	const [replyText, setReplyText] = useState('');
	const [processingStatus, setProcessingStatus] = useState<'RESOLVED' | 'REJECTED'>('RESOLVED');
	const [isSubmitting, setIsSubmitting] = useState(false);

	const { token } = useAuth();
	const { showToast } = useToast();

	const fetchComplaints = async () => {
		try {
			const res = await fetch(`${API_URL}/complaints/all`, {
				headers: { Authorization: `Bearer ${token}` },
			});
			if (res.ok) {
				const data = await res.json();
				setComplaints(data);
			}
		} catch (error) {
			console.error(error);
			showToast('Lỗi tải dữ liệu khiếu nại', 'error');
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchComplaints();
	}, [token]);

	const handleOpenDetail = (item: Complaint) => {
		setSelectedComplaint(item);
		setReplyText(item.adminReply || '');
		setProcessingStatus(item.status === 'PENDING' ? 'RESOLVED' : item.status);
	};

	const handleCloseModal = () => {
		setSelectedComplaint(null);
	};

	const handleSubmitReply = async () => {
		if (!selectedComplaint) return;
		setIsSubmitting(true);

		try {
			const res = await fetch(`${API_URL}/complaints/reply/${selectedComplaint.id}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({
					adminReply: replyText,
					status: processingStatus,
				}),
			});

			if (res.ok) {
				showToast('Đã xử lý khiếu nại thành công!', 'success');
				setComplaints((prev) =>
					prev.map((c) =>
						c.id === selectedComplaint.id
							? { ...c, adminReply: replyText, status: processingStatus }
							: c,
					),
				);
				handleCloseModal();
			} else {
				showToast('Có lỗi xảy ra', 'error');
			}
		} catch (error) {
			showToast('Lỗi kết nối', 'error');
		} finally {
			setIsSubmitting(false);
		}
	};

	const getImages = (jsonString: string): string[] => {
		try {
			return JSON.parse(jsonString) || [];
		} catch {
			return [];
		}
	};

	return (
		<div className="contact-management-view">
			<div className="page-header">
				<h2 className="page-title">Giải Quyết Khiếu Nại</h2>
			</div>

			<div className="table-container">
				{loading ? (
					<p style={{ padding: 20 }}>Đang tải...</p>
				) : (
					<table className="contact-table">
						<thead>
							<tr>
								<th>ID</th>
								<th>Khách hàng</th>
								<th>Mã đơn hàng</th>
								<th>Ngày tạo</th>
								<th>Trạng thái</th>
								<th>Hành động</th>
							</tr>
						</thead>
						<tbody>
							{complaints.map((item) => (
								<tr key={item.id}>
									<td>#{item.id}</td>
									<td>
										<div className="user-info">
											<span className="user-name">{item.fullName}</span>
											<span className="user-email">{item.email}</span>
										</div>
									</td>
									<td style={{ fontWeight: 'bold', color: '#4f46e5' }}>
										{item.transactionCode || `#${item.orderDisplayId}`}
									</td>
									<td>{new Date(item.createdAt).toLocaleDateString('vi-VN')}</td>
									<td>
										<span
											className={`status-badge ${item.status.toLowerCase()}`}
										>
											{item.status === 'PENDING'
												? 'Chờ xử lý'
												: item.status === 'RESOLVED'
													? 'Đã giải quyết'
													: 'Đã từ chối'}
										</span>
									</td>
									<td>
										<button
											className="btn-action btn-reply"
											onClick={() => handleOpenDetail(item)}
										>
											<FaEye /> Xem & Xử lý
										</button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				)}
			</div>

			{selectedComplaint && (
				<div className="modal-overlay">
					<div className="modal-box" style={{ maxWidth: '700px' }}>
						<div className="modal-header">
							<h3>Xử lý khiếu nại #{selectedComplaint.id}</h3>
							<button className="btn-close" onClick={handleCloseModal}>
								<FaTimesCircle />
							</button>
						</div>
						<div
							className="modal-body"
							style={{ maxHeight: '70vh', overflowY: 'auto' }}
						>
							<div className="detail-row">
								<strong>Mã đơn hàng:</strong>
								<span
									style={{ marginLeft: 8, fontWeight: 'bold', color: '#2563eb' }}
								>
									{selectedComplaint.transactionCode ||
										`#${selectedComplaint.orderDisplayId}`}
								</span>
							</div>
							<div className="detail-row" style={{ marginTop: 10 }}>
								<strong>Mô tả của khách:</strong>
								<div
									style={{
										background: '#f1f5f9',
										padding: 10,
										borderRadius: 5,
										marginTop: 5,
									}}
								>
									{selectedComplaint.description}
								</div>
							</div>

							<div className="detail-row" style={{ marginTop: 15 }}>
								<strong>Minh chứng:</strong>
								<div
									style={{
										display: 'flex',
										gap: 10,
										flexWrap: 'wrap',
										marginTop: 5,
									}}
								>
									{getImages(selectedComplaint.images).map((img, i) => (
										<a href={img} target="_blank" key={i} rel="noreferrer">
											<img
												src={img}
												alt="proof"
												style={{
													width: 80,
													height: 80,
													objectFit: 'cover',
													borderRadius: 4,
													border: '1px solid #ddd',
												}}
											/>
										</a>
									))}
									{selectedComplaint.video && (
										<video
											src={selectedComplaint.video}
											controls
											style={{ width: 150, height: 80, borderRadius: 4 }}
										/>
									)}
									{getImages(selectedComplaint.images).length === 0 &&
										!selectedComplaint.video && (
											<span>(Không có ảnh/video)</span>
										)}
								</div>
							</div>

							<div
								style={{
									marginTop: 20,
									paddingTop: 20,
									borderTop: '1px solid #eee',
								}}
							>
								<h4>Phản hồi & Cập nhật trạng thái</h4>
								<div className="form-group">
									<label className="form-label">Trạng thái xử lý:</label>
									<select
										className="form-control"
										style={{
											padding: 8,
											borderRadius: 4,
											border: '1px solid #ccc',
											width: '100%',
										}}
										value={processingStatus}
										onChange={(e) => setProcessingStatus(e.target.value as any)}
									>
										<option value="RESOLVED">Chấp nhận (Đã giải quyết)</option>
										<option value="REJECTED">Từ chối</option>
										<option value="PENDING">Đang xem xét (Pending)</option>
									</select>
								</div>
								<div className="form-group" style={{ marginTop: 10 }}>
									<label className="form-label">
										Nội dung phản hồi (sẽ hiện cho khách):
									</label>
									<textarea
										className="form-textarea"
										rows={4}
										value={replyText}
										onChange={(e) => setReplyText(e.target.value)}
										placeholder="Nhập nội dung giải quyết, lý do từ chối hoặc hướng dẫn..."
									/>
								</div>
							</div>
						</div>
						<div className="modal-footer">
							<button className="btn-cancel" onClick={handleCloseModal}>
								Đóng
							</button>
							<button
								className="btn-submit"
								onClick={handleSubmitReply}
								disabled={isSubmitting}
							>
								{isSubmitting ? 'Đang lưu...' : 'Lưu xử lý'}
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default ComplaintManagement;
