import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getAllOrders, updateOrderStatus } from "../api/orders";
import { getCategories, getDishes, createDish, deleteDish } from "../api/menu";
import type { Order, OrderStatus, Category, Dish } from "../types";
import OrderStatusBadge from "../components/OrderStatusBadge";

const NEXT_STATUS: Record<string, OrderStatus> = {
  pending: "confirmed",
  confirmed: "ready",
  ready: "completed",
};

type Tab = "orders" | "dishes";

export default function StaffPage() {
  const [tab, setTab] = useState<Tab>("orders");

  // Orders state
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<string>("pending");
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Dish management state
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingDishes, setLoadingDishes] = useState(true);
  const [newDish, setNewDish] = useState({ name: "", description: "", price: "", category_id: "", image_url: "" });
  const [savingDish, setSavingDish] = useState(false);

  const loadOrders = () => {
    setLoadingOrders(true);
    getAllOrders(filter || undefined).then((r) => setOrders(r.data)).finally(() => setLoadingOrders(false));
  };

  const loadDishes = () => {
    setLoadingDishes(true);
    Promise.all([getCategories(), getDishes()]).then(([catsR, dishesR]) => {
      setCategories(catsR.data);
      setDishes(dishesR.data);
    }).finally(() => setLoadingDishes(false));
  };

  useEffect(loadOrders, [filter]);
  useEffect(() => { if (tab === "dishes") loadDishes(); }, [tab]);

  const advance = async (order: Order) => {
    const next = NEXT_STATUS[order.status];
    if (!next) return;
    try {
      const r = await updateOrderStatus(order.id, next);
      setOrders((prev) => prev.map((o) => (o.id === order.id ? r.data : o)));
      toast.success(`Статус → ${next}`);
    } catch { toast.error("Ошибка обновления статуса"); }
  };

  const cancel = async (order: Order) => {
    try {
      const r = await updateOrderStatus(order.id, "cancelled");
      setOrders((prev) => prev.map((o) => (o.id === order.id ? r.data : o)));
      toast.success("Заказ отменён");
    } catch { toast.error("Ошибка"); }
  };

  const handleAddDish = async () => {
    if (!newDish.name || !newDish.price || !newDish.category_id) {
      toast.error("Заполните название, цену и категорию");
      return;
    }
    setSavingDish(true);
    try {
      const r = await createDish({
        name: newDish.name,
        description: newDish.description,
        price: Number(newDish.price),
        category_id: Number(newDish.category_id),
        available: true,
        image_url: newDish.image_url,
      } as Parameters<typeof createDish>[0]);
      setDishes((d) => [...d, r.data]);
      setNewDish({ name: "", description: "", price: "", category_id: "", image_url: "" });
      toast.success("Блюдо добавлено");
    } catch { toast.error("Ошибка при добавлении"); } finally { setSavingDish(false); }
  };

  const handleDeleteDish = async (dish: Dish) => {
    if (!confirm(`Удалить «${dish.name}»?`)) return;
    try {
      await deleteDish(dish.id);
      setDishes((d) => d.filter((x) => x.id !== dish.id));
      toast.success("Блюдо удалено");
    } catch { toast.error("Ошибка при удалении"); }
  };

  return (
    <div style={styles.page}>
      <h1>Панель сотрудника</h1>

      {/* Tabs */}
      <div style={styles.tabs}>
        <button style={{ ...styles.tab, ...(tab === "orders" ? styles.tabActive : {}) }} onClick={() => setTab("orders")}>
          📋 Заказы
        </button>
        <button style={{ ...styles.tab, ...(tab === "dishes" ? styles.tabActive : {}) }} onClick={() => setTab("dishes")}>
          🍽 Управление блюдами
        </button>
      </div>

      {/* ORDERS TAB */}
      {tab === "orders" && (
        <>
          <div style={styles.filters}>
            {["pending", "confirmed", "ready", "completed", "cancelled", ""].map((s) => (
              <button key={s} style={{ ...styles.fBtn, ...(filter === s ? styles.fActive : {}) }} onClick={() => setFilter(s)}>
                {s || "Все"}
              </button>
            ))}
          </div>
          {loadingOrders ? <p>Загрузка...</p> : orders.length === 0 ? (
            <p style={{ color: "#6b7280" }}>Заказов нет</p>
          ) : (
            <div style={styles.list}>
              {orders.map((order) => (
                <div key={order.id} style={styles.card}>
                  <div style={styles.cardHeader}>
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
                      <div key={i.id} style={{ fontSize: 14 }}>{i.dish_name || `Блюдо #${i.dish_id}`} × {i.quantity}</div>
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
        </>
      )}

      {/* DISHES TAB */}
      {tab === "dishes" && (
        <div>
          {/* Add dish form */}
          <div style={styles.section}>
            <h3 style={{ marginTop: 0 }}>Добавить новое блюдо</h3>
            <div style={styles.formGrid}>
              <input style={styles.input} placeholder="Название блюда *" value={newDish.name}
                onChange={(e) => setNewDish({ ...newDish, name: e.target.value })} />
              <select style={styles.input} value={newDish.category_id}
                onChange={(e) => setNewDish({ ...newDish, category_id: e.target.value })}>
                <option value="">Выберите категорию *</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <input style={styles.input} type="number" placeholder="Цена (₽) *" value={newDish.price}
                onChange={(e) => setNewDish({ ...newDish, price: e.target.value })} />
              <input style={styles.input} placeholder="URL изображения" value={newDish.image_url}
                onChange={(e) => setNewDish({ ...newDish, image_url: e.target.value })} />
              <input style={{ ...styles.input, gridColumn: "span 2" }} placeholder="Описание"
                value={newDish.description}
                onChange={(e) => setNewDish({ ...newDish, description: e.target.value })} />
              <button style={{ ...styles.addBtn, gridColumn: "span 2" }} onClick={handleAddDish} disabled={savingDish}>
                {savingDish ? "Добавляем..." : "+ Добавить блюдо"}
              </button>
            </div>
          </div>

          {/* Dish list */}
          <div style={styles.section}>
            <h3 style={{ marginTop: 0 }}>Все блюда ({dishes.length})</h3>
            {loadingDishes ? <p>Загрузка...</p> : (
              <div style={styles.dishList}>
                {dishes.map((dish) => (
                  <div key={dish.id} style={styles.dishRow}>
                    <div style={{ flex: 1 }}>
                      <span style={{ fontWeight: 600 }}>{dish.name}</span>
                      <span style={styles.catTag}>{dish.category.name}</span>
                      {!dish.available && <span style={styles.unavailTag}>недоступно</span>}
                    </div>
                    <span style={{ width: 80, textAlign: "right", fontWeight: 600 }}>{dish.price} ₽</span>
                    <button style={styles.deleteBtn} onClick={() => handleDeleteDish(dish)}>🗑 Удалить</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { maxWidth: 900, margin: "0 auto", padding: "24px 16px" },
  tabs: { display: "flex", gap: 8, marginBottom: 20 },
  tab: { padding: "10px 20px", borderRadius: 8, border: "1px solid #d1d5db", background: "#fff", cursor: "pointer", fontSize: 15 },
  tabActive: { background: "#2563eb", color: "#fff", border: "1px solid #2563eb" },
  filters: { display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" },
  fBtn: { padding: "6px 16px", borderRadius: 20, border: "1px solid #d1d5db", background: "#fff", cursor: "pointer" },
  fActive: { background: "#2563eb", color: "#fff", border: "1px solid #2563eb" },
  list: { display: "flex", flexDirection: "column", gap: 14 },
  card: { background: "#fff", borderRadius: 12, padding: 18, border: "1px solid #e5e7eb" },
  cardHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  who: { color: "#6b7280", fontSize: 14 },
  slot: { color: "#6b7280", fontSize: 13, margin: "4px 0 8px" },
  notes: { color: "#6b7280", fontStyle: "italic", fontSize: 13 },
  actions: { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12 },
  advBtn: { background: "#10b981", color: "#fff", border: "none", borderRadius: 8, padding: "6px 14px", cursor: "pointer" },
  cancelBtn: { background: "#ef4444", color: "#fff", border: "none", borderRadius: 8, padding: "6px 14px", cursor: "pointer" },
  section: { background: "#fff", borderRadius: 12, padding: 20, marginBottom: 16, border: "1px solid #e5e7eb" },
  formGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
  input: { padding: "8px 12px", borderRadius: 8, border: "1px solid #d1d5db", fontSize: 14 },
  addBtn: { background: "#2563eb", color: "#fff", border: "none", borderRadius: 8, padding: "10px", cursor: "pointer", fontSize: 15 },
  dishList: { display: "flex", flexDirection: "column", gap: 8 },
  dishRow: { display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: "#f9fafb", borderRadius: 8 },
  catTag: { marginLeft: 8, background: "#eff6ff", color: "#2563eb", borderRadius: 12, padding: "2px 10px", fontSize: 12 },
  unavailTag: { marginLeft: 6, background: "#fef2f2", color: "#ef4444", borderRadius: 12, padding: "2px 8px", fontSize: 12 },
  deleteBtn: { background: "#fef2f2", color: "#ef4444", border: "1px solid #fecaca", borderRadius: 8, padding: "5px 12px", cursor: "pointer", fontSize: 13 },
};
