import React, { useState, useEffect, useContext, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AdminContext } from "../context/AdminContext";
import {
  getAdminStats,
  getAdminUsers,
  updateAdminUser,
  deleteAdminUser,
  getAdminTheatres,
  updateAdminTheatre,
  deleteAdminTheatre,
  getAdminBookings,
  getAdminMovies,
  updateAdminMovie,
} from "../api/admin";
import Logo from "../components/Logo";
import { motion, AnimatePresence } from "framer-motion";

// ────────── Types ──────────

interface Stats {
  totalUsers: number;
  totalTheatres: number;
  approvedTheatres: number;
  totalMovies: number;
  totalScreens: number;
  totalBookings: number;
  activeBookings: number;
  cancelledBookings: number;
  totalRevenue: number;
  totalFoodRevenue: number;
  newUsersThisMonth: number;
  recentBookings: any[];
}

type Tab = "overview" | "users" | "theatres" | "bookings" | "movies";

// ────────── Helper ──────────

const currency = (n: number) =>
  "₹" + n.toLocaleString("en-IN", { maximumFractionDigits: 0 });

// ────────── Component ──────────

const AdminDashboard: React.FC = () => {
  const { admin, setAdmin } = useContext(AdminContext);
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("overview");
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [theatres, setTheatres] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [movies, setMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  // ──── Data fetching ────

  const loadData = useCallback(async (t: Tab) => {
    setLoading(true);
    try {
      switch (t) {
        case "overview":
          setStats(await getAdminStats());
          break;
        case "users":
          setUsers(await getAdminUsers());
          break;
        case "theatres":
          setTheatres(await getAdminTheatres());
          break;
        case "bookings":
          setBookings(await getAdminBookings());
          break;
        case "movies":
          setMovies(await getAdminMovies());
          break;
      }
    } catch (err) {
      console.error("Failed to load", t, err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData(tab);
  }, [tab, loadData]);

  // ──── Actions ────

  const handleToggleUser = async (id: string, isActive: boolean) => {
    setActionLoading(id);
    try {
      await updateAdminUser(id, { isActive: !isActive });
      setUsers((prev) => prev.map((u) => (u._id === id ? { ...u, isActive: !isActive } : u)));
    } catch (err: any) {
      alert(err.response?.data?.message || "Action failed");
    }
    setActionLoading(null);
  };

  const handleDeleteUser = async (id: string, name: string) => {
    if (!confirm(`Delete user "${name}"? This cannot be undone.`)) return;
    setActionLoading(id);
    try {
      await deleteAdminUser(id);
      setUsers((prev) => prev.filter((u) => u._id !== id));
    } catch (err: any) {
      alert(err.response?.data?.message || "Delete failed");
    }
    setActionLoading(null);
  };

  const handleToggleTheatre = async (id: string, isApproved: boolean) => {
    setActionLoading(id);
    try {
      await updateAdminTheatre(id, { isApproved: !isApproved });
      setTheatres((prev) => prev.map((t) => (t._id === id ? { ...t, isApproved: !isApproved } : t)));
    } catch (err) {
      alert("Action failed");
    }
    setActionLoading(null);
  };

  const handleDeleteTheatre = async (id: string, name: string) => {
    if (!confirm(`Delete theatre "${name}"? All screens, movies and food items will be removed.`)) return;
    setActionLoading(id);
    try {
      await deleteAdminTheatre(id);
      setTheatres((prev) => prev.filter((t) => t._id !== id));
    } catch (err) {
      alert("Delete failed");
    }
    setActionLoading(null);
  };

  const handleToggleMovie = async (id: string, isActive: boolean) => {
    setActionLoading(id);
    try {
      await updateAdminMovie(id, { isActive: !isActive });
      setMovies((prev) => prev.map((m) => (m._id === id ? { ...m, isActive: !isActive } : m)));
    } catch (err) {
      alert("Action failed");
    }
    setActionLoading(null);
  };

  const handleLogout = () => {
    setAdmin(null);
    localStorage.removeItem("adminToken");
    navigate("/admin/login");
  };

  // ──── Filter helper ────

  const filtered = <T extends Record<string, any>>(list: T[]) => {
    if (!search) return list;
    const q = search.toLowerCase();
    return list.filter((item) =>
      Object.values(item).some(
        (v) => typeof v === "string" && v.toLowerCase().includes(q)
      )
    );
  };

  // ──── Tabs config ────

  const tabs: { key: Tab; label: string; icon: JSX.Element }[] = [
    {
      key: "overview",
      label: "Overview",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      ),
    },
    {
      key: "users",
      label: "Users",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m9 5.197V20" />
        </svg>
      ),
    },
    {
      key: "theatres",
      label: "Theatres",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
    },
    {
      key: "bookings",
      label: "Bookings",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
        </svg>
      ),
    },
    {
      key: "movies",
      label: "Movies",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
        </svg>
      ),
    },
  ];

  // ──────────────── Render ────────────────

  return (
    <div className="min-h-screen bg-dark">
      {/* Top bar */}
      <header className="sticky top-0 z-50 bg-dark/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo size="sm" showText={false} />
            <div>
              <h1 className="text-white font-bold text-lg leading-none">SuperAdmin</h1>
              <p className="text-emerald-400 text-[11px] font-medium">MarkMySeat Control Panel</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-gray-400 text-sm hidden sm:block">{admin?.email}</span>
            <button
              onClick={handleLogout}
              className="bg-white/5 hover:bg-white/10 text-gray-300 text-sm px-4 py-2 rounded-lg border border-white/5 transition-all"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Tabs */}
        <div className="flex gap-1 bg-dark-light rounded-xl p-1 mb-6 overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => { setTab(t.key); setSearch(""); }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                tab === t.key
                  ? "bg-emerald-600/20 text-emerald-400 shadow-sm"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>

        {/* Search (for list tabs) */}
        {tab !== "overview" && (
          <div className="mb-4">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Search ${tab}...`}
              className="w-full max-w-sm px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            />
          </div>
        )}

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {loading ? (
              <div className="flex justify-center py-20">
                <div className="animate-spin h-8 w-8 border-4 border-emerald-500 border-t-transparent rounded-full" />
              </div>
            ) : (
              <>
                {tab === "overview" && stats && <OverviewPanel stats={stats} />}
                {tab === "users" && (
                  <UsersPanel
                    users={filtered(users)}
                    onToggle={handleToggleUser}
                    onDelete={handleDeleteUser}
                    actionLoading={actionLoading}
                    adminId={admin?._id || ""}
                  />
                )}
                {tab === "theatres" && (
                  <TheatresPanel
                    theatres={filtered(theatres)}
                    onToggle={handleToggleTheatre}
                    onDelete={handleDeleteTheatre}
                    actionLoading={actionLoading}
                  />
                )}
                {tab === "bookings" && <BookingsPanel bookings={filtered(bookings)} />}
                {tab === "movies" && (
                  <MoviesPanel
                    movies={filtered(movies)}
                    onToggle={handleToggleMovie}
                    actionLoading={actionLoading}
                  />
                )}
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════
// Sub-panels
// ═══════════════════════════════════════════════

// ──── Overview ────

const StatCard: React.FC<{ label: string; value: string | number; color?: string; sub?: string }> = ({
  label,
  value,
  color = "text-white",
  sub,
}) => (
  <div className="glass rounded-xl p-5 border border-white/5">
    <p className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-1">{label}</p>
    <p className={`text-2xl font-bold ${color}`}>{value}</p>
    {sub && <p className="text-gray-500 text-xs mt-1">{sub}</p>}
  </div>
);

const OverviewPanel: React.FC<{ stats: Stats }> = ({ stats }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      <StatCard label="Total Users" value={stats.totalUsers} color="text-blue-400" sub={`+${stats.newUsersThisMonth} this month`} />
      <StatCard label="Theatres" value={stats.totalTheatres} color="text-indigo-400" sub={`${stats.approvedTheatres} approved`} />
      <StatCard label="Screens" value={stats.totalScreens} color="text-purple-400" />
      <StatCard label="Movies" value={stats.totalMovies} color="text-pink-400" />
      <StatCard label="Total Bookings" value={stats.totalBookings} color="text-emerald-400" sub={`${stats.activeBookings} active`} />
      <StatCard label="Cancelled" value={stats.cancelledBookings} color="text-red-400" />
      <StatCard label="Revenue" value={currency(stats.totalRevenue)} color="text-yellow-400" />
      <StatCard label="Food Revenue" value={currency(stats.totalFoodRevenue)} color="text-orange-400" />
    </div>

    {/* Recent bookings */}
    {stats.recentBookings?.length > 0 && (
      <div className="glass rounded-xl p-5 border border-white/5">
        <h3 className="text-white font-semibold mb-4">Recent Bookings</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-500 text-xs uppercase border-b border-white/5">
                <th className="text-left py-2 pr-4">Booking ID</th>
                <th className="text-left py-2 pr-4">User</th>
                <th className="text-left py-2 pr-4">Movie</th>
                <th className="text-left py-2 pr-4">Date</th>
                <th className="text-right py-2">Amount</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentBookings.map((b: any) => (
                <tr key={b._id} className="border-b border-white/5">
                  <td className="py-3 pr-4 text-emerald-400 font-mono text-xs">{b.bookingId}</td>
                  <td className="py-3 pr-4 text-gray-300">{b.user?.name || "—"}</td>
                  <td className="py-3 pr-4 text-white">{b.movie?.title || "—"}</td>
                  <td className="py-3 pr-4 text-gray-400">{b.showDate}</td>
                  <td className="py-3 text-right text-yellow-400">{currency(b.totalPrice || 0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )}
  </div>
);

// ──── Users ────

const UsersPanel: React.FC<{
  users: any[];
  onToggle: (id: string, isActive: boolean) => void;
  onDelete: (id: string, name: string) => void;
  actionLoading: string | null;
  adminId: string;
}> = ({ users, onToggle, onDelete, actionLoading, adminId }) => (
  <div className="glass rounded-xl border border-white/5 overflow-hidden">
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-gray-500 text-xs uppercase bg-white/[0.02] border-b border-white/5">
            <th className="text-left py-3 px-4">Name</th>
            <th className="text-left py-3 px-4">Email</th>
            <th className="text-left py-3 px-4">Phone</th>
            <th className="text-left py-3 px-4">Role</th>
            <th className="text-center py-3 px-4">Status</th>
            <th className="text-right py-3 px-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => {
            const isSelf = u._id === adminId;
            return (
              <tr key={u._id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                <td className="py-3 px-4 text-white font-medium">{u.name}</td>
                <td className="py-3 px-4 text-gray-400">{u.email}</td>
                <td className="py-3 px-4 text-gray-500">{u.phone || "—"}</td>
                <td className="py-3 px-4">
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      u.role === "admin"
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "bg-blue-500/10 text-blue-400"
                    }`}
                  >
                    {u.role}
                  </span>
                </td>
                <td className="py-3 px-4 text-center">
                  <span
                    className={`inline-block w-2 h-2 rounded-full ${
                      u.isActive !== false ? "bg-green-400" : "bg-red-400"
                    }`}
                  />
                </td>
                <td className="py-3 px-4 text-right">
                  {!isSelf && (
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => onToggle(u._id, u.isActive !== false)}
                        disabled={actionLoading === u._id}
                        className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
                          u.isActive !== false
                            ? "bg-red-500/10 text-red-400 hover:bg-red-500/20"
                            : "bg-green-500/10 text-green-400 hover:bg-green-500/20"
                        }`}
                      >
                        {u.isActive !== false ? "Disable" : "Enable"}
                      </button>
                      <button
                        onClick={() => onDelete(u._id, u.name)}
                        disabled={actionLoading === u._id}
                        className="text-xs px-3 py-1.5 rounded-lg font-medium bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                  {isSelf && <span className="text-gray-600 text-xs italic">You</span>}
                </td>
              </tr>
            );
          })}
          {users.length === 0 && (
            <tr>
              <td colSpan={6} className="py-12 text-center text-gray-500">
                No users found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);

// ──── Theatres ────

const TheatresPanel: React.FC<{
  theatres: any[];
  onToggle: (id: string, isApproved: boolean) => void;
  onDelete: (id: string, name: string) => void;
  actionLoading: string | null;
}> = ({ theatres, onToggle, onDelete, actionLoading }) => (
  <div className="glass rounded-xl border border-white/5 overflow-hidden">
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-gray-500 text-xs uppercase bg-white/[0.02] border-b border-white/5">
            <th className="text-left py-3 px-4">Name</th>
            <th className="text-left py-3 px-4">City</th>
            <th className="text-left py-3 px-4">Email</th>
            <th className="text-center py-3 px-4">Screens</th>
            <th className="text-center py-3 px-4">Approved</th>
            <th className="text-right py-3 px-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {theatres.map((t) => (
            <tr key={t._id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
              <td className="py-3 px-4 text-white font-medium">{t.name}</td>
              <td className="py-3 px-4 text-gray-400">{t.city || "—"}</td>
              <td className="py-3 px-4 text-gray-400">{t.email}</td>
              <td className="py-3 px-4 text-center text-gray-300">{t.screens || 0}</td>
              <td className="py-3 px-4 text-center">
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    t.isApproved ? "bg-green-500/10 text-green-400" : "bg-yellow-500/10 text-yellow-400"
                  }`}
                >
                  {t.isApproved ? "Approved" : "Pending"}
                </span>
              </td>
              <td className="py-3 px-4 text-right">
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => onToggle(t._id, t.isApproved)}
                    disabled={actionLoading === t._id}
                    className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
                      t.isApproved
                        ? "bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20"
                        : "bg-green-500/10 text-green-400 hover:bg-green-500/20"
                    }`}
                  >
                    {t.isApproved ? "Suspend" : "Approve"}
                  </button>
                  <button
                    onClick={() => onDelete(t._id, t.name)}
                    disabled={actionLoading === t._id}
                    className="text-xs px-3 py-1.5 rounded-lg font-medium bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {theatres.length === 0 && (
            <tr>
              <td colSpan={6} className="py-12 text-center text-gray-500">
                No theatres found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);

// ──── Bookings ────

const BookingsPanel: React.FC<{ bookings: any[] }> = ({ bookings }) => (
  <div className="glass rounded-xl border border-white/5 overflow-hidden">
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-gray-500 text-xs uppercase bg-white/[0.02] border-b border-white/5">
            <th className="text-left py-3 px-4">Booking ID</th>
            <th className="text-left py-3 px-4">User</th>
            <th className="text-left py-3 px-4">Movie</th>
            <th className="text-left py-3 px-4">Theatre</th>
            <th className="text-left py-3 px-4">Date / Time</th>
            <th className="text-left py-3 px-4">Seats</th>
            <th className="text-center py-3 px-4">Status</th>
            <th className="text-right py-3 px-4">Amount</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((b) => (
            <tr key={b._id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
              <td className="py-3 px-4 text-emerald-400 font-mono text-xs">{b.bookingId}</td>
              <td className="py-3 px-4 text-gray-300">{b.user?.name || "—"}</td>
              <td className="py-3 px-4 text-white">{b.movie?.title || "—"}</td>
              <td className="py-3 px-4 text-gray-400">{b.theatre?.name || "—"}</td>
              <td className="py-3 px-4 text-gray-400 text-xs">
                {b.showDate} &middot; {b.showTime}
              </td>
              <td className="py-3 px-4 text-gray-300 text-xs">{b.seatNumber?.replace(/,\s*/g, ", ")}</td>
              <td className="py-3 px-4 text-center">
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    b.status === "confirmed"
                      ? "bg-green-500/10 text-green-400"
                      : b.status === "cancelled"
                      ? "bg-red-500/10 text-red-400"
                      : "bg-yellow-500/10 text-yellow-400"
                  }`}
                >
                  {b.status}
                </span>
              </td>
              <td className="py-3 px-4 text-right text-yellow-400">
                {currency((b.totalPrice || 0) + (b.foodTotal || 0))}
              </td>
            </tr>
          ))}
          {bookings.length === 0 && (
            <tr>
              <td colSpan={8} className="py-12 text-center text-gray-500">
                No bookings found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);

// ──── Movies ────

const MoviesPanel: React.FC<{
  movies: any[];
  onToggle: (id: string, isActive: boolean) => void;
  actionLoading: string | null;
}> = ({ movies, onToggle, actionLoading }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
    {movies.map((m) => (
      <div key={m._id} className="glass rounded-xl border border-white/5 overflow-hidden flex flex-col">
        {m.posterUrl && (
          <img
            src={m.posterUrl}
            alt={m.title}
            className="w-full h-48 object-cover"
          />
        )}
        <div className="p-4 flex-1 flex flex-col">
          <h4 className="text-white font-semibold">{m.title}</h4>
          <p className="text-gray-500 text-xs mt-1">
            {m.genre} &middot; {m.language} &middot; {m.duration}
          </p>
          {m.theatre && (
            <p className="text-indigo-400 text-xs mt-1">
              {m.theatre.name} {m.screen ? `· ${m.screen.name}` : ""}
            </p>
          )}
          <div className="mt-auto pt-3 flex items-center justify-between">
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                m.isActive !== false ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"
              }`}
            >
              {m.isActive !== false ? "Active" : "Disabled"}
            </span>
            <button
              onClick={() => onToggle(m._id, m.isActive !== false)}
              disabled={actionLoading === m._id}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
                m.isActive !== false
                  ? "bg-red-500/10 text-red-400 hover:bg-red-500/20"
                  : "bg-green-500/10 text-green-400 hover:bg-green-500/20"
              }`}
            >
              {m.isActive !== false ? "Disable" : "Enable"}
            </button>
          </div>
        </div>
      </div>
    ))}
    {movies.length === 0 && (
      <div className="col-span-full py-12 text-center text-gray-500">
        No movies found
      </div>
    )}
  </div>
);

export default AdminDashboard;
