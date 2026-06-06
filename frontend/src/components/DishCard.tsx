import type { Dish } from "../types";
import { useCartStore } from "../store/cartStore";

interface Props { dish: Dish; }

export default function DishCard({ dish }: Props) {
  const addItem = useCartStore((s) => s.addItem);

  return (
    <div style={styles.card}>
      {dish.image_url && <img src={dish.image_url} alt={dish.name} style={styles.img} />}
      <div style={styles.body}>
        <h3 style={styles.name}>{dish.name}</h3>
        <p style={styles.desc}>{dish.description}</p>
        <div style={styles.footer}>
          <span style={styles.price}>{dish.price} ₽</span>
          <button
            onClick={() => addItem(dish)}
            disabled={!dish.available}
            style={{ ...styles.btn, opacity: dish.available ? 1 : 0.4 }}
          >
            {dish.available ? "В корзину" : "Недоступно"}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  card: { border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden", background: "#fff", display: "flex", flexDirection: "column" },
  img: { width: "100%", height: 160, objectFit: "cover" },
  body: { padding: 16, display: "flex", flexDirection: "column", gap: 8, flex: 1 },
  name: { margin: 0, fontSize: 16, fontWeight: 600 },
  desc: { margin: 0, fontSize: 13, color: "#6b7280", flex: 1 },
  footer: { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 },
  price: { fontWeight: 700, fontSize: 18, color: "#2563eb" },
  btn: { background: "#2563eb", color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", cursor: "pointer", fontSize: 14 },
};
