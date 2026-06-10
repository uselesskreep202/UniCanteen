import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { listUsers, updateUserRole } from "../api/auth";
import { getStats, getSlots, createSlot } from "../api/orders";
import { getCategories, createCategory } from "../api/menu";
import type { User, UserRole, TimeSlot, Category } from "../types";

export default function AdminPage() {
  const [tab, setTab] = useState<"stats" | "users" | "slots" | "cats">("stats");
  const [stats, setStats] = useState<Record<string, number>>({});
  const [users, setUsers] = useState<User[]>([]);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCat, setNewCat] = useState("");
  const [newSlot, setNewSlot] = useState({ date: "", time_start: "", time_end: "", max_orders: "20" });

  useEffect(() => {
    getStats().then((r) => setStats(r.data));
    listUsers().then((r) => setUsers(r.data));
    getSlots().then((r) => setSlots(r.data));
    getCategories().then((r) => setCategories(r.data));
  }, []);

  const handleRoleChange = async (userId: number, role: UserRole) => {
    try {
      const r = await updateUserRole(userId, role);
      setUsers((prev) => prev.map((u) => (u.id === userId ? r.data : u)));
      toast.success("Роль обновлена");
    } catch { toast.error("Ошибка"); }
  };

  const handleCreateCat = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const r = await createCategory(newCat);
      setCategories((prev) => [...prev, r.data]);
      setNewCat("");
      toast.success("Категория создана");
    } catch { toast.error("Ошибка"); }
  };

  const handleCreateSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const r = await createSlot({ ...newSlot, max_orders: Number(newSlot.max_orders) } as Omit<TimeSlot, "id" | "current_orders">);
      setSlots((prev) => [...prev, r.data]);
      setNewSlot({ date: "", time_start: "", time_end: "", max_orders: "20" });
      toast.success("Слот создан");
    } catch { toast.error("Ошибка"); }
  };

  const statLabels: Record<string, string> = {
    total: "Всего заказов", pending: "Ожидают", confirmed: "Подтверждены",
    ready: "Готовы", completed: "Выданы", cancelled: "Отменены", revenue: "Выручка"
  };

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "24px 16px" }}>
      <h1>Администрирование</h1>
      <div style={{ display: "flex", gap: 10, marginBottom: 24, flexWrap: "wrap" }}>
        {(["stats", "users", "slots", "cats"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} style={tab === t ? activeTab : tabBtn}>
            {{ stats: "📊 Статистика", users: "👥 Пользователи", slots: "🕐 Слоты", cats: "🗂 Категории" }[t]}
          </button>
        ))}
      </div>

      {tab === "stats" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 16 }}>
          {Object.entries(stats).map(([k, v]) => (
            <div key={k} style={{ background: "#fff", borderRadius: 12, padding: 20, border: "1px solid #e5e7eb", textAlign: "center" }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: "#2563eb" }}>{k === "revenue" ? `${v} ₽` : v}</div>
              <div style={{ color: "#6b7280", fontSize: 13, marginTop: 4 }}>{statLabels[k] ?? k}</div>
            </div>
          ))}
        </div>
      )}

      {tab === "users" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {users.map((u) => (
            <div key={u.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#fff", borderRadius: 10, padding: "12px 16px", border: "1px solid #e5e7eb" }}>
              <div>
                <strong>{u.full_name}</strong>
                <span style={{ color: "#6b7280", fontSize: 13, marginLeft: 10 }}>{u.email}</span>
              </div>
              <select value={u.role} onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid #d1d5db" }}>
                <option value="student">Студент</option>
                <option value="staff">Сотрудник</option>
                <option value="admin">Администратор</option>
              </select>
            </div>
          ))}
        </div>
      )}

      {tab === "slots" && (
        <div>
          <form onSubmit={handleCreateSlot} style={{ background: "#fff", borderRadius: 12, padding: 20, border: "1px solid #e5e7eb", marginBottom: 20, display: "flex", flexDirection: "column", gap: 12 }}>
            <h3 style={{ margin: 0 }}>Создать временной слот</h3>
            <input style={inp} type="date" value={newSlot.date}
              onChange={(e) => setNewSlot((p) => ({ ...p, date: e.target.value }))} required />
            <div style={{ display: "flex", gap: 10 }}>
              <input style={inp} type="time" value={newSlot.time_start}
                onChange={(e) => setNewSlot((p) => ({ ...p, time_start: e.target.value }))} required />
              <input style={inp} type="time" value={newSlot.time_end}
                onChange={(e) => setNewSlot((p) => ({ ...p, time_end: e.target.value }))} required />
            </div>
            <input style={inp} type="number" placeholder="Макс. заказов" value={newSlot.max_orders}
              onChange={(e) => setNewSlot((p) => ({ ...p, max_orders: e.target.value }))} required />
            <button type="submit" style={primaryBtn}>Создать слот</button>
          </form>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {slots.map((s) => (
              <div key={s.id} style={{ background: "#fff", borderRadius: 10, padding: "10px 16px", border: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between" }}>
                <span>{s.date} | {s.time_start}–{s.time_end}</span>
                <span style={{ color: "#6b7280" }}>{s.current_orders}/{s.max_orders} заказов</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "cats" && (
        <div>
          <form onSubmit={handleCreateCat} style={{ display: "flex", gap: 10, marginBottom: 20 }}>
            <input style={{ ...inp, flex: 1 }} placeholder="Название категории" value={newCat}
              onChange={(e) => setNewCat(e.target.value)} required />
            <button type="submit" style={primaryBtn}>Добавить</button>
          </form>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {categories.map((c) => (
              <div key={c.id} style={{ background: "#fff", borderRadius: 10, padding: "10px 16px", border: "1px solid #e5e7eb" }}>
                {c.name}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const tabBtn: React.CSSProperties = { padding: "8px 18px", borderRadius: 8, border: "1px solid #d1d5db", background: "#fff", cursor: "pointer", fontSize: 14 };
const activeTab: React.CSSProperties = { ...tabBtn, background: "#2563eb", color: "#fff", border: "1px solid #2563eb" };
const inp: React.CSSProperties = { padding: "8px 12px", borderRadius: 8, border: "1px solid #d1d5db", fontSize: 14 };
const primaryBtn: React.CSSProperties = { background: "#2563eb", color: "#fff", border: "none", borderRadius: 8, padding: "10px 20px", fontSize: 15, cursor: "pointer" };
