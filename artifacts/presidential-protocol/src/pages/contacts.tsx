import { useEffect, useMemo, useRef, useState } from "react";
import { Layout } from "@/components/layout";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/i18n/language-context";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  useListContacts,
  useListDelegations,
  useUpdateContact,
  getListContactsQueryKey,
  type Contact,
} from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { ContactCard } from "@/components/contacts/contact-card";
import { CompactCard } from "@/components/contacts/compact-card";
import { ContactTable } from "@/components/contacts/contact-table";
import { DelegationCard } from "@/components/contacts/delegation-card";
import { ContactProfileDrawer } from "@/components/contacts/contact-profile-drawer";
import { ContactForm } from "@/components/contacts/contact-form";
import { DepartmentCard } from "@/components/contacts/department-card";
import { DepartmentDrawer } from "@/components/contacts/department-drawer";
import { DEPARTMENTS, WORKFLOW_TEMPLATES, type Department } from "@/components/contacts/org-structure";
import { C, CONTACT_TYPES, VIP_LEVELS, TYPE_META, tl } from "@/components/contacts/contact-shared";
import { Plus, Upload, Download, Search, LayoutGrid, Rows3, Table2, Users } from "lucide-react";

const STATUSES = ["active", "inactive", "pending", "vip", "confidential"];
type View = "executive" | "compact" | "table";

function SummaryCard({ label, value, accent, active, onClick }: {
  label: string; value: number; accent: string; active?: boolean; onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="rounded-2xl border p-4 text-start transition-all hover:shadow-sm"
      style={{ borderColor: active ? accent : C.border, background: active ? accent + "0F" : C.cardBg }}
    >
      <p className="text-2xl font-bold" style={{ color: accent, fontFamily: "Georgia, serif" }}>{value}</p>
      <p className="text-[11px] text-muted-foreground mt-1 leading-tight">{label}</p>
    </button>
  );
}

export default function Contacts() {
  const { t } = useTranslation();
  const { lang, dir } = useLanguage();
  const { toast } = useToast();
  const qc = useQueryClient();
  const importRef = useRef<HTMLInputElement>(null);

  const { data: contacts, isLoading } = useListContacts();
  const { data: delegations } = useListDelegations();
  const updateContact = useUpdateContact();

  const [mode, setMode] = useState<"directory" | "org">("directory");
  const [selectedDept, setSelectedDept] = useState<Department | null>(null);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [countryFilter, setCountryFilter] = useState<string>("all");
  const [vipFilter, setVipFilter] = useState<string>("all");
  const [orgFilter, setOrgFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  // Directory layout — persisted so the user's choice is restored on return.
  const [view, setView] = useState<View>(() => {
    try {
      const v = localStorage.getItem("contacts.view");
      if (v === "executive" || v === "compact" || v === "table") return v;
    } catch { /* ignore */ }
    return "executive";
  });
  useEffect(() => { try { localStorage.setItem("contacts.view", view); } catch { /* ignore */ } }, [view]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Contact | null>(null);

  const all = contacts ?? [];

  const counts = useMemo(() => ({
    total: all.length,
    internal: all.filter((c) => c.type === "internal").length,
    external: all.filter((c) => c.type === "external").length,
    delegations: delegations?.length ?? 0,
    vips: all.filter((c) => c.type === "vip").length,
    embassies: all.filter((c) => c.type === "embassy").length,
    government: all.filter((c) => c.type === "government").length,
    vendor: all.filter((c) => c.type === "vendor").length,
  }), [all, delegations]);

  // Quick-filter tabs (drive the shared typeFilter). Delegations count comes from
  // the delegations list; every other type counts its contacts.
  const typeTabs = useMemo(() => [
    { key: "all", count: all.length },
    { key: "internal", count: counts.internal },
    { key: "external", count: counts.external },
    { key: "delegation", count: counts.delegations },
    { key: "vip", count: counts.vips },
    { key: "government", count: counts.government },
    { key: "vendor", count: counts.vendor },
    { key: "embassy", count: counts.embassies },
  ], [all, counts]);

  const orgs = useMemo(() => [...new Set(all.map((c) => c.organization).filter(Boolean))] as string[], [all]);
  const countries = useMemo(() => [...new Set(all.map((c) => c.countryCode).filter(Boolean))] as string[], [all]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return all.filter((c) => {
      if (typeFilter !== "all" && c.type !== typeFilter) return false;
      if (countryFilter !== "all" && c.countryCode !== countryFilter) return false;
      if (vipFilter !== "all" && c.vipLevel !== vipFilter) return false;
      if (orgFilter !== "all" && c.organization !== orgFilter) return false;
      if (statusFilter !== "all" && c.status !== statusFilter) return false;
      if (!q) return true;
      return [c.nameEn, c.nameAr, c.jobTitle, c.organization, c.organizationAr, c.nationality, c.email, c.mobile]
        .some((v) => v?.toLowerCase().includes(q));
    });
  }, [all, search, typeFilter, countryFilter, vipFilter, orgFilter, statusFilter]);

  const togglePin = (c: Contact) => {
    updateContact.mutate(
      { id: c.id, data: { type: c.type, nameEn: c.nameEn, pinned: !c.pinned } },
      { onSuccess: () => qc.invalidateQueries({ queryKey: getListContactsQueryKey() }) },
    );
  };

  const openAdd = () => { setEditing(null); setFormOpen(true); };
  const openEdit = (c: Contact) => { setSelectedId(null); setEditing(c); setFormOpen(true); };

  const exportCsv = () => {
    const cols = ["nameEn", "nameAr", "type", "organization", "jobTitle", "nationality", "email", "mobile"] as const;
    const rows = [cols.join(",")].concat(
      filtered.map((c) => cols.map((k) => `"${String((c as unknown as Record<string, unknown>)[k] ?? "").replace(/"/g, '""')}"`).join(",")),
    );
    const blob = new Blob(["﻿" + rows.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "contacts.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  const onImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) toast({ title: t("contacts.import"), description: e.target.files[0].name });
    e.target.value = "";
  };

  const align = dir === "rtl" ? "text-end" : "text-start";

  const viewBtns: { key: View; icon: typeof LayoutGrid; label: string }[] = [
    { key: "executive", icon: LayoutGrid, label: tl(lang, "Executive Cards", "بطاقات تنفيذية") },
    { key: "compact", icon: Rows3, label: tl(lang, "Compact", "مدمجة") },
    { key: "table", icon: Table2, label: tl(lang, "Table", "جدول") },
  ];

  return (
    <Layout>
      <div className="space-y-7 pb-12">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-2">
            <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white transition-all hover:shadow-sm" style={{ background: C.mangrove }}>
              <Plus size={15} strokeWidth={2} /> {t("contacts.add")}
            </button>
            <button onClick={() => importRef.current?.click()} className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium border" style={{ borderColor: C.border }}>
              <Upload size={14} strokeWidth={1.7} /> {t("contacts.import")}
            </button>
            <button onClick={exportCsv} className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium border" style={{ borderColor: C.border }}>
              <Download size={14} strokeWidth={1.7} /> {t("contacts.export")}
            </button>
            <input ref={importRef} type="file" accept=".csv" className="hidden" onChange={onImportFile} />
          </div>
          <div className="text-end">
            <h1 className="text-4xl font-bold text-foreground" style={{ fontFamily: "Georgia, serif" }}>{t("contacts.title")}</h1>
            <p className="text-sm text-muted-foreground mt-1.5">{t("contacts.subtitle")}</p>
          </div>
        </div>

        {/* Section toggle: Directory / Organization Structure */}
        <div className="flex items-center gap-1 rounded-xl border p-1 w-fit" style={{ borderColor: C.border, background: C.cardBg }}>
          {(["directory", "org"] as const).map((m) => (
            <button key={m} onClick={() => setMode(m)} className="px-4 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={mode === m ? { background: C.mangrove, color: "#fff" } : { color: C.warmGray }}>
              {m === "directory" ? t("contacts.orgStructure.directory") : t("contacts.orgStructure.section")}
            </button>
          ))}
        </div>

        {mode === "org" ? (
          <div className="space-y-7">
            <p className="text-sm text-muted-foreground -mt-2">{t("contacts.orgStructure.subtitle")}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {DEPARTMENTS.map((d) => (
                <DepartmentCard key={d.key} dept={d} userCount={all.filter((c) => c.departmentKey === d.key).length} onOpen={setSelectedDept} />
              ))}
            </div>

            {/* Default workflow templates */}
            <div className="space-y-3">
              <div className={align}>
                <h3 className="text-lg font-bold text-foreground" style={{ fontFamily: "Georgia, serif" }}>{t("contacts.templates.title")}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{t("contacts.templates.subtitle")}</p>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {WORKFLOW_TEMPLATES.map((tpl) => (
                  <div key={tpl.key} className="rounded-2xl border p-4" style={{ borderColor: C.border, background: C.cardBg }}>
                    <h4 className="text-sm font-semibold text-foreground mb-2.5" style={{ fontFamily: "Georgia, serif" }}>{t(`contacts.templates.${tpl.key}`)}</h4>
                    <div className="space-y-1.5">
                      {tpl.steps.map((s) => (
                        <div key={s.dept} className="flex items-center justify-between gap-2 text-[11px]">
                          <span className="text-muted-foreground truncate">{t(`contacts.responsibilities.${s.responsibility}`)}</span>
                          <span className="font-medium text-foreground truncate shrink-0">{t(`contacts.departments.${s.dept}`)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
        <>
        {/* Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <SummaryCard label={t("contacts.summary.total")} value={counts.total} accent={C.mangrove} active={typeFilter === "all"} onClick={() => setTypeFilter("all")} />
          <SummaryCard label={t("contacts.summary.internal")} value={counts.internal} accent={TYPE_META.internal.color} active={typeFilter === "internal"} onClick={() => setTypeFilter("internal")} />
          <SummaryCard label={t("contacts.summary.external")} value={counts.external} accent={TYPE_META.external.color} active={typeFilter === "external"} onClick={() => setTypeFilter("external")} />
          <SummaryCard label={t("contacts.summary.delegations")} value={counts.delegations} accent={TYPE_META.delegation.color} active={typeFilter === "delegation"} onClick={() => setTypeFilter("delegation")} />
          <SummaryCard label={t("contacts.summary.vips")} value={counts.vips} accent={TYPE_META.vip.color} active={typeFilter === "vip"} onClick={() => setTypeFilter("vip")} />
          <SummaryCard label={t("contacts.summary.embassies")} value={counts.embassies} accent={TYPE_META.embassy.color} active={typeFilter === "embassy"} onClick={() => setTypeFilter("embassy")} />
        </div>

        {/* Search + filters */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute end-4 top-1/2 -translate-y-1/2 text-muted-foreground/50" size={16} strokeWidth={1.5} />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t("contacts.searchPlaceholder")}
              className="w-full h-11 rounded-2xl border bg-card pe-12 ps-5 text-sm placeholder:text-muted-foreground/40 outline-none focus:ring-1 focus:ring-primary/30" style={{ borderColor: C.border }} />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="h-9 rounded-lg border bg-card px-3 text-xs" style={{ borderColor: C.border }} dir={dir}>
              <option value="all">{t("contacts.filters.type")}: {t("contacts.filters.all")}</option>
              {CONTACT_TYPES.map((x) => <option key={x} value={x}>{t(`contacts.types.${x}`)}</option>)}
            </select>
            <select value={countryFilter} onChange={(e) => setCountryFilter(e.target.value)} className="h-9 rounded-lg border bg-card px-3 text-xs" style={{ borderColor: C.border }} dir={dir}>
              <option value="all">{t("contacts.filters.country")}: {t("contacts.filters.all")}</option>
              {countries.map((x) => <option key={x} value={x}>{x}</option>)}
            </select>
            <select value={vipFilter} onChange={(e) => setVipFilter(e.target.value)} className="h-9 rounded-lg border bg-card px-3 text-xs" style={{ borderColor: C.border }} dir={dir}>
              <option value="all">{t("contacts.filters.vip")}: {t("contacts.filters.all")}</option>
              {VIP_LEVELS.map((x) => <option key={x} value={x}>{t(`contacts.vipLevels.${x}`)}</option>)}
            </select>
            <select value={orgFilter} onChange={(e) => setOrgFilter(e.target.value)} className="h-9 rounded-lg border bg-card px-3 text-xs max-w-[160px]" style={{ borderColor: C.border }} dir={dir}>
              <option value="all">{t("contacts.filters.organization")}: {t("contacts.filters.all")}</option>
              {orgs.map((x) => <option key={x} value={x}>{x}</option>)}
            </select>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-9 rounded-lg border bg-card px-3 text-xs" style={{ borderColor: C.border }} dir={dir}>
              <option value="all">{t("contacts.filters.status")}: {t("contacts.filters.all")}</option>
              {STATUSES.map((x) => <option key={x} value={x}>{t(`contacts.status.${x}`)}</option>)}
            </select>

            <div className="flex items-center gap-1 ms-auto rounded-lg border p-0.5" style={{ borderColor: C.border }}>
              {viewBtns.map((v) => (
                <button key={v.key} onClick={() => setView(v.key)} title={v.label}
                  className="w-8 h-7 rounded-md flex items-center justify-center transition-colors"
                  style={view === v.key ? { background: C.mangrove, color: "#fff" } : { color: C.warmGray }}>
                  <v.icon size={14} strokeWidth={1.7} />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Contact type tabs — primary quick filter (drives the shared typeFilter) */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {typeTabs.map((tab) => {
              const on = typeFilter === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setTypeFilter(tab.key)}
                  className="shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-medium transition-all"
                  style={on
                    ? { background: C.mangrove, color: "#fff", boxShadow: `0 1px 2px ${C.mangrove}55` }
                    : { background: C.cardBg, color: C.warmGray, border: `1px solid ${C.border}` }}
                >
                  {t(`contacts.tabs.${tab.key}`)}
                  <span
                    className="text-[10px] leading-none px-1.5 py-0.5 rounded-full font-semibold"
                    style={on ? { background: "rgba(255,255,255,0.22)" } : { background: C.border, color: C.castleHill }}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
          <p className="text-xs text-muted-foreground px-0.5">
            {typeFilter === "all"
              ? `${all.length} ${t("contacts.resultsCount")}`
              : `${typeFilter === "delegation" ? (delegations?.length ?? 0) : filtered.length} ${t(`contacts.tabs.${typeFilter}`)}`}
          </p>
        </div>

        {/* Body */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-44 rounded-2xl" />)}
          </div>
        ) : typeFilter === "delegation" ? (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {(delegations ?? []).map((d) => <DelegationCard key={d.id} delegation={d} />)}
          </motion.div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border text-center py-20 text-muted-foreground" style={{ borderColor: C.border, background: C.cardBg }}>
            <Users size={36} className="mx-auto mb-3 opacity-15" />
            <p className="text-sm">{search || typeFilter !== "all" ? t("contacts.noResults") : t("contacts.empty")}</p>
          </div>
        ) : (
          <motion.div key={view} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25, ease: "easeOut" }}>
            {view === "executive" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {filtered.map((c) => <ContactCard key={c.id} contact={c} onOpen={(x) => setSelectedId(x.id)} onPin={togglePin} />)}
              </div>
            )}
            {view === "compact" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2.5">
                {filtered.map((c) => <CompactCard key={c.id} contact={c} onOpen={(x) => setSelectedId(x.id)} />)}
              </div>
            )}
            {view === "table" && <ContactTable list={filtered} onOpen={(x) => setSelectedId(x.id)} />}
          </motion.div>
        )}
        </>
        )}
      </div>

      <ContactProfileDrawer contactId={selectedId} onClose={() => setSelectedId(null)} onEdit={openEdit} />
      <DepartmentDrawer
        dept={selectedDept}
        members={all.filter((c) => c.type === "internal" && c.departmentKey === selectedDept?.key)}
        onClose={() => setSelectedDept(null)}
        onOpenUser={(id) => { setSelectedDept(null); setSelectedId(id); }}
      />
      {formOpen && <ContactForm open={formOpen} editing={editing} onClose={() => setFormOpen(false)} />}
    </Layout>
  );
}
