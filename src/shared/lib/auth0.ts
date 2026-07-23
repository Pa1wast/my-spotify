import { Auth0Client } from "@auth0/nextjs-auth0/server";

import { getConfiguredAppBaseUrl } from "@/shared/lib/app-url";

const DEFAULT_PROD_SESSION_SECONDS = 90 * 24 * 60 * 60; // ~3 months
const DEFAULT_DEV_SESSION_SECONDS = 7 * 24 * 60 * 60; // 7 days

const SESSION_ABSOLUTE_SECONDS = process.env.SESSION_ABSOLUTE_SECONDS
  ? Number.parseInt(process.env.SESSION_ABSOLUTE_SECONDS, 10)
  : process.env.NODE_ENV === "development"
    ? DEFAULT_DEV_SESSION_SECONDS
    : DEFAULT_PROD_SESSION_SECONDS;

function getAuth0Domain() {
  const domain = process.env.AUTH0_DOMAIN?.trim();

  if (!domain) {
    throw new Error("AUTH0_DOMAIN is not set.");
  }

  return domain.replace(/^https?:\/\//, "");
}

export const auth0 = new Auth0Client({
  domain: getAuth0Domain(),
  clientId: process.env.AUTH0_CLIENT_ID,
  clientSecret: process.env.AUTH0_CLIENT_SECRET,
  secret: process.env.AUTH0_SECRET,
  appBaseUrl: getConfiguredAppBaseUrl(),
  transactionCookie: {
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60,
  },
  session: {
    rolling: false,
    absoluteDuration: SESSION_ABSOLUTE_SECONDS,
    inactivityDuration: SESSION_ABSOLUTE_SECONDS,
    cookie: {
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    },
  },
});
