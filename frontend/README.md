# StoryVerse - Frontend Client

Đây là giao diện người dùng (Client-side) của nền tảng **StoryVerse**. Ứng dụng được xây dựng theo kiến trúc Single Page Application (SPA) nhằm mang lại trải nghiệm mượt mà, tốc độ phản hồi nhanh chóng cho người dùng khi đọc truyện, mua sắm, tương tác cộng đồng và chơi minigame.

## 🛠 Công nghệ sử dụng

- **Core:** ReactJS, TypeScript
- **Build Tool:** Vite (Tối ưu hóa tốc độ build và Hot Module Replacement)
- **State Management:** React Context API (Quản lý Auth, Cart, Theme, Notifications,...)
- **Styling:** Thuần CSS (Tổ chức theo từng component/page trong thư mục `assets/styles`)
- **Routing:** React Router DOM
- **Tương tác thời gian thực:** Socket.io-client (dành cho Chat, Comment realtime)

## 🌟 Tính năng chính trên Frontend

- **Hệ thống đọc truyện (Reader):** Giao diện đọc mượt mà, tùy chỉnh theme (sáng/tối), lưu lịch sử đọc.
- **Thương mại điện tử:** Danh sách sản phẩm vật lý/digital, Giỏ hàng, Thanh toán, Lịch sử giao dịch, Nạp Coin.
- **Mạng xã hội (Community):** Đăng bài viết, bình luận, tương tác, thả cảm xúc, chat realtime có hỗ trợ sticker (Én, Thỏ 7 Màu,...).
- **Trợ lý AI (Chatbot):** Giao diện chat thông minh hỗ trợ giải đáp thắc mắc người dùng trực tiếp trên nền tảng.
- **Minigame & Sự kiện:** Giao diện tương tác sinh động cho các sự kiện (Vòng quay may mắn, Cây nguyện ước, Rơi tuyết Giáng sinh,...).
- **Admin Dashboard:** Khu vực quản trị riêng biệt với các biểu đồ thống kê, quản lý truyện, chương, người dùng, báo cáo và kiểm duyệt Avatar.

## 📂 Cấu trúc thư mục Frontend

```text
frontend/
├── public/               # Các file tĩnh (Favicon, robots.txt,...)
├── src/
│   ├── assets/           # Tài nguyên tĩnh: images, cursors, fonts, và toàn bộ file .css
│   ├── components/       # Các UI Component dùng chung, chia theo module:
│   │   ├── admin/        # Components cho trang quản trị (Forms, Tables, Sidebar)
│   │   ├── chatbot/      # Giao diện và logic của AI Chatbot
│   │   ├── common/       # Components tái sử dụng (Header, Footer, Pagination, Carts)
│   │   ├── community/    # Components mạng xã hội (PostItem, CommentSection)
│   │   ├── minigame/     # Hiệu ứng và UI cho minigame (Snowfall, WishingTree)
│   │   └── popups/       # Các Modal/Dialog (Confirm, Báo cáo, LevelUp, Cảnh báo)
│   ├── contexts/         # React Context (AuthContext, CartContext, Theme, Toast,...)
│   ├── data/             # Dữ liệu tĩnh (Mock data)
│   ├── pages/            # Các trang giao diện chính (HomePage, ComicDetailPage, Checkout,...)
│   ├── types/            # Định nghĩa Interface/Type của TypeScript (userTypes, comicTypes,...)
│   ├── utils/            # Các hàm tiện ích (Validate, Auth Utils, format dữ liệu)
│   ├── App.tsx           # File Root Component cấu hình Layout và Routing
│   └── main.tsx          # Điểm khởi chạy của ứng dụng React
├── .env.example          # File mẫu chứa các biến môi trường
├── eslint.config.js      # Cấu hình linter chuẩn format code
├── tsconfig.json         # Cấu hình TypeScript
└── package.json          # Quản lý thư viện và scripts
```

## 🚀 Hướng dẫn cài đặt và chạy môi trường Development

### 1. Cài đặt thư viện

Mở terminal tại thư mục `frontend` và chạy lệnh:

```bash
npm install
```

### 2. Cấu hình biến môi trường

Tạo file `.env` từ file mẫu:

```bash
cp .env.example .env
```

Sau đó, điền các thông tin cần thiết vào file `.env` (ví dụ: `VITE_API_BASE_URL`, Client ID của Google/Facebook, cấu hình Cloudinary,...).

### 3. Khởi chạy ứng dụng

Chạy server phát triển của Vite:

```bash
npm run dev
```

Ứng dụng sẽ mặc định chạy tại địa chỉ: `http://localhost:5173` (hoặc cổng khác do Vite cấp nếu 5173 đã bị chiếm).

### 4. Build dự án (Dành cho Production)

Để đóng gói mã nguồn và tối ưu hóa trước khi deploy:

```bash
npm run build
```
Thư mục `dist/` sẽ được tạo ra, chứa toàn bộ mã tĩnh đã được minify để sẵn sàng đưa lên server.