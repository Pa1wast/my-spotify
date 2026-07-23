import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Noto_Serif_Georgian } from "next/font/google";
import { cookies } from "next/headers";

import { AppProviders } from "@/providers/app-providers";
import {
  APP_THEMES,
  DEFAULT_THEME,
  THEME_COOKIE_NAME,
  type AppTheme,
} from "@/shared/constants/themes";

import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

const notoSerifGeorgian = Noto_Serif_Georgian({
  variable: "--font-noto-serif-georgian",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "My Spotify",
  description: "A personal music app powered by Spotify and your own library.",
  icons: {
    icon: "/logo/logo-icon.png",
    apple: "/logo/logo-icon.png",
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const initialTheme = resolveInitialTheme(
    cookieStore.get(THEME_COOKIE_NAME)?.value,
  );

  return (
    <html
      lang="en"
      data-theme={initialTheme}
      className={`${inter.variable} ${jetbrainsMono.variable} ${notoSerifGeorgian.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full min-w-0 w-full flex-col overflow-x-hidden">
        <AppProviders initialTheme={initialTheme}>{children}</AppProviders>
      </body>
    </html>
  );
}
