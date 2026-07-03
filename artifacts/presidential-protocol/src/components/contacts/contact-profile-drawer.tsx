import { useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/i18n/language-context";
import { useQueryClient } from "@tanstack/react-query";
import {
  useGetContact,
  useAddContactNote,
  getGetContactQueryKey,
  type Contact,
} from "@workspace/api-client-react";
import { CountryFlag } from "@/components/reference/country-flag";
import { ProfileRow } from "@/components/shared/primitives";
import { useToast } from "@/hooks/use-toast";
import {
  X, Pencil, Mail, Phone, MessageCircle, CalendarPlus, Users, ListChecks,
  User, Globe, Languages, BadgeCheck, IdCard, Building2, Briefcase, Network,
  Crown, ShieldCheck, Armchair, Gift, Utensils, Accessibility, BookOpen, FileText, StickyNote, Plus, Layers,
} from "lucide-react";
import { C, ContactAvatar, TypeBadge, StatusBadge, VipBadge, nameOf } from "./contact-shared";
import { parseRoles, availabilityColor } from "./org-structure";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border p-4" style={{ borderColor: C.border, background: C.cardBg }}>
      <h4 className="text-xs font-semibold mb-2" style={{ color: C.castleHill, fontFamily: "Georgia, serif" }}>{title}</h4>
      <div>{children}</div>
    </div>
  );
}

export function ContactProfileDrawer({ contactId, onClose, onEdit }: {
  contactId: number | null;
  onClose: () => void;
  onEdit: (c: Contact) => void;
}) {
  const { t } = useTranslation();
  const { lang, dir } = useLanguage();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [note, setNote] = useState("");

  const { data: contact } = useGetContact(contactId ?? 0, {
    query: { enabled: contactId != null, queryKey: getGetContactQueryKey(contactId ?? 0) },
  });
  const addNote = useAddContactNote();

  if (contactId == null) return null;

  const vip = (v?: string | null) => (v ? t(`contacts.vipLevels.${v}`, { defaultValue: v }) : null);

  const submitNote = () => {
    if (!note.trim() || !contact) return;
    addNote.mutate(
      { id: contact.id, data: { body: note.trim(), author: "Protocol Office" } },
      {
        onSuccess: () => {
          qc.invalidateQueries({ queryKey: getGetContactQueryKey(contact.id) });
          setNote("");
        },
      },
    );
  };

  const ack = (key: string) => toast({ title: t(key) });

  return createPortal(
    <div className="fixed inset-0 z-[100]">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />
      <motion.aside
        dir={dir}
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        transition={{ type: "tween", duration: 0.28 }}
        className="absolute w-full max-w-md overflow-y-auto shadow-2xl"
        /* Always anchored to the right. In RTL the sidebar sits on the right, so
           offset by its width (4rem) to keep the panel within the content area. */
        style={{ background: C.pageBg, top: 0, bottom: 0, right: dir === "rtl" ? "4rem" : 0 }}
      >
        {!contact ? (
          <div className="p-8 text-sm text-muted-foreground">…</div>
        ) : (
          <div className="pb-10">
            {/* Header */}
            <div
              className="relative p-6 pb-5"
              style={{ background: contact.type === "vip" ? `linear-gradient(160deg, ${C.gold}1F, ${C.pageBg})` : `linear-gradient(160deg, ${C.mangrove}10, ${C.pageBg})` }}
            >
              <button onClick={onClose} className="absolute top-4 end-4 w-8 h-8 rounded-lg flex items-center justify-center hover:bg-black/5 text-muted-foreground">
                <X size={18} />
              </button>
              <div className="flex items-start gap-4">
                <ContactAvatar contact={contact} size={64} />
                <div className="min-w-0 flex-1 pt-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-foreground truncate" style={{ fontFamily: "Georgia, serif" }}>{nameOf(contact, lang)}</h2>
                    {contact.countryCode && <CountryFlag value={contact.countryCode} size={16} />}
                  </div>
                  {(contact.protocolTitle || contact.jobTitle) && (
                    <p className="text-sm text-muted-foreground mt-0.5 truncate">
                      {lang === "en" ? (contact.protocolTitle || contact.jobTitle) : (contact.protocolTitleAr || contact.jobTitleAr || contact.protocolTitle || contact.jobTitle)}
                    </p>
                  )}
                  <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                    <TypeBadge type={contact.type} />
                    {contact.vipLevel && <VipBadge level={contact.vipLevel} />}
                    <StatusBadge status={contact.status} />
                  </div>
                </div>
              </div>

              {/* Primary actions */}
              <div className="flex flex-wrap gap-2 mt-5">
                <button onClick={() => onEdit(contact)} className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg text-white" style={{ background: C.mangrove }}>
                  <Pencil size={13} /> {t("contacts.actions.edit")}
                </button>
                {contact.email && <a href={`mailto:${contact.email}`} className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg border" style={{ borderColor: C.border }}><Mail size={13} /> {t("contacts.actions.email")}</a>}
                {contact.mobile && <a href={`tel:${contact.mobile}`} className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg border" style={{ borderColor: C.border }}><Phone size={13} /> {t("contacts.actions.call")}</a>}
                {(contact.whatsapp || contact.mobile) && <a href={`https://wa.me/${(contact.whatsapp || contact.mobile || "").replace(/[^\d]/g, "")}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg border" style={{ borderColor: C.border }}><MessageCircle size={13} /> {t("contacts.actions.whatsapp")}</a>}
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                <button onClick={() => ack("contacts.actions.addToEvent")} className="flex items-center gap-1.5 text-[11px] px-2.5 py-1.5 rounded-lg border text-muted-foreground hover:text-foreground" style={{ borderColor: C.border }}><CalendarPlus size={12} /> {t("contacts.actions.addToEvent")}</button>
                <button onClick={() => ack("contacts.actions.addToDelegation")} className="flex items-center gap-1.5 text-[11px] px-2.5 py-1.5 rounded-lg border text-muted-foreground hover:text-foreground" style={{ borderColor: C.border }}><Users size={12} /> {t("contacts.actions.addToDelegation")}</button>
                <button onClick={() => ack("contacts.actions.assignTask")} className="flex items-center gap-1.5 text-[11px] px-2.5 py-1.5 rounded-lg border text-muted-foreground hover:text-foreground" style={{ borderColor: C.border }}><ListChecks size={12} /> {t("contacts.actions.assignTask")}</button>
              </div>
            </div>

            <div className="px-6 space-y-3">
              {/* Personal */}
              <Section title={t("contacts.profile.personal")}>
                <ProfileRow icon={User} label={t("contacts.profile.nameEn")} value={contact.nameEn} ltr />
                <ProfileRow icon={User} label={t("contacts.profile.nameAr")} value={contact.nameAr} />
                <ProfileRow icon={Globe} label={t("contacts.profile.nationality")} value={contact.nationality} />
                <ProfileRow icon={User} label={t("contacts.profile.gender")} value={contact.gender} />
                <ProfileRow icon={Languages} label={t("contacts.profile.preferredLanguage")} value={contact.preferredLanguage} />
                <ProfileRow icon={BadgeCheck} label={t("contacts.profile.protocolTitle")} value={lang === "en" ? contact.protocolTitle : (contact.protocolTitleAr || contact.protocolTitle)} />
                <ProfileRow icon={BadgeCheck} label={t("contacts.profile.salutation")} value={contact.salutation} />
                <ProfileRow icon={IdCard} label={t("contacts.profile.passport")} value={contact.passportNumber} ltr mono />
                <ProfileRow icon={IdCard} label={t("contacts.profile.emiratesId")} value={contact.emiratesId} ltr mono />
              </Section>

              {/* Work */}
              <Section title={t("contacts.profile.work")}>
                <ProfileRow icon={Building2} label={t("contacts.profile.organization")} value={lang === "en" ? contact.organization : (contact.organizationAr || contact.organization)} />
                <ProfileRow icon={Network} label={t("contacts.profile.department")} value={contact.department} />
                <ProfileRow icon={Briefcase} label={t("contacts.profile.jobTitle")} value={lang === "en" ? contact.jobTitle : (contact.jobTitleAr || contact.jobTitle)} />
                <ProfileRow icon={BadgeCheck} label={t("contacts.profile.roleInProtocol")} value={contact.roleInProtocol} />
                <ProfileRow icon={BadgeCheck} label={t("contacts.profile.classification")} value={contact.classification} />
                <ProfileRow icon={Network} label={t("contacts.profile.reportingLine")} value={contact.reportingLine} />
              </Section>

              {/* Contact */}
              <Section title={t("contacts.profile.contact")}>
                <ProfileRow icon={Mail} label={t("contacts.profile.email")} value={contact.email} ltr />
                <ProfileRow icon={Phone} label={t("contacts.profile.mobile")} value={contact.mobile} ltr />
                <ProfileRow icon={Phone} label={t("contacts.profile.office")} value={contact.officeNumber} ltr />
                <ProfileRow icon={MessageCircle} label={t("contacts.profile.whatsapp")} value={contact.whatsapp} ltr />
                <ProfileRow icon={User} label={t("contacts.profile.assistant")} value={contact.assistantContact} ltr />
              </Section>

              {/* Protocol */}
              {(contact.vipLevel || contact.securityClearance || contact.seatingPreference || contact.giftPreference || contact.culturalNotes || contact.dietaryRequirements || contact.specialRequirements || contact.accessibilityRequirements) && (
                <Section title={t("contacts.profile.protocol")}>
                  <ProfileRow icon={Crown} label={t("contacts.profile.vipLevel")} value={vip(contact.vipLevel)} />
                  <ProfileRow icon={Crown} label={t("contacts.profile.protocolRank")} value={contact.protocolRank} />
                  <ProfileRow icon={ShieldCheck} label={t("contacts.profile.securityClearance")} value={contact.securityClearance} />
                  <ProfileRow icon={Users} label={t("contacts.profile.delegationRole")} value={contact.delegationRole} />
                  <ProfileRow icon={Armchair} label={t("contacts.profile.seating")} value={contact.seatingPreference} />
                  <ProfileRow icon={Gift} label={t("contacts.profile.gift")} value={contact.giftPreference} />
                  <ProfileRow icon={Utensils} label={t("contacts.profile.dietary")} value={contact.dietaryRequirements} />
                  <ProfileRow icon={ShieldCheck} label={t("contacts.profile.special")} value={contact.specialRequirements} />
                  <ProfileRow icon={Accessibility} label={t("contacts.profile.accessibility")} value={contact.accessibilityRequirements} />
                  <ProfileRow icon={BookOpen} label={t("contacts.profile.cultural")} value={contact.culturalNotes} />
                </Section>
              )}

              {/* Workflow (internal users) */}
              {contact.type === "internal" && (
                <Section title={t("contacts.workflow.title")}>
                  {contact.departmentKey && (
                    <ProfileRow icon={Building2} label={t("contacts.workflow.department")}
                      value={t(`contacts.departments.${contact.departmentKey}`, { defaultValue: contact.department ?? "" })} />
                  )}
                  {parseRoles(contact.workflowRoles).length > 0 && (
                    <div className="py-2 border-t flex items-start justify-between gap-2" style={{ borderColor: C.border }}>
                      <div className="flex flex-wrap gap-1 justify-end flex-1">
                        {parseRoles(contact.workflowRoles).map((r) => (
                          <span key={r} className="text-[10px] px-1.5 py-0.5 rounded-full font-medium" style={{ background: C.mangrove + "14", color: C.mangrove }}>
                            {t(`contacts.roles.${r}`, { defaultValue: r })}
                          </span>
                        ))}
                      </div>
                      <span className="flex items-center gap-1.5 text-[11px] font-medium shrink-0" style={{ color: C.castleHill }}>
                        {t("contacts.workflow.roles")}<Layers size={12} strokeWidth={1.5} />
                      </span>
                    </div>
                  )}
                  <ProfileRow icon={ShieldCheck} label={t("contacts.workflow.permissionLevel")}
                    value={contact.permissionLevel ? t(`contacts.permission.${contact.permissionLevel}`, { defaultValue: contact.permissionLevel }) : null} />
                  <ProfileRow icon={BadgeCheck} label={t("contacts.workflow.approvalAuthority")} value={contact.approvalAuthority} />
                  {contact.availability && (
                    <div className="py-1.5 border-t flex items-center justify-between" style={{ borderColor: C.border }}>
                      <span className="flex items-center gap-1.5 text-xs text-foreground">
                        <span className="w-2 h-2 rounded-full" style={{ background: availabilityColor[contact.availability] ?? C.warmGray }} />
                        {t(`contacts.availability.${contact.availability}`, { defaultValue: contact.availability })}
                      </span>
                      <span className="text-[11px] font-medium" style={{ color: C.castleHill }}>{t("contacts.workflow.availability")}</span>
                    </div>
                  )}
                  {contact.taskCapacity != null && (
                    <div className="py-2 border-t" style={{ borderColor: C.border }}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-foreground">{contact.activeTasks ?? 0} / {contact.taskCapacity} {t("contacts.workflow.tasks")}</span>
                        <span className="text-[11px] font-medium" style={{ color: C.castleHill }}>{t("contacts.workflow.workload")}</span>
                      </div>
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: C.border }}>
                        <div className="h-full rounded-full" style={{
                          width: `${Math.min(100, ((contact.activeTasks ?? 0) / Math.max(1, contact.taskCapacity)) * 100)}%`,
                          background: (contact.activeTasks ?? 0) / Math.max(1, contact.taskCapacity) > 0.85 ? C.sunset : C.mangrove,
                        }} />
                      </div>
                    </div>
                  )}
                  {parseRoles(contact.skills).length > 0 && (
                    <div className="py-2 border-t flex items-start justify-between gap-2" style={{ borderColor: C.border }}>
                      <div className="flex flex-wrap gap-1 justify-end flex-1">
                        {parseRoles(contact.skills).map((s) => (
                          <span key={s} className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: C.border, color: C.castleHill }}>{s}</span>
                        ))}
                      </div>
                      <span className="text-[11px] font-medium shrink-0" style={{ color: C.castleHill }}>{t("contacts.workflow.skills")}</span>
                    </div>
                  )}
                  <ProfileRow icon={Phone} label={t("contacts.workflow.extension")} value={contact.extension} ltr />
                  <ProfileRow icon={ListChecks} label={t("contacts.workflow.responsibilities")} value={contact.eventResponsibilities} />
                </Section>
              )}

              {/* History & links */}
              <Section title={t("contacts.profile.history")}>
                {contact.eventLinks && contact.eventLinks.length > 0 ? (
                  <div className="space-y-1.5 mb-2">
                    {contact.eventLinks.map((l) => (
                      <div key={l.id} className="flex items-center justify-between text-xs py-1 border-t first:border-t-0" style={{ borderColor: C.border }}>
                        <span className="text-muted-foreground">{l.rsvpStatus ?? ""}</span>
                        <span className="flex items-center gap-1.5"><CalendarPlus size={12} /> {t("contacts.profile.events")} #{l.eventId} · {l.role}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-muted-foreground italic mb-2">{t("contacts.profile.noHistory")}</p>
                )}

                {/* Notes */}
                <div className="border-t pt-2" style={{ borderColor: C.border }}>
                  <div className="flex items-center gap-1.5 text-[11px] font-medium mb-1.5" style={{ color: C.castleHill }}>
                    <StickyNote size={12} /> {t("contacts.profile.notes")}
                  </div>
                  {contact.notes?.map((n) => (
                    <div key={n.id} className="text-xs text-foreground bg-muted/40 rounded-lg px-3 py-2 mb-1.5">
                      {n.body}
                      {n.author && <span className="block text-[10px] text-muted-foreground mt-1">— {n.author}</span>}
                    </div>
                  ))}
                  <div className="flex gap-2 mt-1.5">
                    <input
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") submitNote(); }}
                      placeholder={t("contacts.profile.addNote")}
                      className="flex-1 h-9 rounded-lg border bg-card px-3 text-xs outline-none focus:ring-1 focus:ring-primary/30"
                      style={{ borderColor: C.border }}
                    />
                    <button onClick={submitNote} disabled={!note.trim()} className="w-9 h-9 rounded-lg flex items-center justify-center text-white disabled:opacity-40" style={{ background: C.mangrove }}>
                      <Plus size={15} />
                    </button>
                  </div>
                </div>
              </Section>

              {/* Documents (placeholders) */}
              <Section title={t("contacts.profile.documents")}>
                {contact.documents && contact.documents.length > 0 ? (
                  contact.documents.map((d) => (
                    <ProfileRow key={d.id} icon={FileText} label={d.kind} value={d.label} />
                  ))
                ) : (
                  <p className="text-[11px] text-muted-foreground italic">{t("contacts.profile.noDocuments")}</p>
                )}
              </Section>
            </div>
          </div>
        )}
      </motion.aside>
    </div>,
    document.body,
  );
}
