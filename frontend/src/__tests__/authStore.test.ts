import { describe, it, expect, beforeEach } from "vitest";
import { useAuthStore } from "../store/authStore";
import type { User } from "../types";

const user: User = { id: 1, email: "test@test.ru", full_name: "Test", role: "student" };

beforeEach(() => useAuthStore.setState({ user: null, token: null }));

describe("authStore", () => {
  it("сохраняет пользователя при входе", () => {
    useAuthStore.getState().setAuth(user, "token123");
    expect(useAuthStore.getState().user).toEqual(user);
    expect(useAuthStore.getState().token).toBe("token123");
  });

  it("очищает данные при выходе", () => {
    useAuthStore.getState().setAuth(user, "token123");
    useAuthStore.getState().logout();
    expect(useAuthStore.getState().user).toBeNull();
    expect(useAuthStore.getState().token).toBeNull();
  });
});
