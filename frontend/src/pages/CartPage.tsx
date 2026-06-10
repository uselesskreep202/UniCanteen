import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useCartStore } from "../store/cartStore";
import { useAuthStore } from "../store/authStore";
import { getSlots, createOrder } from "../api/orders";
import type { TimeSlot } from "../types";

export default function CartPage() {
  const { items, removeItem, updateQuantity, clear, total } = useCartStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    getSlots(today).then((r) =>
      setSlots(r.data.filter((s) => s.current_orders < s.max_orders))
    );
  }, [today]);

  const handleOrder = async () => {
    if (!user) { navigate("/login"); return; }
    if (!selectedSlot) { toast.error("Выберите время получения"); return; }
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
      <div style={{ textAlign: "center", padding: 80 }}>
        <p style={{ fontSize: 18, color: "#6b7280" }}>Корзина пуста</p>
        <button onClick={() => navigate("/menu")} style={primaryBtn}>Перейти в меню</button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 16px" }}>
      <h1>Корзина</h1>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 24 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {items.map((item) => (
            <div key={item.dish.id} style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: 12, background: "#fff", borderRadius: 10, border: "1px solid #e5e7eb"
            }}>
              <span style={{ flex: 1, fontWeight: 600 }}>{item.dish.name}</span>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <button style={qBtn} onClick={() => updateQuantity(item.dish.id, item.quantity - 1)}>−</button>
                <span style={{ minWidth: 24, textAlign: "center" }}>{item.quantity}</span>
                <button style={qBtn} onClick={() => updateQuantity(item.dish.id, item.quantity + 1)}>+</button>
              </div>
              <span style={{ width: 90, textAlign: "right" }}>
                {(item.dish.price * item.quantity).toFixed(2)} ₽
              </span>
              <button onClick={() => removeItem(item.dish.id)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", fontSize: 18 }}>
                ✕
              </button>
            </div>
          ))}
          <div style={{ fontWeight: 700, fontSize: 20, textAlign: "right", padding: "8px 0" }}>
            Итого: {total().toFixed(2)} ₽
          </div>
        </div>

        <div style={{ background: "#fff", borderRadius: 12, padding: 20, border: "1px solid #e5e7eb", display: "flex", flexDirection: "column", gap: 14 }}>
          <h3 style={{ margin: 0 }}>Оформление заказа</h3>
          <label style={{ fontWeight: 600, fontSize: 14 }}>Время получения</label>
          {slots.length === 0 ? (
            <p style={{ color: "#ef4444", fontSize: 14 }}>На сегодня слотов нет</p>
          ) : (
            <select style={inp} value={selectedSlot ?? ""}
              onChange={(e) => setSelectedSlot(Number(e.target.value))}>
              <option value="">— выберите время —</option>
              {slots.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.time_start} – {s.time_end} ({s.max_orders - s.current_orders} мест)
                </option>
              ))}
            </select>
          )}
          <label style={{ fontWeight: 600, fontSize: 14 }}>Комментарий</label>
          <textarea style={{ ...inp, resize: "vertical" }} value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Например: без лука..." rows={3} />
          <button style={primaryBtn} onClick={handleOrder} disabled={loading || slots.length === 0}>
            {loading ? "Оформляем..." : "Оформить заказ"}
          </button>
        </div>
      </div>
    </div>
  );
}

const inp: React.CSSProperties = { padding: "8px 12px", borderRadius: 8, border: "1px solid #d1d5db", fontSize: 14 };
const primaryBtn: React.CSSProperties = { background: "#2563eb", color: "#fff", border: "none", borderRadius: 8, padding: "12px", fontSize: 16, cursor: "pointer" };
const qBtn: React.CSSProperties = { width: 28, height: 28, border: "1px solid #d1d5db", background: "#f9fafb", borderRadius: 6, cursor: "pointer", fontSize: 16 };
