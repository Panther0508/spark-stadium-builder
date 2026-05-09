"use client";

export function ShimmerLoader({ height, width }: { height: number | string; width: number | string }) {
  return (
    <div
      className="bg-white/10 rounded-2xl animate-pulse"
      style={{ height, width }}
    />
  );
}