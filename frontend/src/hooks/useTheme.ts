// src/hooks/useTheme.ts
import { useEffect, useState } from "react";

type Theme = "dark" | "light";

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem("livestock-theme") as Theme;
    if (saved) return saved;
    if (window.matchMedia("(prefers-color-scheme: dark)").matches)
      return "dark";
    return "light";
  });

  useEffect(() => {
    localStorage.setItem("livestock-theme", theme);

    // Remove both just to be clean
    document.documentElement.removeAttribute("data-theme");
    document.documentElement.classList.remove("light", "dark");

    // Apply the active theme
    document.documentElement.classList.add(theme);
    document.documentElement.setAttribute("data-theme", theme);

    // Update meta color
    const metaThemeColor = document.querySelector("meta[name=theme-color]");
    if (metaThemeColor) {
      metaThemeColor.setAttribute(
        "content",
        theme === "dark" ? "#0a0a0a" : "#ffffff"
      );
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return { theme, toggleTheme };
}

// Production: Replace with IndexedDB for larger datasets
// and React Native AsyncStorage for mobile app
