"use client";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { CookieConsent } from "@/components/CookieConsent";
import { FloatingFeedback } from "@/components/FloatingFeedback";
import type { ReactNode } from "react";

export function ClientLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <ErrorBoundary>
        {children}
      </ErrorBoundary>
      <CookieConsent />
      <FloatingFeedback />
    </>
  );
}