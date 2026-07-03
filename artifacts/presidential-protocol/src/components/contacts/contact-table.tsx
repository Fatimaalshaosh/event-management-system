import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/i18n/language-context";
import type { Contact } from "@workspace/api-client-react";
import { CountryFlag } from "@/components/reference/country-flag";
import { ChevronUp, ChevronDown, Download, Check } from "lucide-react";
import {
  C, ContactAvatar, TypeBadge, StatusBadge, nameOf, roleOf, orgOf, IS_PERSON,
  PRESENCE_META, presenceFor, tl,
} from "./contact-shared";

type Col = { key: string; en: string; ar: string; sort?: (c: Contact, lang: string) => string; cls?: string };

/**
 * Enterprise data grid for the directory — sortable columns, sticky header,
 * multi-row selection, CSV export of the selection, open profile on row click.
 * Same design language (typography, palette, portraits) as the card views.
 */
export function ContactTable({ list, onOpen }: { list: Contact[]; onOpen: (c: Contact) => void }) {
  const { t } = useTranslation();
  const { lang, dir } = useLanguage();
  const [sortKey, setSortKey] = useState("name");
  const [asc, setAsc] = useState(true);
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const cols: Col[] = [
    { key: "name", en: "Name", ar: "الاسم", sort: (c, l) => nameOf(c, l) },
    { key: "position", en: "Position", ar: "المنصب", sort: (c, l) => roleOf(c, l) },
    { key: "department", en: "Department", ar: "الإدارة", sort: (c) => c.departmentKey ?? "" },
    { key: "organization", en: "Organization", ar: "الجهة", sort: (c, l) => orgOf(c, l) },
    { key: "country", en: "Country", ar: "الدولة", sort: (c) => c.countryCode ?? "", cls: "hidden lg:table-cell" },
    { key: "category", en: "Category", ar: "الفئة", sort: (c) => c.type, cls: "hidden md:table-cell" },
    { key: "status", en: "Status", ar: "الحالة", sort: (c) => presenceFor(c), cls: "hidden md:table-cell" },
    { key: "phone", en: "Phone", ar: "الهاتف", cls: "hidden xl:table-cell" },
    { key: "email", en: "Email", ar: "البريد", cls: "hidden lg:table-cell" },
  ];

  const sorted = useMemo(() => {
    const col = cols.find((c) => c.key === sortKey);
    if (!col?.sort) return list;
    const s = [...list].sort((a, b) => col.sort!(a, lang).localeCompare(col.sort!(b, lang), lang === "ar" ? "ar" : "en"));
    return asc ? s : s.reverse();
  }, [list, sortKey, asc, lang]);

  const allSelected = sorted.length > 0 && sorted.every((c) => selected.has(c.id));
  const toggleAll = () => setSelected(allSelected ? new Set() : new Set(sorted.map((c) => c.id)));
  const toggleOne = (id: number) => setSelected((p) => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const exportSelected = () => {
    const rows = sorted.filter((c) => selected.has(c.id));
    const cells = ["nameEn", "nameAr", "type", "organization", "jobTitle", "nationality", "email", "mobile"] as const;
    const csv = [cells.join(",")].concat(
      rows.map((c) => cells.map((k) => `"${String((c as unknown as Record<string, unknown>)[k] ?? "").replace(/"/g, '""')}"`).join(",")),
    ).join("\n");
    const url = URL.createObjectURL(new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url; a.download = "contacts-selected.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  const sortHead = (col: Col) => col.sort && (
    <button onClick={() => { if (sortKey === col.key) setAsc(!asc); else { setSortKey(col.key); setAsc(true); } }}
      className="inline-flex items-center gap-1 hover:text-foreground transition-colors">
      {tl(lang, col.en, col.ar)}
      {sortKey === col.key && (asc ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}
    </button>
  );

  return (
    <div className="rounded-2xl border overflow-hidden" style={{ borderColor: C.border, background: C.cardBg }}>
      {/* Selection toolbar */}
      {selected.size > 0 && (
        <div className="flex items-center justify-between gap-3 px-4 py-2.5 border-b" style={{ borderColor: C.border, background: C.mangrove + "0A" }}>
          <span className="text-xs font-medium" style={{ color: C.mangrove }}>
            {selected.size} {tl(lang, "selected", "محدد")}
          </span>
          <div className="flex items-center gap-2">
            <button onClick={exportSelected} className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg text-white" style={{ background: C.mangrove }}>
              <Download size={13} /> {tl(lang, "Export", "تصدير")}
            </button>
            <button onClick={() => setSelected(new Set())} className="text-xs text-muted-foreground hover:text-foreground">{tl(lang, "Clear", "مسح")}</button>
          </div>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-start" dir={dir}>
          <thead className="sticky top-0 z-10" style={{ background: C.paperBg ?? "#FCFAF6", boxShadow: "0 2px 10px -6px rgba(28,40,30,0.25)" }}>
            <tr className="text-[11px] font-semibold text-muted-foreground" style={{ borderBottom: `1px solid ${C.border}` }}>
              <th className="w-10 ps-4 py-3">
                <button onClick={toggleAll} className="w-4 h-4 rounded flex items-center justify-center border" style={{ borderColor: allSelected ? C.mangrove : C.borderStrong ?? C.border, background: allSelected ? C.mangrove : "transparent" }}>
                  {allSelected && <Check size={11} className="text-white" />}
                </button>
              </th>
              <th className="w-10 py-3" />
              {cols.map((col) => (
                <th key={col.key} className={`px-3 py-3 text-start whitespace-nowrap ${col.cls ?? ""}`}>{sortHead(col) ?? tl(lang, col.en, col.ar)}</th>
              ))}
              <th className="px-3 py-3 text-end">{tl(lang, "Actions", "إجراءات")}</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((c) => {
              const sel = selected.has(c.id);
              const pm = PRESENCE_META[presenceFor(c)];
              return (
                <tr key={c.id} onClick={() => onOpen(c)}
                  className="cursor-pointer transition-colors hover:bg-muted/40"
                  style={{ borderTop: `1px solid ${C.border}`, background: sel ? C.mangrove + "0C" : undefined, boxShadow: sel ? `inset 3px 0 0 ${C.mangrove}` : undefined }}>
                  <td className="ps-4 py-2.5" onClick={(e) => { e.stopPropagation(); toggleOne(c.id); }}>
                    <span className="w-4 h-4 rounded flex items-center justify-center border" style={{ borderColor: sel ? C.mangrove : C.borderStrong ?? C.border, background: sel ? C.mangrove : "transparent" }}>
                      {sel && <Check size={11} className="text-white" />}
                    </span>
                  </td>
                  <td className="py-2"><div className="rounded-full ring-2 ring-white shadow-sm inline-block" style={{ lineHeight: 0 }}><ContactAvatar contact={c} size={44} hover={false} /></div></td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-medium text-[13px] text-foreground truncate max-w-[180px]" style={{ fontFamily: "Georgia, serif" }}>{nameOf(c, lang)}</span>
                      {c.countryCode && <CountryFlag value={c.countryCode} size={11} />}
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-[12px] text-muted-foreground truncate max-w-[180px]">{roleOf(c, lang)}</td>
                  <td className="px-3 py-2.5 text-[12px] text-muted-foreground truncate max-w-[140px]">{c.departmentKey ? t(`contacts.departments.${c.departmentKey}`) : "—"}</td>
                  <td className="px-3 py-2.5 text-[12px] text-muted-foreground truncate max-w-[160px]">{orgOf(c, lang) || "—"}</td>
                  <td className="px-3 py-2.5 hidden lg:table-cell text-[12px] text-muted-foreground">{c.countryCode || "—"}</td>
                  <td className="px-3 py-2.5 hidden md:table-cell"><TypeBadge type={c.type} /></td>
                  <td className="px-3 py-2.5 hidden md:table-cell">
                    {IS_PERSON(c.type)
                      ? <span className="inline-flex items-center gap-1.5 text-[11px]" style={{ color: pm.color }}><span className="w-1.5 h-1.5 rounded-full" style={{ background: pm.color }} />{tl(lang, pm.en, pm.ar)}</span>
                      : <StatusBadge status={c.status} />}
                  </td>
                  <td className="px-3 py-2.5 hidden xl:table-cell text-[12px] text-muted-foreground" dir="ltr">{c.mobile || "—"}</td>
                  <td className="px-3 py-2.5 hidden lg:table-cell text-[12px] text-muted-foreground truncate max-w-[200px]" dir="ltr">{c.email || "—"}</td>
                  <td className="px-3 py-2.5 text-end whitespace-nowrap">
                    <button onClick={(e) => { e.stopPropagation(); onOpen(c); }} className="text-[11px] font-medium px-2.5 py-1 rounded-md border hover:bg-muted transition-colors" style={{ borderColor: C.border, color: C.mangrove }}>
                      {tl(lang, "Open", "فتح")}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
