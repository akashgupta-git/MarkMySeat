import React, { useContext, useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import Logo from "./Logo";
import { Film, Ticket, User, LogOut, Menu, X, ChevronDown, Building2 } from "lucide-react";

const Navbar: React.FC = () => {
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("token");
    navigate("/");
    setMobileOpen(false);
    setProfileOpen(false);
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-[#0a0a1a]/95 backdrop-blur-2xl shadow-lg shadow-black/20 border-b border-white/[0.04]"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="group relative">
            <Logo size="md" />
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-primary/0 group-hover:w-full transition-all duration-500" />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden sm:flex items-center gap-1">
            {user ? (
              <>
                <Link
                  to="/"
                  className={`relative text-sm font-medium px-3 py-2 rounded-lg transition-all duration-300 group ${
                    isActive("/")
                      ? "text-white"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <Film className="w-4 h-4" />
                    Movies
                  </span>
                  {isActive("/") && (
                    <motion.span
                      layoutId="nav-indicator"
                      className="absolute bottom-0 left-2 right-2 h-0.5 bg-primary rounded-full"
                    />
                  )}
                </Link>
                <Link
                  to="/my-bookings"
                  className={`relative text-sm font-medium px-3 py-2 rounded-lg transition-all duration-300 group ${
                    isActive("/my-bookings")
                      ? "text-white"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <Ticket className="w-4 h-4" />
                    My Bookings
                  </span>
                  {isActive("/my-bookings") && (
                    <motion.span
                      layoutId="nav-indicator"
                      className="absolute bottom-0 left-2 right-2 h-0.5 bg-primary rounded-full"
                    />
                  )}
                </Link>

                {/* Profile dropdown */}
                <div ref={profileRef} className="relative ml-2">
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 transition-all duration-300 group"
                  >
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-indigo-500 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm text-gray-300 font-medium max-w-[100px] truncate hidden lg:block">
                      {user.name.split(" ")[0]}
                    </span>
                    <ChevronDown className={`w-3.5 h-3.5 text-gray-500 transition-transform duration-300 ${profileOpen ? "rotate-180" : ""}`} />
                  </button>

                  <AnimatePresence>
                    {profileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.96 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-56 rounded-xl bg-[#161630]/95 backdrop-blur-2xl border border-white/[0.06] shadow-2xl shadow-black/40 overflow-hidden"
                      >
                        <div className="p-3 border-b border-white/5">
                          <p className="text-sm font-medium text-white truncate">{user.name}</p>
                          <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        </div>
                        <div className="p-1.5">
                          <Link
                            to="/profile"
                            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                          >
                            <User className="w-4 h-4" />
                            Profile
                          </Link>
                          <Link
                            to="/my-bookings"
                            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                          >
                            <Ticket className="w-4 h-4" />
                            My Bookings
                          </Link>
                          <div className="border-t border-white/5 my-1" />
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-red-400 hover:text-red-300 hover:bg-red-500/5 transition-all"
                          >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/theatre/login"
                  className="flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 text-sm font-medium px-3 py-2 rounded-lg hover:bg-indigo-500/5 transition-all duration-300"
                >
                  <Building2 className="w-4 h-4" />
                  For Theatres
                </Link>
                <Link
                  to="/login"
                  className="text-gray-400 hover:text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-white/5 transition-all duration-300"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="relative bg-primary hover:bg-primary-dark text-white text-sm font-semibold px-5 py-2 rounded-lg transition-all duration-300 shadow-lg shadow-primary/20 overflow-hidden group"
                >
                  <span className="relative z-10">Sign Up</span>
                  <span className="absolute inset-0 bg-gradient-to-r from-primary via-pink-500 to-primary bg-[length:200%_100%] opacity-0 group-hover:opacity-100 group-hover:animate-[shimmer_1.5s_linear_infinite] transition-opacity" />
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="sm:hidden text-gray-400 hover:text-white p-2 rounded-lg hover:bg-white/5 transition-all"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <AnimatePresence mode="wait">
              {mobileOpen ? (
                <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                  <X className="w-6 h-6" />
                </motion.div>
              ) : (
                <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                  <Menu className="w-6 h-6" />
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </div>

        {/* Mobile Nav */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="sm:hidden overflow-hidden"
            >
              <div className="pb-4 space-y-1 border-t border-white/5 pt-3">
                {user ? (
                  <>
                    <div className="flex items-center gap-3 px-3 py-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-indigo-500 flex items-center justify-center text-sm font-bold text-white">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                    <Link to="/" onClick={() => setMobileOpen(false)} className="flex items-center gap-2.5 text-gray-400 hover:text-white text-sm font-medium px-3 py-2.5 rounded-lg hover:bg-white/5">
                      <Film className="w-4 h-4" /> Movies
                    </Link>
                    <Link to="/my-bookings" onClick={() => setMobileOpen(false)} className="flex items-center gap-2.5 text-gray-400 hover:text-white text-sm font-medium px-3 py-2.5 rounded-lg hover:bg-white/5">
                      <Ticket className="w-4 h-4" /> My Bookings
                    </Link>
                    <Link to="/profile" onClick={() => setMobileOpen(false)} className="flex items-center gap-2.5 text-gray-400 hover:text-white text-sm font-medium px-3 py-2.5 rounded-lg hover:bg-white/5">
                      <User className="w-4 h-4" /> Profile
                    </Link>
                    <div className="border-t border-white/5 mt-2 pt-2">
                      <button onClick={handleLogout} className="w-full flex items-center gap-2.5 text-red-400 hover:text-red-300 text-sm font-medium px-3 py-2.5 rounded-lg hover:bg-red-500/5">
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <Link to="/theatre/login" onClick={() => setMobileOpen(false)} className="flex items-center gap-2.5 text-indigo-400 hover:text-indigo-300 text-sm font-medium px-3 py-2.5 rounded-lg hover:bg-indigo-500/5">
                      <Building2 className="w-4 h-4" /> For Theatres
                    </Link>
                    <Link to="/login" onClick={() => setMobileOpen(false)} className="block text-gray-400 hover:text-white text-sm font-medium px-3 py-2.5 rounded-lg hover:bg-white/5">
                      Sign In
                    </Link>
                    <Link to="/register" onClick={() => setMobileOpen(false)} className="block bg-primary text-white text-sm font-semibold px-3 py-2.5 rounded-lg mt-1 text-center">
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

export default Navbar;