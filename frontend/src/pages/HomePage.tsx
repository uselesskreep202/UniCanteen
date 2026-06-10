import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export default function HomePage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 16px" }}>
      <div style={{
        textAlign: "center", padding: "60px 20px",
        background: "linear-gradient(135deg, #eff6ff, #dbeafe)",
        borderRadius: 20, marginBottom: 40
      }}>
        <h1 style={{ fontSize: 36, margin: "0 0 16px", color: "#1e3a8a" }}>
          Предзаказ в столовой университета
        </h1>
        <p style={{ fontSize: 18, color: "#4b5563", margin: "0 0 32px" }}>
          Закажите еду заранее и получите без очереди
        </p>
        <div style={{ display: "flex", gap: 14, justifyContent: "center" }}>
          <button onClick={() => navigate("/menu")} style={primaryBtn}>
            Смотреть меню
          </button>
          {!user && (
            <button onClick={() => navigate("/register")} style={outlineBtn}>
              Зарегистрироваться
            </button>
          )}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
        {[
          { icon: "🕐", title: "Выберите время", desc: "Выбирайте удобный слот для получения еды" },
          { icon: "🍽", title: "Закажите блюда", desc: "Добавляйте блюда в корзину из меню" },
          { icon: "✅", title: "Получите заказ", desc: "Приходите в нужное время — всё готово" },
        ].map((f) => (
          <div key={f.title} style={{
            background: "#fff", borderRadius: 14, padding: 28,
            textAlign: "center", border: "1px solid #e5e7eb"
          }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>{f.icon}</div>
            <h3 style={{ margin: "0 0 8px" }}>{f.title}</h3>
            <p style={{ margin: 0, color: "#6b7280" }}>{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

const primaryBtn: React.CSSProperties = {
  background: "#2563eb", color: "#fff", border: "none",
  borderRadius: 10, padding: "14px 32px", fontSize: 16, cursor: "pointer"
};
const outlineBtn: React.CSSProperties = {
  background: "#fff", color: "#2563eb", border: "2px solid #2563eb",
  borderRadius: 10, padding: "14px 32px", fontSize: 16, cursor: "pointer"
};
