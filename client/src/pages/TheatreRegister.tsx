import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerTheatre } from "../api/theatre";
import { TheatreContext } from "../context/TheatreContext";
import { motion } from "framer-motion";

const TheatreRegister: React.FC = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    city: "",
    address: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { setTheatre } = useContext(TheatreContext);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await registerTheatre(form);
      setTheatre({
        _id: data.theatre._id,
        name: data.theatre.name,
        email: data.theatre.email,
        city: data.theatre.city,
      } as any);
      navigate("/theatre/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/30 transition-all";

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 relative py-8">
      <div className="absolute inset-0 hero-gradient pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/25">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white">Register Your Theatre</h2>
          <p className="text-gray-500 text-sm mt-1">
            List your cinema on MarkMySeat and start selling tickets
          </p>
        </div>

        <div className="glass-strong rounded-2xl p-7 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Theatre Name</label>
              <input name="name" value={form.name} onChange={handleChange} placeholder="PVR Cinemas" className={inputClass} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="theatre@example.com" className={inputClass} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Password</label>
              <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Create a strong password" className={inputClass} required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">City</label>
                <input name="city" value={form.city} onChange={handleChange} placeholder="Mumbai" className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Phone</label>
                <input name="phone" value={form.phone} onChange={handleChange} placeholder="+91 98765..." className={inputClass} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Address</label>
              <input name="address" value={form.address} onChange={handleChange} placeholder="123 Cinema Road" className={inputClass} />
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
                  Creating account...
                </span>
              ) : (
                "Register Theatre"
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already registered?{" "}
          <Link to="/theatre/login" className="text-indigo-400 font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default TheatreRegister;
