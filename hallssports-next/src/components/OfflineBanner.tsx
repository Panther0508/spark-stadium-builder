"use client";

import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";

export function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(() => 
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (isOnline === null || isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500/90 backdrop-blur-md text-black border-b border-amber-600/30">
      <div className="max-w-5xl mx-auto px-4 py-2 flex items-center justify-center gap-2 text-sm font-medium">
        <WifiOff className="h-4 w-4" />
        <span>You are offline. Live updates paused – showing last known data.</span>
      </div>
    </div>
  );
}
