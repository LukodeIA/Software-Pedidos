export type Role = 'admin' | 'employee' | 'client';

export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'delivered';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  active: boolean;
  image_url?: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Order {
  id: string;
  customer_name: string;
  customer_phone: string;
  address: string;
  items: CartItem[];
  total: number;
  status: OrderStatus;
  created_at: string;
}

export interface UserProfile {
  id: string;
  role: Role;
  email: string;
}

export interface AuthState {
  user: UserProfile | null;
  loading: boolean;
  isAuthenticated: boolean;
}