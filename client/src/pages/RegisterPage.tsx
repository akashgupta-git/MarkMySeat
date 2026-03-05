import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../api/auth";
import { AuthContext } from "../context/AuthContext";
import { motion } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, ArrowRight, UserIcon } from "lucide-react";
import { toast } from "sonner";

const RegisterPage: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const { setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast.error("All fields are required.");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    try {
      const { user } = await registerUser({ name, email, password });
      setUser(user);
      toast.success("Account created! Welcome aboard.");
      navigate("/");
    } catch (err: any) {
      toast.error(err.message || "Failed to register.");
    } finally {
      setLoading(false);
    }
  };

  // Password strength
  const pwStrength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : 3;
  const pwColors = ["", "bg-red-500", "bg-amber-500", "bg-emerald-500"];
  const pwLabels = ["", "Weak", "Good", "Strong"];

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 relative">
      {/* Background */}
      <div className="absolute inset-0 hero-gradient pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-primary/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/3 left-1/4 w-64 h-64 bg-cyan-500/5 rounded-full blur-[100px]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/25">
            <svg viewBox="0 0 32 32" className="w-7 h-7">
              <path d="M6 24V8l10 10 10-10v16" stroke="white" strokeWidth="3.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white">Create your account</h2>
          <p className="text-gray-500 text-sm mt-1">
            Join MarkMySeat to start booking movies
          </p>
        </div>

        {/* Form Card */}
        <div className="glass-card rounded-2xl p-7 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 transition-all"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 transition-all"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a strong password"
                  className="w-full pl-10 pr-10 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {/* Password strength meter */}
              {password.length > 0 && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex gap-1 flex-1">
                    {[1, 2, 3].map((level) => (
                      <div
                        key={level}
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                          pwStrength >= level ? pwColors[pwStrength] : "bg-white/10"
                        }`}
                      />
                    ))}
                  </div>
                  <span className={`text-[10px] font-medium ${
                    pwStrength === 1 ? "text-red-400" : pwStrength === 2 ? "text-amber-400" : "text-emerald-400"
                  }`}>
                    {pwLabels[pwStrength]}
                  </span>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3 rounded-xl transition-all duration-300 disabled:opacity-50 shadow-lg shadow-primary/20 text-sm group flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <div className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full" />
                  Creating account...
                </span>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-primary font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
