/* Shared person source of truth.
 *
 * Contacts (`/api/contacts`) is the canonical record for every real person.
 * This module holds a lookup of the loaded contacts (by id and by normalized
 * name) and exposes `resolvePerson` + `personName` / `personRole` helpers so any
 * surface — Mission Engine, Collaboration Hub, org-structure heads, VIPs, … —
 * resolves a person's canonical name / Arabic name / title / department /
 * portrait from Contacts. People who do NOT exist in Contacts (synthetic mission
 * staff, the signed-in executive, foreign VIPs) fall back to their existing
 * demo values, so no demo person is removed.
 *
 * The store is populated once from the live contacts query (see Layout). It is a
 * plain external store with a version counter; `usePeopleVersion` lets identity
 * consumers re-resolve when contacts finish loading. */
import { useSyncExternalStore } from "react";

export interface CanonicalPerson {
  id: string | number;
  name: string;
  nameAr?: string;
  title?: string;
  titleAr?: string;
  department?: string; // DeptKey (matches org-structure keys), never a display string
}

interface ContactLike {
  id: string | number;
  nameEn?: string | null;
  nameAr?: string | null;
  jobTitle?: string | null;
  jobTitleAr?: string | null;
  departmentKey?: string | null;
}

const norm = (s?: string | null): string => (s ?? "").toLowerCase().trim().replace(/\s+/g, " ");

const byId = new Map<string, CanonicalPerson>();
const byName = new Map<string, CanonicalPerson>();
let version = 0;
const listeners = new Set<() => void>();

/** Replace the canonical person source with the loaded contacts. */
export function setPeopleSource(contacts: readonly ContactLike[] | undefined | null): void {
  byId.clear();
  byName.clear();
  for (const c of contacts ?? []) {
    const person: CanonicalPerson = {
      id: c.id,
      name: c.nameEn || c.nameAr || "",
      nameAr: c.nameAr ?? undefined,
      title: c.jobTitle ?? undefined,
      titleAr: c.jobTitleAr ?? undefined,
      department: c.departmentKey ?? undefined,
    };
    byId.set(String(c.id), person);
    const en = norm(c.nameEn);
    if (en && !byName.has(en)) byName.set(en, person);
    const ar = norm(c.nameAr);
    if (ar && !byName.has(ar)) byName.set(ar, person);
  }
  version += 1;
  listeners.forEach((l) => l());
}

/** Canonical person for a reference — by contactId first, then by name. */
export function resolvePerson(ref: { id?: string | number | null; name?: string | null }): CanonicalPerson | undefined {
  if (ref.id != null) {
    const hit = byId.get(String(ref.id));
    if (hit) return hit;
  }
  if (ref.name) {
    const hit = byName.get(norm(ref.name));
    if (hit) return hit;
  }
  return undefined;
}

/** Canonical display name (lang-aware), falling back to the provided name. */
export function personName(
  ref: { id?: string | number | null; name?: string | null; nameAr?: string | null },
  lang: string = "en",
): string {
  const c = resolvePerson(ref);
  if (c) return lang === "ar" && c.nameAr ? c.nameAr : c.name;
  return (lang === "ar" && ref.nameAr ? ref.nameAr : ref.name) ?? "";
}

/** Canonical title/position (lang-aware), falling back to the provided role. */
export function personRole(
  ref: { id?: string | number | null; name?: string | null; role?: string | null; roleAr?: string | null },
  lang: string = "en",
): string | undefined {
  const c = resolvePerson(ref);
  if (c?.title) return lang === "ar" && c.titleAr ? c.titleAr : c.title;
  return (lang === "ar" && ref.roleAr ? ref.roleAr : ref.role) ?? undefined;
}

function subscribe(l: () => void): () => void {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}
const getSnapshot = (): number => version;

/** Re-render + re-resolve when the canonical source changes (contacts load). */
export function usePeopleVersion(): number {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
