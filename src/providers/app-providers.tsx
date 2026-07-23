"use client";

import { Auth0Provider } from "@auth0/nextjs-auth0/client";
import type { ReactNode } from "react";

import { QueryProvider } from "@/providers/query-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import type { AppTheme } from "@/shared/constants/themes";

interface AppProvidersProps {
  children: ReactNode;
  initialTheme?: AppTheme;
}

export function AppProviders({ children, initialTheme }: AppProvidersProps) {
  return (
    <Auth0Provider>
      <ThemeProvider initialTheme={initialTheme}>
        <QueryProvider>
          <div className="flex min-h-full min-w-0 w-full flex-1 flex-col">
            {children}
          </div>
        </QueryProvider>
      </ThemeProvider>
    </Auth0Provider>
  );
}
