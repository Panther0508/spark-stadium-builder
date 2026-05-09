"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Shield, Eye, EyeOff, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { loginAdmin } from "./actions";

type Role = "scout" | "media" | "verifier";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const role = localStorage.getItem('hallssports_admin_role') as Role | null;
    if (role && ['scout', 'media', 'verifier'].includes(role)) {
      router.push(`/admin/${role}`);
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await loginAdmin(email, password);

      if ('error' in result) {
        setError(result.error);
        setLoading(false);
        return;
      }

      const role = result.role;
      localStorage.setItem('hallssports_admin_role', role);
      router.push(`/admin/${role}`);
    } catch (err) {
      console.error("Login error:", err);
      setError("An unexpected error occurred.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl p-8 w-full max-w-sm"
      >
        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-8 h-8 text-primary" />
          <h1 className="text-2xl font-display font-semibold text-foreground">Admin Access</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/20 text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none transition-colors disabled:opacity-50"
              placeholder="admin@hallssports.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="w-full px-3 py-2 pr-10 rounded-lg bg-white/5 border border-white/20 text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none transition-colors disabled:opacity-50"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-white/10 transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <Eye className="w-4 h-4 text-muted-foreground" />
                )}
              </button>
            </div>
          </div>

          {error && <div className="text-sm text-red-400 bg-red-500/10 rounded-lg p-3">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className={cn(
              "w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-medium transition-opacity flex items-center justify-center gap-2",
              loading && "opacity-50 cursor-not-allowed",
            )}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Login"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link href="/home" className="text-sm text-muted-foreground hover:text-foreground transition-colors block">
            ← Back to HallsSports
          </Link>
        </div>
      </motion.div>
    </div>
  );
}