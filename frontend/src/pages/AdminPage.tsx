import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getStats, createSlot } from "../api/orders";
import { getCategories, createCategory, createDish } from "../api/menu";
import type { Category } from "../types";

export default function AdminPage() {
  const [stats, setStats] = useState<Record<string, number>>({});
  const [categories, setCategories] = useState<Category[]>([]);
  const [catName, setCatName] = useState("");
  const [slot, setSlot] = useState({ date: "", time_start: "", time_end: "", max_orders: 20 });
  const [dish, setDish] = useState({ name: "", description: "", price: "", category_id: "", image_url: "" });

  useEffect(() => {
    getStats().then((r) => setStats(r.data));
    getCategories().then((r) => setCategories(r.data));
  }, []);

  const addCategory = async () => {
    if (!catName) return;
    try {
      const r = await createCategory(catName);
      setCategories((c) => [...c, r.data]);
      setCatName("");
      toast.success("Категория добавлена");
    } catch { toast.error("Ошибка"); }
  };

  const addSlot = async () => {
    try {
      await createSlot({ ...slot });
      toast.success("Слот добавлен");
      setSlot({ date: "", time_start: "", time_end: "", max_orders: 20 });
    } catch { toast.error("Ошибка"); }
  };

  const addDish = async () => {
    try {
      await createDish({
        name: dish.name,
        description: dish.description,
        price: Number(dish.price),
        category_id: Number(dish.category_id),
        available: true,
        image_url: dish.image_url,
      } as Parameters<typeof createDish>[0]);
      toast.success("Блюдо добавлено");
      setDish({ name: "", description: "", price: "", category_id: "", image_url: "" });
    } catch { toast.error("Ошибка"); }
  };

  return (
    <div style={styles.page}>
      <h1>Администрирование</h1>

      <section style={styles.section}>
        <h2>Статистика</h2>
        <div style={styles.statsGrid}>
          {Object.entries(stats).map(([k, v]) => (
            <div key={k} style={styles.statCard}>
              <div style={styles.statVal}>{v}</div>
              <div style={styles.statKey}>{k}</div>
            </div>
          ))}
        </div>
      </section>

      <section style={styles.section}>
        <h2>Добавить категорию</h2>
        <div style={styles.row}>
          <input style={styles.input} placeholder="Название категории" value={catName} onChange={(e) => setCatName(e.target.value)} />
          <button style={styles.btn} onClick={addCategory}>Добавить</button>
        </div>
        <div style={styles.chips}>{categories.map((c) => <span key={c.id} style={styles.chip}>{c.name}</span>)}</div>
      </section>

      <section style={styles.section}>
        <h2>Добавить блюдо</h2>
        <div style={styles.formGrid}>
          <input style={styles.input} placeholder="Название" value={dish.name} onChange={(e) => setDish({ ...dish, name: e.target.value })} />
          <input style={styles.input} placeholder="Описание" value={dish.description} onChange={(e) => setDish({ ...dish, description: e.target.value })} />
          <input style={styles.input} type="number" placeholder="Цена" value={dish.price} onChange={(e) => setDish({ ...dish, price: e.target.value })} />
          <select style={styles.input} value={dish.category_id} onChange={(e) => setDish({ ...dish, category_id: e.target.value })}>
            <option value="">Категория</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <input style={styles.input} placeholder="URL изображения (необязательно)" value={dish.image_url} onChange={(e) => setDish({ ...dish, image_url: e.target.value })} />
          <button style={styles.btn} onClick={addDish}>Добавить блюдо</button>
        </div>
      </section>

      <section style={styles.section}>
        <h2>Добавить слот времени</h2>
        <div style={styles.formGrid}>
          <input style={styles.input} type="date" value={slot.date} onChange={(e) => setSlot({ ...slot, date: e.target.value })} />
          <input style={styles.input} type="time" placeholder="Начало" value={slot.time_start} onChange={(e) => setSlot({ ...slot, time_start: e.target.value })} />
          <input style={styles.input} type="time" placeholder="Конец" value={slot.time_end} onChange={(e) => setSlot({ ...slot, time_end: e.target.value })} />
          <input style={styles.input} type="number" placeholder="Макс. заказов" value={slot.max_orders} onChange={(e) => setSlot({ ...slot, max_orders: Number(e.target.value) })} />
          <button style={styles.btn} onClick={addSlot}>Добавить слот</button>
        </div>
      </section>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { maxWidth: 900, margin: "0 auto", padding: "24px 16px" },
  section: { background: "#fff", borderRadius: 12, padding: 24, marginBottom: 20, border: "1px solid #e5e7eb" },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 12 },
  statCard: { background: "#f3f4f6", borderRadius: 10, padding: "12px 16px", textAlign: "center" },
  statVal: { fontSize: 28, fontWeight: 700, color: "#2563eb" },
  statKey: { fontSize: 12, color: "#6b7280", textTransform: "capitalize" },
  row: { display: "flex", gap: 10 },
  chips: { display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 },
  chip: { background: "#eff6ff", color: "#2563eb", borderRadius: 20, padding: "4px 12px", fontSize: 13 },
  formGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
  input: { padding: "8px 12px", borderRadius: 8, border: "1px solid #d1d5db", fontSize: 14 },
  btn: { background: "#2563eb", color: "#fff", border: "none", borderRadius: 8, padding: "8px 18px", cursor: "pointer", gridColumn: "span 2" },
};
