import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useCartStore } from "../store/cartStore";

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const items = useCartStore((s) => s.items);
  const navigate = useNavigate();

  return (
    <nav style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "12px 24px", background: "#2563eb", color: "#fff"
    }}>
      <Link to="/" style={{ color: "#fff", textDecoration: "none", fontWeight: 700, fontSize: 20 }}>
        🍽 UniCanteen
      </Link>
      <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
        <Link to="/menu" style={lnk}>Меню</Link>
        {user && <Link to="/orders" style={lnk}>Мои заказы</Link>}
        {user && (user.role === "staff" || user.role === "admin") && (
          <Link to="/staff" style={lnk}>Панель сотрудника</Link>
        )}
        {user && user.role === "admin" && (
          <Link to="/admin" style={lnk}>Администрирование</Link>
        )}
        <Link to="/cart" style={lnk}>
          🛒 Корзина
          {items.length > 0 && (
            <span style={{
              background: "#ef4444", borderRadius: "50%",
              padding: "2px 6px", fontSize: 12, marginLeft: 4
            }}>{items.length}</span>
          )}
        </Link>
        {user ? (
          <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14 }}>
            {user.full_name}
            <button
              onClick={() => { logout(); navigate("/login"); }}
              style={{
                background: "transparent", border: "1px solid #fff",
                color: "#fff", borderRadius: 6, padding: "4px 10px", cursor: "pointer"
              }}>
              Выйти
            </button>
          </span>
        ) : (
          <Link to="/login" style={lnk}>Войти</Link>
        )}
      </div>
    </nav>
  );
}

const lnk: React.CSSProperties = { color: "#fff", textDecoration: "none", fontSize: 15 };
