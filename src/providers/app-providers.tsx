"use client";

import { Auth0Provider } from "@auth0/nextjs-auth0/client";
import type { ReactNode } from "react";

import { QueryProvider } from "@/providers/query-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import type { AppTheme } from "@/shared/constants/themes";
import {
  DEFAULT_FONT_PREFERENCES,
  type FontPreferences,
} from "@/shared/lib/font-preferences";
import { DEFAULT_PRIMARY_COLOR } from "@/shared/lib/primary-color";

interface AppProvidersProps {
  children: ReactNode;
  initialTheme?: AppTheme;
  initialPrimaryColor?: string;
  initialFonts?: FontPreferences;
}

export function AppProviders({
  children,
  initialTheme,
  initialPrimaryColor = DEFAULT_PRIMARY_COLOR,
  initialFonts = DEFAULT_FONT_PREFERENCES,
}: AppProvidersProps) {
  return (
    <Auth0Provider>
      <ThemeProvider
        initialTheme={initialTheme}
        initialPrimaryColor={initialPrimaryColor}
        initialFonts={initialFonts}
      >
        <QueryProvider>
          <div className="flex min-h-full min-w-0 w-full flex-1 flex-col">
            {children}
          </div>
        </QueryProvider>
      </ThemeProvider>
    </Auth0Provider>
  );
}
