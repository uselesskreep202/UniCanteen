import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { register } from "../api/auth";

export default function RegisterPage() {
  const [form, setForm] = useState({ email: "", full_name: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form.email, form.full_name, form.password);
      toast.success("Аккаунт создан! Войдите в систему.");
      navigate("/login");
    } catch {
      toast.error("Ошибка регистрации. Возможно, email уже занят.");
    } finally {
      setLoading(false);
    }
  };

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.title}>Регистрация</h2>
        <form onSubmit={handleSubmit} style={styles.form}>
          <input style={styles.input} placeholder="ФИО" value={form.full_name} onChange={set("full_name")} required />
          <input style={styles.input} type="email" placeholder="Email" value={form.email} onChange={set("email")} required />
          <input style={styles.input} type="password" placeholder="Пароль" value={form.password} onChange={set("password")} required minLength={6} />
          <button style={styles.btn} type="submit" disabled={loading}>{loading ? "..." : "Зарегистрироваться"}</button>
        </form>
        <p style={{ textAlign: "center", marginTop: 12 }}>
          Уже есть аккаунт? <Link to="/login">Войти</Link>
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
