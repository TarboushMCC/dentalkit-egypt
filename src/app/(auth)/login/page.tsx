"use client";

import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Mail, Lock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn, getSession } from "next-auth/react";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (result?.error) {
        setError("Invalid email or password. Please try again.");
      } else {
        // Determine redirect based on role
        const session = await getSession();
        const role = (session?.user as { role?: string })?.role;
        const isAdmin = role === "ADMIN" || role === "SUPER_ADMIN";
        const dest = callbackUrl !== "/dashboard" ? callbackUrl : isAdmin ? "/admin" : "/dashboard";
        router.push(dest);
        router.refresh();
      }
    });
  };

  const handleGoogle = () => signIn("google", { callbackUrl });

  return (
    <div className="min-h-screen bg-mesh flex items-center justify-center px-4 py-20">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
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
          <h1 className="font-display text-2xl font-bold text-[#0A2540] mb-1">Welcome back</h1>
          <p className="text-sm text-[#6B7A8D] mb-6">Sign in to access your account and orders.</p>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-sm font-medium text-[#0A2540]">Email address</Label>
              <div className="relative mt-1.5">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9BAAB8]" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="pl-10 bg-[#F4F6F8] border-[#E2E8F0] focus:border-[#00B4D8] rounded-xl"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <Label htmlFor="password" className="text-sm font-medium text-[#0A2540]">Password</Label>
                <Link href="/forgot-password" className="text-xs text-[#00B4D8] hover:text-[#0A2540] transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9BAAB8]" />
                <Input
                  id="password"
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="pl-10 pr-10 bg-[#F4F6F8] border-[#E2E8F0] focus:border-[#00B4D8] rounded-xl"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9BAAB8] hover:text-[#0A2540] transition-colors cursor-pointer"
                  aria-label="Toggle password"
                >
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isPending}
              className="w-full bg-[#0A2540] hover:bg-[#0D3461] text-white rounded-xl py-3 font-semibold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isPending ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : (
                <>Sign In <ArrowRight size={15} /></>
              )}
            </Button>
          </form>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#E2E8F0]" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-3 text-xs text-[#9BAAB8]">or continue with</span>
            </div>
          </div>

          <button
            onClick={handleGoogle}
            className="w-full flex items-center justify-center gap-3 py-2.5 border border-[#E2E8F0] rounded-xl text-sm font-medium text-[#1A1A2E] hover:bg-[#F4F6F8] transition-colors cursor-pointer"
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <p className="text-center text-sm text-[#6B7A8D] mt-6">
            Don't have an account?{" "}
            <Link href="/register" className="text-[#00B4D8] font-semibold hover:text-[#0A2540] transition-colors">
              Create one free
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
