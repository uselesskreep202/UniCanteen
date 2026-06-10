import { useEffect, useState } from "react";
import { getCategories, getDishes } from "../api/menu";
import type { Category, Dish } from "../types";
import DishCard from "../components/DishCard";

export default function MenuPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [selectedCat, setSelectedCat] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCategories().then((r) => setCategories(r.data));
  }, []);

  useEffect(() => {
    setLoading(true);
    getDishes({ category_id: selectedCat ?? undefined, available: true })
      .then((r) => setDishes(r.data))
      .finally(() => setLoading(false));
  }, [selectedCat]);

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 16px" }}>
      <h1>Меню столовой</h1>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 24 }}>
        <button style={selectedCat === null ? activeCatBtn : catBtn} onClick={() => setSelectedCat(null)}>
          Все блюда
        </button>
        {categories.map((cat) => (
          <button key={cat.id} style={selectedCat === cat.id ? activeCatBtn : catBtn}
            onClick={() => setSelectedCat(cat.id)}>
            {cat.name}
          </button>
        ))}
      </div>
      {loading ? (
        <p>Загрузка...</p>
      ) : dishes.length === 0 ? (
        <p style={{ color: "#6b7280" }}>Блюд в этой категории нет</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 20 }}>
          {dishes.map((dish) => <DishCard key={dish.id} dish={dish} />)}
        </div>
      )}
    </div>
  );
}

const catBtn: React.CSSProperties = { padding: "8px 18px", borderRadius: 20, border: "1px solid #d1d5db", background: "#fff", cursor: "pointer" };
const activeCatBtn: React.CSSProperties = { ...catBtn, background: "#2563eb", color: "#fff", border: "1px solid #2563eb" };
