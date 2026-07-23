const WINDOW_MS = 30_000;
export const SPOTIFY_ESTIMATED_REQUEST_LIMIT = 180;

export interface SpotifyApiMetricsSnapshot {
  requestsInWindow: number;
  estimatedRemaining: number;
  estimatedLimit: number;
  totalRequests: number;
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
      estimatedRemaining: Math.max(
        0,
        SPOTIFY_ESTIMATED_REQUEST_LIMIT - requestsInWindow,
      ),
      estimatedLimit: SPOTIFY_ESTIMATED_REQUEST_LIMIT,
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
      (timestamp) => now - timestamp < WINDOW_MS,
    );

    if (this.rateLimitedUntil && this.rateLimitedUntil <= now) {
      this.rateLimitedUntil = null;
    }
  }
}

export const spotifyApiMetrics = new SpotifyApiMetricsTracker();
