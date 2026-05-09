"use client";

interface SkipToContentProps {
  mainId?: string;
}

export function SkipToContent({ mainId = "main-content" }: SkipToContentProps) {
  return (
    <a
      href={`#${mainId}`}
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 
                 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium
                 focus:ring-2 focus:ring-primary-glow"
    >
      Skip to main content
    </a>
  );
}