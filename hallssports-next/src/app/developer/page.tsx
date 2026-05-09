"use client";

import dynamic from "next/dynamic";

const DeveloperContent = dynamic(() => import("./DeveloperContent"), { ssr: false });

export default function DeveloperPage() {
  return <DeveloperContent />;
}