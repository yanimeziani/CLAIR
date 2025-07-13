"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { THEME_CONFIG } from "@/config/theme";

interface ThemeProviderProps {
  children: React.ReactNode;
  [key: string]: any;
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme={THEME_CONFIG.defaultTheme}
      enableSystem={THEME_CONFIG.enableSystemTheme}
      disableTransitionOnChange
      enableColorScheme={false}
      forcedTheme={THEME_CONFIG.defaultTheme}
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}