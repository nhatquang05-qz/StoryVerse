import React, { useState } from 'react';
import axios from 'axios';
import { FiSend } from 'react-icons/fi';
import { useToast } from '../../contexts/ToastContext';
import ConfirmModal from '../popups/ConfirmModal';
import '../../assets/styles/NewsletterManagement.css';

const NewsletterManagement: React.FC = () => {
	const [subject, setSubject] = useState('');
	const [content, setContent] = useState('');
	const [loading, setLoading] = useState(false);
	const [showConfirm, setShowConfirm] = useState(false);

	const { showToast } = useToast();

	const handlePreCheck = () => {
		if (!subject.trim() || !content.trim()) {
			showToast('Vui lòng nhập đầy đủ tiêu đề và nội dung email!', 'warning');
			return;
		}
		setShowConfirm(true);
	};

	const handleSendBroadcast = async () => {
		setLoading(true);
		try {
			const res = await axios.post('http://localhost:3000/api/newsletter/broadcast', {
				subject,
				content,
			});
			showToast(res.data.message || 'Gửi Broadcast thành công!', 'success');
			setSubject('');
			setContent('');
		} catch (error: any) {
			console.error(error);
			const msg = error.response?.data?.message || 'Gửi thất bại. Vui lòng kiểm tra server.';
			showToast(msg, 'error');
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="newsletter-container">
			<h2 className="newsletter-title">Trạm Phát Tin (Newsletter)</h2>
			<p className="newsletter-desc">
				Soạn thảo và gửi thông báo, chương trình khuyến mãi hoặc tin tức cập nhật đến tất cả
				thành viên đã đăng ký nhận tin (Subscribers).
			</p>

			<div className="newsletter-form-group">
				<label className="newsletter-label">Tiêu đề Email</label>
				<input
					type="text"
					className="newsletter-input"
					value={subject}
					onChange={(e) => setSubject(e.target.value)}
					placeholder="VD: [HOT] Sự kiện Giáng Sinh - Nhận quà miễn phí!"
					disabled={loading}
				/>
			</div>

			<div className="newsletter-form-group">
				<label className="newsletter-label">Nội dung (Hỗ trợ HTML)</label>
				<textarea
					className="newsletter-textarea"
					rows={12}
					value={content}
					onChange={(e) => setContent(e.target.value)}
					placeholder="Nhập nội dung email tại đây...&#10;Có thể dùng thẻ: <b>in đậm</b>, <br>xuống dòng, <p>đoạn văn</p>..."
					disabled={loading}
				/>
				<small className="newsletter-hint">
					Nội dung này sẽ được chèn vào khung template chuẩn của StoryVerse (kèm Logo và
					Footer).
				</small>
			</div>

			<div className="newsletter-actions">
				<button className="btn-broadcast" onClick={handlePreCheck} disabled={loading}>
					{loading ? (
						'Đang xử lý...'
					) : (
						<>
							<FiSend /> Gửi tin ngay
						</>
					)}
				</button>
			</div>

			<ConfirmModal
				isOpen={showConfirm}
				title="Xác nhận phát tin?"
				message="Bạn sắp gửi email đến TOÀN BỘ người dùng đã đăng ký. Hành động này không thể hoàn tác. Bạn chắc chắn chứ?"
				confirmText="Gửi ngay"
				cancelText="Hủy bỏ"
				onConfirm={handleSendBroadcast}
				onClose={() => setShowConfirm(false)}
			/>
		</div>
	);
};

export default NewsletterManagement;
