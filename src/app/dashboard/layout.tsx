"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, ShoppingBag, Heart, User, LogOut, ArrowLeft } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Orders", href: "/dashboard/orders", icon: ShoppingBag },
  { label: "Wishlist", href: "/dashboard/wishlist", icon: Heart },
  { label: "Profile", href: "/dashboard/profile", icon: User },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();

  const userName = session?.user?.name ?? "Student";
  const userInitial = userName.charAt(0).toUpperCase();

  async function handleSignOut() {
    await signOut({ redirect: false });
    router.push("/");
  }

  return (
    <div className="min-h-screen bg-[#F4F6F8]">
      {/* Top bar */}
      <div className="bg-[#0A2540] text-white h-14 flex items-center px-6 gap-4">
        <Link href="/" className="flex items-center gap-2 text-white/70 hover:text-white transition-colors cursor-pointer text-sm">
          <ArrowLeft size={14} /> Back to store
        </Link>
        <div className="ml-auto flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-[#00B4D8] flex items-center justify-center text-xs font-bold">
            {userInitial}
          </div>
          <span className="text-sm text-white/80">{userName}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <aside className="md:w-56 shrink-0">
            <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
              {/* Student info */}
              <div className="p-5 border-b border-[#E2E8F0]">
                <div className="w-12 h-12 rounded-xl bg-[#0A2540] text-white flex items-center justify-center font-bold text-lg mb-3">
                  {userInitial}
                </div>
                <p className="font-semibold text-[#0A2540] text-sm">{userName}</p>
                <p className="text-xs text-[#9BAAB8]">{session?.user?.email ?? ""}</p>
              </div>

              {/* Nav */}
              <nav className="p-2">
                {navItems.map(({ label, href, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      "flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer",
                      pathname === href
                        ? "bg-[#0A2540] text-white"
                        : "text-[#1A1A2E]/70 hover:bg-[#F4F6F8] hover:text-[#0A2540]"
                    )}
                  >
                    <Icon size={15} />
                    {label}
                  </Link>
                ))}
              </nav>

              <div className="p-2 border-t border-[#E2E8F0]">
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 w-full transition-colors cursor-pointer"
                >
                  <LogOut size={15} /> Sign Out
                </button>
              </div>
            </div>
          </aside>

          {/* Main */}
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
}
