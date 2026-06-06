import { describe, it, expect, beforeEach } from "vitest";
import { useAuthStore } from "../store/authStore";
import type { User } from "../types";

const mockUser: User = { id: 1, email: "test@uni.ru", full_name: "Test User", role: "student" };

beforeEach(() => useAuthStore.setState({ user: null, token: null }));

describe("authStore", () => {
  it("устанавливает пользователя и токен", () => {
    useAuthStore.getState().setAuth(mockUser, "test-token");
    expect(useAuthStore.getState().user).toEqual(mockUser);
    expect(useAuthStore.getState().token).toBe("test-token");
  });

  it("сбрасывает состояние при выходе", () => {
    useAuthStore.getState().setAuth(mockUser, "test-token");
    useAuthStore.getState().logout();
    expect(useAuthStore.getState().user).toBeNull();
    expect(useAuthStore.getState().token).toBeNull();
  });
});
