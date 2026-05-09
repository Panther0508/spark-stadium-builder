"use client";

import { Component, ReactNode } from "react";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/GlassCard";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import * as Sentry from '@sentry/nextjs';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error("ErrorBoundary caught an error:", error);
    // Send error to Sentry in production
    if (process.env.NODE_ENV === 'production') {
      Sentry.captureException(error);
    }
  }

  override render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center-center px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <GlassCard className="p-10 text-center max-w-md">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="mb-6"
              >
                <div className="w-20 h-20 mx-auto bg-yellow-500/20 rounded-full grid place-items-center">
                  <AlertTriangle className="h-10 w-10 text-yellow-500" />
                </div>
              </motion.div>

              <h1 className="text-2xl font-bold mb-2">Something went wrong!</h1>
              <p className="text-muted-foreground mb-6">
                An unexpected error occurred. Please refresh the page.
              </p>

              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => window.location.reload()}
                  className="px-6 py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all flex items-center gap-2"
                >
                  <RefreshCw className="h-5 w-5" />
                  Refresh Page
                </button>
                <button
                  onClick={() => (window.location.href = "/")}
                  className="px-6 py-3 border-2 border-primary text-primary font-bold rounded-xl hover:bg-primary/10 transition-all flex items-center gap-2"
                >
                  <Home className="h-5 w-5" />
                  Go Home
                </button>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}