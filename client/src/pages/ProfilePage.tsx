import React, { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { updateProfile, changePassword } from "../api/auth";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { User, Phone, Mail, Lock, Eye, EyeOff, Save, Shield, CheckCircle } from "lucide-react";

const ProfilePage: React.FC = () => {
  const { user, setUser } = useContext(AuthContext);
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [saving, setSaving] = useState(false);

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwSaving, setPwSaving] = useState(false);
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const pwStrength = (() => {
    if (!newPassword) return 0;
    let s = 0;
    if (newPassword.length >= 6) s++;
    if (/[A-Z]/.test(newPassword) && /[a-z]/.test(newPassword)) s++;
    if (/\d/.test(newPassword) || /[^A-Za-z0-9]/.test(newPassword)) s++;
    return s;
  })();
  const strengthLabel = ["", "Weak", "Good", "Strong"][pwStrength];
  const strengthColor = ["", "bg-red-500", "bg-amber-500", "bg-emerald-500"][pwStrength];

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await updateProfile({ name, phone });
      setUser({ ...user!, ...updated });
      toast.success("Profile updated successfully");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("New passwords don't match");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setPwSaving(true);
    try {
      await changePassword({ currentPassword: oldPassword, newPassword });
      toast.success("Password changed successfully!");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to change password");
    } finally {
      setPwSaving(false);
    }
  };

  const inputClass =
    "w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all";
  const inputClassPw =
    "w-full pl-10 pr-11 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all";

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
            <User className="w-5 h-5 text-primary" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">My Profile</h1>
        </div>

        {/* Avatar + info */}
        <div className="glass-card rounded-2xl p-6 mb-6 flex items-center gap-4 border border-white/[0.06]">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-indigo-500 flex items-center justify-center text-2xl font-bold text-white flex-shrink-0 shadow-lg shadow-primary/20">
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-[#0f0f25]">
              <CheckCircle className="w-3 h-3 text-white" />
            </div>
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">{user?.name}</h2>
            <p className="text-sm text-gray-500 flex items-center gap-1">
              <Mail className="w-3.5 h-3.5" />
              {user?.email}
            </p>
          </div>
        </div>

        {/* Profile Form */}
        <div className="glass-card rounded-2xl p-6 mb-6 border border-white/[0.06]">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-[0.15em] mb-5 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5" />
            Edit Profile
          </h3>
          <form onSubmit={handleProfileSave} className="space-y-4">
            <div>
              <label className="text-xs text-gray-400 font-medium mb-1.5 block">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-400 font-medium mb-1.5 block">Phone</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Your phone number" className={inputClass} />
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-400 font-medium mb-1.5 block">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                <input value={user?.email || ""} disabled className={`${inputClass} opacity-50 cursor-not-allowed`} />
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="bg-primary hover:bg-primary-dark text-white font-semibold py-3 px-6 rounded-xl transition-all disabled:opacity-50 text-sm shadow-lg shadow-primary/20 inline-flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </div>

        {/* Password Change */}
        <div className="glass-card rounded-2xl p-6 border border-white/[0.06]">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-[0.15em] mb-5 flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5" />
            Change Password
          </h3>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="text-xs text-gray-400 font-medium mb-1.5 block">Current Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                <input type={showOld ? "text" : "password"} value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} placeholder="Enter current password" className={inputClassPw} />
                <button type="button" onClick={() => setShowOld(!showOld)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400 transition-colors">
                  {showOld ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-400 font-medium mb-1.5 block">New Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                <input type={showNew ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Enter new password" className={inputClassPw} />
                <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400 transition-colors">
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {newPassword && (
                <div className="mt-2">
                  <div className="flex gap-1">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= pwStrength ? strengthColor : "bg-white/10"}`} />
                    ))}
                  </div>
                  <p className={`text-[10px] mt-1 ${pwStrength === 1 ? "text-red-400" : pwStrength === 2 ? "text-amber-400" : "text-emerald-400"}`}>
                    {strengthLabel}
                  </p>
                </div>
              )}
            </div>
            <div>
              <label className="text-xs text-gray-400 font-medium mb-1.5 block">Confirm New Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                <input type={showConfirm ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm new password" className={inputClassPw} />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400 transition-colors">
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {confirmPassword && newPassword && (
                <p className={`text-[10px] mt-1.5 ${confirmPassword === newPassword ? "text-emerald-400" : "text-red-400"}`}>
                  {confirmPassword === newPassword ? "Passwords match" : "Passwords don't match"}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={pwSaving}
              className="bg-white/5 hover:bg-white/10 text-white font-semibold py-3 px-6 rounded-xl transition-all disabled:opacity-50 text-sm border border-white/10 inline-flex items-center gap-2"
            >
              <Shield className="w-4 h-4" />
              {pwSaving ? "Changing..." : "Change Password"}
            </button>
          </form>
        </div>
      </div>
    </motion.div>
  );
};

export default ProfilePage;