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
      toast.success("Аккаунт создан! Войдите.");
      navigate("/login");
    } catch {
      toast.error("Ошибка. Возможно этот email уже занят.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  return (
    <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "#fff", borderRadius: 12, padding: 32, width: 360, boxShadow: "0 4px 24px #0001" }}>
        <h2 style={{ margin: "0 0 24px", textAlign: "center" }}>Регистрация</h2>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <input style={inp} placeholder="Полное имя" value={form.full_name}
            onChange={handleChange("full_name")} required />
          <input style={inp} type="email" placeholder="Email" value={form.email}
            onChange={handleChange("email")} required />
          <input style={inp} type="password" placeholder="Пароль (минимум 6 символов)"
            value={form.password} onChange={handleChange("password")} required minLength={6} />
          <button style={btn} type="submit" disabled={loading}>
            {loading ? "Создаём..." : "Зарегистрироваться"}
          </button>
        </form>
        <p style={{ textAlign: "center", marginTop: 12 }}>
          Уже есть аккаунт? <Link to="/login">Войти</Link>
        </p>
      </div>
    </div>
  );
}

const inp: React.CSSProperties = { padding: "10px 14px", borderRadius: 8, border: "1px solid #d1d5db", fontSize: 15 };
const btn: React.CSSProperties = { background: "#2563eb", color: "#fff", border: "none", borderRadius: 8, padding: "12px", fontSize: 16, cursor: "pointer" };
