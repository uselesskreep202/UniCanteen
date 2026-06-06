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
      toast.error(msg || "Ошибка при отмене заказа");
    }
  };

  if (loading) return <p style={{ textAlign: "center", padding: 40 }}>Загрузка...</p>;

  return (
    <div style={styles.page}>
      <h1>Мои заказы</h1>
      {orders.length === 0 ? (
        <p style={{ color: "#6b7280" }}>У вас пока нет заказов</p>
      ) : (
        <div style={styles.list}>
          {orders.map((order) => (
            <div key={order.id} style={styles.card}>
              <div style={styles.header}>
                <span style={styles.orderNum}>Заказ #{order.id}</span>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <OrderStatusBadge status={order.status} />
                  {order.status === "pending" && (
                    <button style={styles.cancelBtn} onClick={() => handleCancel(order)}>
                      Отменить
                    </button>
                  )}
                </div>
              </div>

              {order.slot && (
                <p style={styles.slot}>
                  📅 {order.slot.date} &nbsp;|&nbsp; 🕐 {order.slot.time_start}–{order.slot.time_end}
                </p>
              )}

              <div style={styles.items}>
                {order.items.map((item) => (
                  <div key={item.id} style={styles.item}>
                    <span style={{ flex: 1 }}>{item.dish_name || `Блюдо #${item.dish_id}`}</span>
                    <span style={{ color: "#6b7280" }}>× {item.quantity}</span>
                    <span style={{ width: 90, textAlign: "right" }}>
                      {(item.price * item.quantity).toFixed(2)} ₽
                    </span>
                  </div>
                ))}
              </div>

              {order.notes && (
                <p style={styles.notes}>💬 {order.notes}</p>
              )}

              <div style={styles.total}>
                Итого: <strong>{order.total_price.toFixed(2)} ₽</strong>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { maxWidth: 800, margin: "0 auto", padding: "24px 16px" },
  list: { display: "flex", flexDirection: "column", gap: 16 },
  card: { background: "#fff", borderRadius: 12, padding: 20, border: "1px solid #e5e7eb" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  orderNum: { fontWeight: 700, fontSize: 16 },
  slot: { color: "#6b7280", fontSize: 14, margin: "4px 0 12px" },
  items: { display: "flex", flexDirection: "column", gap: 6, marginBottom: 8 },
  item: { display: "flex", gap: 12, fontSize: 14, padding: "4px 0", borderBottom: "1px solid #f3f4f6" },
  notes: { color: "#6b7280", fontSize: 13, fontStyle: "italic", margin: "8px 0" },
  total: { textAlign: "right", marginTop: 10, fontSize: 15 },
  cancelBtn: {
    background: "#fef2f2", color: "#ef4444", border: "1px solid #fecaca",
    borderRadius: 8, padding: "4px 12px", cursor: "pointer", fontSize: 13, fontWeight: 600,
  },
};
