import api from "./client";
import type { Order, TimeSlot } from "../types";

export const getSlots = (date?: string) => api.get<TimeSlot[]>("/orders/slots", { params: date ? { date } : {} });
export const createSlot = (data: Omit<TimeSlot, "id" | "current_orders">) => api.post<TimeSlot>("/orders/slots", data);
export const createOrder = (data: { slot_id: number; items: { dish_id: number; quantity: number }[]; notes?: string }) =>
  api.post<Order>("/orders", data);
export const getMyOrders = () => api.get<Order[]>("/orders/my");
export const getAllOrders = (status?: string) => api.get<Order[]>("/orders/all", { params: status ? { status } : {} });
export const updateOrderStatus = (id: number, status: string) =>
  api.put<Order>(`/orders/${id}/status`, { status });
export const getStats = () => api.get<Record<string, number>>("/orders/stats/summary");
export const cancelOrder = (id: number) => api.delete<Order>(`/orders/${id}`);
