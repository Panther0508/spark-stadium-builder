"use client";

import { type ReactNode, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  Calendar,
  Users,
  Megaphone,
  Video,
  Settings,
  CheckCircle,
  Shield,
  LogOut,
  Menu,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Role = "scout" | "media" | "verifier";

type NavItem = {
  label: string;
  href: string;
  icon: ReactNode;
};

const roleNavItems: Record<Role, NavItem[]> = {
  scout: [
    { label: "Dashboard", href: "/admin/scout", icon: <Home className="w-5 h-5" /> },
    { label: "Manage Matches", href: "/admin/scout/matches", icon: <Calendar className="w-5 h-5" /> },
    { label: "Live Score Entry", href: "/admin/scout/live", icon: <Calendar className="w-5 h-5" /> },
    { label: "Manage Players", href: "/admin/scout/players", icon: <Users className="w-5 h-5" /> },
    { label: "Announcements", href: "/admin/scout/announcements", icon: <Megaphone className="w-5 h-5" /> },
  ],
  media: [
    { label: "Dashboard", href: "/admin/media", icon: <Home className="w-5 h-5" /> },
    { label: "Manage Highlights", href: "/admin/media/highlights", icon: <Video className="w-5 h-5" /> },
    { label: "Match Covers", href: "/admin/media/matches", icon: <Calendar className="w-5 h-5" /> },
    { label: "Player Photos", href: "/admin/media/players", icon: <Users className="w-5 h-5" /> },
    { label: "Team Logos", href: "/admin/media/teams", icon: <Shield className="w-5 h-5" /> },
    { label: "Settings & About", href: "/admin/media/settings", icon: <Settings className="w-5 h-5" /> },
  ],
  verifier: [
    { label: "Dashboard", href: "/admin/verifier", icon: <Home className="w-5 h-5" /> },
    { label: "Verification Queue", href: "/admin/verifier/queue", icon: <CheckCircle className="w-5 h-5" /> },
    { label: "Manual Override", href: "/admin/verifier/override", icon: <Shield className="w-5 h-5" /> },
  ],
};

type Props = {
  children: ReactNode;
  role: Role;
};

export function AdminLayout({ children, role }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const segments = pathname.split("/").filter(Boolean);
  const lastSegment = segments[segments.length - 1];
  const formattedTitle = lastSegment
    ? lastSegment
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ")
    : "Dashboard";
  const pageTitle = role === "media" && segments.length <= 3 ? "Dashboard" : formattedTitle;

  const handleLogout = () => {
    localStorage.removeItem('hallssports_admin_role')
    router.push("/home")
  };

  const navItems = roleNavItems[role];

  return (
    <div className="min-h-screen bg-background">
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -256 }}
              animate={{ x: 0 }}
              exit={{ x: -256 }}
              transition={{ type: "spring", damping: 25 }}
              className="fixed left-0 top-0 bottom-0 w-64 glass bg-[#0A0A0A]/95 z-50 lg:hidden flex flex-col"
            >
              <SidebarContent navItems={navItems} pathname={pathname} onLogout={handleLogout} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-64 glass bg-[#0A0A0A]/95 z-40 flex-col">
        <SidebarContent navItems={navItems} pathname={pathname} onLogout={handleLogout} />
      </aside>

<div className="lg:pl-64 h-screen flex flex-col">
         <header className="glass h-16 border-b border-white/10 flex items-center justify-between px-4 lg:px-6 flex-shrink-0">
           <div className="flex items-center gap-3">
             <button
               onClick={() => setSidebarOpen(true)}
               className="lg:hidden p-2 rounded-lg hover:bg-white/10 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
               aria-label="Open sidebar"
             >
               <Menu className="w-5 h-5" />
             </button>
             <h1 className="text-lg font-semibold text-foreground">{pageTitle}</h1>
           </div>
         </header>

        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

function SidebarContent({
  navItems,
  pathname,
  onLogout,
}: {
  navItems: NavItem[];
  pathname: string;
  onLogout: () => void;
}) {
  return (
    <>
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <span className="font-display font-semibold text-primary">HallsSports Admin</span>
        </div>
      </div>

      <nav className="flex-1 p-3 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors mb-1 min-h-[44px]",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-white/80 hover:bg-white/10 hover:text-white",
              )}
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-white/10">
        <button
          onClick={onLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors w-full min-h-[44px]"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </>
  );
}