import type { CSSProperties } from "react";

import {
  isGoogleFontFamily,
  type GoogleFontFamily,
} from "@/shared/constants/google-fonts";

export type FontRole = "body" | "heading" | "action";

export interface FontPreferences {
  body: string;
  heading: string;
  action: string;
}

export const DEFAULT_FONT_PREFERENCES: FontPreferences = {
  body: "Outfit",
  heading: "Londrina Solid",
  action: "Koulen",
};

export const FONT_PREFERENCES_COOKIE_NAME = "my-spotify-font-preferences";

export const FONT_ROLE_LABELS: Record<FontRole, string> = {
  body: "Body text",
  heading: "Titles & headings",
  action: "Button labels",
};

const BUILTIN_FALLBACKS: Record<FontRole, string> = {
  body: "var(--font-outfit), Outfit, ui-sans-serif, sans-serif, system-ui",
  heading:
    'var(--font-londrina-solid), "Londrina Solid", ui-sans-serif, sans-serif',
  action: "var(--font-koulen), Koulen, ui-sans-serif, sans-serif",
};

const FAMILY_CSS_VARS: Record<FontRole, string[]> = {
  body: ["--font-sans"],
  heading: ["--font-display", "--font-serif"],
  action: ["--font-action"],
};

export function googleFontStylesheetHref(family: string) {
  const familyParam = family.replace(/ /g, "+");
  return `https://fonts.googleapis.com/css2?family=${familyParam}:wght@400;500;600;700&display=swap`;
}

export function loadGoogleFont(family: string) {
  if (typeof document === "undefined") {
    return;
  }

  const id = `google-font-${family.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

  if (document.getElementById(id)) {
    return;
  }

  const link = document.createElement("link");
  link.id = id;
  link.rel = "stylesheet";
  link.href = googleFontStylesheetHref(family);
  document.head.appendChild(link);
}

function stackForFamily(role: FontRole, family: string) {
  if (family === DEFAULT_FONT_PREFERENCES[role]) {
    return BUILTIN_FALLBACKS[role];
  }

  return `"${family}", ${BUILTIN_FALLBACKS[role]}`;
}

export function applyFontPreferencesToDocument(preferences: FontPreferences) {
  const root = document.documentElement.style;

  (["body", "heading", "action"] as FontRole[]).forEach((role) => {
    const family = preferences[role];

    if (family !== DEFAULT_FONT_PREFERENCES[role]) {
      loadGoogleFont(family);
    }

    const stack = stackForFamily(role, family);
    FAMILY_CSS_VARS[role].forEach((cssVar) => {
      root.setProperty(cssVar, stack);
    });
  });
}

export function parseFontPreferences(
  raw: string | null | undefined,
): FontPreferences | null {
  if (!raw) {
    return null;
  }

  try {
    let parsed: Partial<FontPreferences>;

    try {
      parsed = JSON.parse(raw) as Partial<FontPreferences>;
    } catch {
      parsed = JSON.parse(decodeURIComponent(raw)) as Partial<FontPreferences>;
    }

    if (
      typeof parsed.body !== "string" ||
      typeof parsed.heading !== "string" ||
      typeof parsed.action !== "string"
    ) {
      return null;
    }

    if (
      !isGoogleFontFamily(parsed.body) ||
      !isGoogleFontFamily(parsed.heading) ||
      !isGoogleFontFamily(parsed.action)
    ) {
      return null;
    }

    return {
      body: parsed.body,
      heading: parsed.heading,
      action: parsed.action,
    };
  } catch {
    return null;
  }
}

export function serializeFontPreferences(preferences: FontPreferences) {
  return encodeURIComponent(JSON.stringify(preferences));
}

export function fontPreferencesInlineLinks(preferences: FontPreferences) {
  const families = new Set<string>();

  (["body", "heading", "action"] as FontRole[]).forEach((role) => {
    const family = preferences[role];
    if (family !== DEFAULT_FONT_PREFERENCES[role]) {
      families.add(family);
    }
  });

  return Array.from(families).map((family) => ({
    family,
    href: googleFontStylesheetHref(family),
  }));
}

export function fontPreferencesInlineStyle(
  preferences: FontPreferences,
): CSSProperties {
  return {
    ["--font-sans" as string]: stackForFamily("body", preferences.body),
    ["--font-display" as string]: stackForFamily("heading", preferences.heading),
    ["--font-serif" as string]: stackForFamily("heading", preferences.heading),
    ["--font-action" as string]: stackForFamily("action", preferences.action),
  };
}

export type { GoogleFontFamily };
