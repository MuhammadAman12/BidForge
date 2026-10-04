"use client";
import { createContext, useContext, useEffect, useSyncExternalStore } from "react";
type Theme = "light" | "dark";
type ThemeContextType = { theme: Theme; setTheme: (theme: Theme) => void; toggleTheme: () => void };
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);
function snapshot(): Theme { return localStorage.getItem("bidforge-theme") === "light" ? "light" : "dark"; }
function subscribe(listener: () => void) {
  window.addEventListener("storage", listener); window.addEventListener("bidforge-theme-change", listener);
  return () => { window.removeEventListener("storage", listener); window.removeEventListener("bidforge-theme-change", listener); };
}
function setTheme(theme: Theme) {
  localStorage.setItem("bidforge-theme", theme);
  document.documentElement.classList.toggle("dark", theme === "dark");
  window.dispatchEvent(new Event("bidforge-theme-change"));
}
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useSyncExternalStore(subscribe, snapshot, () => "dark" as Theme);
  useEffect(() => { document.documentElement.classList.toggle("dark", theme === "dark"); }, [theme]);
  return <ThemeContext.Provider value={{ theme, setTheme, toggleTheme: () => setTheme(theme === "dark" ? "light" : "dark") }}>{children}</ThemeContext.Provider>;
}
export function useBidForgeTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useBidForgeTheme must be used inside ThemeProvider");
  return context;
}
