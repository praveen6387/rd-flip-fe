"use client";

import { createContext, useContext, useEffect, useState } from "react";

const STORAGE_KEY = "dashboard_theme";
const DashboardThemeContext = createContext(null);

export function DashboardThemeProvider({ children }) {
  const [theme, setThemeState] = useState("light");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "dark" || stored === "light") {
      setThemeState(stored);
    }
    setReady(true);
  }, []);

  function setTheme(next) {
    setThemeState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
  }

  const isDark = theme === "dark";

  return (
    <DashboardThemeContext.Provider
      value={{ theme, setTheme, isDark, ready }}
    >
      {children}
    </DashboardThemeContext.Provider>
  );
}

export function useDashboardTheme() {
  const context = useContext(DashboardThemeContext);
  if (!context) {
    throw new Error("useDashboardTheme must be used within DashboardThemeProvider");
  }
  return context;
}
