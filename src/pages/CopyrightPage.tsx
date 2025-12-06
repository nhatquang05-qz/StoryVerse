import React from 'react';
import { Link } from 'react-router-dom';
import { FaShieldAlt, FaCopyright, FaGavel, FaFileSignature, FaUserSecret, FaExclamationTriangle } from 'react-icons/fa';
import '../assets/styles/CopyrightPage.css';

const CopyrightPage: React.FC = () => {
    return (
        <div className="copyright-page">
            {}

            <div className="copyright-container">
                {}
                <header className="copyright-header">
                    <div className="icon-wrapper">
                        <FaShieldAlt />
                    </div>
                    <h1>Bản Quyền & Sở Hữu Trí Tuệ</h1>
                    <p className="subtitle">
                        Chính sách bảo vệ quyền lợi tác giả và người dùng tại StoryVerse.
                    </p>
                    <div className="header-divider"></div>
                </header>

                {}
                <div className="copyright-grid">
                    <div className="policy-card">
                        <div className="card-header">
                            <div className="card-icon"><FaCopyright /></div>
                            <h3>1. Bản Quyền Nền Tảng</h3>
                        </div>
                        <p>
                            Toàn bộ thiết kế, mã nguồn, logo, giao diện và các tài sản trí tuệ khác thuộc về <strong>StoryVerse</strong>. 
                            Nghiêm cấm sao chép, chỉnh sửa hoặc tái sử dụng cho mục đích thương mại mà không có sự đồng ý bằng văn bản từ chúng tôi.
                        </p>
                    </div>

                    <div className="policy-card">
                        <div className="card-header">
                            <div className="card-icon"><FaUserSecret /></div>
                            <h3>2. Quyền Của Tác Giả</h3>
                        </div>
                        <p>
                            Tác giả giữ toàn quyền sở hữu đối với truyện tranh, nội dung và hình ảnh họ đăng tải. 
                            Bằng việc đăng tải, tác giả cấp cho StoryVerse quyền hiển thị, quảng bá và phân phối nội dung đó trên nền tảng nhằm mục đích tiếp cận độc giả.
                        </p>
                    </div>

                    <div className="policy-card">
                        <div className="card-header">
                            <div className="card-icon"><FaFileSignature /></div>
                            <h3>3. Trách Nhiệm Người Dùng</h3>
                        </div>
                        <p>
                            Người dùng không được phép re-up (đăng lại), dịch thuật trái phép hoặc phát tán các nội dung có bản quyền ra ngoài nền tảng StoryVerse.
                            Mọi hành vi vi phạm bản quyền sẽ bị xử lý nghiêm ngặt, bao gồm việc khóa tài khoản vĩnh viễn và truy cứu trách nhiệm.
                        </p>
                    </div>

                    <div className="policy-card">
                        <div className="card-header">
                            <div className="card-icon"><FaGavel /></div>
                            <h3>4. Xử Lý Vi Phạm DMCA</h3>
                        </div>
                        <p>
                            Chúng tôi tuân thủ nghiêm ngặt đạo luật DMCA. Nếu bạn phát hiện nội dung của mình bị xâm phạm bản quyền trên StoryVerse, 
                            vui lòng gửi báo cáo ngay lập tức kèm theo bằng chứng xác thực. Chúng tôi cam kết xử lý và gỡ bỏ nội dung vi phạm trong vòng 24h.
                        </p>
                    </div>
                </div>

                {}
                <div className="report-section">
                    <div className="report-content">
                        <FaExclamationTriangle className="warning-icon" />
                        <div className="report-text">
                            <h3>Báo cáo vi phạm bản quyền</h3>
                            <p>Nếu bạn phát hiện hành vi xâm phạm, hãy liên hệ ngay với chúng tôi.</p>
                        </div>
                    </div>
                    <Link to="/contact" className="report-btn">Gửi Báo Cáo</Link>
                </div>

                <div className="copyright-footer">
                    <p>Hiệu lực từ ngày: {new Date().toLocaleDateString('vi-VN')}</p>
                </div>
            </div>
        </div>
    );
};

export default CopyrightPage;