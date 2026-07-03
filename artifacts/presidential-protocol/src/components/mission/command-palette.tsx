import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { Search, CornerDownLeft, LayoutGrid, Building2, Wand2 } from "lucide-react";
import type { Mission } from "@/lib/mission";
import { C } from "./panel";

type Kind = "ws" | "dept" | "action";
type Item = { kind: Kind; key: string; label: string; group: string };
const ICON: Record<Kind, typeof Search> = { ws: LayoutGrid, dept: Building2, action: Wand2 };

/** ⌘K / Ctrl+K palette — jump to any workspace, department or action without scrolling. */
export function CommandPalette({ open, onClose, mission, workspaces, onWorkspace, onDept, onEditBrief }: {
  open: boolean; onClose: () => void; mission: Mission; workspaces: readonly string[];
  onWorkspace: (w: string) => void; onDept: (d: string) => void; onEditBrief: () => void;
}) {
  const { t } = useTranslation();
  const [q, setQ] = useState("");
  useEffect(() => { if (open) setQ(""); }, [open]);

  const items: Item[] = useMemo(() => {
    const ws = workspaces.map((w) => ({ kind: "ws" as const, key: w, label: t(`missionEngine.nav.ws.${w}`), group: t("missionEngine.nav.palette.workspaces") }));
    const depts = mission.blueprint.streams.map((s) => ({ kind: "dept" as const, key: s.deptKey, label: t(`contacts.departments.${s.deptKey}`), group: t("missionEngine.nav.palette.departments") }));
    const actions = [{ kind: "action" as const, key: "brief", label: t("missionEngine.nav.bar.editBrief"), group: t("missionEngine.nav.palette.actions") }];
    return [...ws, ...depts, ...actions];
  }, [mission, workspaces, t]);

  const ql = q.trim().toLowerCase();
  const filtered = ql ? items.filter((i) => i.label.toLowerCase().includes(ql) || i.group.toLowerCase().includes(ql)) : items;

  const pick = (it: Item) => {
    if (it.kind === "ws") onWorkspace(it.key);
    else if (it.kind === "dept") onDept(it.key);
    else onEditBrief();
    onClose();
  };

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[120] flex items-start justify-center pt-[12vh] px-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden" style={{ borderColor: C.border, background: C.cardBg }}>
        <div className="flex items-center gap-2 px-4 py-3 border-b" style={{ borderColor: C.border }}>
          <Search size={16} className="text-muted-foreground shrink-0" />
          <input autoFocus value={q} onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && filtered[0]) pick(filtered[0]); if (e.key === "Escape") onClose(); }}
            placeholder={t("missionEngine.nav.palette.placeholder")} className="flex-1 bg-transparent outline-none text-sm" />
          <kbd className="text-[9px] px-1.5 py-0.5 rounded border text-muted-foreground" style={{ borderColor: C.border }}>ESC</kbd>
        </div>
        <div className="max-h-[52vh] overflow-y-auto py-1.5">
          {filtered.length === 0 && <p className="px-4 py-8 text-center text-xs text-muted-foreground">{t("missionEngine.nav.palette.empty")}</p>}
          {filtered.map((it, idx) => {
            const Icon = ICON[it.kind];
            const showGroup = idx === 0 || filtered[idx - 1].group !== it.group;
            return (
              <div key={it.kind + it.key}>
                {showGroup && <p className="px-4 pt-2 pb-1 text-[10px] uppercase tracking-wide text-muted-foreground">{it.group}</p>}
                <button onClick={() => pick(it)} className="w-full flex items-center gap-2.5 px-4 py-2 text-start text-sm hover:bg-muted/40 transition-colors group">
                  <Icon size={14} className="text-muted-foreground shrink-0" />
                  <span className="flex-1 text-foreground">{it.label}</span>
                  {idx === 0 && <CornerDownLeft size={12} className="text-muted-foreground opacity-0 group-hover:opacity-100" />}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>,
    document.body,
  );
}
