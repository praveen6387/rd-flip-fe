"use client";

import { createContext, useContext, useEffect, useState } from "react";

const LandingThemeContext = createContext(null);
const STORAGE_KEY = "rd-landing-theme";

export function LandingThemeProvider({ children }) {
  const [theme, setThemeState] = useState("dark");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark") {
      setThemeState(stored);
    }
    setReady(true);
  }, []);

  function setTheme(next) {
    const value = next === "light" ? "light" : "dark";
    setThemeState(value);
    window.localStorage.setItem(STORAGE_KEY, value);
  }

  const isDark = theme === "dark";

  return (
    <LandingThemeContext.Provider value={{ theme, isDark, setTheme, ready }}>
      {children}
    </LandingThemeContext.Provider>
  );
}

export function useLandingTheme() {
  const context = useContext(LandingThemeContext);
  if (!context) {
    throw new Error("useLandingTheme must be used within LandingThemeProvider");
  }
  return context;
}
