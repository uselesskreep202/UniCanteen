import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getAllOrders, updateOrderStatus } from "../api/orders";
import { getDishes, getCategories, createDish, deleteDish } from "../api/menu";
import type { Order, Dish, Category } from "../types";
import OrderStatusBadge from "../components/OrderStatusBadge";

const STATUSES = ["pending", "confirmed", "ready", "completed", "cancelled"];

export default function StaffPage() {
  const [tab, setTab] = useState<"orders" | "dishes">("orders");
  const [orders, setOrders] = useState<Order[]>([]);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [newDish, setNewDish] = useState({ name: "", price: "", category_id: "", description: "" });

  useEffect(() => {
    getAllOrders().then((r) => setOrders(r.data));
    getDishes().then((r) => setDishes(r.data));
    getCategories().then((r) => setCategories(r.data));
  }, []);

  const handleStatusChange = async (orderId: number, status: string) => {
    try {
      const r = await updateOrderStatus(orderId, status);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? r.data : o)));
      toast.success("Статус обновлён");
    } catch { toast.error("Ошибка"); }
  };

  const handleCreateDish = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const r = await createDish({
        name: newDish.name, price: Number(newDish.price),
        category_id: Number(newDish.category_id),
        description: newDish.description, available: true, image_url: "",
      });
      setDishes((prev) => [...prev, r.data]);
      setNewDish({ name: "", price: "", category_id: "", description: "" });
      toast.success("Блюдо добавлено");
    } catch { toast.error("Ошибка при создании блюда"); }
  };

  const handleDeleteDish = async (id: number) => {
    if (!confirm("Удалить блюдо?")) return;
    try {
      await deleteDish(id);
      setDishes((prev) => prev.filter((d) => d.id !== id));
      toast.success("Блюдо удалено");
    } catch { toast.error("Ошибка"); }
  };

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "24px 16px" }}>
      <h1>Панель сотрудника</h1>
      <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
        <button style={tab === "orders" ? activeTab : tabBtn} onClick={() => setTab("orders")}>📋 Заказы</button>
        <button style={tab === "dishes" ? activeTab : tabBtn} onClick={() => setTab("dishes")}>🍽 Блюда</button>
      </div>

      {tab === "orders" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {orders.length === 0 ? <p style={{ color: "#6b7280" }}>Заказов нет</p> : orders.map((order) => (
            <div key={order.id} style={{ background: "#fff", borderRadius: 12, padding: 18, border: "1px solid #e5e7eb" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                <div>
                  <strong>Заказ #{order.id}</strong>
                  {order.user && <span style={{ color: "#6b7280", fontSize: 14, marginLeft: 12 }}>{order.user.full_name}</span>}
                  {order.slot && <span style={{ color: "#6b7280", fontSize: 13, marginLeft: 12 }}>🕐 {order.slot.time_start}–{order.slot.time_end}</span>}
                </div>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <OrderStatusBadge status={order.status} />
                  <select value={order.status} onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid #d1d5db", fontSize: 13 }}>
                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ marginTop: 8, fontSize: 14, color: "#4b5563" }}>
                {order.items.map((i) => (
                  <span key={i.id} style={{ marginRight: 12 }}>{i.dish_name} ×{i.quantity}</span>
                ))}
              </div>
              <div style={{ textAlign: "right", fontWeight: 700 }}>{order.total_price.toFixed(2)} ₽</div>
            </div>
          ))}
        </div>
      )}

      {tab === "dishes" && (
        <div>
          <form onSubmit={handleCreateDish} style={{ background: "#fff", borderRadius: 12, padding: 20, border: "1px solid #e5e7eb", marginBottom: 20, display: "flex", flexDirection: "column", gap: 12 }}>
            <h3 style={{ margin: 0 }}>Добавить блюдо</h3>
            <input style={inp} placeholder="Название" value={newDish.name}
              onChange={(e) => setNewDish((p) => ({ ...p, name: e.target.value }))} required />
            <input style={inp} placeholder="Описание" value={newDish.description}
              onChange={(e) => setNewDish((p) => ({ ...p, description: e.target.value }))} />
            <input style={inp} placeholder="Цена (₽)" type="number" value={newDish.price}
              onChange={(e) => setNewDish((p) => ({ ...p, price: e.target.value }))} required />
            <select style={inp} value={newDish.category_id}
              onChange={(e) => setNewDish((p) => ({ ...p, category_id: e.target.value }))} required>
              <option value="">— выберите категорию —</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <button type="submit" style={primaryBtn}>Добавить блюдо</button>
          </form>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {dishes.map((dish) => (
              <div key={dish.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#fff", borderRadius: 10, padding: "12px 16px", border: "1px solid #e5e7eb" }}>
                <div>
                  <strong>{dish.name}</strong>
                  <span style={{ color: "#6b7280", fontSize: 13, marginLeft: 10 }}>{dish.category.name}</span>
                  <span style={{ marginLeft: 12, fontWeight: 600, color: "#2563eb" }}>{dish.price} ₽</span>
                </div>
                <button onClick={() => handleDeleteDish(dish.id)} style={{ background: "#fef2f2", color: "#ef4444", border: "1px solid #fecaca", borderRadius: 8, padding: "4px 12px", cursor: "pointer" }}>
                  Удалить
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const tabBtn: React.CSSProperties = { padding: "8px 20px", borderRadius: 8, border: "1px solid #d1d5db", background: "#fff", cursor: "pointer", fontSize: 15 };
const activeTab: React.CSSProperties = { ...tabBtn, background: "#2563eb", color: "#fff", border: "1px solid #2563eb" };
const inp: React.CSSProperties = { padding: "8px 12px", borderRadius: 8, border: "1px solid #d1d5db", fontSize: 14 };
const primaryBtn: React.CSSProperties = { background: "#2563eb", color: "#fff", border: "none", borderRadius: 8, padding: "10px 20px", fontSize: 15, cursor: "pointer" };
