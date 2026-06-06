import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { login } from "../api/auth";
import { useAuthStore } from "../store/authStore";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { access_token, user } = await login(email, password);
      setAuth(user, access_token);
      toast.success(`Добро пожаловать, ${user.full_name}!`);
      navigate("/menu");
    } catch {
      toast.error("Неверный email или пароль");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.title}>Вход в систему</h2>
        <form onSubmit={handleSubmit} style={styles.form}>
          <input style={styles.input} type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input style={styles.input} type="password" placeholder="Пароль" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <button style={styles.btn} type="submit" disabled={loading}>{loading ? "Вход..." : "Войти"}</button>
        </form>
        <p style={{ textAlign: "center", marginTop: 12 }}>
          Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
        </p>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f3f4f6" },
  card: { background: "#fff", borderRadius: 12, padding: 32, width: 360, boxShadow: "0 4px 24px #0001" },
  title: { margin: "0 0 24px", textAlign: "center" },
  form: { display: "flex", flexDirection: "column", gap: 14 },
  input: { padding: "10px 14px", borderRadius: 8, border: "1px solid #d1d5db", fontSize: 15 },
  btn: { background: "#2563eb", color: "#fff", border: "none", borderRadius: 8, padding: "12px", fontSize: 16, cursor: "pointer" },
};
