/**
 * Centralized, typed access to the app's localStorage keys.
 *
 * Previously the auth flags were read/written as raw string literals in App,
 * login, and the sidebar. This module is the single place those keys live.
 * (Owner key, dashboard profile, layout-lock, and language each already have
 * their own dedicated helpers in `owner-key.ts` / the i18n module.)
 *
 * Behavior matches the originals exactly: `pp_auth === "1"` means signed in;
 * `pp_remember` is set only when the user ticks "remember me"; both are cleared
 * on sign-out.
 */

const AUTH_KEY = "pp_auth";
const REMEMBER_KEY = "pp_remember";

export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(AUTH_KEY) === "1";
}

export function signIn(remember: boolean): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(AUTH_KEY, "1");
  if (remember) window.localStorage.setItem(REMEMBER_KEY, "1");
}

export function signOut(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(AUTH_KEY);
  window.localStorage.removeItem(REMEMBER_KEY);
}
