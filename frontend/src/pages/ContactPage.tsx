import React, { useState } from 'react';
import {
	FaFacebookF,
	FaInstagram,
	FaYoutube,
	FaDiscord,
	FaMapMarkerAlt,
	FaPhoneAlt,
	FaEnvelope,
	FaPaperPlane,
	FaCheckCircle,
	FaExclamationCircle,
	FaExclamationTriangle,
} from 'react-icons/fa';
import '../assets/styles/ContactPage.css';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

const ContactPage = () => {
	const [toast, setToast] = useState<{
		message: string;
		type: 'success' | 'error' | 'warning';
	} | null>(null);

	const showToast = (message: string, type: 'success' | 'error' | 'warning') => {
		setToast({ message, type });

		setTimeout(() => setToast(null), 3000);
	};

	const [formData, setFormData] = useState({
		name: '',
		email: '',
		subject: '',
		message: '',
	});
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);

		try {
			const response = await fetch(`${API_URL}/contact`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(formData),
			});

			const data = await response.json();

			if (response.ok) {
				showToast('Gửi thành công! Chúng tôi sẽ phản hồi sớm.', 'success');
				setFormData({ name: '', email: '', subject: '', message: '' });
			} else {
				showToast(data.message || 'Có lỗi xảy ra.', 'warning');
			}
		} catch (error) {
			console.error('Error:', error);
			showToast('Lỗi kết nối server.', 'error');
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="contact-page-container">
			{}
			{toast && (
				<div className={`local-toast ${toast.type}`}>
					{toast.type === 'success' && <FaCheckCircle />}
					{toast.type === 'error' && <FaExclamationCircle />}
					{toast.type === 'warning' && <FaExclamationTriangle />}
					<span>{toast.message}</span>
				</div>
			)}

			<div className="contact-wrapper">
				<div className="contact-header">
					<h1 className="contact-title">Liên Hệ Với Chúng Tôi</h1>
					<p className="contact-subtitle-1">
						Chúng tôi luôn sẵn sàng lắng nghe ý kiến đóng góp và giải đáp mọi thắc mắc
						của bạn về StoryVerse.
					</p>
				</div>

				<div className="contact-grid">
					<div className="contact-info-col">
						<div className="info-card">
							<h3 className="info-title">Thông Tin Liên Lạc</h3>
							<div className="info-list">
								<a href="#" className="info-item">
									<span className="info-icon">
										<FaMapMarkerAlt />
									</span>
									<span>Dĩ An, Bình Dương, Việt Nam</span>
								</a>
								<a href="mailto:support@storyverse.com" className="info-item">
									<span className="info-icon">
										<FaEnvelope />
									</span>
									<span>support@storyverse.com</span>
								</a>
								<a href="tel:+84123456789" className="info-item">
									<span className="info-icon">
										<FaPhoneAlt />
									</span>
									<span>+84 123 456 789</span>
								</a>
							</div>
						</div>
						<div className="info-card">
							<h3 className="info-title">Mạng Xã Hội</h3>
							<div className="social-links">
								<a
									href="https://facebook.com"
									target="_blank"
									rel="noreferrer"
									className="social-btn fb"
								>
									<FaFacebookF />
								</a>
								<a
									href="https://instagram.com"
									target="_blank"
									rel="noreferrer"
									className="social-btn ins"
								>
									<FaInstagram />
								</a>
								<a
									href="https://youtube.com"
									target="_blank"
									rel="noreferrer"
									className="social-btn ytb"
								>
									<FaYoutube />
								</a>
								<a
									href="https://discord.com"
									target="_blank"
									rel="noreferrer"
									className="social-btn discord"
								>
									<FaDiscord />
								</a>
							</div>
						</div>
					</div>

					<div className="contact-form-card">
						<h3 className="info-title" style={{ marginBottom: '1.5rem' }}>
							Gửi Tin Nhắn
						</h3>
						<form onSubmit={handleSubmit}>
							<div className="form-group">
								<label htmlFor="name" className="form-label">
									Họ và tên
								</label>
								<input
									type="text"
									id="name"
									name="name"
									value={formData.name}
									onChange={handleChange}
									className="form-input"
									placeholder="Nhập họ tên của bạn"
									required
								/>
							</div>
							<div className="form-group">
								<label htmlFor="email" className="form-label">
									Email
								</label>
								<input
									type="email"
									id="email"
									name="email"
									value={formData.email}
									onChange={handleChange}
									className="form-input"
									placeholder="example@email.com"
									required
								/>
							</div>
							<div className="form-group">
								<label htmlFor="subject" className="form-label">
									Chủ đề
								</label>
								<input
									type="text"
									id="subject"
									name="subject"
									value={formData.subject}
									onChange={handleChange}
									className="form-input"
									placeholder="Bạn cần hỗ trợ về vấn đề gì?"
									required
								/>
							</div>
							<div className="form-group">
								<label htmlFor="message" className="form-label">
									Nội dung
								</label>
								<textarea
									id="message"
									name="message"
									value={formData.message}
									onChange={handleChange}
									className="form-textarea"
									placeholder="Viết nội dung tin nhắn của bạn tại đây..."
									required
								></textarea>
							</div>
							<button type="submit" className="submit-btn" disabled={isSubmitting}>
								{isSubmitting ? (
									'Đang gửi...'
								) : (
									<>
										<FaPaperPlane /> Gửi Tin Nhắn
									</>
								)}
							</button>
						</form>
					</div>
				</div>

				<div className="contact-map-section">
					<h3 className="info-title">Bản Đồ Chỉ Dẫn</h3>
					<div className="map-frame">
						<iframe
							title="Google Map KTX Khu B"
							src="https://maps.google.com/maps?q=K%C3%BD%20t%C3%BAc%20x%C3%A1%20Khu%20B%20%C4%90HQG%20TPHCM&t=&z=16&ie=UTF8&iwloc=&output=embed"
							width="100%"
							height="450"
							style={{ border: 0, borderRadius: '0.75rem' }}
							allowFullScreen={true}
							loading="lazy"
							referrerPolicy="no-referrer-when-downgrade"
						></iframe>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ContactPage;