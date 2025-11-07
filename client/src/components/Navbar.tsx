import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { motion } from "framer-motion";

const Navbar: React.FC = () => {
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex-shrink-0 flex items-center gap-2 cursor-pointer"
            >
              {/* Assuming you have a logo in /public/markmyseat.png */}
              <img
                className="h-8 w-auto"
                src="/markmyseat.png"
                alt="MarkMySeat"
              />
              <span className="font-bold text-xl text-gray-800 hidden sm:block">
                MarkMySeat
              </span>
            </motion.div>
          </Link>

          {/* Links */}
          <div className="flex items-center space-x-4">
            {user ? (
              // --- Logged In View ---
              <>
                <span className="text-gray-700 hidden sm:block">
                  Hi, {user.name.split(" ")[0]}!
                </span>
                <Link
                  to="/my-bookings"
                  className="text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  My Bookings
                </Link>
                <button
                  onClick={handleLogout}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium
                             hover:bg-indigo-700 transition"
                >
                  Logout
                </button>
              </>
            ) : (
              // --- Logged Out View ---
              <>
                <Link
                  to="/login"
                  className="text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium
                             hover:bg-indigo-700 transition"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;