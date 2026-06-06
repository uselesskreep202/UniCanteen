import api from "./client";
import type { Category, Dish } from "../types";

export const getCategories = () => api.get<Category[]>("/menu/categories");
export const getDishes = (params?: { category_id?: number; available?: boolean }) =>
  api.get<Dish[]>("/menu/dishes", { params });
export const createCategory = (name: string) => api.post<Category>("/menu/categories", { name });
export const createDish = (data: Omit<Dish, "id" | "category">) => api.post<Dish>("/menu/dishes", data);
export const updateDish = (id: number, data: Partial<Dish>) => api.put<Dish>(`/menu/dishes/${id}`, data);
export const deleteDish = (id: number) => api.delete(`/menu/dishes/${id}`);
