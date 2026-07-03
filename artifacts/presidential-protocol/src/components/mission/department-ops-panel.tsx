import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/i18n/language-context";
import { X, Users, Workflow, AlertTriangle, CheckSquare, FileText, Library, ListTree, Bell } from "lucide-react";
import { DEPARTMENT_BY_KEY, type DeptKey } from "@/components/contacts/org-structure";
import { buildDepartmentDetail, type Bi, type Mission } from "@/lib/mission";
import { ExecutiveAvatar } from "@/components/identity";
import { departmentHead, type Presence } from "@/lib/identity";
import { C, Pill, STATUS_COLOR } from "./panel";

const toPresence = (a: string): Presence => (a === "available" ? "available" : a === "busy" ? "busy" : "leave");

function Section({ icon: Icon, title, children }: { icon: typeof Users; title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="flex items-center gap-1.5 text-[11px] font-medium mb-1.5" style={{ color: C.castleHill }}>
        <Icon size={12} strokeWidth={1.7} /> {title}
      </p>
      {children}
    </div>
  );
}

export function DepartmentOpsPanel({ mission, deptKey, onClose }: {
  mission: Mission; deptKey: string | null; onClose: () => void;
}) {
  const { t } = useTranslation();
  const { lang, dir } = useLanguage();
  const L = (x: Bi) => (lang === "en" ? x.en : x.ar);
  if (!deptKey) return null;
  const d = buildDepartmentDetail(mission, deptKey as DeptKey);
  if (!d) return null;
  const dept = DEPARTMENT_BY_KEY[d.deptKey];
  const Icon = dept?.icon ?? Users;
  const ring = 2 * Math.PI * 20;

  return createPortal(
    <div className="fixed inset-0 z-[100]">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />
      <motion.aside dir={dir} initial={{ x: "100%" }} animate={{ x: 0 }} transition={{ type: "tween", duration: 0.28 }}
        className="absolute w-full max-w-md overflow-y-auto shadow-2xl"
        style={{ background: C.pageBg, top: 0, bottom: 0, right: dir === "rtl" ? "4rem" : 0 }}>
        {/* Header */}
        <div className="relative p-5 pb-4 border-b" style={{ borderColor: C.border, background: `linear-gradient(160deg, ${(dept?.color ?? C.mangrove)}14, ${C.pageBg})` }}>
          <button onClick={onClose} className="absolute top-4 end-4 w-8 h-8 rounded-lg flex items-center justify-center hover:bg-black/5 text-muted-foreground"><X size={18} /></button>
          <div className="flex items-center gap-3">
            <span className="relative inline-flex items-center justify-center" style={{ width: 48, height: 48 }}>
              <svg width="48" height="48" className="absolute inset-0 -rotate-90">
                <circle cx="24" cy="24" r="20" fill="none" stroke={C.border} strokeWidth="4" />
                <circle cx="24" cy="24" r="20" fill="none" stroke={dept?.color ?? C.mangrove} strokeWidth="4" strokeLinecap="round" strokeDasharray={ring} strokeDashoffset={ring * (1 - d.readiness / 100)} />
              </svg>
              <Icon size={18} strokeWidth={1.7} style={{ color: dept?.color ?? C.mangrove }} />
            </span>
            <ExecutiveAvatar identity={departmentHead(d.deptKey) ?? { name: d.head.en, nameAr: d.head.ar, department: d.deptKey }} size="md" ring />
            <div>
              <h2 className="text-lg font-bold text-foreground" style={{ fontFamily: "Georgia, serif" }}>{t(`contacts.departments.${d.deptKey}`)}</h2>
              <p className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
                {t("missionEngine.head")}: {L(d.head)} · <Pill label={t(`missionEngine.status.${d.status}`)} color={STATUS_COLOR[d.status] ?? C.warmGray} soft /> · {d.readiness}%
              </p>
            </div>
          </div>
        </div>

        <div className="p-5 space-y-4">
          <Section icon={Users} title={t("missionEngine.deptPanel.employees")}>
            <div className="space-y-1.5">
              {d.employees.map((e, i) => (
                <div key={i} className="flex items-center gap-2.5 rounded-lg border px-2.5 py-1.5" style={{ borderColor: C.border }}>
                  <ExecutiveAvatar identity={{ name: e.name.en, nameAr: e.name.ar, department: d.deptKey, presence: toPresence(e.availability) }} size="sm" />
                  <div className="flex-1 min-w-0"><p className="text-xs font-medium text-foreground truncate">{L(e.name)}</p><p className="text-[10px] text-muted-foreground truncate">{L(e.role)}</p></div>
                  <span className="flex items-center gap-1 text-[10px] shrink-0" style={{ color: e.availability === "available" ? C.mangrove : C.sunset }}>
                    <span className="w-2 h-2 rounded-full" style={{ background: e.availability === "available" ? C.mangrove : C.sunset }} />
                    {t(`missionEngine.deptPanel.${e.availability}`)}
                  </span>
                </div>
              ))}
            </div>
          </Section>

          <Section icon={ListTree} title={t("missionEngine.deptPanel.subOperations")}>
            <ul className="space-y-1">{d.subOperations.map((s, i) => <li key={i} className="text-[11px] text-muted-foreground flex gap-1.5"><span style={{ color: dept?.color }}>•</span>{L(s)}</li>)}</ul>
          </Section>

          {d.dependencies.length > 0 && (
            <Section icon={Workflow} title={t("missionEngine.deptPanel.dependencies")}>
              <div className="space-y-1">
                {d.dependencies.map((r) => (
                  <div key={r.id} className="text-[11px] flex items-center gap-1.5">
                    <Pill label={t(`missionEngine.status.${r.status}`)} color={STATUS_COLOR[r.status] ?? C.warmGray} soft />
                    <span className="text-foreground">{t(`contacts.departments.${r.source}`)} → {t(`contacts.departments.${r.target}`)}</span>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {d.risks.length > 0 && (
            <Section icon={AlertTriangle} title={t("missionEngine.deptPanel.risks")}>
              <ul className="space-y-1">{d.risks.map((r, i) => <li key={i} className="text-[11px] text-foreground flex gap-1.5"><span style={{ color: C.error }}>•</span>{L(r.label)}</li>)}</ul>
            </Section>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Section icon={CheckSquare} title={t("missionEngine.deptPanel.approvals")}>
              <ul className="space-y-1">{d.approvals.map((a, i) => <li key={i} className="text-[11px] text-muted-foreground">{L(a)}</li>)}</ul>
            </Section>
            <Section icon={FileText} title={t("missionEngine.deptPanel.documents")}>
              <ul className="space-y-1">{d.documents.map((a, i) => <li key={i} className="text-[11px] text-muted-foreground">{L(a)}</li>)}</ul>
            </Section>
          </div>

          <Section icon={Library} title={t("missionEngine.deptPanel.playbook")}>
            <div className="flex flex-wrap gap-1.5">{d.playbook.map((p, i) => <span key={i} className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: (dept?.color ?? C.mangrove) + "12", color: dept?.color ?? C.mangrove }}>{L(p)}</span>)}</div>
          </Section>

          <Section icon={Bell} title={t("missionEngine.deptPanel.notifications")}>
            <ul className="space-y-1">{d.notifications.map((nt, i) => <li key={i} className="text-[11px] text-muted-foreground flex gap-1.5"><Bell size={10} className="mt-0.5 shrink-0" style={{ color: C.castleHill }} />{L(nt)}</li>)}</ul>
          </Section>
        </div>
      </motion.aside>
    </div>,
    document.body,
  );
}
