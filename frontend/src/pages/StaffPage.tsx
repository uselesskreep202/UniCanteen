import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getAllOrders, updateOrderStatus } from "../api/orders";
import type { Order, OrderStatus } from "../types";
import OrderStatusBadge from "../components/OrderStatusBadge";

const NEXT_STATUS: Record<string, OrderStatus> = {
  pending: "confirmed",
  confirmed: "ready",
  ready: "completed",
};

export default function StaffPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<string>("pending");
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    getAllOrders(filter || undefined).then((r) => setOrders(r.data)).finally(() => setLoading(false));
  };

  useEffect(load, [filter]);

  const advance = async (order: Order) => {
    const next = NEXT_STATUS[order.status];
    if (!next) return;
    try {
      const r = await updateOrderStatus(order.id, next);
      setOrders((prev) => prev.map((o) => (o.id === order.id ? r.data : o)));
      toast.success(`Статус обновлён: ${next}`);
    } catch {
      toast.error("Ошибка обновления статуса");
    }
  };

  const cancel = async (order: Order) => {
    try {
      const r = await updateOrderStatus(order.id, "cancelled");
      setOrders((prev) => prev.map((o) => (o.id === order.id ? r.data : o)));
      toast.success("Заказ отменён");
    } catch {
      toast.error("Ошибка");
    }
  };

  return (
    <div style={styles.page}>
      <h1>Панель сотрудника</h1>
      <div style={styles.filters}>
        {["pending", "confirmed", "ready", "completed", "cancelled", ""].map((s) => (
          <button key={s} style={{ ...styles.fBtn, ...(filter === s ? styles.fActive : {}) }} onClick={() => setFilter(s)}>
            {s || "Все"}
          </button>
        ))}
      </div>
      {loading ? <p>Загрузка...</p> : orders.length === 0 ? <p style={{ color: "#6b7280" }}>Заказов нет</p> : (
        <div style={styles.list}>
          {orders.map((order) => (
            <div key={order.id} style={styles.card}>
              <div style={styles.header}>
                <div>
                  <strong>Заказ #{order.id}</strong>
                  {order.user && <span style={styles.who}> — {order.user.full_name}</span>}
                </div>
                <OrderStatusBadge status={order.status} />
              </div>
              {order.slot && (
                <p style={styles.slot}>{order.slot.date} {order.slot.time_start}–{order.slot.time_end}</p>
              )}
              <div>
                {order.items.map((i) => (
                  <div key={i.id} style={{ fontSize: 14 }}>{i.dish_name} × {i.quantity}</div>
                ))}
              </div>
              {order.notes && <p style={styles.notes}>{order.notes}</p>}
              <div style={styles.actions}>
                <strong>{order.total_price.toFixed(2)} ₽</strong>
                <div style={{ display: "flex", gap: 8 }}>
                  {NEXT_STATUS[order.status] && (
                    <button style={styles.advBtn} onClick={() => advance(order)}>
                      → {NEXT_STATUS[order.status]}
                    </button>
                  )}
                  {!["completed", "cancelled"].includes(order.status) && (
                    <button style={styles.cancelBtn} onClick={() => cancel(order)}>Отменить</button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { maxWidth: 900, margin: "0 auto", padding: "24px 16px" },
  filters: { display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" },
  fBtn: { padding: "6px 16px", borderRadius: 20, border: "1px solid #d1d5db", background: "#fff", cursor: "pointer" },
  fActive: { background: "#2563eb", color: "#fff", border: "1px solid #2563eb" },
  list: { display: "flex", flexDirection: "column", gap: 14 },
  card: { background: "#fff", borderRadius: 12, padding: 18, border: "1px solid #e5e7eb" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  who: { color: "#6b7280", fontSize: 14 },
  slot: { color: "#6b7280", fontSize: 13, margin: "4px 0 8px" },
  notes: { color: "#6b7280", fontStyle: "italic", fontSize: 13 },
  actions: { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12 },
  advBtn: { background: "#10b981", color: "#fff", border: "none", borderRadius: 8, padding: "6px 14px", cursor: "pointer" },
  cancelBtn: { background: "#ef4444", color: "#fff", border: "none", borderRadius: 8, padding: "6px 14px", cursor: "pointer" },
};
