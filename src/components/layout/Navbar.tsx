"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, User, Menu, X, Search, ChevronDown, LayoutDashboard, LogOut, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSession, signOut } from "next-auth/react";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "Find My Kit", href: "/find-kit" },
  { label: "Universities", href: "/universities" },
  { label: "Packages", href: "/packages" },
  { label: "Products", href: "/products" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const { data: session, status } = useSession();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // Fetch real cart count
  useEffect(() => {
    if (!session) { setCartCount(0); return; }
    fetch("/api/cart")
      .then((r) => r.json())
      .then((json) => { if (json.success) setCartCount(json.data.count ?? 0); })
      .catch(() => {});
  }, [session]);

  const isAdmin = session?.user?.role === "ADMIN" || session?.user?.role === "SUPER_ADMIN";

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          scrolled ? "glass shadow-sm shadow-dental-blue/5 py-3" : "bg-transparent py-5"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-[#0A2540] flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-[#00B4D8]">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" fill="currentColor" />
                </svg>
              </div>
              <div>
                <span className="font-display font-bold text-[#0A2540] text-lg leading-none">DentalKit</span>
                <span className="block text-[10px] font-medium text-[#00B4D8] leading-none tracking-wider uppercase">Egypt</span>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href} className="px-4 py-2 text-sm font-medium text-[#1A1A2E]/70 hover:text-[#0A2540] hover:bg-[#F4F6F8] rounded-lg transition-colors duration-150 cursor-pointer">
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              <button aria-label="Search" className="hidden sm:flex w-9 h-9 items-center justify-center rounded-lg text-[#1A1A2E]/60 hover:text-[#0A2540] hover:bg-[#F4F6F8] transition-colors cursor-pointer">
                <Search size={18} />
              </button>

              <Link href="/cart" aria-label="Cart">
                <button className="relative w-9 h-9 flex items-center justify-center rounded-lg text-[#1A1A2E]/60 hover:text-[#0A2540] hover:bg-[#F4F6F8] transition-colors cursor-pointer">
                  <ShoppingCart size={18} />
                  {cartCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#00B4D8] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                      {cartCount > 9 ? "9+" : cartCount}
                    </span>
                  )}
                </button>
              </Link>

              {status === "loading" ? (
                <div className="w-8 h-8 rounded-full bg-[#E2E8F0] animate-pulse" />
              ) : session ? (
                <div className="relative hidden sm:block">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl hover:bg-[#F4F6F8] transition-colors cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-full bg-[#0A2540] flex items-center justify-center text-white text-xs font-bold">
                      {session.user?.name?.[0]?.toUpperCase() || "U"}
                    </div>
                    <span className="text-sm font-medium text-[#0A2540] hidden md:block max-w-[100px] truncate">
                      {session.user?.name?.split(" ")[0]}
                    </span>
                    <ChevronDown size={13} className={cn("text-[#6B7A8D] transition-transform", userMenuOpen && "rotate-180")} />
                  </button>

                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-[#E2E8F0] py-1 z-50"
                      >
                        <div className="px-3 py-2 border-b border-[#F4F6F8] mb-1">
                          <p className="text-xs font-semibold text-[#0A2540] truncate">{session.user?.name}</p>
                          <p className="text-[10px] text-[#9BAAB8] truncate">{session.user?.email}</p>
                        </div>
                        <Link href="/dashboard" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2.5 px-3 py-2 text-sm text-[#1A1A2E]/70 hover:bg-[#F4F6F8] hover:text-[#0A2540] transition-colors cursor-pointer">
                          <LayoutDashboard size={14} /> Dashboard
                        </Link>
                        {isAdmin && (
                          <Link href="/admin" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2.5 px-3 py-2 text-sm text-[#1A1A2E]/70 hover:bg-[#F4F6F8] hover:text-[#0A2540] transition-colors cursor-pointer">
                            <Shield size={14} /> Admin Panel
                          </Link>
                        )}
                        <button
                          onClick={() => { setUserMenuOpen(false); signOut({ callbackUrl: "/" }); }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                        >
                          <LogOut size={14} /> Sign Out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="hidden sm:flex items-center gap-2 ml-1">
                  <Link href="/login"><Button variant="ghost" size="sm" className="text-sm cursor-pointer">Sign In</Button></Link>
                  <Link href="/register"><Button size="sm" className="bg-[#0A2540] hover:bg-[#0D3461] text-white text-sm cursor-pointer">Get Started</Button></Link>
                </div>
              )}

              <button onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu" className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg text-[#1A1A2E]/70 hover:bg-[#F4F6F8] transition-colors cursor-pointer">
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }} className="fixed top-[64px] left-0 right-0 z-40 glass shadow-lg border-b border-[#E2E8F0] md:hidden">
            <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)} className="px-4 py-3 text-sm font-medium text-[#1A1A2E]/80 hover:text-[#0A2540] hover:bg-[#F4F6F8] rounded-lg transition-colors cursor-pointer">
                  {link.label}
                </Link>
              ))}
              <div className="flex gap-2 mt-3 pt-3 border-t border-[#E2E8F0]">
                {session ? (
                  <>
                    <Link href="/dashboard" className="flex-1"><Button variant="outline" className="w-full text-sm">Dashboard</Button></Link>
                    <Button onClick={() => signOut({ callbackUrl: "/" })} variant="ghost" className="flex-1 text-sm text-red-500">Sign Out</Button>
                  </>
                ) : (
                  <>
                    <Link href="/login" className="flex-1"><Button variant="outline" className="w-full text-sm">Sign In</Button></Link>
                    <Link href="/register" className="flex-1"><Button className="w-full bg-[#0A2540] hover:bg-[#0D3461] text-white text-sm">Get Started</Button></Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
