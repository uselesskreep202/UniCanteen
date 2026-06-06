import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getStats, createSlot } from "../api/orders";
import { getCategories, createCategory } from "../api/menu";
import { listUsers, updateUserRole } from "../api/auth";
import type { Category, User, UserRole } from "../types";

type Tab = "stats" | "users" | "menu" | "slots";

const ROLE_LABELS: Record<UserRole, string> = {
  student: "Студент",
  staff: "Сотрудник",
  admin: "Администратор",
};

const ROLE_COLORS: Record<UserRole, string> = {
  student: "#6b7280",
  staff: "#2563eb",
  admin: "#7c3aed",
};

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>("stats");
  const [stats, setStats] = useState<Record<string, number>>({});
  const [categories, setCategories] = useState<Category[]>([]);
  const [catName, setCatName] = useState("");
  const [slot, setSlot] = useState({ date: "", time_start: "", time_end: "", max_orders: 20 });
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  useEffect(() => {
    getStats().then((r) => setStats(r.data));
    getCategories().then((r) => setCategories(r.data));
  }, []);

  useEffect(() => {
    if (tab === "users") {
      setLoadingUsers(true);
      listUsers().then((r) => setUsers(r.data)).finally(() => setLoadingUsers(false));
    }
  }, [tab]);

  const addCategory = async () => {
    if (!catName.trim()) return;
    try {
      const r = await createCategory(catName.trim());
      setCategories((c) => [...c, r.data]);
      setCatName("");
      toast.success("Категория добавлена");
    } catch { toast.error("Ошибка"); }
  };

  const addSlot = async () => {
    if (!slot.date || !slot.time_start || !slot.time_end) { toast.error("Заполните все поля слота"); return; }
    try {
      await createSlot({ ...slot });
      toast.success("Слот добавлен");
      setSlot({ date: "", time_start: "", time_end: "", max_orders: 20 });
    } catch { toast.error("Ошибка"); }
  };

  const handleRoleChange = async (user: User, newRole: UserRole) => {
    if (newRole === user.role) return;
    try {
      const r = await updateUserRole(user.id, newRole);
      setUsers((prev) => prev.map((u) => (u.id === user.id ? r.data : u)));
      toast.success(`Роль ${user.full_name} изменена на «${ROLE_LABELS[newRole]}»`);
    } catch { toast.error("Ошибка изменения роли"); }
  };

  const TABS: { key: Tab; label: string }[] = [
    { key: "stats", label: "📊 Статистика" },
    { key: "users", label: "👥 Пользователи" },
    { key: "menu", label: "🗂 Категории меню" },
    { key: "slots", label: "🕐 Слоты времени" },
  ];

  return (
    <div style={styles.page}>
      <h1>Администрирование</h1>

      <div style={styles.tabs}>
        {TABS.map((t) => (
          <button key={t.key} style={{ ...styles.tab, ...(tab === t.key ? styles.tabActive : {}) }} onClick={() => setTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      {/* STATS */}
      {tab === "stats" && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Статистика заказов</h2>
          <div style={styles.statsGrid}>
            {Object.entries(stats).map(([k, v]) => (
              <div key={k} style={styles.statCard}>
                <div style={styles.statVal}>{typeof v === "number" && k === "revenue" ? `${v} ₽` : v}</div>
                <div style={styles.statKey}>{k}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* USERS */}
      {tab === "users" && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Управление пользователями</h2>
          <p style={styles.hint}>Назначайте роли пользователям. Сотрудник может управлять заказами и блюдами.</p>
          {loadingUsers ? <p>Загрузка...</p> : (
            <div style={styles.userList}>
              {users.map((user) => (
                <div key={user.id} style={styles.userRow}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600 }}>{user.full_name}</div>
                    <div style={{ fontSize: 13, color: "#6b7280" }}>{user.email}</div>
                  </div>
                  <span style={{ ...styles.roleBadge, background: ROLE_COLORS[user.role] }}>
                    {ROLE_LABELS[user.role]}
                  </span>
                  <select
                    style={styles.roleSelect}
                    value={user.role}
                    onChange={(e) => handleRoleChange(user, e.target.value as UserRole)}
                  >
                    <option value="student">Студент</option>
                    <option value="staff">Сотрудник</option>
                    <option value="admin">Администратор</option>
                  </select>
                </div>
              ))}
              {users.length === 0 && <p style={{ color: "#6b7280" }}>Пользователи не найдены</p>}
            </div>
          )}
        </div>
      )}

      {/* CATEGORIES */}
      {tab === "menu" && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Категории меню</h2>
          <div style={styles.row}>
            <input style={styles.input} placeholder="Название категории" value={catName}
              onChange={(e) => setCatName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addCategory()} />
            <button style={styles.btn} onClick={addCategory}>Добавить</button>
          </div>
          <div style={styles.chips}>
            {categories.map((c) => <span key={c.id} style={styles.chip}>{c.name}</span>)}
          </div>
        </div>
      )}

      {/* SLOTS */}
      {tab === "slots" && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Добавить слот времени</h2>
          <p style={styles.hint}>Слоты определяют когда студенты могут получить заказ.</p>
          <div style={styles.formGrid}>
            <div>
              <label style={styles.label}>Дата</label>
              <input style={styles.input} type="date" value={slot.date}
                onChange={(e) => setSlot({ ...slot, date: e.target.value })} />
            </div>
            <div>
              <label style={styles.label}>Макс. заказов</label>
              <input style={styles.input} type="number" value={slot.max_orders}
                onChange={(e) => setSlot({ ...slot, max_orders: Number(e.target.value) })} />
            </div>
            <div>
              <label style={styles.label}>Начало</label>
              <input style={styles.input} type="time" value={slot.time_start}
                onChange={(e) => setSlot({ ...slot, time_start: e.target.value })} />
            </div>
            <div>
              <label style={styles.label}>Конец</label>
              <input style={styles.input} type="time" value={slot.time_end}
                onChange={(e) => setSlot({ ...slot, time_end: e.target.value })} />
            </div>
          </div>
          <button style={{ ...styles.btn, marginTop: 12, width: "100%" }} onClick={addSlot}>
            + Добавить слот
          </button>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { maxWidth: 900, margin: "0 auto", padding: "24px 16px" },
  tabs: { display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" },
  tab: { padding: "10px 18px", borderRadius: 8, border: "1px solid #d1d5db", background: "#fff", cursor: "pointer", fontSize: 14 },
  tabActive: { background: "#2563eb", color: "#fff", border: "1px solid #2563eb" },
  section: { background: "#fff", borderRadius: 12, padding: 24, border: "1px solid #e5e7eb" },
  sectionTitle: { margin: "0 0 16px", fontSize: 20 },
  hint: { color: "#6b7280", fontSize: 14, margin: "0 0 16px" },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 12 },
  statCard: { background: "#f3f4f6", borderRadius: 10, padding: "14px 16px", textAlign: "center" },
  statVal: { fontSize: 26, fontWeight: 700, color: "#2563eb" },
  statKey: { fontSize: 12, color: "#6b7280", textTransform: "capitalize", marginTop: 4 },
  userList: { display: "flex", flexDirection: "column", gap: 10 },
  userRow: { display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", background: "#f9fafb", borderRadius: 10, border: "1px solid #e5e7eb" },
  roleBadge: { color: "#fff", borderRadius: 20, padding: "3px 12px", fontSize: 13, fontWeight: 600, whiteSpace: "nowrap" as const },
  roleSelect: { padding: "6px 10px", borderRadius: 8, border: "1px solid #d1d5db", fontSize: 14, cursor: "pointer" },
  row: { display: "flex", gap: 10, marginBottom: 12 },
  chips: { display: "flex", flexWrap: "wrap", gap: 8, marginTop: 4 },
  chip: { background: "#eff6ff", color: "#2563eb", borderRadius: 20, padding: "4px 14px", fontSize: 14 },
  formGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 },
  label: { display: "block", fontWeight: 600, fontSize: 13, marginBottom: 4, color: "#374151" },
  input: { width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid #d1d5db", fontSize: 14, boxSizing: "border-box" as const },
  btn: { background: "#2563eb", color: "#fff", border: "none", borderRadius: 8, padding: "9px 20px", cursor: "pointer", fontSize: 15 },
};
