const DEFAULT_DEV_APP_BASE_URL = "http://127.0.0.1:3000";

export function getConfiguredAppBaseUrl() {
  const configured = process.env.APP_BASE_URL?.trim();

  if (configured) {
    return configured.replace(/\/$/, "");
  }

  return DEFAULT_DEV_APP_BASE_URL;
}

export function createAppUrl(path: string, fallbackOrigin?: string) {
  const base = getConfiguredAppBaseUrl() || fallbackOrigin;

  if (!base) {
    throw new Error("APP_BASE_URL is not configured.");
  }

  return new URL(path, `${base}/`);
}
