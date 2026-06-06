import type { OrderStatus } from "../types";

const labels: Record<OrderStatus, string> = {
  pending: "Ожидает",
  confirmed: "Подтверждён",
  ready: "Готов",
  completed: "Выдан",
  cancelled: "Отменён",
};

const colors: Record<OrderStatus, string> = {
  pending: "#f59e0b",
  confirmed: "#3b82f6",
  ready: "#10b981",
  completed: "#6b7280",
  cancelled: "#ef4444",
};

export default function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span style={{ background: colors[status], color: "#fff", borderRadius: 20, padding: "3px 12px", fontSize: 13, fontWeight: 600 }}>
      {labels[status]}
    </span>
  );
}
