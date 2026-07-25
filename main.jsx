import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Car, Calendar, Wallet, TrendingUp, Plus, Trash2, X, Fuel, User, Route, ChevronDown, AlertCircle, LogOut, Lock, Shield, UserPlus, Pencil, Check } from "lucide-react";
import { api } from "./api";

// ---------- Helpers ----------
const todayISO = () => new Date().toISOString().slice(0, 10);
const currentMonth = () => new Date().toISOString().slice(0, 7);
const vnd = (n) => (Number(n) || 0).toLocaleString("vi-VN") + "đ";
const monthLabel = (m) => {
  const [y, mo] = m.split("-");
  return `Tháng ${parseInt(mo, 10)}/${y}`;
};

const EXPENSE_CATEGORIES = [
  "Bến bãi / gửi xe",
  "Bảo trì / sửa chữa",
  "Bảo hiểm",
  "Đăng kiểm / phí đường bộ",
  "Lương nhân viên văn phòng",
  "Khấu hao xe",
  "Lãi vay ngân hàng",
  "Khác",
];

// ---------- Small UI atoms ----------
function Card({ children, className = "" }) {
  return (
    <div className={`bg-[#171B22] border border-[#262B35] rounded-2xl ${className}`}>
      {children}
    </div>
  );
}

function StatBlock({ label, value, accent, sub }) {
  return (
    <Card className="p-4 sm:p-5 w-full lg:flex-1 lg:min-w-[150px]">
      <div className="text-[11px] uppercase tracking-[0.14em] text-[#7A8194] font-medium mb-2">
        {label}
      </div>
      <div
        className="text-xl sm:text-2xl md:text-[28px] font-semibold tabular-nums break-all"
        style={{ color: accent, fontFamily: "'JetBrains Mono', ui-monospace, monospace" }}
      >
        {value}
      </div>
      {sub && <div className="text-xs text-[#5C6474] mt-1">{sub}</div>}
    </Card>
  );
}

function Field({ label, children }) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="text-[#9AA1B2] text-xs font-medium">{label}</span>
      {children}
    </label>
  );
}

const inputClass =
  "bg-[#0F1218] border border-[#2A3040] rounded-lg px-3 py-2 text-[#E7E9EE] text-sm outline-none focus:border-[#4CC38A] transition-colors placeholder:text-[#4B5262]";

function Select({ value, onChange, children, className = "" }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        className={`${inputClass} appearance-none w-full pr-8 ${className}`}
      >
        {children}
      </select>
      <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#5C6474] pointer-events-none" />
    </div>
  );
}

function EmptyState({ icon: Icon, text }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 text-center gap-2 text-[#5C6474]">
      <Icon size={28} strokeWidth={1.5} />
      <p className="text-sm max-w-[280px]">{text}</p>
    </div>
  );
}

function ErrorBanner({ message, onClose }) {
  if (!message) return null;
  return (
    <div className="bg-[#2A1616] border border-[#5A2A2A] text-[#F87171] text-sm rounded-lg px-4 py-3 flex items-center justify-between mb-4">
      <span>{message}</span>
      <button onClick={onClose}><X size={14} /></button>
    </div>
  );
}

// ---------- Login ----------
function LoginPage({ onLoggedIn }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!username || !password) return;
    setLoading(true);
    setError("");
    try {
      const user = await api.login(username, password);
      onLoggedIn(user);
    } catch (err) {
      setError(err.message || "Đăng nhập thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0D12] flex items-center justify-center px-4" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 text-[#4CC38A] text-xs font-semibold tracking-[0.18em] uppercase mb-2 justify-center">
          <Route size={14} /> Quản lý cho thuê xe
        </div>
        <Card className="p-6">
          <h1 className="text-lg font-semibold text-white mb-5 text-center">Đăng nhập</h1>
          <form onSubmit={submit} className="flex flex-col gap-3.5">
            <Field label="Tài khoản">
              <input
                className={inputClass}
                autoFocus
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
              />
            </Field>
            <Field label="Mật khẩu">
              <input
                type="password"
                className={inputClass}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </Field>
            {error && (
              <div className="text-[#F87171] text-xs bg-[#2A1616] border border-[#5A2A2A] rounded-lg px-3 py-2">
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="mt-1 w-full bg-[#4CC38A] text-[#0B0D12] font-medium rounded-lg py-2.5 text-sm hover:bg-[#3FAE79] transition-colors disabled:opacity-60"
            >
              {loading ? "Đang đăng nhập…" : "Đăng nhập"}
            </button>
          </form>
        </Card>
        <p className="text-center text-xs text-[#4B5262] mt-4">
          Tài khoản mặc định lần đầu: <span className="text-[#7A8194]">admin / admin123</span> — hãy đổi mật khẩu sau khi đăng nhập.
        </p>
      </div>
    </div>
  );
}

// ---------- Account tab (đổi mật khẩu + quản lý tài khoản) ----------
function AccountTab({ currentUser, setError, setNotice }) {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [changing, setChanging] = useState(false);

  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(currentUser.role === "admin");
  const [newUser, setNewUser] = useState({ username: "", password: "", role: "staff" });
  const [addingUser, setAddingUser] = useState(false);

  useEffect(() => {
    if (currentUser.role === "admin") {
      api.getUsers().then(setUsers).catch(() => {}).finally(() => setLoadingUsers(false));
    }
  }, [currentUser.role]);

  const submitChangePassword = async (e) => {
    e.preventDefault();
    if (!oldPassword || !newPassword) return;
    setChanging(true);
    try {
      await api.changePassword(oldPassword, newPassword);
      setOldPassword("");
      setNewPassword("");
      setNotice("Đã đổi mật khẩu thành công.");
    } catch (err) {
      setError(err.message || "Không đổi được mật khẩu.");
    } finally {
      setChanging(false);
    }
  };

  const addUser = async () => {
    if (!newUser.username || !newUser.password) return;
    setAddingUser(true);
    try {
      const created = await api.addUser(newUser);
      setUsers((u) => [...u, created]);
      setNewUser({ username: "", password: "", role: "staff" });
    } catch (err) {
      setError(err.message || "Không thêm được tài khoản.");
    } finally {
      setAddingUser(false);
    }
  };

  const removeUser = async (id) => {
    const prev = users;
    setUsers(users.filter((u) => u.id !== id));
    try {
      await api.deleteUser(id);
    } catch (err) {
      setUsers(prev);
      setError(err.message || "Không xoá được tài khoản.");
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <Card className="p-4 sm:p-5">
        <h3 className="text-sm font-semibold text-white mb-1 flex items-center gap-2">
          <Lock size={15} className="text-[#4CC38A]" /> Đổi mật khẩu
        </h3>
        <p className="text-xs text-[#5C6474] mb-4">
          Đang đăng nhập với tài khoản <span className="text-[#9AA1B2]">{currentUser.username}</span>
          {currentUser.role === "admin" && <span className="text-[#4CC38A]"> · quản trị</span>}
        </p>
        <form onSubmit={submitChangePassword} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Field label="Mật khẩu hiện tại">
            <input type="password" className={inputClass} value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} />
          </Field>
          <Field label="Mật khẩu mới">
            <input type="password" className={inputClass} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Tối thiểu 6 ký tự" />
          </Field>
          <div className="flex items-end">
            <button type="submit" disabled={changing} className="w-full bg-[#4CC38A] text-[#0B0D12] font-medium rounded-lg py-2 text-sm hover:bg-[#3FAE79] transition-colors disabled:opacity-60">
              {changing ? "Đang lưu…" : "Đổi mật khẩu"}
            </button>
          </div>
        </form>
      </Card>

      {currentUser.role === "admin" && (
        <Card className="p-4 sm:p-5">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Shield size={15} className="text-[#4CC38A]" /> Quản lý tài khoản
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <Field label="Tài khoản mới">
              <input className={inputClass} value={newUser.username} onChange={(e) => setNewUser((u) => ({ ...u, username: e.target.value }))} placeholder="ten_dang_nhap" />
            </Field>
            <Field label="Mật khẩu">
              <input type="password" className={inputClass} value={newUser.password} onChange={(e) => setNewUser((u) => ({ ...u, password: e.target.value }))} placeholder="Tối thiểu 6 ký tự" />
            </Field>
            <Field label="Vai trò">
              <Select value={newUser.role} onChange={(e) => setNewUser((u) => ({ ...u, role: e.target.value }))}>
                <option value="staff">Nhân viên</option>
                <option value="admin">Quản trị</option>
              </Select>
            </Field>
            <div className="flex items-end">
              <button onClick={addUser} disabled={addingUser} className="w-full bg-[#4CC38A] text-[#0B0D12] font-medium rounded-lg py-2 text-sm hover:bg-[#3FAE79] transition-colors disabled:opacity-60 flex items-center justify-center gap-1.5">
                <UserPlus size={14} /> {addingUser ? "Đang thêm…" : "Thêm tài khoản"}
              </button>
            </div>
          </div>

          {loadingUsers ? (
            <p className="text-sm text-[#5C6474]">Đang tải danh sách tài khoản…</p>
          ) : (
            <div className="flex flex-col gap-2">
              {users.map((u) => (
                <div key={u.id} className="flex items-center justify-between gap-3 bg-[#0F1218] border border-[#1E232C] rounded-lg px-3 sm:px-4 py-3">
                  <div className="flex items-center gap-2 text-sm min-w-0 flex-wrap">
                    <span className="text-white font-medium">{u.username}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${u.role === "admin" ? "bg-[#1A2A22] text-[#4CC38A]" : "bg-[#1B1F28] text-[#9AA1B2]"}`}>
                      {u.role === "admin" ? "Quản trị" : "Nhân viên"}
                    </span>
                    {u.id === currentUser.id && <span className="text-xs text-[#5C6474]">(bạn)</span>}
                  </div>
                  {u.id !== currentUser.id && (
                    <button onClick={() => removeUser(u.id)} className="text-[#5C6474] hover:text-[#F87171] transition-colors p-1 -m-1 shrink-0">
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

// ---------- App ----------
function FleetApp({ currentUser, onLogout }) {
  const [tab, setTab] = useState("overview");
  const [cars, setCars] = useState([]);
  const [trips, setTrips] = useState([]);
  const [daily, setDaily] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [month, setMonth] = useState(currentMonth());

  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(""), 3500);
    return () => clearTimeout(t);
  }, [notice]);

  const loadAll = useCallback(async () => {
    try {
      const [c, t, d, e] = await Promise.all([
        api.getCars(),
        api.getTrips(),
        api.getDaily(),
        api.getExpenses(),
      ]);
      setCars(c);
      setTrips(t);
      setDaily(d);
      setExpenses(e);
    } catch (err) {
      setError("Không kết nối được tới server. Kiểm tra lại backend / DATABASE_URL trên Railway.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const carName = (id) => cars.find((c) => c.id === id)?.name || "—";

  // ----- Monthly aggregation -----
  const stats = useMemo(() => {
    const inMonth = (dateStr) => (dateStr || "").slice(0, 7) === month;
    const mTrips = trips.filter((t) => inMonth(t.date));
    const mDaily = daily.filter((d) => inMonth(d.date));
    const mExpenses = expenses.filter((e) => e.month === month);

    const tripRevenue = mTrips.reduce((s, t) => s + (Number(t.revenue) || 0), 0);
    const tripCost = mTrips.reduce(
      (s, t) => s + (Number(t.driverCost) || 0) + (Number(t.fuelCost) || 0) + (Number(t.otherCost) || 0),
      0
    );
    const dailyRevenue = mDaily.reduce((s, d) => s + (Number(d.pricePerDay) || 0) * (Number(d.days) || 1), 0);
    const monthlyExpenseTotal = mExpenses.reduce((s, e) => s + (Number(e.amount) || 0), 0);

    const totalRevenue = tripRevenue + dailyRevenue;
    const totalCost = tripCost + monthlyExpenseTotal;
    const profit = totalRevenue - totalCost;

    return {
      mTrips,
      mDaily,
      mExpenses,
      tripRevenue,
      tripCost,
      dailyRevenue,
      monthlyExpenseTotal,
      totalRevenue,
      totalCost,
      profit,
      tripCount: mTrips.length,
      dailyCount: mDaily.length,
    };
  }, [trips, daily, expenses, month]);

  const monthOptions = useMemo(() => {
    const set = new Set([month]);
    trips.forEach((t) => t.date && set.add(t.date.slice(0, 7)));
    daily.forEach((d) => d.date && set.add(d.date.slice(0, 7)));
    expenses.forEach((e) => e.month && set.add(e.month));
    return Array.from(set).sort().reverse();
  }, [trips, daily, expenses, month]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0D12] flex items-center justify-center text-[#5C6474] text-sm">
        Đang tải dữ liệu…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0D12] text-[#E7E9EE]" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div className="max-w-5xl mx-auto px-4 md:px-6 pb-24">
        {/* Header */}
        <header className="pt-6 md:pt-8 pb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-[#4CC38A] text-xs font-semibold tracking-[0.18em] uppercase mb-1">
              <Route size={14} /> Quản lý cho thuê xe
            </div>
            <h1 className="text-xl md:text-2xl font-semibold text-white">Đội xe {cars.length} chiếc</h1>
          </div>
          <div className="flex items-center gap-2.5">
            <Select value={month} onChange={(e) => setMonth(e.target.value)} className="flex-1 sm:flex-none sm:w-[170px]">
              {monthOptions.map((m) => (
                <option key={m} value={m}>
                  {monthLabel(m)}
                </option>
              ))}
            </Select>
            <span className="text-xs text-[#5C6474] hidden md:inline">{currentUser.username}</span>
            <button
              onClick={onLogout}
              title="Đăng xuất"
              className="w-10 h-10 sm:w-9 sm:h-9 flex items-center justify-center shrink-0 rounded-lg border border-[#262B35] text-[#9AA1B2] hover:text-[#F87171] hover:border-[#5A2A2A] transition-colors"
            >
              <LogOut size={15} />
            </button>
          </div>
        </header>

        <ErrorBanner message={error} onClose={() => setError("")} />
        {notice && (
          <div className="bg-[#12241C] border border-[#255A3D] text-[#4CC38A] text-sm rounded-lg px-4 py-3 flex items-center justify-between mb-4">
            <span>{notice}</span>
            <button onClick={() => setNotice("")}><X size={14} /></button>
          </div>
        )}

        {/* Tabs */}
        <nav className="flex gap-1 bg-[#12151C] border border-[#262B35] rounded-xl p-1 mb-6 overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-1">
          {[
            { id: "overview", label: "Tổng quan", shortLabel: "Tổng quan", icon: TrendingUp },
            { id: "trips", label: "Tính chuyến", shortLabel: "Chuyến", icon: Route },
            { id: "daily", label: "Tính ngày", shortLabel: "Ngày", icon: Calendar },
            { id: "expenses", label: "Chi phí hằng tháng", shortLabel: "Chi phí", icon: Wallet },
            { id: "cars", label: "Xe", shortLabel: "Xe", icon: Car },
            { id: "account", label: "Tài khoản", shortLabel: "Tài khoản", icon: Lock },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-3 sm:px-3.5 py-2.5 sm:py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors shrink-0 ${
                tab === t.id ? "bg-[#4CC38A] text-[#0B0D12]" : "text-[#9AA1B2] hover:text-white"
              }`}
            >
              <t.icon size={14} />
              <span className="sm:hidden">{t.shortLabel}</span>
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          ))}
        </nav>

        {tab === "overview" && <Overview stats={stats} monthLabel={monthLabel(month)} carName={carName} />}
        {tab === "trips" && (
          <TripsTab cars={cars} trips={trips} setTrips={setTrips} carName={carName} setError={setError} />
        )}
        {tab === "daily" && (
          <DailyTab cars={cars} daily={daily} setDaily={setDaily} carName={carName} setError={setError} />
        )}
        {tab === "expenses" && (
          <ExpensesTab expenses={expenses} setExpenses={setExpenses} month={month} setError={setError} />
        )}
        {tab === "cars" && (
          <CarsTab cars={cars} setCars={setCars} trips={trips} daily={daily} setError={setError} />
        )}
        {tab === "account" && (
          <AccountTab currentUser={currentUser} setError={setError} setNotice={setNotice} />
        )}
      </div>
    </div>
  );
}

// ---------- Overview / Meter ----------
function Overview({ stats, monthLabel, carName }) {
  const profitPositive = stats.profit >= 0;
  return (
    <div className="flex flex-col gap-5 md:gap-6">
      <Card className="p-5 sm:p-6 md:p-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{
          backgroundImage: "repeating-linear-gradient(90deg, #4CC38A 0px, #4CC38A 1px, transparent 1px, transparent 24px)"
        }} />
        <div className="text-[11px] uppercase tracking-[0.16em] text-[#7A8194] font-medium mb-3">
          Lợi nhuận · {monthLabel}
        </div>
        <div
          className="text-4xl sm:text-5xl md:text-6xl font-bold tabular-nums leading-none break-all"
          style={{
            fontFamily: "'JetBrains Mono', ui-monospace, monospace",
            color: profitPositive ? "#4CC38A" : "#F87171",
            textShadow: profitPositive ? "0 0 24px rgba(76,195,138,0.35)" : "0 0 24px rgba(248,113,113,0.3)",
          }}
        >
          {profitPositive ? "+" : ""}
          {vnd(stats.profit)}
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-1 mt-5 text-sm">
          <div>
            <span className="text-[#5C6474]">Doanh thu </span>
            <span className="text-white font-medium tabular-nums">{vnd(stats.totalRevenue)}</span>
          </div>
          <div>
            <span className="text-[#5C6474]">Chi phí </span>
            <span className="text-white font-medium tabular-nums">{vnd(stats.totalCost)}</span>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-2 lg:flex lg:flex-wrap gap-3 md:gap-4">
        <StatBlock label="Doanh thu chuyến" value={vnd(stats.tripRevenue)} accent="#E7E9EE" sub={`${stats.tripCount} chuyến`} />
        <StatBlock label="Doanh thu thuê ngày" value={vnd(stats.dailyRevenue)} accent="#E7E9EE" sub={`${stats.dailyCount} lượt`} />
        <StatBlock label="Chi phí chuyến" value={vnd(stats.tripCost)} accent="#FB923C" sub="tài xế + xăng dầu + khác" />
        <StatBlock label="Chi phí hằng tháng" value={vnd(stats.monthlyExpenseTotal)} accent="#FB923C" />
      </div>

      <Card className="p-4 sm:p-5">
        <h3 className="text-sm font-semibold text-white mb-3">Hoạt động gần đây trong tháng</h3>
        {stats.mTrips.length === 0 && stats.mDaily.length === 0 ? (
          <EmptyState icon={AlertCircle} text="Chưa có chuyến hoặc lượt thuê ngày nào trong tháng này." />
        ) : (
          <div className="flex flex-col divide-y divide-[#1E232C]">
            {[...stats.mTrips.map((t) => ({ ...t, kind: "trip" })), ...stats.mDaily.map((d) => ({ ...d, kind: "daily" }))]
              .sort((a, b) => (b.date || "").localeCompare(a.date || ""))
              .slice(0, 8)
              .map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-2 py-2.5 text-sm">
                  <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 flex-wrap">
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${item.kind === "trip" ? "bg-[#4CC38A]" : "bg-[#60A5FA]"}`} />
                    <span className="text-[#9AA1B2]">{item.date}</span>
                    <span className="text-white">{carName(item.carId)}</span>
                    <span className="text-[#5C6474] text-xs truncate">{item.customer || (item.kind === "trip" ? "Chuyến" : "Thuê ngày")}</span>
                  </div>
                  <span className="tabular-nums text-white font-medium shrink-0">
                    {item.kind === "trip" ? vnd(item.revenue) : vnd((Number(item.pricePerDay) || 0) * (Number(item.days) || 1))}
                  </span>
                </div>
              ))}
          </div>
        )}
      </Card>
    </div>
  );
}

// ---------- Trips ----------
function emptyTrip() {
  return { date: todayISO(), carId: "", customer: "", revenue: "", driverCost: "", fuelCost: "", otherCost: "" };
}

function TripsTab({ cars, trips, setTrips, carName, setError }) {
  const [form, setForm] = useState(emptyTrip());
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const setEdit = (k, v) => setEditForm((f) => ({ ...f, [k]: v }));

  const add = async () => {
    if (!form.carId || !form.revenue) return;
    setSaving(true);
    try {
      const payload = { ...form, carId: form.carId || cars[0]?.id };
      const { id } = await api.addTrip(payload);
      setTrips([{ ...payload, id }, ...trips]);
      setForm(emptyTrip());
    } catch (e) {
      setError("Không lưu được chuyến. Thử lại sau.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    const prev = trips;
    setTrips(trips.filter((t) => t.id !== id));
    try {
      await api.deleteTrip(id);
    } catch (e) {
      setTrips(prev);
      setError("Không xoá được chuyến này.");
    }
  };

  const startEdit = (t) => {
    setEditingId(t.id);
    setEditForm({
      date: t.date,
      carId: t.carId,
      customer: t.customer || "",
      revenue: t.revenue,
      driverCost: t.driverCost,
      fuelCost: t.fuelCost,
      otherCost: t.otherCost,
    });
  };
  const cancelEdit = () => {
    setEditingId(null);
    setEditForm(null);
  };
  const saveEdit = async (id) => {
    setSavingEdit(true);
    try {
      await api.updateTrip(id, editForm);
      setTrips(trips.map((t) => (t.id === id ? { ...t, ...editForm } : t)));
      setEditingId(null);
      setEditForm(null);
    } catch (e) {
      setError("Không lưu được thay đổi.");
    } finally {
      setSavingEdit(false);
    }
  };

  const profitOf = (t) =>
    (Number(t.revenue) || 0) - (Number(t.driverCost) || 0) - (Number(t.fuelCost) || 0) - (Number(t.otherCost) || 0);

  return (
    <div className="flex flex-col gap-5">
      <Card className="p-4 sm:p-5">
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <Plus size={15} className="text-[#4CC38A]" /> Thêm chuyến mới
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <Field label="Ngày">
            <input type="date" className={inputClass} value={form.date} onChange={(e) => set("date", e.target.value)} />
          </Field>
          <Field label="Xe">
            <Select value={form.carId} onChange={(e) => set("carId", e.target.value)}>
              <option value="">Chọn xe</option>
              {cars.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </Select>
          </Field>
          <Field label="Khách hàng">
            <input className={inputClass} placeholder="Tên khách" value={form.customer} onChange={(e) => set("customer", e.target.value)} />
          </Field>
          <Field label="Giá chuyến (đ)">
            <input type="number" className={inputClass} placeholder="0" value={form.revenue} onChange={(e) => set("revenue", e.target.value)} />
          </Field>
          <Field label="Tiền tài xế (đ)">
            <input type="number" className={inputClass} placeholder="0" value={form.driverCost} onChange={(e) => set("driverCost", e.target.value)} />
          </Field>
          <Field label="Xăng dầu (đ)">
            <input type="number" className={inputClass} placeholder="0" value={form.fuelCost} onChange={(e) => set("fuelCost", e.target.value)} />
          </Field>
          <Field label="Chi phí khác (đ)">
            <input type="number" className={inputClass} placeholder="Cầu đường, bãi đỗ…" value={form.otherCost} onChange={(e) => set("otherCost", e.target.value)} />
          </Field>
          <div className="flex items-end">
            <button disabled={saving} onClick={add} className="w-full bg-[#4CC38A] text-[#0B0D12] font-medium rounded-lg py-2 text-sm hover:bg-[#3FAE79] transition-colors disabled:opacity-60">
              {saving ? "Đang lưu…" : "Thêm chuyến"}
            </button>
          </div>
        </div>
      </Card>

      <Card className="p-4 sm:p-5">
        <h3 className="text-sm font-semibold text-white mb-3">Danh sách chuyến ({trips.length})</h3>
        {trips.length === 0 ? (
          <EmptyState icon={Route} text="Chưa có chuyến nào. Thêm chuyến đầu tiên ở trên." />
        ) : (
          <div className="flex flex-col gap-2">
            {trips.map((t) =>
              editingId === t.id ? (
                <div key={t.id} className="bg-[#0F1218] border border-[#4CC38A]/40 rounded-lg px-3 sm:px-4 py-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                    <Field label="Ngày">
                      <input type="date" className={inputClass} value={editForm.date} onChange={(e) => setEdit("date", e.target.value)} />
                    </Field>
                    <Field label="Xe">
                      <Select value={editForm.carId} onChange={(e) => setEdit("carId", e.target.value)}>
                        {cars.map((c) => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </Select>
                    </Field>
                    <Field label="Khách hàng">
                      <input className={inputClass} value={editForm.customer} onChange={(e) => setEdit("customer", e.target.value)} />
                    </Field>
                    <Field label="Giá chuyến (đ)">
                      <input type="number" className={inputClass} value={editForm.revenue} onChange={(e) => setEdit("revenue", e.target.value)} />
                    </Field>
                    <Field label="Tiền tài xế (đ)">
                      <input type="number" className={inputClass} value={editForm.driverCost} onChange={(e) => setEdit("driverCost", e.target.value)} />
                    </Field>
                    <Field label="Xăng dầu (đ)">
                      <input type="number" className={inputClass} value={editForm.fuelCost} onChange={(e) => setEdit("fuelCost", e.target.value)} />
                    </Field>
                    <Field label="Chi phí khác (đ)">
                      <input type="number" className={inputClass} value={editForm.otherCost} onChange={(e) => setEdit("otherCost", e.target.value)} />
                    </Field>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <button onClick={cancelEdit} className="px-3 py-1.5 rounded-lg text-sm text-[#9AA1B2] hover:text-white transition-colors">
                      Huỷ
                    </button>
                    <button
                      disabled={savingEdit}
                      onClick={() => saveEdit(t.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm bg-[#4CC38A] text-[#0B0D12] font-medium hover:bg-[#3FAE79] transition-colors disabled:opacity-60"
                    >
                      <Check size={14} /> {savingEdit ? "Đang lưu…" : "Lưu"}
                    </button>
                  </div>
                </div>
              ) : (
                <div key={t.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 bg-[#0F1218] border border-[#1E232C] rounded-lg px-3 sm:px-4 py-3">
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <div className="flex items-center gap-2 text-sm flex-wrap">
                      <span className="text-white font-medium">{carName(t.carId)}</span>
                      <span className="text-[#5C6474]">·</span>
                      <span className="text-[#9AA1B2]">{t.date}</span>
                      {t.customer && <span className="text-[#5C6474] text-xs">· {t.customer}</span>}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-[#5C6474] flex-wrap">
                      <span className="flex items-center gap-1"><User size={11}/> {vnd(t.driverCost)}</span>
                      <span className="flex items-center gap-1"><Fuel size={11}/> {vnd(t.fuelCost)}</span>
                      {Number(t.otherCost) > 0 && <span>Khác: {vnd(t.otherCost)}</span>}
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                    <div className="text-left sm:text-right">
                      <div className="text-sm font-semibold tabular-nums text-white">{vnd(t.revenue)}</div>
                      <div className={`text-xs tabular-nums ${profitOf(t) >= 0 ? "text-[#4CC38A]" : "text-[#F87171]"}`}>
                        LN {vnd(profitOf(t))}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button onClick={() => startEdit(t)} className="text-[#5C6474] hover:text-[#4CC38A] transition-colors p-1 -m-1">
                        <Pencil size={15} />
                      </button>
                      <button onClick={() => remove(t.id)} className="text-[#5C6474] hover:text-[#F87171] transition-colors p-1 -m-1">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </Card>
    </div>
  );
}

// ---------- Daily rentals ----------
function emptyDaily() {
  return { date: todayISO(), carId: "", customer: "", pricePerDay: "", days: 1 };
}

function DailyTab({ cars, daily, setDaily, carName, setError }) {
  const [form, setForm] = useState(emptyDaily());
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const setEdit = (k, v) => setEditForm((f) => ({ ...f, [k]: v }));

  const add = async () => {
    if (!form.carId || !form.pricePerDay) return;
    setSaving(true);
    try {
      const { id } = await api.addDaily(form);
      setDaily([{ ...form, id }, ...daily]);
      setForm(emptyDaily());
    } catch (e) {
      setError("Không lưu được lượt thuê ngày.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    const prev = daily;
    setDaily(daily.filter((d) => d.id !== id));
    try {
      await api.deleteDaily(id);
    } catch (e) {
      setDaily(prev);
      setError("Không xoá được lượt thuê này.");
    }
  };

  const startEdit = (d) => {
    setEditingId(d.id);
    setEditForm({
      date: d.date,
      carId: d.carId,
      customer: d.customer || "",
      pricePerDay: d.pricePerDay,
      days: d.days,
    });
  };
  const cancelEdit = () => {
    setEditingId(null);
    setEditForm(null);
  };
  const saveEdit = async (id) => {
    setSavingEdit(true);
    try {
      await api.updateDaily(id, editForm);
      setDaily(daily.map((d) => (d.id === id ? { ...d, ...editForm } : d)));
      setEditingId(null);
      setEditForm(null);
    } catch (e) {
      setError("Không lưu được thay đổi.");
    } finally {
      setSavingEdit(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <Card className="p-4 sm:p-5">
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <Plus size={15} className="text-[#4CC38A]" /> Thêm lượt thuê ngày
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          <Field label="Ngày bắt đầu">
            <input type="date" className={inputClass} value={form.date} onChange={(e) => set("date", e.target.value)} />
          </Field>
          <Field label="Xe">
            <Select value={form.carId} onChange={(e) => set("carId", e.target.value)}>
              <option value="">Chọn xe</option>
              {cars.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </Select>
          </Field>
          <Field label="Khách hàng">
            <input className={inputClass} placeholder="Tên khách" value={form.customer} onChange={(e) => set("customer", e.target.value)} />
          </Field>
          <Field label="Giá / ngày (đ)">
            <input type="number" className={inputClass} placeholder="0" value={form.pricePerDay} onChange={(e) => set("pricePerDay", e.target.value)} />
          </Field>
          <Field label="Số ngày">
            <input type="number" min="1" className={inputClass} value={form.days} onChange={(e) => set("days", e.target.value)} />
          </Field>
        </div>
        <button disabled={saving} onClick={add} className="mt-3 w-full md:w-auto bg-[#4CC38A] text-[#0B0D12] font-medium rounded-lg py-2 px-6 text-sm hover:bg-[#3FAE79] transition-colors disabled:opacity-60">
          {saving ? "Đang lưu…" : "Thêm lượt thuê"}
        </button>
      </Card>

      <Card className="p-4 sm:p-5">
        <h3 className="text-sm font-semibold text-white mb-3">Danh sách thuê ngày ({daily.length})</h3>
        {daily.length === 0 ? (
          <EmptyState icon={Calendar} text="Chưa có lượt thuê ngày nào. Thêm ở trên." />
        ) : (
          <div className="flex flex-col gap-2">
            {daily.map((d) =>
              editingId === d.id ? (
                <div key={d.id} className="bg-[#0F1218] border border-[#4CC38A]/40 rounded-lg px-3 sm:px-4 py-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 mb-3">
                    <Field label="Ngày bắt đầu">
                      <input type="date" className={inputClass} value={editForm.date} onChange={(e) => setEdit("date", e.target.value)} />
                    </Field>
                    <Field label="Xe">
                      <Select value={editForm.carId} onChange={(e) => setEdit("carId", e.target.value)}>
                        {cars.map((c) => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </Select>
                    </Field>
                    <Field label="Khách hàng">
                      <input className={inputClass} value={editForm.customer} onChange={(e) => setEdit("customer", e.target.value)} />
                    </Field>
                    <Field label="Giá / ngày (đ)">
                      <input type="number" className={inputClass} value={editForm.pricePerDay} onChange={(e) => setEdit("pricePerDay", e.target.value)} />
                    </Field>
                    <Field label="Số ngày">
                      <input type="number" min="1" className={inputClass} value={editForm.days} onChange={(e) => setEdit("days", e.target.value)} />
                    </Field>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <button onClick={cancelEdit} className="px-3 py-1.5 rounded-lg text-sm text-[#9AA1B2] hover:text-white transition-colors">
                      Huỷ
                    </button>
                    <button
                      disabled={savingEdit}
                      onClick={() => saveEdit(d.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm bg-[#4CC38A] text-[#0B0D12] font-medium hover:bg-[#3FAE79] transition-colors disabled:opacity-60"
                    >
                      <Check size={14} /> {savingEdit ? "Đang lưu…" : "Lưu"}
                    </button>
                  </div>
                </div>
              ) : (
                <div key={d.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 bg-[#0F1218] border border-[#1E232C] rounded-lg px-3 sm:px-4 py-3">
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <div className="flex items-center gap-2 text-sm flex-wrap">
                      <span className="text-white font-medium">{carName(d.carId)}</span>
                      <span className="text-[#5C6474]">·</span>
                      <span className="text-[#9AA1B2]">{d.date}</span>
                      {d.customer && <span className="text-[#5C6474] text-xs">· {d.customer}</span>}
                    </div>
                    <div className="text-xs text-[#5C6474]">{vnd(d.pricePerDay)} × {d.days} ngày</div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-4">
                    <div className="text-sm font-semibold tabular-nums text-white">
                      {vnd((Number(d.pricePerDay) || 0) * (Number(d.days) || 1))}
                    </div>
                    <div className="flex items-center gap-3">
                      <button onClick={() => startEdit(d)} className="text-[#5C6474] hover:text-[#4CC38A] transition-colors p-1 -m-1">
                        <Pencil size={15} />
                      </button>
                      <button onClick={() => remove(d.id)} className="text-[#5C6474] hover:text-[#F87171] transition-colors p-1 -m-1">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </Card>
    </div>
  );
}

// ---------- Monthly expenses ----------
function emptyExpense(month) {
  return { month, category: EXPENSE_CATEGORIES[0], amount: "", note: "" };
}

function ExpensesTab({ expenses, setExpenses, month, setError }) {
  const [form, setForm] = useState(emptyExpense(month));
  const [saving, setSaving] = useState(false);
  useEffect(() => setForm(emptyExpense(month)), [month]);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const add = async () => {
    if (!form.amount) return;
    setSaving(true);
    try {
      const { id } = await api.addExpense(form);
      setExpenses([{ ...form, id }, ...expenses]);
      setForm(emptyExpense(month));
    } catch (e) {
      setError("Không lưu được chi phí.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    const prev = expenses;
    setExpenses(expenses.filter((e) => e.id !== id));
    try {
      await api.deleteExpense(id);
    } catch (e) {
      setExpenses(prev);
      setError("Không xoá được khoản chi phí này.");
    }
  };

  const monthExpenses = expenses.filter((e) => e.month === month);
  const total = monthExpenses.reduce((s, e) => s + (Number(e.amount) || 0), 0);

  return (
    <div className="flex flex-col gap-5">
      <Card className="p-4 sm:p-5">
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <Plus size={15} className="text-[#4CC38A]" /> Thêm chi phí — {monthLabel(month)}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <Field label="Khoản mục">
            <Select value={form.category} onChange={(e) => set("category", e.target.value)}>
              {EXPENSE_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </Select>
          </Field>
          <Field label="Số tiền (đ)">
            <input type="number" className={inputClass} placeholder="0" value={form.amount} onChange={(e) => set("amount", e.target.value)} />
          </Field>
          <Field label="Ghi chú">
            <input className={inputClass} placeholder="Tuỳ chọn" value={form.note} onChange={(e) => set("note", e.target.value)} />
          </Field>
          <div className="flex items-end">
            <button disabled={saving} onClick={add} className="w-full bg-[#4CC38A] text-[#0B0D12] font-medium rounded-lg py-2 text-sm hover:bg-[#3FAE79] transition-colors disabled:opacity-60">
              {saving ? "Đang lưu…" : "Thêm chi phí"}
            </button>
          </div>
        </div>
      </Card>

      <Card className="p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
          <h3 className="text-sm font-semibold text-white">Chi phí tháng này ({monthExpenses.length})</h3>
          <span className="text-sm font-semibold tabular-nums text-[#FB923C]">Tổng: {vnd(total)}</span>
        </div>
        {monthExpenses.length === 0 ? (
          <EmptyState icon={Wallet} text="Chưa có chi phí nào cho tháng này." />
        ) : (
          <div className="flex flex-col gap-2">
            {monthExpenses.map((e) => (
              <div key={e.id} className="flex items-center justify-between gap-3 bg-[#0F1218] border border-[#1E232C] rounded-lg px-3 sm:px-4 py-3">
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span className="text-sm text-white font-medium truncate">{e.category}</span>
                  {e.note && <span className="text-xs text-[#5C6474] truncate">{e.note}</span>}
                </div>
                <div className="flex items-center gap-3 sm:gap-4 shrink-0">
                  <span className="text-sm font-semibold tabular-nums text-white">{vnd(e.amount)}</span>
                  <button onClick={() => remove(e.id)} className="text-[#5C6474] hover:text-[#F87171] transition-colors p-1 -m-1">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

// ---------- Cars ----------
function CarsTab({ cars, setCars, trips, daily, setError }) {
  const [name, setName] = useState("");
  const [plate, setPlate] = useState("");
  const [saving, setSaving] = useState(false);

  const add = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      const data = { name: name.trim(), plate: plate.trim() };
      const car = await api.addCar(data);
      setCars([...cars, car]);
      setName("");
      setPlate("");
    } catch (e) {
      setError("Không thêm được xe.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    const used = trips.some((t) => t.carId === id) || daily.some((d) => d.carId === id);
    if (used && !window.confirm("Xe này đã có dữ liệu chuyến/thuê ngày. Vẫn xoá xe khỏi danh sách?")) return;
    const prev = cars;
    setCars(cars.filter((c) => c.id !== id));
    try {
      await api.deleteCar(id);
    } catch (e) {
      setCars(prev);
      setError("Không xoá được xe này.");
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <Card className="p-4 sm:p-5">
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <Plus size={15} className="text-[#4CC38A]" /> Thêm xe
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Field label="Tên xe">
            <input className={inputClass} placeholder="VD: Xe 04 - Innova" value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
          <Field label="Biển số (tuỳ chọn)">
            <input className={inputClass} placeholder="51H-123.45" value={plate} onChange={(e) => setPlate(e.target.value)} />
          </Field>
          <div className="flex items-end">
            <button disabled={saving} onClick={add} className="w-full bg-[#4CC38A] text-[#0B0D12] font-medium rounded-lg py-2 text-sm hover:bg-[#3FAE79] transition-colors disabled:opacity-60">
              {saving ? "Đang lưu…" : "Thêm xe"}
            </button>
          </div>
        </div>
      </Card>

      <Card className="p-4 sm:p-5">
        <h3 className="text-sm font-semibold text-white mb-3">Danh sách xe ({cars.length})</h3>
        <div className="flex flex-col gap-2">
          {cars.map((c) => {
            const tripCount = trips.filter((t) => t.carId === c.id).length;
            const dailyCount = daily.filter((d) => d.carId === c.id).length;
            return (
              <div key={c.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 bg-[#0F1218] border border-[#1E232C] rounded-lg px-3 sm:px-4 py-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 shrink-0 rounded-lg bg-[#1A2A22] flex items-center justify-center text-[#4CC38A]">
                    <Car size={15} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm text-white font-medium truncate">{c.name}</div>
                    {c.plate && <div className="text-xs text-[#5C6474]">{c.plate}</div>}
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-4 pl-11 sm:pl-0">
                  <span className="text-xs text-[#5C6474]">{tripCount} chuyến · {dailyCount} thuê ngày</span>
                  <button onClick={() => remove(c.id)} className="text-[#5C6474] hover:text-[#F87171] transition-colors p-1 -m-1">
                    <X size={15} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

// ---------- Auth gate ----------
export default function AuthGate() {
  const [status, setStatus] = useState("checking"); // checking | loggedOut | loggedIn
  const [user, setUser] = useState(null);

  useEffect(() => {
    api
      .me()
      .then((u) => {
        setUser(u);
        setStatus("loggedIn");
      })
      .catch(() => setStatus("loggedOut"));
  }, []);

  const handleLoggedIn = (u) => {
    setUser(u);
    setStatus("loggedIn");
  };

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch (e) {
      // bo qua loi, van dang xuat phia client
    }
    setUser(null);
    setStatus("loggedOut");
  };

  if (status === "checking") {
    return (
      <div className="min-h-screen bg-[#0B0D12] flex items-center justify-center text-[#5C6474] text-sm">
        Đang kiểm tra đăng nhập…
      </div>
    );
  }

  if (status === "loggedOut") {
    return <LoginPage onLoggedIn={handleLoggedIn} />;
  }

  return <FleetApp currentUser={user} onLogout={handleLogout} />;
}
