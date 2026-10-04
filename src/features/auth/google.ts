import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { API_BASE_URL } from "../../config";
import { Request } from "../../lib/request";
import { exchangeGoogleCode, type Session } from "../../services";

/*
 * Google sign-in runs in the system browser:
 *   app → GET /user/google/login?client=mobile → Google → API callback
 *       → shortment://auth/google/callback?code=… (or ?error=google)
 * The code is single-use. On Android the redirect can reach the app twice — as the auth session's
 * result and as a deep link that opens `auth/google/callback` — so both paths share one exchange.
 */

export const GOOGLE_ERROR = "Google sign-in failed, please try again.";

let rememberedNext = "/";
const exchanges = new Map<string, Promise<Session>>();

/** Exchanges a one-time code once, however many screens ask for it. */
export const exchangeGoogleCodeOnce = (code: string): Promise<Session> => {
  let pending = exchanges.get(code);
  if (!pending) {
    pending = exchangeGoogleCode(code);
    exchanges.set(code, pending);
  }
  return pending;
};

/** Where to go after a sign-in that finishes on the callback route (set when the flow starts). */
export const takeRememberedNext = (): string => {
  const next = rememberedNext;
  rememberedNext = "/";
  return next;
};

export type GoogleResult = { type: "code"; code: string } | { type: "error" } | { type: "closed" };

/**
 * Opens Google sign-in. "closed" means the browser closed without handing back a redirect
 * (user cancelled, or on Android the deep link arrived separately and the callback route handles it).
 */
export const startGoogleSignIn = async (next: string): Promise<GoogleResult> => {
  rememberedNext = next;
  const returnUrl = Linking.createURL("auth/google/callback");
  const result = await WebBrowser.openAuthSessionAsync(`${API_BASE_URL}${Request.googleLogin}?client=mobile`, returnUrl);
  if (result.type !== "success") return { type: "closed" };
  const code = Linking.parse(result.url).queryParams?.code;
  return typeof code === "string" && code ? { type: "code", code } : { type: "error" };
};
