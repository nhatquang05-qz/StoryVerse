// src/types/userTypes.ts

export interface Address {
    id: string;
    street: string;
    ward: string;
    district: string;
    city: string;
    isDefault: boolean;
}

export interface User {
  id: string; // Hoặc number tùy CSDL của bạn trả về gì, nhưng string an toàn hơn
  email: string;
  fullName: string;
  phone: string;
  addresses: Address[];
  coinBalance: number;
  lastDailyLogin: string; // Hoặc Date nếu bạn parse nó
  consecutiveLoginDays: number;
  level: number;
  exp: number; // Đảm bảo đây là number
  avatarUrl: string;
  // Thêm các trường khác nếu có, ví dụ: role: 'admin' | 'user';
}

// Bạn có thể định nghĩa thêm các kiểu liên quan đến user ở đây