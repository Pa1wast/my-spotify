"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  APP_THEMES,
  DEFAULT_THEME,
  THEME_COOKIE_NAME,
  type AppTheme,
} from "@/shared/constants/themes";

interface ThemeContextValue {
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  themes: readonly AppTheme[];
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function isAppTheme(value: string): value is AppTheme {
  return APP_THEMES.includes(value as AppTheme);
}

function persistTheme(theme: AppTheme) {
  document.cookie = `${THEME_COOKIE_NAME}=${theme}; path=/; max-age=31536000; samesite=lax`;
  localStorage.setItem(THEME_COOKIE_NAME, theme);
}

interface ThemeProviderProps {
  children: ReactNode;
  initialTheme?: AppTheme;
}

export function ThemeProvider({
  children,
  initialTheme = DEFAULT_THEME,
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<AppTheme>(initialTheme);

  const setTheme = useCallback((nextTheme: AppTheme) => {
    setThemeState(nextTheme);
    document.documentElement.dataset.theme = nextTheme;
    persistTheme(nextTheme);
  }, []);

  useEffect(() => {
    const storedTheme = localStorage.getItem(THEME_COOKIE_NAME);

    if (storedTheme && isAppTheme(storedTheme)) {
      setTheme(storedTheme);
      return;
    }

    setTheme(initialTheme);
  }, [initialTheme, setTheme]);

  const value = useMemo(
    () => ({
      theme,
      setTheme,
      themes: APP_THEMES,
    }),
    [theme, setTheme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }

  return context;
}
