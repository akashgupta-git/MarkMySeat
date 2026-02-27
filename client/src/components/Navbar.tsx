import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import Logo from "./Logo";

const Navbar: React.FC = () => {
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("token");
    navigate("/");
    setMobileOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 bg-dark/80 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="group">
            <Logo size="md" />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden sm:flex items-center gap-2">
            {user ? (
              <>
                <span className="text-gray-500 text-sm mr-1">
                  Hi, <span className="text-gray-200 font-medium">{user.name.split(" ")[0]}</span>
                </span>
                <Link
                  to="/my-bookings"
                  className="text-gray-400 hover:text-white text-sm font-medium px-3 py-2 rounded-lg hover:bg-white/5 transition-all duration-200"
                >
                  My Bookings
                </Link>
                <Link
                  to="/profile"
                  className="text-gray-400 hover:text-white text-sm font-medium px-3 py-2 rounded-lg hover:bg-white/5 transition-all duration-200"
                >
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white text-sm font-medium px-4 py-2 rounded-lg transition-all duration-200 border border-white/5"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/theatre/login"
                  className="text-indigo-400 hover:text-indigo-300 text-sm font-medium px-3 py-2 rounded-lg hover:bg-indigo-500/5 transition-all duration-200"
                >
                  For Theatres
                </Link>
                <Link
                  to="/login"
                  className="text-gray-400 hover:text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-white/5 transition-all duration-200"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="bg-primary hover:bg-primary-dark text-white text-sm font-semibold px-5 py-2 rounded-lg transition-all duration-200 shadow-lg shadow-primary/20"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="sm:hidden text-gray-400 hover:text-white p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Nav with animation */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="sm:hidden overflow-hidden"
            >
              <div className="pb-4 space-y-1 border-t border-white/5 pt-3">
                {user ? (
                  <>
                    <p className="text-gray-500 text-sm px-3 py-2">
                      Hi, <span className="text-gray-200 font-medium">{user.name.split(" ")[0]}</span>
                    </p>
                    <Link
                      to="/my-bookings"
                      onClick={() => setMobileOpen(false)}
                      className="block text-gray-400 hover:text-white text-sm font-medium px-3 py-2.5 rounded-lg hover:bg-white/5"
                    >
                      My Bookings
                    </Link>
                    <Link
                      to="/profile"
                      onClick={() => setMobileOpen(false)}
                      className="block text-gray-400 hover:text-white text-sm font-medium px-3 py-2.5 rounded-lg hover:bg-white/5"
                    >
                      Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left text-gray-400 hover:text-white text-sm font-medium px-3 py-2.5 rounded-lg hover:bg-white/5"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/theatre/login"
                      onClick={() => setMobileOpen(false)}
                      className="block text-indigo-400 hover:text-indigo-300 text-sm font-medium px-3 py-2.5 rounded-lg hover:bg-indigo-500/5"
                    >
                      For Theatres
                    </Link>
                    <Link
                      to="/login"
                      onClick={() => setMobileOpen(false)}
                      className="block text-gray-400 hover:text-white text-sm font-medium px-3 py-2.5 rounded-lg hover:bg-white/5"
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setMobileOpen(false)}
                      className="block bg-primary text-white text-sm font-semibold px-3 py-2.5 rounded-lg mt-1"
                    >
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
