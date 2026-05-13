'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';

export function BackButton() {
  const router = useRouter();
  return (
    <button
      onClick={() => router.push('/')}
      aria-label="Back to Home"
      className="absolute top-4 left-4 z-[110] flex items-center justify-center w-11 h-11 bg-white/10 backdrop-blur-md border border-white/20 rounded-full hover:bg-white/20 transition-colors"
    >
      <ChevronLeft className="w-6 h-6 text-white" />
    </button>
  );
}
