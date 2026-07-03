import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/i18n/language-context";
import type { Contact } from "@workspace/api-client-react";
import { X, Users, Workflow, CircleDot, UserCog, ShieldCheck, ListChecks } from "lucide-react";
import { personName, usePeopleVersion } from "@/lib/identity";
import { C, ContactAvatar, nameOf } from "./contact-shared";
import { type Department, templatesForDept, availabilityColor, parseRoles } from "./org-structure";

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border p-4" style={{ borderColor: C.border, background: C.cardBg }}>
      <h4 className="text-xs font-semibold mb-2.5" style={{ color: C.castleHill, fontFamily: "Georgia, serif" }}>{title}</h4>
      {children}
    </div>
  );
}

function Chip({ label, color }: { label: string; color: string }) {
  return (
    <span className="text-[11px] px-2 py-0.5 rounded-full font-medium" style={{ background: color + "16", color }}>
      {label}
    </span>
  );
}

export function DepartmentDrawer({ dept, members, onClose, onOpenUser }: {
  dept: Department | null;
  members: Contact[];
  onClose: () => void;
  onOpenUser: (id: number) => void;
}) {
  const { t } = useTranslation();
  const { lang, dir } = useLanguage();
  usePeopleVersion();
  if (!dept) return null;

  const Icon = dept.icon;
  const head = personName({ name: dept.headEn, nameAr: dept.headAr }, lang);

  return createPortal(
    <div className="fixed inset-0 z-[100]">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />
      <motion.aside
        dir={dir}
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        transition={{ type: "tween", duration: 0.28 }}
        className="absolute w-full max-w-md overflow-y-auto shadow-2xl"
        style={{ background: C.pageBg, top: 0, bottom: 0, right: dir === "rtl" ? "4rem" : 0 }}
      >
        {/* Header */}
        <div className="relative p-6 pb-5" style={{ background: `linear-gradient(160deg, ${dept.color}1F, ${C.pageBg})` }}>
          <button onClick={onClose} className="absolute top-4 end-4 w-8 h-8 rounded-lg flex items-center justify-center hover:bg-black/5 text-muted-foreground">
            <X size={18} />
          </button>
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
              style={{ background: dept.color + "1A", color: dept.color, boxShadow: `inset 0 0 0 1px ${dept.color}33` }}>
              <Icon size={26} strokeWidth={1.5} />
            </div>
            <div className="min-w-0 flex-1 pt-1">
              <h2 className="text-xl font-bold text-foreground" style={{ fontFamily: "Georgia, serif" }}>{t(`contacts.departments.${dept.key}`)}</h2>
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                <UserCog size={12} /> {t("contacts.orgStructure.head")}: {head}
              </p>
            </div>
          </div>
          {/* Metrics */}
          <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5"><Users size={13} /> {members.length} {t("contacts.orgStructure.users")}</span>
            <span className="flex items-center gap-1.5"><Workflow size={13} /> {dept.activeWorkflows}</span>
            <span className="flex items-center gap-1.5"><CircleDot size={13} /> {dept.pendingTasks}</span>
            <span className="ms-auto font-semibold" style={{ color: dept.color }}>{dept.readiness}%</span>
          </div>
        </div>

        <div className="px-6 space-y-3 pb-10">
          {/* Approval role */}
          <Block title={t("contacts.orgStructure.approvalRole")}>
            <div className="flex flex-wrap gap-1.5">
              {dept.roleKeys.map((r) => <Chip key={r} label={t(`contacts.roles.${r}`)} color={dept.color} />)}
            </div>
          </Block>

          {/* Responsibilities */}
          <Block title={t("contacts.orgStructure.responsibilities")}>
            <ul className="space-y-1.5">
              {dept.responsibilities.map((r) => (
                <li key={r} className="flex items-center gap-2 text-xs text-foreground">
                  <ShieldCheck size={13} strokeWidth={1.6} style={{ color: dept.color }} />
                  {t(`contacts.responsibilities.${r}`)}
                </li>
              ))}
            </ul>
          </Block>

          {/* Workflow participation */}
          <Block title={t("contacts.orgStructure.participation")}>
            <div className="flex flex-wrap gap-1.5">
              {templatesForDept(dept.key).map((tpl) => (
                <span key={tpl} className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-medium" style={{ background: C.mangrove + "14", color: C.mangrove }}>
                  <ListChecks size={11} /> {t(`contacts.templates.${tpl}`)}
                </span>
              ))}
            </div>
          </Block>

          {/* Team members */}
          <Block title={`${t("contacts.orgStructure.team")} · ${members.length}`}>
            {members.length === 0 ? (
              <p className="text-[11px] text-muted-foreground italic">{t("contacts.orgStructure.noMembers")}</p>
            ) : (
              <div className="space-y-1">
                {members.map((m) => {
                  const roles = parseRoles(m.workflowRoles);
                  return (
                    <button key={m.id} onClick={() => onOpenUser(m.id)}
                      className="w-full flex items-center gap-2.5 rounded-lg px-2 py-2 text-start transition-colors hover:bg-muted/50">
                      <ContactAvatar contact={m} size={34} />
                      <div className="min-w-0 flex-1">
                        <span className="block text-sm font-medium text-foreground truncate">{nameOf(m, lang)}</span>
                        <span className="block text-[11px] text-muted-foreground truncate">
                          {lang === "en" ? m.jobTitle : (m.jobTitleAr || m.jobTitle)}
                          {roles[0] ? ` · ${t(`contacts.roles.${roles[0]}`, { defaultValue: roles[0] })}` : ""}
                        </span>
                      </div>
                      {m.availability && (
                        <span className="shrink-0 w-2 h-2 rounded-full" title={t(`contacts.availability.${m.availability}`, { defaultValue: m.availability })}
                          style={{ background: availabilityColor[m.availability] ?? C.warmGray }} />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </Block>
        </div>
      </motion.aside>
    </div>,
    document.body,
  );
}
