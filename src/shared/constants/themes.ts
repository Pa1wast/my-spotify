export const APP_THEMES = ["ember"] as const;

export type AppTheme = (typeof APP_THEMES)[number];

export const DEFAULT_THEME: AppTheme = "ember";

export const THEME_COOKIE_NAME = "my-spotify-theme";
