export type UserRole = "student" | "staff" | "admin";

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: UserRole;
}

export interface Category {
  id: number;
  name: string;
}

export interface Dish {
  id: number;
  name: string;
  description: string;
  price: number;
  category_id: number;
  available: boolean;
  image_url: string;
  category: Category;
}

export type OrderStatus = "pending" | "confirmed" | "ready" | "completed" | "cancelled";

export interface TimeSlot {
  id: number;
  date: string;
  time_start: string;
  time_end: string;
  max_orders: number;
  current_orders: number;
}

export interface OrderItem {
  id: number;
  dish_id: number;
  quantity: number;
  price: number;
  dish_name: string;
}

export interface Order {
  id: number;
  user_id: number;
  slot_id: number;
  status: OrderStatus;
  total_price: number;
  notes: string;
  created_at: string | null;
  items: OrderItem[];
  slot?: TimeSlot;
  user?: User;
}

export interface CartItem {
  dish: Dish;
  quantity: number;
}
