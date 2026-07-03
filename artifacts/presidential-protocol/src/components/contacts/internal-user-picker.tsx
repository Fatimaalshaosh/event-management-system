import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/i18n/language-context";
import { useListContactsByType, type Contact } from "@workspace/api-client-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, ChevronDown, UserCog, Check } from "lucide-react";
import { C, ContactAvatar, nameOf } from "./contact-shared";
import { DEPARTMENTS, parseRoles, availabilityColor } from "./org-structure";

/**
 * Assignee picker backed by internal users. Filterable by department and
 * workflow role; shows availability and current workload. Reports the chosen
 * user's name (so it drops into existing free-text `assignedTo` fields) plus the
 * full contact for callers that want the department/role.
 */
export function InternalUserPicker({ value, onChange, placeholder }: {
  value: string;
  onChange: (name: string, user?: Contact) => void;
  placeholder?: string;
}) {
  const { t } = useTranslation();
  const { lang, dir } = useLanguage();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [dept, setDept] = useState("all");
  const [role, setRole] = useState("all");
  const { data: users } = useListContactsByType("internal");

  const filtered = useMemo(() => (users ?? []).filter((u) => {
    if (dept !== "all" && u.departmentKey !== dept) return false;
    if (role !== "all" && !parseRoles(u.workflowRoles).includes(role)) return false;
    if (q && !`${u.nameEn} ${u.nameAr ?? ""} ${u.jobTitle ?? ""}`.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  }), [users, dept, role, q]);

  const roleOptions = useMemo(
    () => [...new Set((users ?? []).flatMap((u) => parseRoles(u.workflowRoles)))],
    [users],
  );

  return (
    <Popover open={open} onOpenChange={(o) => { setOpen(o); if (!o) setQ(""); }}>
      <PopoverTrigger asChild>
        <button type="button" className="w-full flex items-center justify-between gap-2 h-10 rounded-md border bg-background px-3 text-sm transition-colors hover:bg-muted/30" style={{ borderColor: C.border }}>
          {value
            ? <span className="flex items-center gap-2 truncate text-foreground"><UserCog size={14} strokeWidth={1.6} />{value}</span>
            : <span className="flex items-center gap-2 text-muted-foreground"><UserCog size={14} strokeWidth={1.6} />{placeholder ?? t("contacts.summary.internal")}</span>}
          <ChevronDown size={15} strokeWidth={1.5} className="text-muted-foreground shrink-0" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[var(--radix-popover-trigger-width)] p-0" dir={dir}>
        <div className="p-2 border-b space-y-2" style={{ borderColor: C.border }}>
          <div className="flex items-center gap-2">
            <Search size={14} strokeWidth={1.5} className="text-muted-foreground shrink-0" />
            <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("contacts.searchPlaceholder")} className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/50" dir={dir} />
          </div>
          <div className="flex gap-2">
            <select value={dept} onChange={(e) => setDept(e.target.value)} className="flex-1 h-8 rounded-md border bg-background px-2 text-xs min-w-0" style={{ borderColor: C.border }} dir={dir}>
              <option value="all">{t("contacts.workflow.department")}: {t("contacts.filters.all")}</option>
              {DEPARTMENTS.map((d) => <option key={d.key} value={d.key}>{t(`contacts.departments.${d.key}`)}</option>)}
            </select>
            <select value={role} onChange={(e) => setRole(e.target.value)} className="flex-1 h-8 rounded-md border bg-background px-2 text-xs min-w-0" style={{ borderColor: C.border }} dir={dir}>
              <option value="all">{t("contacts.workflow.roles")}: {t("contacts.filters.all")}</option>
              {roleOptions.map((r) => <option key={r} value={r}>{t(`contacts.roles.${r}`, { defaultValue: r })}</option>)}
            </select>
          </div>
        </div>
        <ScrollArea className="max-h-64">
          <div className="p-1">
            {filtered.length === 0 ? (
              <p className="px-3 py-6 text-center text-xs text-muted-foreground">{t("contacts.noResults")}</p>
            ) : filtered.map((u) => {
              const picked = value === nameOf(u, lang) || value === u.nameEn;
              const cap = u.taskCapacity ?? 0, act = u.activeTasks ?? 0;
              return (
                <button key={u.id} type="button" onClick={() => { onChange(nameOf(u, lang), u); setOpen(false); setQ(""); }}
                  className="w-full flex items-center gap-2.5 rounded-lg px-2 py-2 text-start transition-colors hover:bg-muted/50">
                  <ContactAvatar contact={u} size={32} hover={false} />
                  <div className="min-w-0 flex-1">
                    <span className="block text-sm font-medium text-foreground truncate">{nameOf(u, lang)}</span>
                    <span className="block text-[11px] text-muted-foreground truncate">
                      {u.departmentKey ? t(`contacts.departments.${u.departmentKey}`) : ""}{cap ? ` · ${act}/${cap} ${t("contacts.workflow.tasks")}` : ""}
                    </span>
                  </div>
                  {u.availability && <span className="w-2 h-2 rounded-full shrink-0" title={t(`contacts.availability.${u.availability}`, { defaultValue: u.availability })} style={{ background: availabilityColor[u.availability] ?? C.warmGray }} />}
                  {picked && <Check size={14} strokeWidth={2} style={{ color: C.mangrove }} className="shrink-0" />}
                </button>
              );
            })}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
