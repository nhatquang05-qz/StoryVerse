# StoryVerse

StoryVerse là một nền tảng full-stack kết hợp giữa trải nghiệm đọc truyện trực tuyến, thương mại điện tử và mạng xã hội. Hệ thống được thiết kế để mang lại không gian tương tác liền mạch, cho phép người dùng vừa thưởng thức các tác phẩm yêu thích, vừa có thể giao lưu, mua sắm và sử dụng các tiện ích thông minh.

## 🚀 Tính năng nổi bật

- **Đọc truyện trực tuyến:** Trải nghiệm đọc mượt mà với thư viện truyện đa dạng.
- **Thương mại điện tử:** Hệ thống mua bán, giỏ hàng và thanh toán trực tuyến.
- **Mạng xã hội & Tương tác:** Tính năng cộng đồng, bình luận và hệ thống chat realtime (thời gian thực).
- **AI Chatbot:** Tích hợp trợ lý ảo thông minh để hỗ trợ và giải đáp cho người dùng.
- **Quản lý hệ thống:** Dashboard dành cho Admin để kiểm duyệt nội dung, quản lý người dùng và theo dõi doanh thu.

## 🛠 Công nghệ sử dụng

**Frontend:**
- ReactJS
- TypeScript
- Vite

**Backend:**
- Node.js
- Express.js

**Database:**
- MySQL

## 📦 Hướng dẫn cài đặt và khởi chạy

### Yêu cầu hệ thống
- Node.js (khuyến nghị bản LTS)
- MySQL Server (đang chạy cục bộ hoặc trên Cloud)

### Các bước thực hiện

1. **Clone repository:**
   ```bash
   git clone [https://github.com/nhatquang05-qz/storyverse.git](https://github.com/nhatquang05-qz/storyverse.git)
   cd storyverse
   ```

2. **Cài đặt thư viện cho Backend:**
   ```bash
   cd backend
   npm install
   ```

3. **Cài đặt thư viện cho Frontend:**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Cấu hình môi trường (.env):**
   - Tạo file `.env` tương ứng trong thư mục `backend` và `frontend`.
   - Bổ sung các cấu hình cần thiết (như thông tin kết nối MySQL `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, biến môi trường cho cổng server, secret keys, cấu hình thanh toán/AI,...).

5. **Chạy dự án ở môi trường Development:**

   Mở 2 terminal để chạy song song Frontend và Backend.

   - **Terminal 1 (Backend):**
     ```bash
     cd backend
     npm start
     ```
   - **Terminal 2 (Frontend):**
     ```bash
     cd frontend
     npm run dev
     ```

## 📂 Cấu trúc thư mục dự án

```text
StoryVerse/
├── backend/       # Mã nguồn server, APIs, Models, Controllers,...
├── frontend/      # Mã nguồn UI, Components, Pages, State management,...
└── README.md      # Tài liệu giới thiệu dự án
```

