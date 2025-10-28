// src/hooks/useTheme.ts

import { useEffect, useState } from "react";

type Theme = "dark" | "light";

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    // Check localStorage first
    const saved = localStorage.getItem("livestock-theme") as Theme;
    if (saved) return saved;

    // Then system preference
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return "dark";
    }

    // Default to light
    return "light";
  });

  useEffect(() => {
    // Save to localStorage
    localStorage.setItem("livestock-theme", theme);

    // Apply to document element
    const root = document.documentElement;
    root.setAttribute("data-theme", theme);

    // Also set class on body for backup
    if (theme === "dark") {
      document.body.classList.add("dark");
      document.body.classList.remove("light");
    } else {
      document.body.classList.add("light");
      document.body.classList.remove("dark");
    }

    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector("meta[name=theme-color]");
    const color = theme === "dark" ? "#000000" : "#ffffff";
    if (metaThemeColor) {
      metaThemeColor.setAttribute("content", color);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return { theme, toggleTheme };
}
