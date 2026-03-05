import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { TheatreContext } from "../context/TheatreContext";
import {
  getTheatreStats, getTheatreMovies, getTheatreBookings,
  addTheatreMovie, updateTheatreMovie, deleteTheatreMovie,
  updateBookingStatus, getTheatreFoodItems, addFoodItem,
  deleteFoodItem,
  getTheatreScreens, addScreen, updateScreen, deleteScreen,
  TheatreMovie, TheatreBooking, TheatreStats,
} from "../api/theatre";
import { FoodItem, SeatCategory, Screen } from "../types/User";
import { motion, AnimatePresence } from "framer-motion";

type Tab = "overview" | "movies" | "bookings" | "food" | "screens";

const TheatreDashboard: React.FC = () => {
  const { theatre, setTheatre } = useContext(TheatreContext);
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("overview");
  const [stats, setStats] = useState<TheatreStats | null>(null);
  const [movies, setMovies] = useState<TheatreMovie[]>([]);
  const [bookings, setBookings] = useState<TheatreBooking[]>([]);
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [screens, setScreens] = useState<Screen[]>([]);
  const [loading, setLoading] = useState(true);

  // Movie form
  const [showMovieForm, setShowMovieForm] = useState(false);
  const [movieForm, setMovieForm] = useState({
    title: "", posterUrl: "", description: "", genre: "", language: "",
    duration: "", showTimes: "10:00 AM, 1:30 PM, 5:00 PM, 9:00 PM",
    rating: "", cast: "", screen: "",
  });
  const [editingMovieId, setEditingMovieId] = useState<string | null>(null);

  // Food form
  const [showFoodForm, setShowFoodForm] = useState(false);
  const [foodForm, setFoodForm] = useState({
    name: "", description: "", price: "", category: "Snack", imageUrl: "", isVeg: true,
  });

  // Screen form
  const [showScreenForm, setShowScreenForm] = useState(false);
  const [editingScreenId, setEditingScreenId] = useState<string | null>(null);
  const [screenForm, setScreenForm] = useState({
    name: "",
    screenNumber: 1,
    rows: 8,
    seatsPerRow: 12,
    categories: [
      { name: "Premium", rows: ["A", "B"], price: 350, color: "#eab308" },
      { name: "Executive", rows: ["C", "D", "E"], price: 250, color: "#0ea5e9" },
      { name: "Classic", rows: ["F", "G", "H"], price: 150, color: "#22c55e" },
    ] as SeatCategory[],
  });

  useEffect(() => {
    loadData();
  }, [tab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (tab === "overview") {
        const s = await getTheatreStats();
        setStats(s);
      } else if (tab === "movies") {
        const [m, s] = await Promise.all([getTheatreMovies(), getTheatreScreens()]);
        setMovies(m);
        setScreens(s);
      } else if (tab === "bookings") {
        const b = await getTheatreBookings();
        setBookings(b);
      } else if (tab === "food") {
        const f = await getTheatreFoodItems();
        setFoodItems(f);
      } else if (tab === "screens") {
        const s = await getTheatreScreens();
        setScreens(s);
      }
    } catch (err) {
      console.error("Load error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setTheatre(null);
    localStorage.removeItem("theatreToken");
    navigate("/theatre/login");
  };

  // ──────── Movie CRUD ────────
  const handleSaveMovie = async () => {
    try {
      const payload: any = {
        ...movieForm,
        showTimes: movieForm.showTimes.split(",").map((s) => s.trim()).filter(Boolean),
      };
      if (movieForm.screen) payload.screen = movieForm.screen;
      if (editingMovieId) {
        await updateTheatreMovie(editingMovieId, payload);
      } else {
        await addTheatreMovie(payload);
      }
      setShowMovieForm(false);
      setEditingMovieId(null);
      setMovieForm({ title: "", posterUrl: "", description: "", genre: "", language: "", duration: "", showTimes: "10:00 AM, 1:30 PM, 5:00 PM, 9:00 PM", rating: "", cast: "", screen: "" });
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to save movie");
    }
  };

  const handleEditMovie = (m: TheatreMovie) => {
    const screenId = typeof m.screen === "object" && m.screen ? m.screen._id : (typeof m.screen === "string" ? m.screen : "");
    setMovieForm({
      title: m.title, posterUrl: m.posterUrl || "", description: m.description || "",
      genre: m.genre || "", language: m.language || "", duration: m.duration || "",
      showTimes: m.showTimes.join(", "), rating: m.rating || "", cast: m.cast || "",
      screen: screenId,
    });
    setEditingMovieId(m._id);
    setShowMovieForm(true);
  };

  const handleDeleteMovie = async (id: string) => {
    if (!confirm("Delete this movie?")) return;
    await deleteTheatreMovie(id);
    loadData();
  };

  // ──────── Booking Status ────────
  const handleStatusChange = async (id: string, status: string) => {
    await updateBookingStatus(id, status);
    loadData();
  };

  // ──────── Food CRUD ────────
  const handleSaveFood = async () => {
    try {
      await addFoodItem({
        ...foodForm,
        price: Number(foodForm.price),
      } as any);
      setShowFoodForm(false);
      setFoodForm({ name: "", description: "", price: "", category: "Snack", imageUrl: "", isVeg: true });
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to add item");
    }
  };

  const handleDeleteFood = async (id: string) => {
    if (!confirm("Delete this item?")) return;
    await deleteFoodItem(id);
    loadData();
  };

  // ──────── Screen CRUD ────────
  const resetScreenForm = () => {
    setScreenForm({
      name: "", screenNumber: screens.length + 1, rows: 8, seatsPerRow: 12,
      categories: [
        { name: "Premium", rows: ["A", "B"], price: 350, color: "#eab308" },
        { name: "Executive", rows: ["C", "D", "E"], price: 250, color: "#0ea5e9" },
        { name: "Classic", rows: ["F", "G", "H"], price: 150, color: "#22c55e" },
      ],
    });
    setEditingScreenId(null);
    setShowScreenForm(false);
  };

  const handleEditScreen = (s: Screen) => {
    setScreenForm({
      name: s.name,
      screenNumber: s.screenNumber,
      rows: s.seatConfig.rows,
      seatsPerRow: s.seatConfig.seatsPerRow,
      categories: s.seatConfig.categories || [],
    });
    setEditingScreenId(s._id);
    setShowScreenForm(true);
  };

  const handleSaveScreen = async () => {
    try {
      const payload = {
        name: screenForm.name || `Screen ${screenForm.screenNumber}`,
        screenNumber: screenForm.screenNumber,
        seatConfig: {
          rows: screenForm.rows,
          seatsPerRow: screenForm.seatsPerRow,
          categories: screenForm.categories,
        },
      };
      if (editingScreenId) {
        await updateScreen(editingScreenId, payload);
      } else {
        await addScreen(payload);
      }
      resetScreenForm();
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to save screen");
    }
  };

  const handleDeleteScreen = async (id: string) => {
    if (!confirm("Delete this screen? (Blocked if movies still assigned)")) return;
    try {
      await deleteScreen(id);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to delete screen");
    }
  };

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: "overview", label: "Overview", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
    { id: "movies", label: "Movies", icon: "M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" },
    { id: "bookings", label: "Bookings", icon: "M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" },
    { id: "food", label: "Food Menu", icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
    { id: "screens", label: "Screens", icon: "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" },
  ];

  const inputClass = "w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all";

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="border-b border-white/5 bg-dark-light/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">{theatre?.name || "Theatre Dashboard"}</h1>
            <p className="text-xs text-gray-500">{theatre?.city} {theatre?.address ? `· ${theatre.address}` : ""}</p>
          </div>
          <button
            onClick={handleLogout}
            className="text-gray-400 hover:text-white text-sm px-4 py-2 rounded-lg hover:bg-white/5 transition-all border border-white/5"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Tabs */}
        <div className="flex gap-1 overflow-x-auto pb-4 scrollbar-hide mb-6">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                tab === t.id
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/25"
                  : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={t.icon} />
              </svg>
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin h-10 w-10 border-4 border-indigo-500 border-t-transparent rounded-full" />
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {/* ──────── Overview ──────── */}
              {tab === "overview" && stats && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { label: "Movies Listed", value: stats.totalMovies, color: "text-indigo-400", bg: "bg-indigo-500/10" },
                      { label: "Total Bookings", value: stats.totalBookings, color: "text-emerald-400", bg: "bg-emerald-500/10" },
                      { label: "Ticket Revenue", value: `₹${stats.totalRevenue.toLocaleString()}`, color: "text-amber-400", bg: "bg-amber-500/10" },
                      { label: "Food Revenue", value: `₹${stats.totalFoodRevenue.toLocaleString()}`, color: "text-cyan-400", bg: "bg-cyan-500/10" },
                    ].map((stat, i) => (
                      <div key={i} className={`glass-strong rounded-2xl p-5 ${stat.bg}`}>
                        <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">{stat.label}</p>
                        <p className={`text-2xl font-bold mt-2 ${stat.color}`}>{stat.value}</p>
                      </div>
                    ))}
                  </div>

                  {stats.recentBookings.length > 0 && (
                    <div className="glass-strong rounded-2xl p-5">
                      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Recent Bookings</h3>
                      <div className="space-y-3">
                        {stats.recentBookings.map((b: any) => (
                          <div key={b._id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                            <div>
                              <p className="text-sm font-medium text-gray-200">{b.user?.name || "User"}</p>
                              <p className="text-xs text-gray-500">{b.movie?.title} · {b.showTime}</p>
                            </div>
                            <span className="text-xs font-mono text-accent">{b.bookingId}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ──────── Movies ──────── */}
              {tab === "movies" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-white">Your Movies</h3>
                    <button
                      onClick={() => { setShowMovieForm(true); setEditingMovieId(null); setMovieForm({ title: "", posterUrl: "", description: "", genre: "", language: "", duration: "", showTimes: "10:00 AM, 1:30 PM, 5:00 PM, 9:00 PM", rating: "", cast: "", screen: "" }); }}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-4 py-2 rounded-xl transition-all shadow-lg shadow-indigo-500/20"
                    >
                      + Add Movie
                    </button>
                  </div>

                  {showMovieForm && (
                    <div className="glass-strong rounded-2xl p-5 space-y-3">
                      <h4 className="font-semibold text-white text-sm">{editingMovieId ? "Edit Movie" : "Add New Movie"}</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input placeholder="Title *" value={movieForm.title} onChange={(e) => setMovieForm({ ...movieForm, title: e.target.value })} className={inputClass} />
                        <input placeholder="Poster URL" value={movieForm.posterUrl} onChange={(e) => setMovieForm({ ...movieForm, posterUrl: e.target.value })} className={inputClass} />
                        <input placeholder="Genre (e.g. Action)" value={movieForm.genre} onChange={(e) => setMovieForm({ ...movieForm, genre: e.target.value })} className={inputClass} />
                        <input placeholder="Language" value={movieForm.language} onChange={(e) => setMovieForm({ ...movieForm, language: e.target.value })} className={inputClass} />
                        <input placeholder="Duration (e.g. 2h 30m)" value={movieForm.duration} onChange={(e) => setMovieForm({ ...movieForm, duration: e.target.value })} className={inputClass} />
                        <input placeholder="Rating (e.g. 8.5)" value={movieForm.rating} onChange={(e) => setMovieForm({ ...movieForm, rating: e.target.value })} className={inputClass} />
                      </div>
                      <input placeholder="Cast" value={movieForm.cast} onChange={(e) => setMovieForm({ ...movieForm, cast: e.target.value })} className={inputClass} />
                      <input placeholder="Description" value={movieForm.description} onChange={(e) => setMovieForm({ ...movieForm, description: e.target.value })} className={inputClass} />
                      <input placeholder="Show Times (comma-separated)" value={movieForm.showTimes} onChange={(e) => setMovieForm({ ...movieForm, showTimes: e.target.value })} className={inputClass} />
                      {screens.length > 0 && (
                        <select
                          value={movieForm.screen}
                          onChange={(e) => setMovieForm({ ...movieForm, screen: e.target.value })}
                          className={inputClass}
                        >
                          <option value="">— Select Screen —</option>
                          {screens.filter(s => s.isActive).map((s) => (
                            <option key={s._id} value={s._id}>{s.name} (Screen {s.screenNumber})</option>
                          ))}
                        </select>
                      )}
                      <div className="flex gap-2">
                        <button onClick={handleSaveMovie} className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-5 py-2 rounded-lg transition-all">Save</button>
                        <button onClick={() => { setShowMovieForm(false); setEditingMovieId(null); }} className="text-gray-400 hover:text-white text-sm px-4 py-2 rounded-lg hover:bg-white/5 transition-all">Cancel</button>
                      </div>
                    </div>
                  )}

                  {movies.length === 0 ? (
                    <div className="text-center py-16">
                      <p className="text-gray-500">No movies yet. Add your first movie above!</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {movies.map((m) => {
                        const scrn = typeof m.screen === "object" && m.screen ? m.screen : null;
                        return (
                        <div key={m._id} className="glass-strong rounded-xl p-4 flex items-center gap-4">
                          {m.posterUrl && (
                            <img src={m.posterUrl} alt={m.title} className="w-14 h-20 object-cover rounded-lg flex-shrink-0" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                          )}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-white truncate">{m.title}</h4>
                            <p className="text-xs text-gray-500">{m.genre} · {m.language} · {m.duration}</p>
                            <p className="text-xs text-gray-600 mt-1">{m.showTimes.join(", ")}</p>
                            {scrn && (
                              <span className="inline-block text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full mt-1">
                                {scrn.name || `Screen ${scrn.screenNumber}`}
                              </span>
                            )}
                          </div>
                          <div className="flex gap-2 flex-shrink-0">
                            <button onClick={() => handleEditMovie(m)} className="text-indigo-400 hover:text-indigo-300 text-xs px-3 py-1.5 rounded-lg hover:bg-white/5 transition-all">Edit</button>
                            <button onClick={() => handleDeleteMovie(m._id)} className="text-red-400 hover:text-red-300 text-xs px-3 py-1.5 rounded-lg hover:bg-white/5 transition-all">Delete</button>
                          </div>
                        </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* ──────── Bookings ──────── */}
              {tab === "bookings" && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-white">Bookings ({bookings.length})</h3>
                  {bookings.length === 0 ? (
                    <div className="text-center py-16"><p className="text-gray-500">No bookings yet.</p></div>
                  ) : (
                    <div className="space-y-3">
                      {bookings.map((b) => (
                        <div key={b._id} className="glass-strong rounded-xl p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="font-semibold text-white text-sm">{b.user?.name || "User"}</p>
                                <span className="text-[10px] text-accent font-mono">{b.bookingId}</span>
                              </div>
                              <p className="text-xs text-gray-400 mt-1">{b.movie?.title} · {b.showTime}</p>
                              <p className="text-xs text-gray-500">Seats: {b.seatNumbers?.join(", ")}</p>
                              <p className="text-xs text-gray-500">₹{b.totalPrice} {b.foodTotal ? `+ ₹${b.foodTotal} food` : ""}</p>
                            </div>
                            <div className="flex flex-col gap-1 flex-shrink-0 items-end">
                              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                                b.status === "confirmed" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                                b.status === "used" ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                                "bg-red-500/10 text-red-400 border-red-500/20"
                              }`}>
                                {b.status}
                              </span>
                              <div className="flex gap-1 mt-1">
                                {b.status === "confirmed" && (
                                  <>
                                    <button onClick={() => handleStatusChange(b._id, "used")} className="text-[10px] text-blue-400 hover:underline">Mark Used</button>
                                    <button onClick={() => handleStatusChange(b._id, "cancelled")} className="text-[10px] text-red-400 hover:underline ml-2">Cancel</button>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ──────── Food ──────── */}
              {tab === "food" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-white">Your Food Menu</h3>
                    <button
                      onClick={() => setShowFoodForm(true)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-4 py-2 rounded-xl transition-all shadow-lg shadow-indigo-500/20"
                    >
                      + Add Item
                    </button>
                  </div>

                  {showFoodForm && (
                    <div className="glass-strong rounded-2xl p-5 space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input placeholder="Name *" value={foodForm.name} onChange={(e) => setFoodForm({ ...foodForm, name: e.target.value })} className={inputClass} />
                        <input placeholder="Price (₹) *" type="number" value={foodForm.price} onChange={(e) => setFoodForm({ ...foodForm, price: e.target.value })} className={inputClass} />
                        <select value={foodForm.category} onChange={(e) => setFoodForm({ ...foodForm, category: e.target.value })} className={inputClass}>
                          {["Popcorn", "Beverage", "Snack", "Combo", "Meal"].map((c) => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <input placeholder="Image URL" value={foodForm.imageUrl} onChange={(e) => setFoodForm({ ...foodForm, imageUrl: e.target.value })} className={inputClass} />
                      </div>
                      <input placeholder="Description" value={foodForm.description} onChange={(e) => setFoodForm({ ...foodForm, description: e.target.value })} className={inputClass} />
                      <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                        <input type="checkbox" checked={foodForm.isVeg} onChange={(e) => setFoodForm({ ...foodForm, isVeg: e.target.checked })} className="rounded bg-white/10 border-white/20 text-emerald-500 focus:ring-emerald-500/20" />
                        Vegetarian
                      </label>
                      <div className="flex gap-2">
                        <button onClick={handleSaveFood} className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-5 py-2 rounded-lg transition-all">Save</button>
                        <button onClick={() => setShowFoodForm(false)} className="text-gray-400 hover:text-white text-sm px-4 py-2 rounded-lg hover:bg-white/5 transition-all">Cancel</button>
                      </div>
                    </div>
                  )}

                  {foodItems.length === 0 ? (
                    <div className="text-center py-16">
                      <p className="text-gray-500">No food items yet. Add items above or your global menu will be used.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {foodItems.map((f) => (
                        <div key={f._id} className="glass-strong rounded-xl p-4 flex items-center gap-3">
                          {f.imageUrl && (
                            <img src={f.imageUrl} alt={f.name} className="w-14 h-14 object-cover rounded-lg flex-shrink-0" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold text-white text-sm truncate">{f.name}</h4>
                              <span className={`w-3 h-3 rounded-sm flex-shrink-0 ${f.isVeg ? "bg-emerald-500" : "bg-red-500"}`} />
                            </div>
                            <p className="text-xs text-gray-500">{f.category} · ₹{f.price}</p>
                          </div>
                          <button onClick={() => handleDeleteFood(f._id)} className="text-red-400 hover:text-red-300 text-xs px-2 py-1 rounded hover:bg-white/5">Delete</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ──────── Screens ──────── */}
              {tab === "screens" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-white">Your Screens ({screens.length})</h3>
                    <button
                      onClick={() => { resetScreenForm(); setShowScreenForm(true); setScreenForm(prev => ({ ...prev, screenNumber: screens.length + 1, name: `Screen ${screens.length + 1}` })); }}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-4 py-2 rounded-xl transition-all shadow-lg shadow-indigo-500/20"
                    >
                      + Add Screen
                    </button>
                  </div>

                  {showScreenForm && (
                    <div className="glass-strong rounded-2xl p-5 space-y-4">
                      <h4 className="font-semibold text-white text-sm">{editingScreenId ? "Edit Screen" : "Add New Screen"}</h4>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <input placeholder="Screen Name" value={screenForm.name} onChange={(e) => setScreenForm({ ...screenForm, name: e.target.value })} className={inputClass} />
                        <input placeholder="Number" type="number" min={1} value={screenForm.screenNumber} onChange={(e) => setScreenForm({ ...screenForm, screenNumber: Number(e.target.value) })} className={inputClass} />
                        <div>
                          <label className="text-[10px] text-gray-500 font-medium">Rows</label>
                          <input type="number" min={1} max={26} value={screenForm.rows} onChange={(e) => setScreenForm({ ...screenForm, rows: Number(e.target.value) })} className={inputClass} />
                        </div>
                        <div>
                          <label className="text-[10px] text-gray-500 font-medium">Seats/Row</label>
                          <input type="number" min={1} max={30} value={screenForm.seatsPerRow} onChange={(e) => setScreenForm({ ...screenForm, seatsPerRow: Number(e.target.value) })} className={inputClass} />
                        </div>
                      </div>

                      <div>
                        <h5 className="text-xs font-semibold text-gray-300 mb-2">Seat Categories</h5>
                        {screenForm.categories.map((cat, i) => (
                          <div key={i} className="grid grid-cols-4 gap-2 mb-2">
                            <input placeholder="Name" value={cat.name} onChange={(e) => { const u = [...screenForm.categories]; u[i] = { ...cat, name: e.target.value }; setScreenForm({ ...screenForm, categories: u }); }} className={inputClass} />
                            <input placeholder="Rows (A,B)" value={cat.rows.join(",")} onChange={(e) => { const u = [...screenForm.categories]; u[i] = { ...cat, rows: e.target.value.split(",").map(r => r.trim()).filter(Boolean) }; setScreenForm({ ...screenForm, categories: u }); }} className={inputClass} />
                            <input placeholder="Price" type="number" value={cat.price} onChange={(e) => { const u = [...screenForm.categories]; u[i] = { ...cat, price: Number(e.target.value) }; setScreenForm({ ...screenForm, categories: u }); }} className={inputClass} />
                            <div className="flex gap-1">
                              <input type="color" value={cat.color} onChange={(e) => { const u = [...screenForm.categories]; u[i] = { ...cat, color: e.target.value }; setScreenForm({ ...screenForm, categories: u }); }} className="w-10 h-10 rounded-lg bg-transparent cursor-pointer" />
                              <button onClick={() => setScreenForm({ ...screenForm, categories: screenForm.categories.filter((_, j) => j !== i) })} className="text-red-400 hover:text-red-300 text-xs px-2">×</button>
                            </div>
                          </div>
                        ))}
                        <button onClick={() => setScreenForm({ ...screenForm, categories: [...screenForm.categories, { name: "", rows: [], price: 100, color: "#8b5cf6" }] })} className="text-indigo-400 text-xs hover:underline mt-1">+ Add Category</button>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <button onClick={handleSaveScreen} className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-5 py-2 rounded-lg transition-all">Save Screen</button>
                        <button onClick={resetScreenForm} className="text-gray-400 hover:text-white text-sm px-4 py-2 rounded-lg hover:bg-white/5 transition-all">Cancel</button>
                      </div>
                    </div>
                  )}

                  {screens.length === 0 ? (
                    <div className="text-center py-16"><p className="text-gray-500">No screens configured. Add your first screen above!</p></div>
                  ) : (
                    <div className="space-y-3">
                      {screens.map((s) => (
                        <div key={s._id} className="glass-strong rounded-xl p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-bold text-white">{s.name}</h4>
                              <p className="text-xs text-gray-500 mt-0.5">
                                Screen #{s.screenNumber} · {s.seatConfig.rows} rows × {s.seatConfig.seatsPerRow} seats
                                {s.seatConfig.categories?.length > 0 && ` · ${s.seatConfig.categories.map(c => `${c.name} ₹${c.price}`).join(", ")}`}
                              </p>
                              {!s.isActive && <span className="text-[10px] text-red-400 mt-0.5">Inactive</span>}
                            </div>
                            <div className="flex gap-2 flex-shrink-0">
                              <button onClick={() => handleEditScreen(s)} className="text-indigo-400 hover:text-indigo-300 text-xs px-3 py-1.5 rounded-lg hover:bg-white/5 transition-all">Edit</button>
                              <button onClick={() => handleDeleteScreen(s._id)} className="text-red-400 hover:text-red-300 text-xs px-3 py-1.5 rounded-lg hover:bg-white/5 transition-all">Delete</button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default TheatreDashboard;