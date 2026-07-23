import type { Metadata } from "next";
import { JetBrains_Mono, Koulen, Londrina_Solid, Outfit } from "next/font/google";
import { cookies } from "next/headers";

import { AppProviders } from "@/providers/app-providers";
import {
  APP_THEMES,
  DEFAULT_THEME,
  THEME_COOKIE_NAME,
  type AppTheme,
} from "@/shared/constants/themes";
import {
  DEFAULT_FONT_PREFERENCES,
  FONT_PREFERENCES_COOKIE_NAME,
  fontPreferencesInlineLinks,
  fontPreferencesInlineStyle,
  parseFontPreferences,
} from "@/shared/lib/font-preferences";
import {
  DEFAULT_PRIMARY_COLOR,
  parsePrimaryColorInput,
  PRIMARY_COLOR_COOKIE_NAME,
  primaryColorInlineStyle,
} from "@/shared/lib/primary-color";

import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

const koulen = Koulen({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-koulen",
});

const londrinaSolid = Londrina_Solid({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-londrina-solid",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "My Spotify",
  description: "A personal music app powered by Spotify and your own library.",
  icons: {
    icon: "/logo/logo-icon-brand.png",
    apple: "/logo/logo-icon-brand.png",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

function resolveInitialTheme(cookieValue: string | undefined): AppTheme {
  if (cookieValue && APP_THEMES.includes(cookieValue as AppTheme)) {
    return cookieValue as AppTheme;
  }

  return DEFAULT_THEME;
}

function resolveInitialPrimaryColor(cookieValue: string | undefined) {
  if (!cookieValue) {
    return DEFAULT_PRIMARY_COLOR;
  }

  const decoded = decodeURIComponent(cookieValue);
  return parsePrimaryColorInput(decoded) ?? DEFAULT_PRIMARY_COLOR;
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const initialTheme = resolveInitialTheme(
    cookieStore.get(THEME_COOKIE_NAME)?.value,
  );
  const initialPrimaryColor = resolveInitialPrimaryColor(
    cookieStore.get(PRIMARY_COLOR_COOKIE_NAME)?.value,
  );
  const initialFonts =
    parseFontPreferences(
      cookieStore.get(FONT_PREFERENCES_COOKIE_NAME)?.value,
    ) ?? DEFAULT_FONT_PREFERENCES;
  const fontLinks = fontPreferencesInlineLinks(initialFonts);

  return (
    <html
      lang="en"
      data-theme={initialTheme}
      className={`${outfit.variable} ${koulen.variable} ${londrinaSolid.variable} ${jetbrainsMono.variable} h-full antialiased`}
      style={{
        ...primaryColorInlineStyle(initialPrimaryColor),
        ...fontPreferencesInlineStyle(initialFonts),
      }}
      suppressHydrationWarning
    >
      <head>
        {fontLinks.map((font) => (
          <link
            key={font.family}
            rel="stylesheet"
            href={font.href}
          />
        ))}
      </head>
      <body className="flex min-h-full min-w-0 w-full flex-col overflow-x-hidden">
        <AppProviders
          initialTheme={initialTheme}
          initialPrimaryColor={initialPrimaryColor}
          initialFonts={initialFonts}
        >
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
