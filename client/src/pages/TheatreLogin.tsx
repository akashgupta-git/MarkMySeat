import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginTheatre } from "../api/theatre";
import { TheatreContext } from "../context/TheatreContext";
import { motion } from "framer-motion";
import Logo from "../components/Logo";

const TheatreLogin: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { setTheatre } = useContext(TheatreContext);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await loginTheatre({ email, password });
      setTheatre({
        _id: data.theatre._id,
        name: data.theatre.name,
        email: data.theatre.email,
        city: data.theatre.city,
      } as any);
      navigate("/theatre/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 relative">
      <div className="absolute inset-0 hero-gradient pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Logo size="lg" showText={false} />
          </div>
          <h2 className="text-2xl font-bold text-white">Theatre Partner Login</h2>
          <p className="text-gray-500 text-sm mt-1">
            Sign in to manage your theatre on MarkMySeat
          </p>
        </div>

        <div className="glass-strong rounded-2xl p-7 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="theatre@example.com"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/30 transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/30 transition-all"
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
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition-all duration-200 disabled:opacity-50 shadow-lg shadow-indigo-500/20 text-sm"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <div className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full" />
                  Signing in...
                </span>
              ) : (
                "Sign In as Theatre"
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Don't have a theatre account?{" "}
          <Link to="/theatre/register" className="text-indigo-400 font-medium hover:underline">
            Register here
          </Link>
        </p>
        <p className="text-center text-sm text-gray-600 mt-2">
          <Link to="/login" className="text-gray-500 hover:text-gray-300 transition-colors">
            Sign in as regular user instead
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default TheatreLogin;