import { useEffect, useState } from "react";
import { getCategories, getDishes } from "../api/menu";
import type { Category, Dish } from "../types";
import DishCard from "../components/DishCard";

export default function MenuPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCategories().then((r) => setCategories(r.data));
  }, []);

  useEffect(() => {
    setLoading(true);
    getDishes({ category_id: selectedCategory ?? undefined, available: true })
      .then((r) => setDishes(r.data))
      .finally(() => setLoading(false));
  }, [selectedCategory]);

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>Меню столовой</h1>
      <div style={styles.cats}>
        <button style={{ ...styles.catBtn, ...(selectedCategory === null ? styles.catActive : {}) }} onClick={() => setSelectedCategory(null)}>
          Все блюда
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            style={{ ...styles.catBtn, ...(selectedCategory === c.id ? styles.catActive : {}) }}
            onClick={() => setSelectedCategory(c.id)}
          >
            {c.name}
          </button>
        ))}
      </div>
      {loading ? (
        <p style={{ textAlign: "center" }}>Загрузка...</p>
      ) : dishes.length === 0 ? (
        <p style={{ textAlign: "center", color: "#6b7280" }}>Блюда не найдены</p>
      ) : (
        <div style={styles.grid}>
          {dishes.map((d) => <DishCard key={d.id} dish={d} />)}
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { maxWidth: 1100, margin: "0 auto", padding: "24px 16px" },
  title: { marginBottom: 20 },
  cats: { display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 24 },
  catBtn: { padding: "8px 18px", borderRadius: 20, border: "1px solid #d1d5db", background: "#fff", cursor: "pointer", fontSize: 14 },
  catActive: { background: "#2563eb", color: "#fff", border: "1px solid #2563eb" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 20 },
};
