// src/contexts/AuthContext.tsx
import React, { createContext, useState, useContext, type ReactNode, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  // Thêm các thông tin khác nếu cần: name, avatarUrl,...
}

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, pass: string) => Promise<void>; // Giả lập async
  register: (email: string, pass: string) => Promise<void>; // Giả lập async
  logout: () => Promise<void>; // Giả lập async
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Hàm đăng nhập giả
  const login = async (email: string, pass: string) => {
    console.log('Attempting login (mock):', email, pass);
    // Trong thực tế, bạn sẽ gọi API ở đây
    // Giả sử đăng nhập thành công nếu email và pass không rỗng
    if (email && pass) {
        const mockUser: User = { id: 'user-' + Date.now(), email: email };
        setCurrentUser(mockUser);
        // Lưu trạng thái đăng nhập (ví dụ: localStorage) - Sẽ làm sau
        console.log('Mock login successful:', mockUser);
    } else {
        throw new Error('Invalid credentials (mock)');
    }
  };

  // Hàm đăng ký giả
  const register = async (email: string, pass: string) => {
    console.log('Attempting register (mock):', email, pass);
    // Trong thực tế, bạn sẽ gọi API ở đây
    // Giả sử đăng ký luôn thành công
    if (!email || !pass) throw new Error("Email/Pass required (mock)");
    console.log('Mock register successful for:', email);
    // Không tự động đăng nhập sau khi đăng ký ở bản giả lập này
  };

  // Hàm đăng xuất giả
  const logout = async () => {
    console.log('Attempting logout (mock)');
    setCurrentUser(null);
    // Xóa trạng thái đăng nhập đã lưu (ví dụ: localStorage) - Sẽ làm sau
    console.log('Mock logout successful');
  };

  // (Tùy chọn) Kiểm tra trạng thái đăng nhập đã lưu khi app khởi động - Sẽ làm sau
  // useEffect(() => {
  //   // Code kiểm tra localStorage/sessionStorage
  // }, []);

  return (
    <AuthContext.Provider value={{ currentUser, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};