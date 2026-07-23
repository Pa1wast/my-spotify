"use client";

import { AppBottomNav } from "@/layouts/app-bottom-nav";
import { AppMobileHeader } from "@/layouts/app-mobile-header";
import { AppSidebar } from "@/layouts/app-sidebar";
import {
  AppPlayerBar,
  getPlayerBarOffsetClass,
} from "@/features/player/components/app-player-bar";
import { ExpandedPlayer } from "@/features/player/components/expanded-player";
import { SpotifyPlayerProvider } from "@/features/player/components/spotify-player-provider";
import { useSpotifyPlayer } from "@/features/player/hooks/use-spotify-player";
import { cn } from "@/shared/lib/utils";

interface AppShellClientProps {
  children: React.ReactNode;
  userName: string;
  userPicture?: string | null;
}

function AppShellContent({ children }: AppShellClientProps) {
  const player = useSpotifyPlayer();
  const hasTrack = Boolean(player.currentTrack);
  const playerOffset = getPlayerBarOffsetClass(hasTrack);

  return (
    <div className="flex h-dvh min-w-0 overflow-hidden">
      <AppSidebar />
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden lg:pl-44">
        <AppMobileHeader />
        <main
          className={cn(
            "mx-auto flex min-h-0 w-full min-w-0 max-w-6xl flex-1 flex-col overflow-hidden px-4 pt-4 sm:px-6 sm:pt-6",
            "pb-[calc(4rem+env(safe-area-inset-bottom,0px))] lg:pb-0",
            playerOffset,
          )}
        >
          {children}
        </main>
        <AppPlayerBar />
        <ExpandedPlayer />
        <AppBottomNav />
      </div>
    </div>
  );
}

export function AppShellClient(props: AppShellClientProps) {
  return (
    <SpotifyPlayerProvider>
      <AppShellContent {...props} />
    </SpotifyPlayerProvider>
  );
}
