import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getMyOrders, cancelOrder } from "../api/orders";
import type { Order } from "../types";
import OrderStatusBadge from "../components/OrderStatusBadge";

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyOrders().then((r) => setOrders(r.data)).finally(() => setLoading(false));
  }, []);

  const handleCancel = async (order: Order) => {
    if (!confirm(`Отменить заказ #${order.id}?`)) return;
    try {
      const r = await cancelOrder(order.id);
      setOrders((prev) => prev.map((o) => (o.id === order.id ? r.data : o)));
      toast.success("Заказ отменён");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      toast.error(msg || "Ошибка при отмене");
    }
  };

  if (loading) return <p style={{ textAlign: "center", padding: 40 }}>Загрузка...</p>;

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "24px 16px" }}>
      <h1>Мои заказы</h1>
      {orders.length === 0 ? (
        <p style={{ color: "#6b7280" }}>У вас пока нет заказов</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {orders.map((order) => (
            <div key={order.id} style={{ background: "#fff", borderRadius: 12, padding: 20, border: "1px solid #e5e7eb" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <strong style={{ fontSize: 16 }}>Заказ #{order.id}</strong>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <OrderStatusBadge status={order.status} />
                  {order.status === "pending" && (
                    <button onClick={() => handleCancel(order)} style={{
                      background: "#fef2f2", color: "#ef4444",
                      border: "1px solid #fecaca", borderRadius: 8,
                      padding: "4px 12px", cursor: "pointer"
                    }}>Отменить</button>
                  )}
                </div>
              </div>
              {order.slot && (
                <p style={{ color: "#6b7280", fontSize: 14, margin: "4px 0 12px" }}>
                  📅 {order.slot.date} &nbsp;|&nbsp; 🕐 {order.slot.time_start} – {order.slot.time_end}
                </p>
              )}
              <div style={{ borderTop: "1px solid #f3f4f6", paddingTop: 10 }}>
                {order.items.map((item) => (
                  <div key={item.id} style={{ fontSize: 14, padding: "3px 0", display: "flex", justifyContent: "space-between" }}>
                    <span>{item.dish_name || `Блюдо #${item.dish_id}`} × {item.quantity}</span>
                    <span>{(item.price * item.quantity).toFixed(2)} ₽</span>
                  </div>
                ))}
              </div>
              {order.notes && (
                <p style={{ color: "#6b7280", fontSize: 13, fontStyle: "italic", margin: "8px 0 0" }}>
                  💬 {order.notes}
                </p>
              )}
              <div style={{ textAlign: "right", fontWeight: 700, marginTop: 10, fontSize: 16 }}>
                Итого: {order.total_price.toFixed(2)} ₽
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
