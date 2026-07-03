const OWNER_KEY_STORAGE = "pp_dashboard_uid";

/**
 * A stable, per-browser identifier used to scope dashboard profiles to a user.
 * The app has no real auth user id, so we persist a UUID in localStorage that
 * survives logout (only the "pp_auth" flag is cleared on logout).
 */
export function getOwnerKey(): string {
  if (typeof window === "undefined") return "anonymous";
  let key = window.localStorage.getItem(OWNER_KEY_STORAGE);
  if (!key) {
    key =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `uid-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    window.localStorage.setItem(OWNER_KEY_STORAGE, key);
  }
  return key;
}

const ACTIVE_PROFILE_STORAGE = "pp_dashboard_active";

export function getActiveProfileId(): number | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(ACTIVE_PROFILE_STORAGE);
  if (!raw) return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

export function setActiveProfileId(id: number): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ACTIVE_PROFILE_STORAGE, String(id));
}

const LAYOUT_LOCK_STORAGE = "pp_dashboard_locked";

/** Whether the dashboard layout is locked (drag/resize/show-hide disabled). */
export function getLayoutLocked(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(LAYOUT_LOCK_STORAGE) === "1";
}

export function setLayoutLocked(locked: boolean): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LAYOUT_LOCK_STORAGE, locked ? "1" : "0");
}
