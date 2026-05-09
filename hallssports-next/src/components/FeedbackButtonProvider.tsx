"use client";

import { usePathname } from "next/navigation";
import { FloatingFeedbackButton } from "@/components/FloatingFeedbackButton";

export function FeedbackButtonProvider() {
  const pathname = usePathname();

  // Hide on admin pages and 404 (which has no pathname match pattern but shows error page)
  const isAdminPage = pathname?.startsWith("/admin") || pathname?.startsWith("/developer");
  const isErrorPage = pathname === "/404" || pathname === "/500";

  if (isAdminPage || isErrorPage) {
    return null;
  }

  return <FloatingFeedbackButton />;
}
