"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Trophy, Medal, MessageCircle, Megaphone, Info, Download, ChevronRight, X, Settings, Gift, MessageSquare } from "lucide-react";
import { FeedbackModal } from "@/components/FeedbackModal";
import { FullScreenOverlay } from "@/components/FullScreenOverlay";

type MenuItem = {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  external?: boolean;
  onClick?: () => void;
};

const BASE_MENU_ITEMS: MenuItem[] = [
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

export function MoreDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const menuItems: MenuItem[] = [...BASE_MENU_ITEMS];

  menuItems.push({
    id: "feedback",
    title: "Feedback",
    description: "Report a bug or suggest a feature",
    icon: MessageSquare,
    href: "#",
    onClick: () => setShowFeedbackModal(true),
    external: false,
  });

  return (
    <>
      <FullScreenOverlay
        isOpen={open}
        onClose={onClose}
        showCloseButton={true}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-primary">Explore HallsSports</h2>
        </div>

        <div className="space-y-2">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                {item.onClick ? (
                  <button
                    onClick={() => {
                      item.onClick?.();
                      onClose();
                    }}
                    className="w-full text-left"
                  >
                    <div className="glass rounded-xl p-4 flex items-center gap-3 hover:bg-white/20 transition-colors min-h-[44px]">
                      <Icon className="h-5 w-5 text-primary" />
                      <div className="flex-1">
                        <div className="font-medium">{item.title}</div>
                        <div className="text-xs text-muted-foreground">{item.description}</div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </button>
                ) : item.external ? (
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={onClose}
                    className="block"
                  >
                    <div className="glass rounded-xl p-4 flex items-center gap-3 hover:bg-white/20 transition-colors min-h-[44px]">
                      <Icon className="h-5 w-5 text-primary" />
                      <div className="flex-1">
                        <div className="font-medium">{item.title}</div>
                        <div className="text-xs text-muted-foreground">{item.description}</div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </a>
                ) : (
                  <Link href={item.href} onClick={onClose} className="block">
                    <div className="glass rounded-xl p-4 flex items-center gap-3 hover:bg-white/20 transition-colors min-h-[44px]">
                      <Icon className="h-5 w-5 text-primary" />
                      <div className="flex-1">
                        <div className="font-medium">{item.title}</div>
                        <div className="text-xs text-muted-foreground">{item.description}</div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </Link>
                )}
              </motion.div>
            );
          })}
        </div>

        <div className="text-center text-sm text-muted-foreground mt-6 pt-4 border-t border-white/10">
          HallsSports v1.0
        </div>
      </FullScreenOverlay>

      <FeedbackModal open={showFeedbackModal} onClose={() => setShowFeedbackModal(false)} />
    </>
  );
}