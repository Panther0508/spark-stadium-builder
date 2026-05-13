"use client";

import { useState } from "react";
import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { GlassCard } from "@/components/GlassCard";
import { BackButton } from "@/components/BackButton";
import { GlassToggle } from "@/components/FormElements";
import { useTheme } from "@/contexts/ThemeContext";
import { Bell, Palette, MessageCircle, Trash2 } from "lucide-react";

interface SettingToggleProps {
  label: string;
  storageKey: string;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
}

function SettingToggle({ label, storageKey, defaultChecked = false, onChange }: SettingToggleProps) {
  const [checked, setChecked] = useState(() => {
    if (typeof window === "undefined") return defaultChecked;
    const stored = localStorage.getItem(storageKey);
    if (stored === null) return defaultChecked;
    return stored === "true";
  });

  const handleChange = (newVal: boolean) => {
    setChecked(newVal);
    if (typeof window !== "undefined") {
      localStorage.setItem(storageKey, String(newVal));
      if (newVal && storageKey === "hallssports_popups") {
        if ("Notification" in window && Notification.permission === "default") {
          Notification.requestPermission();
        }
      }
    }
    onChange?.(newVal);
  };

  return (
    <div className="flex items-center justify-between py-3 border-b border-white/10 last:border-0">
      <span className="text-sm">{label}</span>
      <GlassToggle checked={checked} onChange={handleChange} />
    </div>
  );
}

export default function SettingsPage() {
  const { theme, setTheme, fontSize, setFontSize, reduceMotion, setReduceMotion } = useTheme();

  const clearAllPreferences = () => {
    if (confirm("Are you sure you want to clear all preferences?")) {
      if (typeof window !== "undefined") {
        Object.keys(localStorage)
          .filter((key) => key.startsWith("hallssports_"))
          .forEach((key) => localStorage.removeItem(key));
        window.location.reload();
      }
    }
  };

  return (
    <PageShell title="Settings">
      <BackButton />
      <div className="space-y-6">
        <GlassCard className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="h-5 w-5 text-primary" />
            <h2 className="font-bold text-white">Notifications</h2>
          </div>
          <SettingToggle label="Enable pop-up notifications" storageKey="hallssports_popups" />
          <SettingToggle label="Match event alerts" storageKey="hallssports_event_alerts" />
          <SettingToggle label="Sound on goals" storageKey="hallssports_sound" />
        </GlassCard>

        <GlassCard className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <Palette className="h-5 w-5 text-primary" />
            <h2 className="font-bold text-white">Appearance</h2>
          </div>
          <div className="py-3 border-b border-white/10">
            <span className="text-sm mb-3 block">Theme</span>
            <div className="flex gap-2">
              {(["dark", "light"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTheme(t)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    theme === t
                      ? "bg-primary text-primary-foreground"
                      : "bg-white/10 hover:bg-white/20"
                  }`}
                >
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="py-3 border-b border-white/10">
            <span className="text-sm mb-3 block">Font size</span>
            <div className="flex gap-2">
              {(["small", "medium", "large"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setFontSize(s)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    fontSize === s
                      ? "bg-primary text-primary-foreground"
                      : "bg-white/10 hover:bg-white/20"
                  }`}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="pt-3">
            <GlassToggle
              checked={reduceMotion}
              onChange={setReduceMotion}
              label="Reduce motion"
            />
          </div>
        </GlassCard>

        <GlassCard className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <MessageCircle className="h-5 w-5 text-primary" />
            <h2 className="font-bold text-white">Chat</h2>
          </div>
          <SettingToggle label="Auto-scroll to new messages" storageKey="hallssports_autoscroll" defaultChecked />
          <SettingToggle label="Show message timestamps" storageKey="hallssports_chat_timestamps" defaultChecked />
        </GlassCard>

        <GlassCard className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <Trash2 className="h-5 w-5 text-destructive" />
            <h2 className="font-bold text-white">Data & Privacy</h2>
          </div>
          <button
            onClick={clearAllPreferences}
            className="w-full py-3 border border-destructive/50 text-destructive rounded-lg text-sm font-medium hover:bg-destructive/10 transition-colors mb-3"
          >
            Clear all preferences
          </button>
          <div className="flex gap-4 text-sm">
            <Link href="/terms" className="text-primary hover:underline">
              Terms of Service
            </Link>
            <Link href="/privacy" className="text-primary hover:underline">
              Privacy Policy
            </Link>
          </div>
        </GlassCard>
      </div>
    </PageShell>
  );
}