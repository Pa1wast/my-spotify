import { Auth0Client } from "@auth0/nextjs-auth0/server";

const DEFAULT_PROD_SESSION_SECONDS = 90 * 24 * 60 * 60; // ~3 months
const DEFAULT_DEV_SESSION_SECONDS = 7 * 24 * 60 * 60; // 7 days

const SESSION_ABSOLUTE_SECONDS = process.env.SESSION_ABSOLUTE_SECONDS
  ? Number.parseInt(process.env.SESSION_ABSOLUTE_SECONDS, 10)
  : process.env.NODE_ENV === "development"
    ? DEFAULT_DEV_SESSION_SECONDS
    : DEFAULT_PROD_SESSION_SECONDS;

export const auth0 = new Auth0Client({
  session: {
    rolling: false,
    absoluteDuration: SESSION_ABSOLUTE_SECONDS,
    inactivityDuration: SESSION_ABSOLUTE_SECONDS,
  },
});
