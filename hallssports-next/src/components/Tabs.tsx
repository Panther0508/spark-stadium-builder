"use client";

import { useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface TabsProps {
  tabs: { id: string; label: string }[];
  defaultTab?: string;
  onChange?: (tabId: string) => void;
  className?: string;
}

export function Tabs({ tabs, defaultTab, onChange, className }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    onChange?.(tabId);
  };

  return (
    <div className={cn("w-full", className)}>
      <div className="relative flex border-b border-white/20 mb-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab.id)}
            className={cn(
              "relative px-4 py-2 text-sm font-medium transition-colors",
              activeTab === tab.id ? "text-primary" : "text-muted-foreground hover:text-white"
            )}
          >
            {tab.label}
            {activeTab === tab.id && (
              <motion.div
                layoutId="tab-indicator"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
              />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

interface TabContentProps {
  value: string;
  activeValue: string;
  children: ReactNode;
}

export function TabContent({ value, activeValue, children }: TabContentProps) {
  if (value !== activeValue) return null;
  return <div>{children}</div>;
}