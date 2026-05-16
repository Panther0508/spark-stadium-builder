"use client";

import Link from "next/link";
import { Shield, LogOut, Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const ADMIN_ROLES = ["scout", "media", "verifier"] as const;

type Role = (typeof ADMIN_ROLES)[number];

function isRole(value: unknown): value is Role {
  return typeof value === "string" && ADMIN_ROLES.includes(value as Role);
}

export function AdminNavButton() {
  const router = useRouter();
  
  // Initialize from localStorage during render (only on client)
  const getInitialRole = (): Role | null => {
    if (typeof window !== "undefined") {
      const role = localStorage.getItem("hallssports_admin_role");
      if (role && isRole(role)) return role;
    }
    return null;
  };
  
  const [role] = useState<Role | null>(getInitialRole);

  const handleLogout = () => {
    localStorage.removeItem("hallssports_admin_role");
    router.push("/home");
  };

  if (role) {
    return (
      <div className="flex items-center gap-2">
        <Link
          href={`/admin/${role}`}
          className="p-2 rounded-lg glass hover:bg-white/10 transition-colors flex items-center gap-2"
          aria-label="Admin dashboard"
        >
          <Shield className="w-5 h-5 text-primary" />
          <span className="text-xs text-primary hidden md:inline">Dashboard</span>
        </Link>
        <button
          onClick={handleLogout}
          className="p-2 rounded-lg glass hover:bg-white/10 transition-colors"
          aria-label="Logout admin"
          title="Logout"
        >
          <LogOut className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>
    );
  }

  return (
    <Link
      href="/admin-login"
      className="p-2 rounded-lg glass hover:bg-white/10 transition-colors"
      aria-label="Admin login"
    >
      <Lock className="w-5 h-5 text-primary" />
    </Link>
  );
}