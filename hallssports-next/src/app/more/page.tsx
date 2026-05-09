"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/GlassCard";
import { PageShell } from "@/components/PageShell";
import { ExternalLink, Shield, FileText, HelpCircle, Bell, Moon, Sun, Globe, Trophy } from "lucide-react";

const MOCK_MORE_OPTIONS = [
  { id: 1, title: "Tournament Leaders", description: "Top performers & stats", icon: Trophy, href: "/leaders" },
  { id: 2, title: "Privacy Policy", description: "How we protect your data", icon: Shield, href: "/privacy" },
  { id: 2, title: "Terms of Use", description: "Rules and guidelines", icon: FileText, href: "/terms" },
  { id: 3, title: "Help & Support", description: "Get assistance", icon: HelpCircle, href: "/support" },
  { id: 4, title: "Notifications", description: "Manage alerts", icon: Bell, href: "/notifications" },
  { id: 5, title: "Appearance", description: "Dark mode settings", icon: Moon, href: "/appearance" },
  { id: 6, title: "Language", description: "English (Change)", icon: Globe, href: "/language" },
  { id: 7, title: "Pantero", description: "Visit our platform", icon: ExternalLink, href: "https://pantero.vercel.app" },
];

export default function MorePage() {
  const [darkMode, setDarkMode] = useState(true);

  return (
    <PageShell title="More">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-4"
      >
        {/* Profile Section */}
        <GlassCard className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-primary/20 grid place-items-center">
              <span className="text-2xl font-bold text-primary">HS</span>
            </div>
            <div>
              <h2 className="font-bold text-xl">HallsSports</h2>
              <p className="text-sm text-muted-foreground">v1.0.0</p>
            </div>
          </div>
        </GlassCard>

        {/* Options */}
        <div className="space-y-3">
          {MOCK_MORE_OPTIONS.map((option, index) => {
            const Icon = option.icon;
            const isExternal = option.href.startsWith("http");
            return (
              <motion.div
                key={option.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                {isExternal ? (
                  <a href={option.href} target="_blank" rel="noopener noreferrer">
                    <GlassCard className="p-4 flex items-center gap-3">
                      <Icon className="h-5 w-5 text-primary" />
                      <div className="flex-1">
                        <div className="font-medium">{option.title}</div>
                        <div className="text-xs text-muted-foreground">{option.description}</div>
                      </div>
                      <ExternalLink className="h-4 w-4 text-muted-foreground" />
                    </GlassCard>
                  </a>
                ) : (
                  <Link href={option.href}>
                    <GlassCard className="p-4 flex items-center gap-3">
                      <Icon className="h-5 w-5 text-primary" />
                      <div className="flex-1">
                        <div className="font-medium">{option.title}</div>
                        <div className="text-xs text-muted-foreground">{option.description}</div>
                      </div>
                    </GlassCard>
                  </Link>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Dark Mode Toggle */}
        <GlassCard className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {darkMode ? <Moon className="h-5 w-5 text-primary" /> : <Sun className="h-5 w-5 text-yellow-500" />}
              <span className="font-medium">Dark Mode</span>
            </div>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`w-12 h-6 rounded-full ${darkMode ? "bg-primary" : "bg-white/20"} relative transition-colors`}
            >
              <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${darkMode ? "right-0.5" : "left-0.5"}`} />
            </button>
          </div>
        </GlassCard>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground pt-4">
          <p>&copy; 2025 HallsSports. All rights reserved.</p>
        </div>
      </motion.div>
    </PageShell>
  );
}