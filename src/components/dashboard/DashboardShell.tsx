"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "@/lib/auth-client";
import toast from "react-hot-toast";
import { LayoutGrid, User, Cpu, FolderOpen, BarChart2, LogOut, Menu, X, Tag, Eye } from "lucide-react";
import NotificationBell from "./NotificationBell";

const navItems = [
  { href: "/dashboard",             icon: LayoutGrid, label: "Overview",   exact: true  },
  { href: "/dashboard/portfolio",   icon: User,       label: "Portfolio",  exact: false },
  { href: "/dashboard/skills",      icon: Cpu,        label: "Skills",     exact: false },
  { href: "/dashboard/projects",    icon: FolderOpen, label: "Projects",   exact: false },
  { href: "/dashboard/categories",  icon: Tag,        label: "Categories", exact: false },
  { href: "/dashboard/analytics",   icon: BarChart2,  label: "Analytics",  exact: false },
  { href: "/dashboard/preview",     icon: Eye,        label: "Preview",    exact: false },
];

interface DashboardShellProps {
  user: { name?: string | null; email?: string | null; id: string };
  children: React.ReactNode;
}

export default function DashboardShell({ user, children }: DashboardShellProps) {
  const pathname     = usePathname();
  const router       = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [tooltip,    setTooltip]    = useState<string | null>(null);

  const handleLogout = async () => {
    await signOut();
    toast.success("Signed out");
    router.push("/login");
  };

  const isActive = (href: string, exact: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  const initials = (user.name ?? user.email ?? "U")
    .split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  /* ── Icon sidebar ── */
  const SidebarIcons = () => (
    <div className="hidden md:flex flex-col items-center w-16 h-full py-5 gap-2">
      {/* Logo */}
      <Link href="/" className="w-10 h-10 rounded-2xl bg-lime flex items-center justify-center mb-4 shrink-0 hover:bg-lime-dim transition-colors">
        <span className="text-ink font-black text-base leading-none">F</span>
      </Link>

      {/* Notifications */}
      <div className="mb-2 shrink-0">
        <NotificationBell dark />
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-1 flex-1">
        {navItems.map(({ href, icon: Icon, label, exact }) => {
          const active = isActive(href, exact);
          return (
            <div key={href} className="relative"
              onMouseEnter={() => setTooltip(label)}
              onMouseLeave={() => setTooltip(null)}>
              <Link href={href}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-150 ${
                  active ? "bg-lime text-ink" : "text-[#666] hover:bg-void-2 hover:text-white"
                }`}>
                <Icon size={18} strokeWidth={active ? 2.5 : 2} />
              </Link>
              {/* Tooltip */}
              {tooltip === label && (
                <div className="absolute left-14 top-1/2 -translate-y-1/2 z-50 pointer-events-none">
                  <div className="bg-ink text-white text-xs font-semibold px-3 py-1.5 rounded-lg whitespace-nowrap shadow-lg">
                    {label}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Bottom: user avatar + logout */}
      <div className="flex flex-col items-center gap-2 mt-auto">
        <div className="relative group"
          onMouseEnter={() => setTooltip("logout")}
          onMouseLeave={() => setTooltip(null)}>
          <button onClick={handleLogout}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-[#666] hover:bg-void-2 hover:text-white transition-all duration-150">
            <LogOut size={18} strokeWidth={2} />
          </button>
          {tooltip === "logout" && (
            <div className="absolute left-14 top-1/2 -translate-y-1/2 z-50 pointer-events-none">
              <div className="bg-ink text-white text-xs font-semibold px-3 py-1.5 rounded-lg whitespace-nowrap shadow-lg">
                Sign out
              </div>
            </div>
          )}
        </div>
        <div className="w-10 h-10 rounded-xl bg-lime flex items-center justify-center shrink-0">
          <span className="text-ink font-bold text-sm leading-none">{initials}</span>
        </div>
      </div>
    </div>
  );

  /* ── Mobile drawer ── */
  const MobileDrawer = () => (
    <>
      {/* Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 md:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Drawer panel */}
      <div className={`fixed left-0 top-0 bottom-0 w-72 z-50 bg-[#111] flex flex-col transition-transform duration-200 md:hidden ${
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        <div className="flex items-center justify-between px-5 py-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-lime flex items-center justify-center">
              <span className="text-ink font-black text-sm leading-none">F</span>
            </div>
            <span className="text-white font-bold">Portfolio CMS</span>
          </div>
          <button onClick={() => setMobileOpen(false)} className="text-white/50 hover:text-white">
            <X size={20} strokeWidth={2} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navItems.map(({ href, icon: Icon, label, exact }) => {
            const active = isActive(href, exact);
            return (
              <Link key={href} href={href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-150 ${
                  active ? "bg-lime text-ink font-semibold" : "text-white/60 hover:text-white hover:bg-white/5"
                }`}>
                <Icon size={18} strokeWidth={active ? 2.5 : 2} />
                <span className="text-sm font-medium">{label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-lime flex items-center justify-center shrink-0">
              <span className="text-ink font-bold text-sm">{initials}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-semibold truncate">{user.name ?? "User"}</p>
              <p className="text-white/40 text-xs truncate">{user.email}</p>
            </div>
          </div>
          <button onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-colors text-sm">
            <LogOut size={16} strokeWidth={2} /> Sign out
          </button>
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-canvas flex">
      {/* Desktop sidebar */}
      <div className="hidden md:flex bg-[#111] sticky top-0 h-screen shrink-0">
        <SidebarIcons />
      </div>

      {/* Mobile drawer */}
      <MobileDrawer />

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <div className="md:hidden sticky top-0 z-30 bg-[#111] flex items-center justify-between px-4 py-3 border-b border-white/10">
          <button onClick={() => setMobileOpen(true)} className="text-white p-1">
            <Menu size={22} strokeWidth={2} />
          </button>
          <div className="w-8 h-8 rounded-xl bg-lime flex items-center justify-center">
            <span className="text-ink font-black text-sm">F</span>
          </div>
          <div className="flex items-center gap-1">
            <NotificationBell dark={false} />
            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center">
              <span className="text-white font-bold text-sm">{initials}</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <main className="flex-1 px-4 sm:px-8 py-8 max-w-5xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
