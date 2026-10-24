"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, GraduationCap, Package, ShoppingBag, Users,
  Megaphone, Settings, LogOut, Store
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard },
  { label: "Universities", href: "/admin/universities", icon: GraduationCap },
  { label: "Packages", href: "/admin/packages", icon: Package },
  { label: "Products", href: "/admin/products", icon: Store },
  { label: "Orders", href: "/admin/orders", icon: ShoppingBag },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Marketing", href: "/admin/marketing", icon: Megaphone },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();

  const userName = session?.user?.name ?? "Admin";
  const userInitial = userName.charAt(0).toUpperCase();
  const userEmail = session?.user?.email ?? "";

  async function handleSignOut() {
    await signOut({ redirect: false });
    router.push("/");
  }

  return (
    <div className="min-h-screen bg-[#F4F6F8] flex">
      {/* Sidebar */}
      <aside className="w-60 bg-[#0A2540] min-h-screen flex flex-col fixed left-0 top-0 bottom-0 z-40">
        {/* Logo */}
        <div className="p-5 border-b border-white/10">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#00B4D8] flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-white">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" fill="currentColor"/>
              </svg>
            </div>
            <div>
              <span className="font-display font-bold text-white text-base">DentalKit</span>
              <span className="block text-[9px] text-[#00B4D8] tracking-widest uppercase leading-none">Admin Panel</span>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {navItems.map(({ label, href, icon: Icon }) => {
            const active = pathname === href || (href !== "/admin" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer",
                  active
                    ? "bg-white/15 text-white"
                    : "text-white/50 hover:bg-white/8 hover:text-white/80"
                )}
              >
                <Icon size={15} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="p-3 border-t border-white/10">
          <div className="flex items-center gap-2.5 px-3 py-2.5 mb-1">
            <div className="w-7 h-7 rounded-full bg-[#00B4D8] flex items-center justify-center text-xs font-bold text-white">
              {userInitial}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">{userName}</p>
              <p className="text-[10px] text-white/40 truncate">{userEmail}</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-white/40 hover:text-white hover:bg-white/8 w-full transition-colors cursor-pointer"
          >
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Content */}
      <div className="flex-1 ml-60">
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}
