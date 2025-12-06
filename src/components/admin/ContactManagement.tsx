import React, { useState, useEffect } from 'react';
import { FaReply, FaCheckCircle, FaPaperclip, FaTimes, FaPaperPlane } from 'react-icons/fa';
import '../../assets/styles/ContactManagement.css';
import { useNotification } from '../../contexts/NotificationContext';

interface ContactMessage {
	id: number;
	name: string;
	email: string;
	subject: string;
	message: string;
	status: 'pending' | 'replied';
	createdAt: string;
	admin_response?: string;
}

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

const ContactManagement: React.FC = () => {
	const [messages, setMessages] = useState<ContactMessage[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [selectedMsg, setSelectedMsg] = useState<ContactMessage | null>(null);
	const [replyText, setReplyText] = useState('');
	const [replyImage, setReplyImage] = useState<File | null>(null);
	const [isSending, setIsSending] = useState(false);

	const { showNotification } = useNotification();

	const fetchMessages = async () => {
		try {
			const res = await fetch(`${API_URL}/contact`);
			if (res.ok) {
				const data = await res.json();
				setMessages(data);
			}
		} catch (error) {
			console.error(error);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchMessages();
	}, []);

	const handleOpenReply = (msg: ContactMessage) => {
		setSelectedMsg(msg);
		setReplyText('');
		setReplyImage(null);
	};

	const handleCloseModal = () => {
		setSelectedMsg(null);
	};

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files[0]) {
			setReplyImage(e.target.files[0]);
		}
	};

	const handleSendReply = async () => {
		if (!selectedMsg || !replyText) return;
		setIsSending(true);

		const formData = new FormData();
		formData.append('id', selectedMsg.id.toString());
		formData.append('email', selectedMsg.email);
		formData.append('name', selectedMsg.name);
		formData.append('replyMessage', replyText);
		if (replyImage) {
			formData.append('attachment', replyImage);
		}

		try {
			const res = await fetch(`${API_URL}/contact/reply`, {
				method: 'POST',
				body: formData,
			});

			if (res.ok) {
				showNotification('Đã gửi phản hồi thành công!', 'success');
				setMessages((prev) =>
					prev.map((m) =>
						m.id === selectedMsg.id
							? { ...m, status: 'replied', admin_response: replyText }
							: m,
					),
				);
				handleCloseModal();
			} else {
				showNotification('Lỗi khi gửi mail.', 'error');
			}
		} catch (error) {
			console.error(error);
			showNotification('Lỗi kết nối server.', 'error');
		} finally {
			setIsSending(false);
		}
	};

	return (
		<div className="contact-management-view">
			<div className="page-header">
				<h2 className="page-title">Quản Lý Liên Hệ</h2>
			</div>

			<div className="table-container">
				{isLoading ? (
					<div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
						Đang tải dữ liệu...
					</div>
				) : (
					<table className="contact-table">
						<thead>
							<tr>
								<th>ID</th>
								<th>Người gửi</th>
								<th>Chủ đề</th>
								<th>Ngày gửi</th>
								<th>Trạng thái</th>
								<th>Hành động</th>
							</tr>
						</thead>
						<tbody>
							{messages.map((msg) => (
								<tr key={msg.id}>
									<td>#{msg.id}</td>
									<td>
										<div className="user-info">
											<span className="user-name">{msg.name}</span>
											<span className="user-email">{msg.email}</span>
										</div>
									</td>
									<td>{msg.subject}</td>
									<td>{new Date(msg.createdAt).toLocaleDateString('vi-VN')}</td>
									<td>
										<span className={`status-badge ${msg.status}`}>
											{msg.status === 'replied' ? 'Đã trả lời' : 'Chờ xử lý'}
										</span>
									</td>
									<td>
										<button
											className="btn-action btn-reply"
											onClick={() => handleOpenReply(msg)}
											title="Xem & Trả lời"
										>
											<FaReply /> Phản hồi
										</button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				)}
			</div>

			{selectedMsg && (
				<div className="modal-overlay">
					<div className="modal-box">
						<div className="modal-header">
							<h3>Phản hồi liên hệ #{selectedMsg.id}</h3>
							<button className="btn-close" onClick={handleCloseModal}>
								<FaTimes />
							</button>
						</div>

						<div className="modal-body">
							<div className="message-detail-box">
								<div className="detail-row">
									<strong>Từ:</strong> {selectedMsg.name} &lt;{selectedMsg.email}
									&gt;
								</div>
								<div className="detail-row">
									<strong>Nội dung:</strong> {selectedMsg.message}
								</div>
							</div>

							{selectedMsg.status === 'replied' && (
								<div
									className="replied-container"
									style={{
										marginTop: '1rem',
										padding: '1rem',
										backgroundColor: '#eff6ff',
										borderRadius: '8px',
										border: '1px solid #bfdbfe',
									}}
								>
									<div
										className="replied-notice"
										style={{
											display: 'flex',
											alignItems: 'center',
											gap: '0.5rem',
											color: '#1e40af',
											fontWeight: 600,
											marginBottom: '0.5rem',
										}}
									>
										<FaCheckCircle /> Phản hồi của Admin:
									</div>
									<div
										className="admin-response-text"
										style={{
											whiteSpace: 'pre-wrap',
											color: '#334155',
											fontSize: '0.95rem',
											lineHeight: '1.5',
											backgroundColor: '#fff',
											padding: '0.75rem',
											borderRadius: '6px',
											border: '1px solid #e2e8f0',
										}}
									>
										{selectedMsg.admin_response ||
											'(Nội dung phản hồi không khả dụng)'}
									</div>
								</div>
							)}

							<div className="form-group" style={{ marginTop: '1.5rem' }}>
								<label className="form-label">
									{selectedMsg.status === 'replied'
										? 'Gửi phản hồi khác (Ghi đè)'
										: 'Nội dung trả lời'}
								</label>
								<textarea
									className="form-textarea"
									value={replyText}
									onChange={(e) => setReplyText(e.target.value)}
									placeholder="Nhập nội dung phản hồi của bạn..."
								></textarea>
							</div>

							<div className="form-group">
								<label className="form-label">Đính kèm ảnh (Tùy chọn)</label>
								<div className="file-upload-wrapper">
									<label className="btn-upload">
										<FaPaperclip /> Chọn ảnh
										<input
											type="file"
											accept="image/*"
											onChange={handleFileChange}
											hidden
										/>
									</label>
									{replyImage && (
										<span className="file-name">{replyImage.name}</span>
									)}
								</div>
							</div>
						</div>

						<div className="modal-footer">
							<button className="btn-cancel" onClick={handleCloseModal}>
								Đóng
							</button>
							<button
								className="btn-submit"
								onClick={handleSendReply}
								disabled={isSending || !replyText}
							>
								{isSending ? (
									'Đang gửi...'
								) : (
									<>
										<FaPaperPlane size={12} /> Gửi Phản Hồi
									</>
								)}
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default ContactManagement;