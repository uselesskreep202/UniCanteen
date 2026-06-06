import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export default function HomePage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  return (
    <div style={styles.page}>
      <div style={styles.hero}>
        <h1 style={styles.title}>Предзаказ в столовой университета</h1>
        <p style={styles.sub}>Закажите еду заранее и получите её без очереди в удобное время</p>
        <div style={styles.btns}>
          <button style={styles.primary} onClick={() => navigate("/menu")}>Смотреть меню</button>
          {!user && <button style={styles.secondary} onClick={() => navigate("/register")}>Зарегистрироваться</button>}
        </div>
      </div>
      <div style={styles.features}>
        {[
          { icon: "🕐", title: "Выберите время", desc: "Выбирайте удобный слот для получения заказа" },
          { icon: "🍽", title: "Закажите блюда", desc: "Просматривайте меню и добавляйте блюда в корзину" },
          { icon: "✅", title: "Получите заказ", desc: "Приходите в нужное время — заказ будет готов" },
        ].map((f) => (
          <div key={f.title} style={styles.feature}>
            <div style={styles.icon}>{f.icon}</div>
            <h3 style={styles.fTitle}>{f.title}</h3>
            <p style={styles.fDesc}>{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { maxWidth: 1100, margin: "0 auto", padding: "40px 16px" },
  hero: { textAlign: "center", padding: "60px 20px", background: "linear-gradient(135deg, #eff6ff, #dbeafe)", borderRadius: 20, marginBottom: 40 },
  title: { fontSize: 36, margin: "0 0 16px", color: "#1e3a8a" },
  sub: { fontSize: 18, color: "#4b5563", margin: "0 0 32px" },
  btns: { display: "flex", gap: 14, justifyContent: "center" },
  primary: { background: "#2563eb", color: "#fff", border: "none", borderRadius: 10, padding: "14px 32px", fontSize: 16, cursor: "pointer" },
  secondary: { background: "#fff", color: "#2563eb", border: "2px solid #2563eb", borderRadius: 10, padding: "14px 32px", fontSize: 16, cursor: "pointer" },
  features: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 },
  feature: { background: "#fff", borderRadius: 14, padding: 28, textAlign: "center", border: "1px solid #e5e7eb" },
  icon: { fontSize: 40, marginBottom: 12 },
  fTitle: { margin: "0 0 8px", fontSize: 18 },
  fDesc: { margin: 0, color: "#6b7280" },
};
