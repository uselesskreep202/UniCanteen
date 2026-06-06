import api from "./client";
import type { User, UserRole } from "../types";

export const register = (email: string, full_name: string, password: string) =>
  api.post<User>("/auth/register", { email, full_name, password });

export const login = async (email: string, password: string) => {
  const form = new URLSearchParams({ username: email, password });
  const { data } = await api.post<{ access_token: string; user: User }>("/auth/login", form);
  return data;
};

export const getMe = () => api.get<User>("/auth/me");
export const listUsers = () => api.get<User[]>("/auth/users");
export const updateUserRole = (userId: number, role: UserRole) =>
  api.put<User>(`/auth/users/${userId}/role`, { role });
