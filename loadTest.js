import http from 'k6/http';
import { sleep, check } from 'k6';

export const options = {
  stages: [
    { duration: '10s', target: 2000 }, 
    { duration: '30s', target: 5000 },
    { duration: '10s', target: 0 },
  ],
  thresholds: {
    http_req_failed: ['rate<0.01'],
  },
};

export default function () {
  // 1. Dán Token bạn vừa copy từ Postman vào đây
  const myToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAwMDAwMTEsImVtYWlsIjoiZHVvbmduZ3V5ZW5uaGF0cXVhbmdAZ21haWwuY29tIiwiaWF0IjoxNzY1NzQ1MzczLCJleHAiOjE3NjU3NDg5NzN9.FYzfGtaP4Nei1AzGdPP5sRWC_Z_UPvK3yQgb3dyNYGg"; 

  // 2. Tạo Header chứa Token (Giống hệt cách bạn làm trong Postman)
  const params = {
    headers: {
      'Authorization': `Bearer ${myToken}`,
      'Content-Type': 'application/json',
    },
  };

  // 3. Gửi request kèm theo params
  // Ví dụ test route lấy thông tin cá nhân (Cần đăng nhập)
  const res = http.get('http://localhost:3000/api/users/me', params);

  check(res, {
    'status is 200': (r) => r.status === 200, // Nếu Token đúng, nó sẽ ra 200
    'status is not 401': (r) => r.status !== 401, // Kiểm tra xem có bị chặn không
  });

  sleep(1);
}