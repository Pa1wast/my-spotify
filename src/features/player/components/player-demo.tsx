"use client";

import { MusicPlayer, type Track } from "@/shared/components/ui/music-player";

const demoTrack: Track = {
  id: "demo-track",
  title: "Midnight Echoes",
  artist: "My Spotify",
  album: "Scaffold Sessions",
  artwork: "/logo/logo-icon.png",
  duration: 214,
};

const demoQueue: Track[] = [
  demoTrack,
  {
    id: "demo-track-2",
    title: "Neon Horizon",
    artist: "My Spotify",
    album: "Scaffold Sessions",
    artwork: "/logo/logo-icon.png",
    duration: 198,
  },
  {
    id: "demo-track-3",
    title: "Ember Pulse",
    artist: "My Spotify",
    album: "Scaffold Sessions",
    artwork: "/logo/logo-icon.png",
    duration: 241,
  },
];

export function PlayerDemo() {
  return (
    <MusicPlayer
      theme="spotify"
      currentTrack={demoTrack}
      queue={demoQueue}
      currentIndex={0}
      showEqualizer
      className="border border-border/60"
    />
  );
}
