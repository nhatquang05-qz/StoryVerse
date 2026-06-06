import React from 'react';
import { Link } from 'react-router-dom';
import {
	FaUserShield,
	FaDatabase,
	FaServer,
	FaUserLock,
	FaHandHoldingHeart,
	FaInfoCircle,
} from 'react-icons/fa';
import '../assets/styles/LegalPage.css';

const PrivacyPolicyPage: React.FC = () => {
	return (
		<div className="sv-legal-page">
			<div className="sv-legal-container">
				<header className="sv-legal-header">
					<div className="sv-legal-icon-wrapper">
						<FaUserShield />
					</div>
					<h1 className="sv-legal-title">Chính Sách Bảo Mật</h1>
					<p className="sv-legal-subtitle">
						Cam kết bảo vệ thông tin và quyền riêng tư của người dùng.
					</p>
					<div className="sv-legal-divider"></div>
				</header>

				<div className="sv-legal-grid">
					<div className="sv-legal-card">
						<div className="sv-legal-card-header">
							<div className="sv-legal-card-icon">
								<FaInfoCircle />
							</div>
							<h3>1. Giới thiệu</h3>
						</div>
						<p>
							Chào mừng bạn đến với StoryVerse. Chúng tôi cam kết bảo vệ thông tin cá
							nhân của bạn. Chính sách này giải thích cách chúng tôi quản lý dữ liệu
							khi bạn sử dụng dịch vụ của chúng tôi.
						</p>
					</div>

					<div className="sv-legal-card">
						<div className="sv-legal-card-header">
							<div className="sv-legal-card-icon">
								<FaDatabase />
							</div>
							<h3>2. Dữ liệu thu thập</h3>
						</div>
						<ul>
							<li>
								<strong>Danh tính:</strong> Tên, tên người dùng.
							</li>
							<li>
								<strong>Liên hệ:</strong> Email, số điện thoại.
							</li>
							<li>
								<strong>Kỹ thuật:</strong> IP, loại trình duyệt, vị trí.
							</li>
							<li>
								<strong>Sử dụng:</strong> Lịch sử đọc, tương tác trên web.
							</li>
						</ul>
					</div>

					<div className="sv-legal-card">
						<div className="sv-legal-card-header">
							<div className="sv-legal-card-icon">
								<FaServer />
							</div>
							<h3>3. Mục đích sử dụng</h3>
						</div>
						<ul>
							<li>Đăng ký và quản lý tài khoản khách hàng.</li>
							<li>Xử lý đơn hàng và thanh toán.</li>
							<li>Cải thiện trải nghiệm và dịch vụ.</li>
							<li>Gửi thông báo quan trọng về tài khoản.</li>
						</ul>
					</div>

					<div className="sv-legal-card">
						<div className="sv-legal-card-header">
							<div className="sv-legal-card-icon">
								<FaUserLock />
							</div>
							<h3>4. Bảo mật dữ liệu</h3>
						</div>
						<p>
							Chúng tôi áp dụng các biện pháp an ninh nghiêm ngặt để ngăn chặn dữ liệu
							bị mất, đánh cắp hoặc truy cập trái phép. Chỉ nhân viên có thẩm quyền
							mới được phép truy cập dữ liệu cần thiết cho công việc.
						</p>
					</div>

					<div className="sv-legal-card" style={{ gridColumn: '1 / -1' }}>
						<div className="sv-legal-card-header">
							<div className="sv-legal-card-icon">
								<FaHandHoldingHeart />
							</div>
							<h3>5. Quyền của bạn</h3>
						</div>
						<p>
							Bạn có quyền yêu cầu truy cập, chỉnh sửa, xóa hoặc hạn chế việc xử lý dữ
							liệu cá nhân của mình. Bạn cũng có quyền rút lại sự đồng ý bất cứ lúc
							nào đối với các dữ liệu chúng tôi thu thập dựa trên sự đồng thuận.
						</p>
					</div>
				</div>

				<div className="sv-legal-report-section">
					<div className="sv-legal-report-content">
						<FaUserShield className="sv-legal-warning-icon" />
						<div className="sv-legal-report-text">
							<h3>Yêu cầu về quyền riêng tư?</h3>
							<p>Nếu bạn muốn thực hiện quyền của mình hoặc có câu hỏi về bảo mật.</p>
						</div>
					</div>
					<Link to="/contact" className="sv-legal-report-btn">
						Liên Hệ Hỗ Trợ
					</Link>
				</div>

				<div className="sv-legal-footer">
					<p>Cập nhật lần cuối: 04/12/2025</p>
				</div>
			</div>
		</div>
	);
};

export default PrivacyPolicyPage;
