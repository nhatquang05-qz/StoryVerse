import React, { useState, useMemo } from 'react';
import '../assets/styles/FAQPage.css';

interface FAQItem {
  id: string;
  category: string;
  question: string;
  answer: string;
}

const FAQ_DATA: FAQItem[] = [
  {
    id: '1',
    category: 'Tài khoản',
    question: 'Làm thế nào để tạo tài khoản StoryVerse?',
    answer: 'Bạn có thể nhấp vào nút "Đăng ký" ở góc trên bên phải màn hình. Điền đầy đủ thông tin email, tên đăng nhập và mật khẩu để tạo tài khoản mới. Bạn cũng có thể đăng nhập nhanh bằng Google.'
  },
  {
    id: '2',
    category: 'Tài khoản',
    question: 'Tôi quên mật khẩu thì phải làm sao?',
    answer: 'Tại trang Đăng nhập, hãy chọn "Quên mật khẩu". Nhập email bạn đã đăng ký, hệ thống sẽ gửi một liên kết để bạn thiết lập lại mật khẩu mới.'
  },
  {
    id: '3',
    category: 'Truyện & Đọc',
    question: 'Làm sao để tìm kiếm truyện tranh?',
    answer: 'Bạn có thể sử dụng thanh tìm kiếm trên Header hoặc truy cập trang "Khám phá" để lọc truyện theo thể loại, tác giả hoặc độ phổ biến.'
  },
  {
    id: '4',
    category: 'Truyện & Đọc',
    question: 'Tại sao có chapter bị khóa?',
    answer: 'Một số chapter đặc biệt yêu cầu bạn phải dùng Xu để mở khóa. Việc này nhằm ủng hộ tác giả và duy trì nền tảng truyện bản quyền.'
  },
  {
    id: '5',
    category: 'Xu & Thanh toán',
    question: 'Làm thế nào để nạp Xu vào tài khoản?',
    answer: 'Truy cập trang "Nạp Xu", chọn gói nạp phù hợp và phương thức thanh toán. Xu sẽ được cộng ngay sau khi thanh toán thành công.'
  },
  {
    id: '6',
    category: 'Đơn hàng',
    question: 'Bao lâu tôi sẽ nhận được truyện tranh giấy?',
    answer: 'Thời gian giao hàng thường từ 3-5 ngày làm việc tùy thuộc vào địa chỉ của bạn. Bạn có thể theo dõi đơn hàng trong phần Lịch sử giao dịch.'
  },
   {
    id: '7',
    category: 'Cộng đồng',
    question: 'Làm sao để báo cáo bình luận vi phạm?',
    answer: 'Tại mỗi bình luận, nhấn vào dấu 3 chấm và chọn "Báo cáo". Admin sẽ xem xét và xử lý trong vòng 24h.'
  }
];

const CATEGORIES = ['Tất cả', 'Tài khoản', 'Truyện & Đọc', 'Xu & Thanh toán', 'Đơn hàng', 'Cộng đồng'];

const FAQPage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('Tất cả');
  const [searchTerm, setSearchTerm] = useState('');
  const [openId, setOpenId] = useState<string | null>(null);

  const filteredFAQs = useMemo(() => {
    return FAQ_DATA.filter(item => {
      const matchesCategory = activeCategory === 'Tất cả' || item.category === activeCategory;
      const matchesSearch = item.question.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            item.answer.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchTerm]);

  const toggleAccordion = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <div className="faq-page-wrapper">
      
      {/* Hero Section */}
      <section className="faq-hero">
        <h1 className="faq-title">Câu hỏi thường gặp</h1>
        <p className="faq-hero-desc">Tìm kiếm câu trả lời nhanh chóng cho các vấn đề tại StoryVerse</p>
        
        <div className="faq-search-wrapper">
          <input
            type="text"
            placeholder="Nhập từ khóa (ví dụ: xu, mật khẩu, truyện)..."
            className="faq-search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="faq-search-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </section>

      <div className="faq-content-container">
        {/* Category Filter */}
        <div className="faq-categories">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`category-btn ${activeCategory === cat ? 'active' : ''}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* FAQ List */}
        <div className="faq-list">
          {filteredFAQs.length > 0 ? (
            filteredFAQs.map((item) => (
              <div key={item.id} className="faq-item">
                <button 
                  className="faq-question"
                  onClick={() => toggleAccordion(item.id)}
                >
                  <span>{item.question}</span>
                  <span className={`faq-toggle-icon ${openId === item.id ? 'rotate' : ''}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </button>
                <div className={`faq-answer ${openId === item.id ? 'open' : ''}`}>
                  <div className="faq-answer-content">
                    {item.answer}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="faq-no-result">
              <p>Không tìm thấy kết quả phù hợp.</p>
            </div>
          )}
        </div>

        {/* Contact Support */}
        <div className="faq-contact-box">
          <h3>Bạn vẫn cần hỗ trợ?</h3>
          <p>Đội ngũ của chúng tôi luôn sẵn sàng giải đáp thắc mắc của bạn.</p>
          <a href="/contact" className="contact-btn">
            Liên hệ ngay
          </a>
        </div>
      </div>
    </div>
  );
};

export default FAQPage;