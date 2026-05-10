"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

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

function getStoredTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  return (localStorage.getItem("hallssports_theme") as Theme) || "dark";
}

function getStoredFontSize(): FontSize {
  if (typeof window === "undefined") return "medium";
  return (localStorage.getItem("hallssports_fontSize") as FontSize) || "medium";
}

function getStoredReduceMotion(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem("hallssports_reduceMotion") === "true";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(getStoredTheme);
  const [fontSize, setFontSizeState] = useState<FontSize>(getStoredFontSize);
  const [reduceMotion, setReduceMotionState] = useState(getStoredReduceMotion);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "light") {
      root.classList.remove("dark");
    } else {
      root.classList.add("dark");
    }
    root.setAttribute("data-font-size", fontSize);
    root.setAttribute("data-reduce-motion", String(reduceMotion));
  }, [theme, fontSize, reduceMotion]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem("hallssports_theme", newTheme);
  };

  const setFontSize = (newSize: FontSize) => {
    setFontSizeState(newSize);
    localStorage.setItem("hallssports_fontSize", newSize);
    document.documentElement.setAttribute("data-font-size", newSize);
  };

  const setReduceMotion = (reduce: boolean) => {
    setReduceMotionState(reduce);
    localStorage.setItem("hallssports_reduceMotion", String(reduce));
    document.documentElement.setAttribute("data-reduce-motion", String(reduce));
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, fontSize, setFontSize, reduceMotion, setReduceMotion }}>
      {children}
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