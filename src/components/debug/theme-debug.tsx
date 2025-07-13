"use client";

import { useTheme } from "next-themes";
import { useEffect } from "react";
import { THEME_CONFIG } from "@/config/theme";

export function ThemeDebug() {
  const { theme, setTheme, systemTheme, resolvedTheme } = useTheme();

  useEffect(() => {
    console.log("Theme Debug:", {
      theme,
      systemTheme,
      resolvedTheme,
      configDefault: THEME_CONFIG.defaultTheme,
      htmlClass: document.documentElement.className
    });

    // Force set theme to light if it's not already
    if (theme !== "light") {
      console.log("Forcing theme to light");
      setTheme("light");
    }
  }, [theme, systemTheme, resolvedTheme, setTheme]);

  return (
    <div className="fixed top-4 right-4 bg-background border p-2 text-xs z-50">
      <div>Current: {theme}</div>
      <div>Resolved: {resolvedTheme}</div>
      <div>Config: {THEME_CONFIG.defaultTheme}</div>
    </div>
  );
}