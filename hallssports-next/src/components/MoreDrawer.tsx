"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Trophy, Medal, MessageCircle, Megaphone, Info, Download, ChevronRight, X, Settings, Gift, MessageSquare } from "lucide-react";
import { FeedbackModal } from "@/components/FeedbackModal";

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

  // Build menu items dynamically
  const menuItems: MenuItem[] = [...BASE_MENU_ITEMS];

  // Feedback uses modal, not external link
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
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/50"
            onClick={onClose}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="w-full md:w-96 max-h-[85vh] md:max-h-[90vh] glass-strong rounded-t-3xl md:rounded-3xl p-6 overflow-y-auto overscroll-contain"
              onClick={e => e.stopPropagation()}
            >
            <div className="flex items-center justify-between mb-6">
              <div className="w-12 h-1.5 bg-white/30 rounded-full md:hidden" />
              <h2 className="text-xl font-bold text-primary">Explore HallsSports</h2>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
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
                         <div className="glass rounded-xl p-4 flex items-center gap-3 hover:bg-white/20 transition-colors">
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
                       >
                         <div className="glass rounded-xl p-4 flex items-center gap-3 hover:bg-white/20 transition-colors">
                           <Icon className="h-5 w-5 text-primary" />
                           <div className="flex-1">
                             <div className="font-medium">{item.title}</div>
                             <div className="text-xs text-muted-foreground">{item.description}</div>
                           </div>
                           <ChevronRight className="h-4 w-4 text-muted-foreground" />
                         </div>
                       </a>
                     ) : (
                       <Link href={item.href} onClick={onClose}>
                         <div className="glass rounded-xl p-4 flex items-center gap-3 hover:bg-white/20 transition-colors">
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
           </motion.div>
         </motion.div>
         )}
        </AnimatePresence>

        {/* Feedback Modal */}
        <FeedbackModal open={showFeedbackModal} onClose={() => setShowFeedbackModal(false)} />
      </>
    );
}