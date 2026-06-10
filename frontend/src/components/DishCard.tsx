import type { Dish } from "../types";
import { useCartStore } from "../store/cartStore";

export default function DishCard({ dish }: { dish: Dish }) {
  const addItem = useCartStore((s) => s.addItem);

  return (
    <div style={{
      border: "1px solid #e5e7eb", borderRadius: 12,
      overflow: "hidden", background: "#fff",
      display: "flex", flexDirection: "column"
    }}>
      {dish.image_url && (
        <img src={dish.image_url} alt={dish.name}
          style={{ width: "100%", height: 160, objectFit: "cover" }} />
      )}
      <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>{dish.name}</h3>
        <p style={{ margin: 0, fontSize: 13, color: "#6b7280", flex: 1 }}>{dish.description}</p>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
          <span style={{ fontWeight: 700, fontSize: 18, color: "#2563eb" }}>{dish.price} ₽</span>
          <button
            onClick={() => addItem(dish)}
            disabled={!dish.available}
            style={{
              background: dish.available ? "#2563eb" : "#9ca3af",
              color: "#fff", border: "none", borderRadius: 8,
              padding: "8px 16px", cursor: dish.available ? "pointer" : "not-allowed"
            }}>
            {dish.available ? "В корзину" : "Недоступно"}
          </button>
        </div>
      </div>
    </div>
  );
}
