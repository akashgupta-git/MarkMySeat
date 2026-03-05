import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { adminLogin } from "../api/admin";
import { AdminContext } from "../context/AdminContext";
import { motion } from "framer-motion";
import Logo from "../components/Logo";

const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { setAdmin } = useContext(AdminContext);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await adminLogin({ email, password });
      setAdmin(data.admin);
      navigate("/admin/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative bg-dark">
      {/* Background effects */}
      <div className="absolute inset-0 hero-gradient pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-emerald-500/5 rounded-full blur-[100px]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Logo size="lg" showText={false} />
          </div>
          <h2 className="text-2xl font-bold text-white">SuperAdmin Portal</h2>
          <p className="text-gray-500 text-sm mt-1">
            Manage theatres, users & the entire system
          </p>
        </div>

        {/* Form */}
        <div className="glass-strong rounded-2xl p-7 sm:p-8 border border-emerald-500/10">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@markmyseat.com"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/30 transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/30 transition-all"
                required
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-xl">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-xl transition-all duration-200 disabled:opacity-50 shadow-lg shadow-emerald-600/20 text-sm"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <div className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full" />
                  Authenticating...
                </span>
              ) : (
                "Access Dashboard"
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          <Link to="/" className="text-emerald-400 font-medium hover:underline">
            &larr; Back to MarkMySeat
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default AdminLogin;