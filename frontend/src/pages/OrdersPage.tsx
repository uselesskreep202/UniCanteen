import { useEffect, useState } from "react";
import { getMyOrders } from "../api/orders";
import type { Order } from "../types";
import OrderStatusBadge from "../components/OrderStatusBadge";

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyOrders().then((r) => setOrders(r.data)).finally(() => setLoading(false));
  }, []);

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
                <OrderStatusBadge status={order.status} />
              </div>
              {order.slot && (
                <p style={styles.slot}>
                  {order.slot.date} | {order.slot.time_start}–{order.slot.time_end}
                </p>
              )}
              <div style={styles.items}>
                {order.items.map((item) => (
                  <div key={item.id} style={styles.item}>
                    <span>{item.dish_name || `Блюдо #${item.dish_id}`}</span>
                    <span>× {item.quantity}</span>
                    <span>{(item.price * item.quantity).toFixed(2)} ₽</span>
                  </div>
                ))}
              </div>
              {order.notes && <p style={styles.notes}>Комментарий: {order.notes}</p>}
              <div style={styles.total}>Итого: {order.total_price.toFixed(2)} ₽</div>
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
  item: { display: "flex", gap: 16, fontSize: 14 },
  notes: { color: "#6b7280", fontSize: 13, fontStyle: "italic" },
  total: { fontWeight: 700, textAlign: "right", marginTop: 8 },
};
