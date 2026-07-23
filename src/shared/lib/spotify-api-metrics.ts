/**
 * Spotify calculates rate limits over a rolling 30 second window.
 * @see https://developer.spotify.com/documentation/web-api/concepts/rate-limits
 */
export const SPOTIFY_RATE_LIMIT_WINDOW_MS = 30_000;

export interface SpotifyApiMetricsSnapshot {
  /** Requests observed in the current rolling 30s window (local tracker). */
  requestsInWindow: number;
  windowMs: number;
  totalRequests: number;
  /** ISO time until which we must not call Spotify (from Retry-After). */
  rateLimitedUntil: string | null;
  rateLimitRemainingMs: number | null;
  lastRequestAt: string | null;
}

class SpotifyApiMetricsTracker {
  private timestamps: number[] = [];
  private totalRequests = 0;
  private rateLimitedUntil: number | null = null;

  recordRequest() {
    this.totalRequests += 1;
    const now = Date.now();
    this.timestamps.push(now);
    this.prune(now);
  }

  /** Extends cooldown if the new wait is longer; never shortens an active one. */
  recordRateLimit(retryAfterMs: number) {
    const until = Date.now() + Math.max(0, retryAfterMs);

    if (this.rateLimitedUntil === null || until > this.rateLimitedUntil) {
      this.rateLimitedUntil = until;
    }
  }

  isRateLimited() {
    const now = Date.now();
    this.prune(now);
    return this.rateLimitedUntil !== null && this.rateLimitedUntil > now;
  }

  getRateLimitRemainingMs() {
    const now = Date.now();
    this.prune(now);

    if (this.rateLimitedUntil === null || this.rateLimitedUntil <= now) {
      return null;
    }

    return this.rateLimitedUntil - now;
  }

  getSnapshot(): SpotifyApiMetricsSnapshot {
    const now = Date.now();
    this.prune(now);
    const requestsInWindow = this.timestamps.length;
    const remainingMs = this.getRateLimitRemainingMs();

    return {
      requestsInWindow,
      windowMs: SPOTIFY_RATE_LIMIT_WINDOW_MS,
      totalRequests: this.totalRequests,
      rateLimitedUntil:
        remainingMs !== null && this.rateLimitedUntil
          ? new Date(this.rateLimitedUntil).toISOString()
          : null,
      rateLimitRemainingMs: remainingMs,
      lastRequestAt: this.timestamps.at(-1)
        ? new Date(this.timestamps.at(-1)!).toISOString()
        : null,
    };
  }

  private prune(now: number) {
    this.timestamps = this.timestamps.filter(
      (timestamp) => now - timestamp < SPOTIFY_RATE_LIMIT_WINDOW_MS,
    );

    if (this.rateLimitedUntil && this.rateLimitedUntil <= now) {
      this.rateLimitedUntil = null;
    }
  }
}

export const spotifyApiMetrics = new SpotifyApiMetricsTracker();
