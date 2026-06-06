import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useCartStore } from "../store/cartStore";

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const items = useCartStore((s) => s.items);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav style={styles.nav}>
      <Link to="/" style={styles.brand}>🍽 UniCanteen</Link>
      <div style={styles.links}>
        <Link to="/menu" style={styles.link}>Меню</Link>
        {user && <Link to="/orders" style={styles.link}>Мои заказы</Link>}
        {user && (user.role === "staff" || user.role === "admin") && (
          <Link to="/staff" style={styles.link}>Панель сотрудника</Link>
        )}
        {user && user.role === "admin" && (
          <Link to="/admin" style={styles.link}>Администрирование</Link>
        )}
        <Link to="/cart" style={styles.link}>
          Корзина {items.length > 0 && <span style={styles.badge}>{items.length}</span>}
        </Link>
        {user ? (
          <span style={styles.userInfo}>
            {user.full_name}
            <button onClick={handleLogout} style={styles.btn}>Выйти</button>
          </span>
        ) : (
          <Link to="/login" style={styles.link}>Войти</Link>
        )}
      </div>
    </nav>
  );
}

const styles: Record<string, React.CSSProperties> = {
  nav: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 24px", background: "#2563eb", color: "#fff" },
  brand: { color: "#fff", textDecoration: "none", fontWeight: 700, fontSize: 20 },
  links: { display: "flex", gap: 16, alignItems: "center" },
  link: { color: "#fff", textDecoration: "none", fontSize: 15 },
  badge: { background: "#ef4444", borderRadius: "50%", padding: "2px 6px", fontSize: 12, marginLeft: 4 },
  userInfo: { display: "flex", alignItems: "center", gap: 8, fontSize: 14 },
  btn: { background: "transparent", border: "1px solid #fff", color: "#fff", borderRadius: 6, padding: "4px 10px", cursor: "pointer" },
};
