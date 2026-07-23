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
import { isGoogleFontFamily } from "@/shared/constants/google-fonts";
import {
  applyFontPreferencesToDocument,
  DEFAULT_FONT_PREFERENCES,
  FONT_PREFERENCES_COOKIE_NAME,
  parseFontPreferences,
  serializeFontPreferences,
  type FontPreferences,
  type FontRole,
} from "@/shared/lib/font-preferences";
import {
  applyPrimaryColorToDocument,
  DEFAULT_PRIMARY_COLOR,
  parsePrimaryColorInput,
  PRIMARY_COLOR_COOKIE_NAME,
} from "@/shared/lib/primary-color";

interface ThemeContextValue {
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  themes: readonly AppTheme[];
  primaryColor: string;
  setPrimaryColor: (color: string) => boolean;
  resetPrimaryColor: () => void;
  fonts: FontPreferences;
  setFontRole: (role: FontRole, family: string) => boolean;
  resetFonts: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function isAppTheme(value: string): value is AppTheme {
  return APP_THEMES.includes(value as AppTheme);
}

function persistTheme(theme: AppTheme) {
  document.cookie = `${THEME_COOKIE_NAME}=${theme}; path=/; max-age=31536000; samesite=lax`;
  localStorage.setItem(THEME_COOKIE_NAME, theme);
}

function persistPrimaryColor(color: string) {
  document.cookie = `${PRIMARY_COLOR_COOKIE_NAME}=${encodeURIComponent(color)}; path=/; max-age=31536000; samesite=lax`;
  localStorage.setItem(PRIMARY_COLOR_COOKIE_NAME, color);
}

function persistFonts(fonts: FontPreferences) {
  const serialized = serializeFontPreferences(fonts);
  document.cookie = `${FONT_PREFERENCES_COOKIE_NAME}=${serialized}; path=/; max-age=31536000; samesite=lax`;
  localStorage.setItem(FONT_PREFERENCES_COOKIE_NAME, JSON.stringify(fonts));
}

interface ThemeProviderProps {
  children: ReactNode;
  initialTheme?: AppTheme;
  initialPrimaryColor?: string;
  initialFonts?: FontPreferences;
}

export function ThemeProvider({
  children,
  initialTheme = DEFAULT_THEME,
  initialPrimaryColor = DEFAULT_PRIMARY_COLOR,
  initialFonts = DEFAULT_FONT_PREFERENCES,
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<AppTheme>(initialTheme);
  const [primaryColor, setPrimaryColorState] = useState(initialPrimaryColor);
  const [fonts, setFontsState] = useState<FontPreferences>(initialFonts);

  const setTheme = useCallback((nextTheme: AppTheme) => {
    setThemeState(nextTheme);
    document.documentElement.dataset.theme = nextTheme;
    persistTheme(nextTheme);
  }, []);

  const setPrimaryColor = useCallback((raw: string) => {
    const parsed = parsePrimaryColorInput(raw);

    if (!parsed) {
      return false;
    }

    setPrimaryColorState(parsed);
    applyPrimaryColorToDocument(parsed);
    persistPrimaryColor(parsed);
    return true;
  }, []);

  const resetPrimaryColor = useCallback(() => {
    setPrimaryColorState(DEFAULT_PRIMARY_COLOR);
    applyPrimaryColorToDocument(DEFAULT_PRIMARY_COLOR);
    persistPrimaryColor(DEFAULT_PRIMARY_COLOR);
  }, []);

  const setFontRole = useCallback((role: FontRole, family: string) => {
    if (!isGoogleFontFamily(family)) {
      return false;
    }

    setFontsState((current) => {
      const next = { ...current, [role]: family };
      applyFontPreferencesToDocument(next);
      persistFonts(next);
      return next;
    });
    return true;
  }, []);

  const resetFonts = useCallback(() => {
    setFontsState(DEFAULT_FONT_PREFERENCES);
    applyFontPreferencesToDocument(DEFAULT_FONT_PREFERENCES);
    persistFonts(DEFAULT_FONT_PREFERENCES);
  }, []);

  useEffect(() => {
    const storedTheme = localStorage.getItem(THEME_COOKIE_NAME);

    if (storedTheme && isAppTheme(storedTheme)) {
      setTheme(storedTheme);
    } else {
      setTheme(initialTheme);
    }

    const storedPrimary = localStorage.getItem(PRIMARY_COLOR_COOKIE_NAME);
    const parsedPrimary = storedPrimary
      ? parsePrimaryColorInput(storedPrimary)
      : null;

    if (parsedPrimary) {
      setPrimaryColorState(parsedPrimary);
      applyPrimaryColorToDocument(parsedPrimary);
    } else {
      applyPrimaryColorToDocument(initialPrimaryColor);
    }

    const storedFontsRaw = localStorage.getItem(FONT_PREFERENCES_COOKIE_NAME);
    const parsedFonts = parseFontPreferences(storedFontsRaw);

    if (parsedFonts) {
      setFontsState(parsedFonts);
      applyFontPreferencesToDocument(parsedFonts);
    } else {
      applyFontPreferencesToDocument(initialFonts);
    }
  }, [initialFonts, initialPrimaryColor, initialTheme, setTheme]);

  const value = useMemo(
    () => ({
      theme,
      setTheme,
      themes: APP_THEMES,
      primaryColor,
      setPrimaryColor,
      resetPrimaryColor,
      fonts,
      setFontRole,
      resetFonts,
    }),
    [
      theme,
      setTheme,
      primaryColor,
      setPrimaryColor,
      resetPrimaryColor,
      fonts,
      setFontRole,
      resetFonts,
    ],
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
