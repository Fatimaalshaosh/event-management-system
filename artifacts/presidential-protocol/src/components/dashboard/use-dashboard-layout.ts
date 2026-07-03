import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  useListDashboardProfiles,
  useCreateDashboardProfile,
  useUpdateDashboardProfile,
  useDeleteDashboardProfile,
  getListDashboardProfilesQueryKey,
  type DashboardProfile,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import {
  getOwnerKey,
  getActiveProfileId,
  setActiveProfileId,
  getLayoutLocked,
  setLayoutLocked,
} from "./owner-key";
import {
  PROFILE_TEMPLATES,
  DEFAULT_ITEMS,
  reconcileItems,
  type WidgetId,
  type WidgetItem,
} from "./widget-meta";

const PROFILES_KEY = ["/api/dashboard/profiles"];

export type DashboardLayout = {
  loading: boolean;
  seeding: boolean;
  profiles: DashboardProfile[];
  activeProfile: DashboardProfile | undefined;
  activeId: number | null;
  items: WidgetItem[];
  visibleItems: WidgetItem[];
  dirty: boolean;
  saving: boolean;
  locked: boolean;
  toggleLock: () => void;
  /* layout mutations (operate on the active profile) */
  hide: (id: WidgetId) => void;
  show: (id: WidgetId) => void;
  resetToDefault: () => void;
  saveNow: () => void;
  /* profile management */
  switchProfile: (id: number) => void;
  createProfile: (name: string) => void;
  duplicateProfile: () => void;
  renameProfile: (name: string) => void;
  deleteProfile: () => void;
};

export function useDashboardLayout(lang: "en" | "ar"): DashboardLayout {
  const ownerKey = useMemo(() => getOwnerKey(), []);
  const queryClient = useQueryClient();
  const { data: profiles, isLoading } = useListDashboardProfiles({ ownerKey });
  const createMut = useCreateDashboardProfile();
  const updateMut = useUpdateDashboardProfile();
  const deleteMut = useDeleteDashboardProfile();

  const [activeId, setActiveId] = useState<number | null>(() => getActiveProfileId());
  const [items, setItems] = useState<WidgetItem[]>([]);
  const [dirty, setDirty] = useState(false);
  const [locked, setLocked] = useState<boolean>(() => getLayoutLocked());
  const seededRef = useRef(false);
  const lastLoadedId = useRef<number | null>(null);

  const refetchProfiles = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: PROFILES_KEY });
  }, [queryClient]);

  /* Seed default profiles once when the owner has none. */
  useEffect(() => {
    if (isLoading || !profiles || seededRef.current) return;
    if (profiles.length > 0) return;
    seededRef.current = true;
    (async () => {
      for (const tpl of PROFILE_TEMPLATES) {
        await createMut.mutateAsync({
          data: {
            ownerKey,
            name: lang === "ar" ? tpl.nameAr : tpl.nameEn,
            icon: tpl.icon,
            items: tpl.items,
          },
        });
      }
      refetchProfiles();
    })().catch(() => {
      seededRef.current = false;
    });
  }, [isLoading, profiles, ownerKey, lang, createMut, refetchProfiles]);

  /* Resolve the active profile: stored id if valid, else first profile. */
  const activeProfile = useMemo(() => {
    if (!profiles || profiles.length === 0) return undefined;
    return profiles.find((p) => p.id === activeId) ?? profiles[0];
  }, [profiles, activeId]);

  /* Normalize activeId only when it is unset or points to a profile that no
   * longer exists. Do NOT normalize while a create is in flight — otherwise a
   * freshly created profile (not yet in the refetched list) would be reverted
   * to the fallback before its switchProfile() takes effect. */
  useEffect(() => {
    if (!profiles || profiles.length === 0) return;
    if (createMut.isPending) return;
    const exists = activeId != null && profiles.some((p) => p.id === activeId);
    if (!exists) {
      setActiveId(profiles[0].id);
      setActiveProfileId(profiles[0].id);
    }
  }, [profiles, activeId, createMut.isPending]);

  /* Load items into local state when the active profile changes (not on every keystroke save). */
  useEffect(() => {
    if (!activeProfile) return;
    if (lastLoadedId.current === activeProfile.id && items.length > 0) return;
    lastLoadedId.current = activeProfile.id;
    setItems(reconcileItems(activeProfile.items));
    setDirty(false);
  }, [activeProfile]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Debounced autosave ──────────────────────────────────────── */
  /* Track the live active id so a save that resolves after the user switched
   * profiles only clears the dirty flag if it still owns the active profile. */
  const activeIdRef = useRef<number | null>(null);
  useEffect(() => {
    activeIdRef.current = activeProfile?.id ?? null;
  }, [activeProfile]);

  /* Per-profile debounce timers. Keyed by profile id so a pending save for one
   * profile is never cancelled when the user switches to and edits another. */
  const saveTimers = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());
  /* Drop any pending debounces on unmount so a late timer can't fire after teardown. */
  useEffect(() => {
    const timers = saveTimers.current;
    return () => {
      timers.forEach((t) => clearTimeout(t));
      timers.clear();
    };
  }, []);

  const persist = useCallback(
    (next: WidgetItem[]) => {
      if (!activeProfile) return;
      const id = activeProfile.id;
      const existing = saveTimers.current.get(id);
      if (existing) clearTimeout(existing);
      const timer = setTimeout(() => {
        saveTimers.current.delete(id);
        updateMut.mutate(
          { id, params: { ownerKey }, data: { items: next } },
          { onSuccess: () => { if (activeIdRef.current === id) setDirty(false); refetchProfiles(); } },
        );
      }, 700);
      saveTimers.current.set(id, timer);
    },
    [activeProfile, ownerKey, updateMut, refetchProfiles],
  );

  const apply = useCallback(
    (next: WidgetItem[]) => {
      setItems(next);
      setDirty(true);
      persist(next);
    },
    [persist],
  );

  const saveNow = useCallback(() => {
    if (!activeProfile) return;
    const id = activeProfile.id;
    const existing = saveTimers.current.get(id);
    if (existing) {
      clearTimeout(existing);
      saveTimers.current.delete(id);
    }
    updateMut.mutate(
      { id, params: { ownerKey }, data: { items } },
      { onSuccess: () => { if (activeIdRef.current === id) setDirty(false); refetchProfiles(); } },
    );
  }, [activeProfile, items, ownerKey, updateMut, refetchProfiles]);

  /* ── Layout mutations ────────────────────────────────────────── */
  const hide = useCallback(
    (id: WidgetId) => apply(items.map((w) => (w.id === id ? { ...w, hidden: true } : w))),
    [items, apply],
  );

  /* Reveal a hidden widget, parking it just below the current content so
   * vertical compaction pulls it into the first free slot. */
  const show = useCallback(
    (id: WidgetId) => {
      const maxY = items.reduce((m, w) => (w.hidden ? m : Math.max(m, w.y + w.h)), 0);
      apply(items.map((w) => (w.id === id ? { ...w, hidden: false, x: 0, y: maxY } : w)));
    },
    [items, apply],
  );

  const resetToDefault = useCallback(() => {
    const tpl = PROFILE_TEMPLATES.find(
      (t) =>
        activeProfile &&
        (activeProfile.name === t.nameEn || activeProfile.name === t.nameAr),
    );
    apply((tpl?.items ?? DEFAULT_ITEMS).map((w) => ({ ...w })));
  }, [activeProfile, apply]);

  /* ── Profile management ──────────────────────────────────────── */
  const switchProfile = useCallback((id: number) => {
    setActiveId(id);
    setActiveProfileId(id);
  }, []);

  const toggleLock = useCallback(() => {
    setLocked((prev) => {
      const next = !prev;
      setLayoutLocked(next);
      return next;
    });
  }, []);

  /* Insert the created profile into the cache synchronously, then switch to it.
   * This guarantees the new id is present in `profiles` before the normalize
   * effect runs, so the selection sticks even before the refetch lands. */
  const adoptCreated = useCallback(
    (p: DashboardProfile) => {
      queryClient.setQueryData<DashboardProfile[]>(
        getListDashboardProfilesQueryKey({ ownerKey }),
        (old) => (old ? [...old, p] : [p]),
      );
      switchProfile(p.id);
      refetchProfiles();
    },
    [queryClient, ownerKey, switchProfile, refetchProfiles],
  );

  const createProfile = useCallback(
    (name: string) => {
      createMut.mutate(
        { data: { ownerKey, name, items: DEFAULT_ITEMS.map((w) => ({ ...w })) } },
        { onSuccess: adoptCreated },
      );
    },
    [createMut, ownerKey, adoptCreated],
  );

  const duplicateProfile = useCallback(() => {
    if (!activeProfile) return;
    const copyName =
      (lang === "ar" ? "نسخة من " : "Copy of ") + activeProfile.name;
    createMut.mutate(
      { data: { ownerKey, name: copyName, icon: activeProfile.icon ?? undefined, items } },
      { onSuccess: adoptCreated },
    );
  }, [activeProfile, items, lang, createMut, ownerKey, adoptCreated]);

  const renameProfile = useCallback(
    (name: string) => {
      if (!activeProfile) return;
      updateMut.mutate(
        { id: activeProfile.id, params: { ownerKey }, data: { name } },
        { onSuccess: () => refetchProfiles() },
      );
    },
    [activeProfile, ownerKey, updateMut, refetchProfiles],
  );

  const deleteProfile = useCallback(() => {
    if (!activeProfile || !profiles || profiles.length <= 1) return;
    const id = activeProfile.id;
    const fallback = profiles.find((p) => p.id !== id);
    deleteMut.mutate(
      { id, params: { ownerKey } },
      {
        onSuccess: () => {
          refetchProfiles();
          if (fallback) switchProfile(fallback.id);
        },
      },
    );
  }, [activeProfile, profiles, ownerKey, deleteMut, refetchProfiles, switchProfile]);

  const visibleItems = useMemo(() => items.filter((w) => !w.hidden), [items]);

  return {
    loading: isLoading,
    seeding: !!profiles && profiles.length === 0,
    profiles: profiles ?? [],
    activeProfile,
    activeId: activeProfile?.id ?? null,
    items,
    visibleItems,
    dirty,
    saving: updateMut.isPending,
    locked,
    toggleLock,
    hide,
    show,
    resetToDefault,
    saveNow,
    switchProfile,
    createProfile,
    duplicateProfile,
    renameProfile,
    deleteProfile,
  };
}
