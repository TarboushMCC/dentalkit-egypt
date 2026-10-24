"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { User, Mail, Shield, Save, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const [name, setName] = useState(session?.user?.name ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const role = (session?.user as { role?: string })?.role;

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (data.success) {
        await update({ name });
        setSaved(true);
        toast.success("Profile updated!");
        setTimeout(() => setSaved(false), 3000);
      } else {
        toast.error(data.error ?? "Failed to update profile");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6 max-w-lg">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="font-display text-2xl font-bold text-[#0A2540]">My Profile</h1>
        <p className="text-sm text-[#6B7A8D] mt-1">Manage your account information.</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6">
          {/* Avatar */}
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-[#E2E8F0]">
            <div className="w-16 h-16 rounded-2xl bg-[#0A2540] text-white flex items-center justify-center font-bold text-2xl">
              {(session?.user?.name ?? "U").charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-display font-bold text-[#0A2540] text-lg">{session?.user?.name ?? "Student"}</p>
              <p className="text-sm text-[#9BAAB8]">{session?.user?.email}</p>
              <span className={`inline-flex items-center gap-1 mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                role === "SUPER_ADMIN" || role === "ADMIN"
                  ? "bg-[#0A2540] text-white"
                  : "bg-[#F4F6F8] text-[#6B7A8D]"
              }`}>
                <Shield size={9} /> {role ?? "STUDENT"}
              </span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#6B7A8D] mb-1.5 flex items-center gap-1.5">
                <User size={12} /> Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:border-[#00B4D8] bg-[#F4F6F8]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#6B7A8D] mb-1.5 flex items-center gap-1.5">
                <Mail size={12} /> Email Address
              </label>
              <input
                type="email"
                value={session?.user?.email ?? ""}
                disabled
                className="w-full px-3.5 py-2.5 border border-[#E2E8F0] rounded-xl text-sm bg-[#F4F6F8] text-[#9BAAB8] cursor-not-allowed"
              />
              <p className="text-[10px] text-[#9BAAB8] mt-1">Email cannot be changed.</p>
            </div>

            <button
              type="submit"
              disabled={saving || !name.trim()}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#0A2540] text-white rounded-xl text-sm font-semibold hover:bg-[#0D3461] transition-colors cursor-pointer disabled:opacity-50"
            >
              {saving ? (
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : saved ? (
                <CheckCircle2 size={15} />
              ) : (
                <Save size={15} />
              )}
              {saving ? "Saving…" : saved ? "Saved!" : "Save Changes"}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
