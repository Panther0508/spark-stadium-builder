"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/GlassCard";
import { PageShell } from "@/components/PageShell";
import { 
  ExternalLink, 
  Shield, 
  FileText, 
  HelpCircle, 
  Bell, 
  Moon, 
  Sun, 
  Globe, 
  Trophy,
  Users,
  Medal,
  MessageCircle,
  Megaphone,
  Info,
  Download,
  Settings,
  Gift,
  MessageSquare,
  ArrowLeft
} from "lucide-react";
import { FeedbackModal } from "@/components/FeedbackModal";

const MENU_ITEMS = [
  { id: "players", title: "Players", description: "View all tournament players", icon: Users, href: "/players" },
  { id: "leaders", title: "Leaders", description: "Tournament statistics & rankings", icon: Trophy, href: "/leaders" },
  { id: "champions", title: "Champions", description: "Past tournament winners", icon: Medal, href: "/champions" },
  { id: "community", title: "Community", description: "Join the match chat", icon: MessageCircle, href: "/community" },
  { id: "announcements", title: "Announcements", description: "Latest tournament news", icon: Megaphone, href: "/announcements" },
  { id: "about", title: "About", description: "About HallsSports", icon: Info, href: "/about" },
  { id: "download", title: "Download App", description: "Get the mobile app", icon: Download, href: "/download" },
  { id: "settings", title: "Settings", description: "Customize your experience", icon: Settings, href: "/settings" },
  { id: "referral", title: "Referrals", description: "Invite friends, earn rewards", icon: Gift, href: "/referral" },
];

export default function MorePage() {
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(true);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  return (
    <PageShell title="More" className="pb-20">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-4"
      >
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg glass hover:bg-white/20 min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Go back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-bold">More Options</h1>
        </div>

        <div className="space-y-3">
          {MENU_ITEMS.map((item, index) => {
            const Icon = item.icon;
            const isExternal = item.href.startsWith("http");
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link href={item.href}>
                  <GlassCard className="p-4 flex items-center gap-3 min-h-[44px]">
                    <Icon className="h-5 w-5 text-primary" />
                    <div className="flex-1">
                      <div className="font-medium">{item.title}</div>
                      <div className="text-xs text-muted-foreground">{item.description}</div>
                    </div>
                    {isExternal && <ExternalLink className="h-4 w-4 text-muted-foreground" />}
                  </GlassCard>
                </Link>
              </motion.div>
            );
          })}
          
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: MENU_ITEMS.length * 0.05 }}
          >
            <button
              onClick={() => setShowFeedbackModal(true)}
              className="w-full"
            >
              <GlassCard className="p-4 flex items-center gap-3 min-h-[44px]">
                <MessageSquare className="h-5 w-5 text-primary" />
                <div className="flex-1 text-left">
                  <div className="font-medium">Feedback</div>
                  <div className="text-xs text-muted-foreground">Report a bug or suggest a feature</div>
                </div>
              </GlassCard>
            </button>
          </motion.div>
        </div>

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

        <div className="text-center text-sm text-muted-foreground pt-4">
          <p>&copy; 2025 HallsSports. All rights reserved.</p>
        </div>
      </motion.div>

      <FeedbackModal open={showFeedbackModal} onClose={() => setShowFeedbackModal(false)} />
    </PageShell>
  );
}