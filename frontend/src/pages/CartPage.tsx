import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useCartStore } from "../store/cartStore";
import { useAuthStore } from "../store/authStore";
import { getSlots } from "../api/orders";
import { createOrder } from "../api/orders";
import type { TimeSlot } from "../types";

export default function CartPage() {
  const { items, removeItem, updateQuantity, clear, total } = useCartStore();
  const { user } = useAuthStore();
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    getSlots(today).then((r) =>
      setSlots(r.data.filter((s) => s.current_orders < s.max_orders))
    );
  }, [today]);

  const handleOrder = async () => {
    if (!user) { navigate("/login"); return; }
    if (!selectedSlot) { toast.error("Выберите время получения"); return; }
    if (items.length === 0) { toast.error("Корзина пуста"); return; }
    setLoading(true);
    try {
      await createOrder({
        slot_id: selectedSlot,
        items: items.map((i) => ({ dish_id: i.dish.id, quantity: i.quantity })),
        notes,
      });
      clear();
      toast.success("Заказ оформлен!");
      navigate("/orders");
    } catch {
      toast.error("Ошибка при оформлении заказа");
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div style={styles.empty}>
        <p>Корзина пуста</p>
        <button style={styles.btn} onClick={() => navigate("/menu")}>Перейти в меню</button>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <h1>Корзина</h1>
      <div style={styles.layout}>
        <div style={styles.items}>
          {items.map((item) => (
            <div key={item.dish.id} style={styles.item}>
              <span style={{ fontWeight: 600, flex: 1 }}>{item.dish.name}</span>
              <div style={styles.qty}>
                <button style={styles.qtyBtn} onClick={() => updateQuantity(item.dish.id, item.quantity - 1)}>−</button>
                <span>{item.quantity}</span>
                <button style={styles.qtyBtn} onClick={() => updateQuantity(item.dish.id, item.quantity + 1)}>+</button>
              </div>
              <span style={{ width: 80, textAlign: "right" }}>{(item.dish.price * item.quantity).toFixed(2)} ₽</span>
              <button style={styles.del} onClick={() => removeItem(item.dish.id)}>✕</button>
            </div>
          ))}
          <div style={{ fontWeight: 700, fontSize: 18, textAlign: "right", marginTop: 12 }}>
            Итого: {total().toFixed(2)} ₽
          </div>
        </div>

        <div style={styles.checkout}>
          <h3>Оформление заказа</h3>
          <label style={styles.label}>Время получения</label>
          {slots.length === 0 ? (
            <p style={{ color: "#ef4444" }}>На сегодня слотов нет</p>
          ) : (
            <select style={styles.select} value={selectedSlot ?? ""} onChange={(e) => setSelectedSlot(Number(e.target.value))}>
              <option value="">Выберите время</option>
              {slots.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.time_start}–{s.time_end} ({s.max_orders - s.current_orders} мест)
                </option>
              ))}
            </select>
          )}
          <label style={styles.label}>Комментарий к заказу</label>
          <textarea style={styles.textarea} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Без лука, без соли..." rows={3} />
          <button style={styles.btn} onClick={handleOrder} disabled={loading || slots.length === 0}>
            {loading ? "Оформляем..." : "Оформить заказ"}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { maxWidth: 900, margin: "0 auto", padding: "24px 16px" },
  empty: { textAlign: "center", padding: 80 },
  layout: { display: "grid", gridTemplateColumns: "1fr 320px", gap: 24, alignItems: "start" },
  items: { display: "flex", flexDirection: "column", gap: 12 },
  item: { display: "flex", alignItems: "center", gap: 12, padding: 12, background: "#fff", borderRadius: 10, border: "1px solid #e5e7eb" },
  qty: { display: "flex", alignItems: "center", gap: 8 },
  qtyBtn: { width: 28, height: 28, border: "1px solid #d1d5db", background: "#f9fafb", borderRadius: 6, cursor: "pointer", fontSize: 16 },
  del: { background: "none", border: "none", cursor: "pointer", color: "#ef4444", fontSize: 16 },
  checkout: { background: "#fff", borderRadius: 12, padding: 20, border: "1px solid #e5e7eb", display: "flex", flexDirection: "column", gap: 12 },
  label: { fontWeight: 600, fontSize: 14 },
  select: { padding: "8px 12px", borderRadius: 8, border: "1px solid #d1d5db", fontSize: 14 },
  textarea: { padding: "8px 12px", borderRadius: 8, border: "1px solid #d1d5db", fontSize: 14, resize: "vertical" },
  btn: { background: "#2563eb", color: "#fff", border: "none", borderRadius: 8, padding: "12px", fontSize: 16, cursor: "pointer" },
};
