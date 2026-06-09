# StoryVerse API Server

Đây là phần Backend API Server của nền tảng **StoryVerse** – hệ thống tích hợp đọc truyện trực tuyến, thương mại điện tử, mạng xã hội và trợ lý ảo AI. Server được xây dựng trên nền tảng Node.js & Express, sử dụng MySQL làm hệ quản trị cơ sở dữ liệu chính và hỗ trợ các kết nối thời gian thực (realtime).

## 🛠 Công nghệ và Thư viện sử dụng

- **Runtime Environment:** Node.js
- **Framework:** Express.js
- **Database:** MySQL (Kết nối và truy vấn dữ liệu hệ thống)
- **Realtime Communication:** Socket.io (Hệ thống chat chapter, chat cộng đồng)
- **Authentication:** JSON Web Token (JWT) & Google/Facebook OAuth
- **File Storage:** Cloudinary (Quản lý và lưu trữ hình ảnh truyện, avatar, ảnh bài đăng)
- **AI Integration:** Groq SDK (Xử lý phản hồi thông minh của Chatbot)
- **Payment Gateway:** VNPay (Xử lý giao dịch nạp coin và mua sắm vật lý)
- **Email Service:** Nodemailer (Gửi mã OTP, thông báo hệ thống, newsletter)

## 📂 Cấu trúc thư mục Backend

```text
backend/
├── src/
│   ├── config/           # Cấu hình kết nối Database, Cloudinary, AppConfig
│   ├── controllers/      # Điều hướng và xử lý logic request/response (Auth, Comic, Cart, Chat,...)
│   ├── db/               # Thiết lập kết nối cơ sở dữ liệu gốc (connection.js)
│   ├── middleware/       # Các tầng kiểm tra trung gian (Xác thực JWT, phân quyền Admin/User)
│   ├── models/           # Định nghĩa cấu trúc bảng và thực thể Database (UserModel, ComicModel,...)
│   ├── routes/           # Định tuyến các endpoints API hệ thống (index.js điều hướng tập trung)
│   ├── services/         # Tầng xử lý logic nghiệp vụ chuyên sâu (Tương tác AI, tính toán Ranking, Event)
│   └── utils/            # Các hàm tiện ích bổ trợ (Socket helper, mã hóa, transaction generator)
├── server.js             # File khởi tạo kết nối socket, database và chạy server chính
├── src/app.js            # Cấu hình Express app, CORS, các route tổng và xử lý lỗi hệ thống
├── .env.example          # File mẫu cấu hình các biến môi trường
└── package.json          # Quản lý các gói thư viện phụ thuộc và scripts chạy dự án
```

## 🚀 Hướng dẫn cài đặt và khởi chạy

### 1. Yêu cầu hệ thống
- **Node.js** (Phiên bản 18.x hoặc cao hơn)
- **MySQL Server** (Đang chạy cục bộ qua XAMPP, MySQL Workbench hoặc trên Cloud)

### 2. Các bước cài đặt

Di chuyển vào thư mục backend từ thư mục gốc của dự án:
```bash
cd backend
```

Cài đặt toàn bộ các gói thư viện phụ thuộc:
```bash
npm install
```

### 3. Cấu hình môi trường (`.env`)

1. Tạo một file có tên là `.env` dựa trên file mẫu có sẵn:
   ```bash
   cp .env.example .env
   ```
2. Mở file `.env` vừa tạo và điền đầy đủ thông tin cấu hình của bạn:
   - Thông tin kết nối MySQL (`DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`).
   - Khóa bảo mật `JWT_SECRET`.
   - Các API Key tích hợp (`CLOUDINARY`, `GROQ_API_KEY`, `VNP_HASH_SECRET`, cấu hình SMTP gửi Mail).

### 4. Khởi chạy Server

Chạy server ở chế độ phát triển (Development):
```bash
npm run dev
```
*Hoặc khởi chạy thông thường:*
```bash
npm start
```

Server sẽ mặc định khởi chạy tại địa chỉ: `http://localhost:3000`

## 🔒 Các API Endpoints chính

Hệ thống cung cấp cấu trúc định tuyến API dạng mã nguồn mở theo chuẩn RESTful tại tiền tố `/api`:
- **Auth & Users:** `/api/auth`, `/api/users` (Đăng ký, đăng nhập, hồ sơ, cấp độ)
- **Comics & Chapters:** `/api/comics` (Danh sách truyện, thể loại, chương đọc, lượt xem)
- **E-Commerce:** `/api/cart`, `/api/orders`, `/api/vouchers` (Giỏ hàng, thanh toán, mã giảm giá)
- **Realtime Interaction:** `/api/chat`, `/api/community`, `/api/posts` (Mạng xã hội, phòng chat)
- **Smart Utilities:** `/api/chatbot` (Giao tiếp với mô hình AI trợ lý)
- **Admin Management:** `/api/admin` (Dashboard thống kê doanh thu, duyệt avatar, báo cáo vi phạm)