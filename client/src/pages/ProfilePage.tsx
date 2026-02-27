import React, { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { updateProfile, changePassword } from "../api/auth";
import { motion } from "framer-motion";

const ProfilePage: React.FC = () => {
  const { user, setUser } = useContext(AuthContext);
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMessage, setPwMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const updated = await updateProfile({ name, phone });
      setUser({ ...user!, ...updated });
      setMessage({ type: "success", text: "Profile updated!" });
    } catch (err: any) {
      setMessage({ type: "error", text: err.response?.data?.message || "Failed to update." });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPwMessage({ type: "error", text: "New passwords don't match." });
      return;
    }
    if (newPassword.length < 6) {
      setPwMessage({ type: "error", text: "Password must be at least 6 characters." });
      return;
    }
    setPwSaving(true);
    setPwMessage(null);
    try {
      await changePassword({ currentPassword: oldPassword, newPassword });
      setPwMessage({ type: "success", text: "Password changed successfully!" });
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setPwMessage({ type: "error", text: err.response?.data?.message || "Failed to change password." });
    } finally {
      setPwSaving(false);
    }
  };

  const inputClass =
    "w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all";

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-8">My Profile</h1>

        {/* Avatar + info */}
        <div className="glass-strong rounded-2xl p-6 mb-6 flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-indigo-500 flex items-center justify-center text-2xl font-bold text-white flex-shrink-0">
            {user?.name?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">{user?.name}</h2>
            <p className="text-sm text-gray-500">{user?.email}</p>
          </div>
        </div>

        {/* Profile Form */}
        <div className="glass-strong rounded-2xl p-6 mb-6">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Edit Profile</h3>
          <form onSubmit={handleProfileSave} className="space-y-4">
            <div>
              <label className="text-xs text-gray-400 font-medium mb-1 block">Full Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="text-xs text-gray-400 font-medium mb-1 block">Phone</label>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Your phone number" className={inputClass} />
            </div>
            <div>
              <label className="text-xs text-gray-400 font-medium mb-1 block">Email</label>
              <input value={user?.email || ""} disabled className={`${inputClass} opacity-50 cursor-not-allowed`} />
            </div>

            {message && (
              <div className={`text-sm rounded-xl px-4 py-2.5 ${message.type === "success" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"}`}>
                {message.text}
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              className="bg-primary hover:bg-primary-dark text-white font-semibold py-3 px-6 rounded-xl transition-all disabled:opacity-50 text-sm shadow-lg shadow-primary/20"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </div>

        {/* Password Change */}
        <div className="glass-strong rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Change Password</h3>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="text-xs text-gray-400 font-medium mb-1 block">Current Password</label>
              <input type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} placeholder="Enter current password" className={inputClass} />
            </div>
            <div>
              <label className="text-xs text-gray-400 font-medium mb-1 block">New Password</label>
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Enter new password" className={inputClass} />
            </div>
            <div>
              <label className="text-xs text-gray-400 font-medium mb-1 block">Confirm New Password</label>
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm new password" className={inputClass} />
            </div>

            {pwMessage && (
              <div className={`text-sm rounded-xl px-4 py-2.5 ${pwMessage.type === "success" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"}`}>
                {pwMessage.text}
              </div>
            )}

            <button
              type="submit"
              disabled={pwSaving}
              className="bg-white/5 hover:bg-white/10 text-white font-semibold py-3 px-6 rounded-xl transition-all disabled:opacity-50 text-sm border border-white/10"
            >
              {pwSaving ? "Changing..." : "Change Password"}
            </button>
          </form>
        </div>
      </div>
    </motion.div>
  );
};

export default ProfilePage;
