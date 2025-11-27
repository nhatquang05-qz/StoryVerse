export interface Address {
    id: string;
    specificAddress: string;
    ward: string;
    district: string;
    city: string;
    isDefault: boolean;
}

export interface User {
  id: string; 
  email: string;
  fullName: string;
  phone: string;
  addresses: Address[];
  coinBalance: number;
  lastDailyLogin: string; 
  consecutiveLoginDays: number;
  level: number;
  exp: number; 
  avatarUrl: string;
}

