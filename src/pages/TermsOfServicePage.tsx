import React from 'react';
import { Link } from 'react-router-dom';
import {
	FaFileContract,
	FaUserCheck,
	FaGavel,
	FaBan,
	FaSyncAlt,
	FaCopyright,
	FaEnvelopeOpenText,
} from 'react-icons/fa';
import '../assets/styles/LegalPage.css';

const TermsOfServicePage: React.FC = () => {
	return (
		<div className="sv-legal-page">
			<div className="sv-legal-container">
				<header className="sv-legal-header">
					<div className="sv-legal-icon-wrapper">
						<FaFileContract />
					</div>
					<h1 className="sv-legal-title">Điều Khoản Dịch Vụ</h1>
					<p className="sv-legal-subtitle">
						Quy định và điều kiện sử dụng nền tảng StoryVerse.
					</p>
					<div className="sv-legal-divider"></div>
				</header>

				<div className="sv-legal-grid">
					<div className="sv-legal-card">
						<div className="sv-legal-card-header">
							<div className="sv-legal-card-icon">
								<FaFileContract />
							</div>
							<h3>1. Chấp nhận điều khoản</h3>
						</div>
						<p>
							Bằng cách truy cập và sử dụng trang web StoryVerse, bạn đồng ý tuân thủ
							và bị ràng buộc bởi các Điều khoản dịch vụ này. Nếu bạn không đồng ý với
							bất kỳ phần nào của các điều khoản này, bạn không được phép truy cập
							trang web.
						</p>
					</div>

					<div className="sv-legal-card">
						<div className="sv-legal-card-header">
							<div className="sv-legal-card-icon">
								<FaUserCheck />
							</div>
							<h3>2. Tài khoản người dùng</h3>
						</div>
						<p>
							Bạn chịu trách nhiệm duy trì tính bảo mật của tài khoản và mật khẩu của
							mình. Bạn đồng ý chịu trách nhiệm cho mọi hoạt động hoặc hành động xảy
							ra dưới tài khoản và/hoặc mật khẩu của mình.
						</p>
					</div>

					<div className="sv-legal-card">
						<div className="sv-legal-card-header">
							<div className="sv-legal-card-icon">
								<FaCopyright />
							</div>
							<h3>3. Quyền sở hữu trí tuệ</h3>
						</div>
						<p>
							Dịch vụ và nội dung gốc là tài sản độc quyền của StoryVerse. Nội dung
							truyện tranh được đăng tải thuộc bản quyền của tác giả hoặc nhà xuất bản
							tương ứng. StoryVerse chỉ đóng vai trò là nền tảng phân phối.
						</p>
					</div>

					<div className="sv-legal-card">
						<div className="sv-legal-card-header">
							<div className="sv-legal-card-icon">
								<FaBan />
							</div>
							<h3>4. Hành vi bị cấm</h3>
						</div>
						<ul>
							<li>Đăng tải nội dung vi phạm pháp luật, đe dọa, lạm dụng.</li>
							<li>Mạo danh bất kỳ cá nhân hoặc tổ chức nào.</li>
							<li>Gây cản trở hoặc gián đoạn Dịch vụ.</li>
							<li>Sử dụng ngôn từ thô tục, xúc phạm trong bình luận/chat.</li>
						</ul>
					</div>

					<div className="sv-legal-card">
						<div className="sv-legal-card-header">
							<div className="sv-legal-card-icon">
								<FaGavel />
							</div>
							<h3>5. Chấm dứt quyền truy cập</h3>
						</div>
						<p>
							Chúng tôi có thể chấm dứt hoặc đình chỉ quyền truy cập của bạn ngay lập
							tức mà không cần báo trước nếu bạn vi phạm các Điều khoản này, nhằm đảm
							bảo môi trường an toàn cho cộng đồng.
						</p>
					</div>

					<div className="sv-legal-card">
						<div className="sv-legal-card-header">
							<div className="sv-legal-card-icon">
								<FaSyncAlt />
							</div>
							<h3>6. Thay đổi điều khoản</h3>
						</div>
						<p>
							Chúng tôi bảo lưu quyền sửa đổi các Điều khoản này bất kỳ lúc nào. Nếu
							bản sửa đổi là quan trọng, chúng tôi sẽ cố gắng thông báo ít nhất 30
							ngày trước khi áp dụng.
						</p>
					</div>
				</div>

				<div className="sv-legal-report-section">
					<div className="sv-legal-report-content">
						<FaEnvelopeOpenText className="sv-legal-warning-icon" />
						<div className="sv-legal-report-text">
							<h3>Thắc mắc về Điều khoản?</h3>
							<p>
								Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ với đội ngũ hỗ trợ.
							</p>
						</div>
					</div>
					<Link to="/contact" className="sv-legal-report-btn">
						Liên Hệ Ngay
					</Link>
				</div>

				<div className="sv-legal-footer">
					<p>Cập nhật lần cuối: 01/12/2025</p>
				</div>
			</div>
		</div>
	);
};

export default TermsOfServicePage;