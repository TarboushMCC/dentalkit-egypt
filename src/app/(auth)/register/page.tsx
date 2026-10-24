"use client";

import { useState, useTransition, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Eye, EyeOff, Mail, Lock, User, GraduationCap, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { registerAction } from "@/lib/actions/auth";

type University = { id: string; name: string; academicYears: { id: string; name: string }[] };

export default function RegisterPage() {
  const [showPw, setShowPw] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [universities, setUniversities] = useState<University[]>([]);
  const [selectedUni, setSelectedUni] = useState<University | null>(null);

  // Form state
  const [formData, setFormData] = useState({ name: "", email: "", password: "", universityId: "", yearId: "" });

  useEffect(() => {
    fetch("/api/universities")
      .then((r) => r.json())
      .then((d) => { if (d.success) setUniversities(d.data); })
      .catch(() => {});
  }, []);

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!formData.name || formData.name.length < 2) return setError("Name must be at least 2 characters");
    if (!formData.email.includes("@")) return setError("Please enter a valid email");
    if (formData.password.length < 8) return setError("Password must be at least 8 characters");
    setStep(2);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await registerAction(formData);
      if (result?.error) setError(typeof result.error === "string" ? result.error : "Registration failed");
    });
  };

  return (
    <div className="min-h-screen bg-mesh flex items-center justify-center px-4 py-20">
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md">
        <Link href="/" className="flex items-center gap-2.5 justify-center mb-8">
          <div className="w-9 h-9 rounded-xl bg-[#0A2540] flex items-center justify-center shadow-md">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-[#00B4D8]">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" fill="currentColor"/>
            </svg>
          </div>
          <div>
            <span className="font-display font-bold text-[#0A2540] text-xl">DentalKit</span>
            <span className="block text-[10px] text-[#00B4D8] tracking-widest uppercase leading-none">Egypt</span>
          </div>
        </Link>

        <div className="bg-white rounded-3xl shadow-xl shadow-[#0A2540]/8 border border-[#E2E8F0] p-8">
          <div className="flex items-center gap-2 mb-6">
            <div className={`h-1.5 flex-1 rounded-full transition-colors ${step >= 1 ? "bg-[#00B4D8]" : "bg-[#E2E8F0]"}`} />
            <div className={`h-1.5 flex-1 rounded-full transition-colors ${step >= 2 ? "bg-[#00B4D8]" : "bg-[#E2E8F0]"}`} />
          </div>

          <h1 className="font-display text-2xl font-bold text-[#0A2540] mb-1">
            {step === 1 ? "Create your account" : "Your academic info"}
          </h1>
          <p className="text-sm text-[#6B7A8D] mb-6">
            {step === 1 ? "Join thousands of dental students on DentalKit." : "Help us show you the right packages."}
          </p>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600">{error}</div>
          )}

          {step === 1 ? (
            <form onSubmit={handleNext} className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-sm font-medium text-[#0A2540]">Full name</Label>
                <div className="relative mt-1.5">
                  <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9BAAB8]" />
                  <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} type="text" placeholder="Your full name" className="pl-10 bg-[#F4F6F8] border-[#E2E8F0] focus:border-[#00B4D8] rounded-xl" required />
                </div>
              </div>
              <div>
                <Label htmlFor="email" className="text-sm font-medium text-[#0A2540]">Email address</Label>
                <div className="relative mt-1.5">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9BAAB8]" />
                  <Input id="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} type="email" placeholder="you@example.com" className="pl-10 bg-[#F4F6F8] border-[#E2E8F0] focus:border-[#00B4D8] rounded-xl" required />
                </div>
              </div>
              <div>
                <Label htmlFor="password" className="text-sm font-medium text-[#0A2540]">Password</Label>
                <div className="relative mt-1.5">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9BAAB8]" />
                  <Input id="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} type={showPw ? "text" : "password"} placeholder="Min. 8 characters" className="pl-10 pr-10 bg-[#F4F6F8] border-[#E2E8F0] focus:border-[#00B4D8] rounded-xl" required />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9BAAB8] hover:text-[#0A2540] transition-colors cursor-pointer" aria-label="Toggle password">
                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
              <Button type="submit" className="w-full bg-[#0A2540] hover:bg-[#0D3461] text-white rounded-xl py-3 font-semibold flex items-center justify-center gap-2 cursor-pointer">
                Continue <ArrowRight size={15} />
              </Button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="university" className="text-sm font-medium text-[#0A2540]">Your University</Label>
                <div className="relative mt-1.5">
                  <GraduationCap size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9BAAB8] z-10" />
                  <select
                    id="university"
                    value={formData.universityId}
                    onChange={(e) => {
                      const uni = universities.find((u) => u.id === e.target.value) || null;
                      setSelectedUni(uni);
                      setFormData({ ...formData, universityId: e.target.value, yearId: "" });
                    }}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#F4F6F8] border border-[#E2E8F0] focus:border-[#00B4D8] rounded-xl text-sm text-[#1A1A2E] outline-none appearance-none cursor-pointer"
                  >
                    <option value="">Select your university</option>
                    {universities.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <Label htmlFor="year" className="text-sm font-medium text-[#0A2540]">Academic Year</Label>
                <div className="relative mt-1.5">
                  <select
                    id="year"
                    value={formData.yearId}
                    onChange={(e) => setFormData({ ...formData, yearId: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#F4F6F8] border border-[#E2E8F0] focus:border-[#00B4D8] rounded-xl text-sm text-[#1A1A2E] outline-none appearance-none cursor-pointer"
                    disabled={!selectedUni}
                  >
                    <option value="">Select your year</option>
                    {selectedUni?.academicYears.map((y) => <option key={y.id} value={y.id}>{y.name}</option>)}
                  </select>
                </div>
              </div>
              <Button type="submit" disabled={isPending} className="w-full bg-[#0A2540] hover:bg-[#0D3461] text-white rounded-xl py-3 font-semibold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60">
                {isPending ? (
                  <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Creating account...</span>
                ) : <>Create Account <ArrowRight size={15} /></>}
              </Button>
              <button type="button" onClick={() => setStep(1)} className="w-full text-sm text-[#6B7A8D] hover:text-[#0A2540] transition-colors cursor-pointer">
                ← Back
              </button>
            </form>
          )}

          <p className="text-center text-sm text-[#6B7A8D] mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-[#00B4D8] font-semibold hover:text-[#0A2540] transition-colors">Sign in</Link>
          </p>
          <p className="text-center text-xs text-[#9BAAB8] mt-3">
            By creating an account you agree to our{" "}
            <Link href="/terms" className="underline hover:text-[#0A2540] transition-colors">Terms</Link> and{" "}
            <Link href="/privacy" className="underline hover:text-[#0A2540] transition-colors">Privacy Policy</Link>.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
