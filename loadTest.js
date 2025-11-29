import http from 'k6/http';
import { sleep, check } from 'k6';

// Cấu hình bài test
export const options = {
  // Giai đoạn 1: Tăng dần từ 0 lên 1000 user trong 10s (Ramp-up)
  // Giai đoạn 2: Duy trì 1000 user trong 30s (Plateau)
  // Giai đoạn 3: Giảm từ 1000 về 0 user trong 10s (Ramp-down)
  stages: [
    { duration: '10s', target: 2000 }, 
    { duration: '30s', target: 5000 },
    { duration: '10s', target: 0 },
  ],
  
  // Thiết lập tiêu chuẩn đạt (Thresholds)
  thresholds: {
    http_req_failed: ['rate<0.01'], // Tỉ lệ lỗi phải dưới 1%
    http_req_duration: ['p(95)<500'], // 95% số request phải phản hồi dưới 500ms
  },
};

export default function () {
  // [QUAN TRỌNG] Thay đổi URL này thành URL server local của bạn
  // Nhớ là server backend phải đang chạy (npm start)
  // Thử test API có cache để xem hiệu quả
  const res = http.get('https://localhost:3000/api/comics?limit=100');

  // Kiểm tra xem request có thành công không (Status 200)
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });

  // Mỗi user ảo (VU) nghỉ 1 giây rồi mới gọi tiếp (giả lập hành vi đọc lướt)
  sleep(1);
}