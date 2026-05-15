"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { MotionConfig } from "framer-motion";

type Theme = "dark" | "light";
type FontSize = "small" | "medium" | "large";

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  fontSize: FontSize;
  setFontSize: (size: FontSize) => void;
  reduceMotion: boolean;
  setReduceMotion: (reduce: boolean) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const DEFAULT_THEME = "dark";
const DEFAULT_FONT_SIZE = "medium";
const DEFAULT_REDUCE_MOTION = false;

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(DEFAULT_THEME);
  const [fontSize, setFontSizeState] = useState<FontSize>(DEFAULT_FONT_SIZE);
  const [reduceMotion, setReduceMotionState] = useState<boolean>(DEFAULT_REDUCE_MOTION);

  useEffect(() => {
    // Read from storage on mount
    const storedTheme = localStorage.getItem("hallssports_theme") as Theme;
    if (storedTheme) setThemeState(storedTheme);
    
    const storedFontSize = localStorage.getItem("hallssports_fontSize") as FontSize;
    if (storedFontSize) setFontSizeState(storedFontSize);
    
    const storedReduceMotion = localStorage.getItem("hallssports_reduceMotion");
    if (storedReduceMotion) setReduceMotionState(storedReduceMotion === "true");
  }, []);

  useEffect(() => {
    // Sync state if storage changes
    const handleStorage = () => {
      const storedTheme = localStorage.getItem("hallssports_theme") as Theme;
      if (storedTheme) setThemeState(storedTheme);
      
      const storedFontSize = localStorage.getItem("hallssports_fontSize") as FontSize;
      if (storedFontSize) setFontSizeState(storedFontSize);
      
      const storedReduceMotion = localStorage.getItem("hallssports_reduceMotion");
      if (storedReduceMotion) setReduceMotionState(storedReduceMotion === "true");
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    
    // Theme
    if (theme === "light") {
      root.classList.remove("dark");
    } else {
      root.classList.add("dark");
    }
    
    // Font Size
    root.classList.remove("text-sm", "text-base", "text-lg");
    if (fontSize === "small") root.classList.add("text-sm");
    else if (fontSize === "medium") root.classList.add("text-base");
    else if (fontSize === "large") root.classList.add("text-lg");

    // Reduce Motion data attribute for CSS if needed
    root.setAttribute("data-reduce-motion", String(reduceMotion));
  }, [theme, fontSize, reduceMotion]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    if (typeof window !== "undefined") {
      localStorage.setItem("hallssports_theme", newTheme);
    }
  };

  const setFontSize = (newSize: FontSize) => {
    setFontSizeState(newSize);
    if (typeof window !== "undefined") {
      localStorage.setItem("hallssports_fontSize", newSize);
    }
  };

  const setReduceMotion = (reduce: boolean) => {
    setReduceMotionState(reduce);
    if (typeof window !== "undefined") {
      localStorage.setItem("hallssports_reduceMotion", String(reduce));
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, fontSize, setFontSize, reduceMotion, setReduceMotion }}>
      <MotionConfig reducedMotion={reduceMotion ? "always" : "never"}>
        {children}
      </MotionConfig>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    // Return a default context for graceful degradation (e.g., during SSR or dynamic imports)
    return {
      theme: DEFAULT_THEME,
      setTheme: () => {},
      fontSize: "medium",
      setFontSize: () => {},
      reduceMotion: false,
      setReduceMotion: () => {},
    };
  }
  return ctx;
}

export function useReducedMotion() {
  const { reduceMotion } = useTheme();
  return reduceMotion;
}