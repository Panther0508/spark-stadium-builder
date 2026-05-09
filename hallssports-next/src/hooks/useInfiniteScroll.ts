"use client";

import { useRef, useCallback } from "react";

export function useInfiniteScroll(callback: () => void) {
  const observer = useRef<IntersectionObserver | null>(null);

  const lastElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (observer.current) observer.current.disconnect();
      
      observer.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            callback();
          }
        },
        { threshold: 1.0 }
      );
      
      if (node) observer.current.observe(node);
    },
    [callback]
  );

  return lastElementRef;
}