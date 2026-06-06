import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import OrderStatusBadge from "../components/OrderStatusBadge";

describe("OrderStatusBadge", () => {
  it("показывает правильный текст для каждого статуса", () => {
    const cases: [string, string][] = [
      ["pending", "Ожидает"],
      ["confirmed", "Подтверждён"],
      ["ready", "Готов"],
      ["completed", "Выдан"],
      ["cancelled", "Отменён"],
    ];
    for (const [status, label] of cases) {
      const { unmount } = render(<OrderStatusBadge status={status as never} />);
      expect(screen.getByText(label)).toBeTruthy();
      unmount();
    }
  });
});
