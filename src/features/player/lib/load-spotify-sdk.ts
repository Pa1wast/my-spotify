const SDK_URL = "https://sdk.scdn.co/spotify-player.js";

let loadPromise: Promise<void> | null = null;

function waitForSpotifyPlayer(timeoutMs = 10_000): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.Spotify?.Player) {
      resolve();
      return;
    }

    const startedAt = Date.now();
    const interval = window.setInterval(() => {
      if (window.Spotify?.Player) {
        window.clearInterval(interval);
        resolve();
        return;
      }

      if (Date.now() - startedAt >= timeoutMs) {
        window.clearInterval(interval);
        reject(new Error("Timed out waiting for Spotify Web Playback SDK."));
      }
    }, 50);
  });
}

export function loadSpotifySdk(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Spotify SDK can only load in the browser."));
  }

  if (window.Spotify?.Player) {
    return Promise.resolve();
  }

  if (loadPromise) {
    return loadPromise;
  }

  loadPromise = new Promise((resolve, reject) => {
    window.onSpotifyWebPlaybackSDKReady = () => {
      resolve();
    };

    const existing = document.querySelector(`script[src="${SDK_URL}"]`);

    if (existing) {
      void waitForSpotifyPlayer().then(resolve).catch(reject);
      return;
    }

    const script = document.createElement("script");
    script.src = SDK_URL;
    script.async = true;
    script.onerror = () => {
      loadPromise = null;
      reject(new Error("Failed to load Spotify Web Playback SDK."));
    };
    document.body.appendChild(script);
  });

  return loadPromise;
}
