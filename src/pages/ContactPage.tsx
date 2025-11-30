import React, { useState } from 'react';
import { 
  FaFacebookF, 
  FaInstagram, 
  FaYoutube, 
  FaDiscord,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaEnvelope,
  FaPaperPlane
} from 'react-icons/fa';
import '../assets/styles/ContactPage.css';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    setTimeout(() => {
      console.log('Form data submitted:', formData);
      alert('Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi sớm nhất có thể.');
      setFormData({ name: '', email: '', subject: '', message: '' });
      setIsSubmitting(false);
    }, 1500);
  };

  return (
    <div className="contact-page-container">
      <div className="contact-wrapper">
        <div className="contact-header">
          <h1 className="contact-title">Liên Hệ Với Chúng Tôi</h1>
          <p className="contact-subtitle">
            Chúng tôi luôn sẵn sàng lắng nghe ý kiến đóng góp và giải đáp mọi thắc mắc của bạn về StoryVerse.
          </p>
        </div>

        <div className="contact-grid">
          <div className="contact-info-col">
            <div className="info-card">
              <h3 className="info-title">Thông Tin Liên Lạc</h3>
              <div className="info-list">
                <a href="#" className="info-item">
                  <span className="info-icon"><FaMapMarkerAlt /></span>
                  <span>Dĩ An, Bình Dương, Việt Nam</span>
                </a>
                <a href="mailto:support@storyverse.com" className="info-item">
                  <span className="info-icon"><FaEnvelope /></span>
                  <span>support@storyverse.com</span>
                </a>
                <a href="tel:+84123456789" className="info-item">
                  <span className="info-icon"><FaPhoneAlt /></span>
                  <span>+84 123 456 789</span>
                </a>
              </div>
            </div>

            <div className="info-card">
              <h3 className="info-title">Mạng Xã Hội</h3>
              <p style={{ color: 'var(--clr-text-secondary, #94a3b8)', marginBottom: '1.5rem' }}>
                Theo dõi chúng tôi để cập nhật những truyện mới nhất và các sự kiện hấp dẫn.
              </p>
              <div className="social-links">
                <a href="https://facebook.com" target="_blank" rel="noreferrer" className="social-btn fb">
                  <FaFacebookF />
                </a>
                <a href="https://instagram.com" target="_blank" rel="noreferrer" className="social-btn ins">
                  <FaInstagram />
                </a>
                <a href="https://youtube.com" target="_blank" rel="noreferrer" className="social-btn ytb">
                  <FaYoutube />
                </a>
                <a href="https://discord.com" target="_blank" rel="noreferrer" className="social-btn discord">
                  <FaDiscord />
                </a>
              </div>
            </div>
          </div>

          <div className="contact-form-card">
            <h3 className="info-title" style={{ marginBottom: '2rem' }}>Gửi Tin Nhắn</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name" className="form-label">Họ và tên</label>
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
                <label htmlFor="email" className="form-label">Email</label>
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
                <label htmlFor="subject" className="form-label">Chủ đề</label>
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
                <label htmlFor="message" className="form-label">Nội dung</label>
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
                {isSubmitting ? 'Đang gửi...' : (
                  <>
                    Gửi Tin Nhắn <FaPaperPlane />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;