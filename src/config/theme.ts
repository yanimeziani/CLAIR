/**
 * Centralized Theme Configuration
 * 
 * Change the DEFAULT_THEME value here to switch between light and dark mode
 * throughout the entire application.
 */

export type Theme = "light" | "dark";

// 🎨 CHANGE THIS VALUE TO SWITCH THEMES GLOBALLY
export const DEFAULT_THEME: Theme = "light";

export const THEME_CONFIG = {
  defaultTheme: DEFAULT_THEME,
  enableSystemTheme: false, // Set to true to use system preference
  storageKey: "irielle-theme",
} as const;