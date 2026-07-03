import { useTranslation } from "react-i18next";
import { useLanguage } from "@/i18n/language-context";
import type { Contact } from "@workspace/api-client-react";
import { CountryFlag } from "@/components/reference/country-flag";
import { Mail, Phone, MessageCircle, Pin, Languages, ShieldCheck, ClipboardList } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  C, ContactAvatar, TypeBadge, StatusBadge, VipBadge, nameOf, roleOf, orgOf,
  IS_PERSON, accentFor, coverToneFor, coverGradient, CARD_SURFACE, PresenceChip, presenceFor, rankFor, tl,
} from "./contact-shared";

function ActionIcon({ label, href, onClick, children }: {
  label: string; href?: string; onClick?: (e: React.MouseEvent) => void; children: React.ReactNode;
}) {
  const cls = "w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-muted text-muted-foreground hover:text-foreground";
  const stop = (e: React.MouseEvent) => e.stopPropagation();
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {href ? (
          <a href={href} onClick={stop} target="_blank" rel="noreferrer" className={cls}>{children}</a>
        ) : (
          <button type="button" onClick={(e) => { stop(e); onClick?.(e); }} className={cls}>{children}</button>
        )}
      </TooltipTrigger>
      <TooltipContent className="text-xs">{label}</TooltipContent>
    </Tooltip>
  );
}

/** A subtle muted metadata chip — shown only when the data exists. */
function MetaChip({ icon: Icon, children }: { icon: typeof Languages; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[10.5px] text-muted-foreground/90 px-2 py-0.5 rounded-md"
      style={{ background: C.warmGray + "12" }}>
      <Icon size={11} strokeWidth={1.6} className="opacity-70" />
      <span className="truncate max-w-[120px]">{children}</span>
    </span>
  );
}

/**
 * Executive contact card — premium, calm, hierarchy-first. Preserves all
 * existing behaviour (open profile, pin, quick actions, ExecutiveAvatar hover
 * card + presence) while elevating the presentation.
 */
export function ContactCard({ contact, onOpen, onPin }: {
  contact: Contact;
  onOpen: (c: Contact) => void;
  onPin: (c: Contact) => void;
}) {
  const { t } = useTranslation();
  const { lang } = useLanguage();
  const isVip = contact.type === "vip";
  const person = IS_PERSON(contact.type);
  const name = nameOf(contact, lang);
  const role = roleOf(contact, lang);
  const org = orgOf(contact, lang);
  const dept = contact.departmentKey ? t(`contacts.departments.${contact.departmentKey}`) : "";
  const accent = accentFor(contact);
  const tone = coverToneFor(contact);
  const rank = rankFor(contact);
  const nameSize = rank >= 4 ? "text-[18px]" : rank === 3 ? "text-[17px]" : "text-[16px]";

  return (
    <button
      type="button"
      onClick={() => onOpen(contact)}
      className="group relative text-start w-full rounded-[18px] border overflow-hidden transition-all duration-[250ms] ease-out hover:-translate-y-1 hover:shadow-[0_20px_44px_-22px_rgba(28,40,30,0.42)]"
      style={{ borderColor: isVip ? C.gold + "55" : C.border, background: CARD_SURFACE, boxShadow: "inset 0 1px 0 rgba(255,255,255,0.85), 0 1px 2px rgba(28,40,30,0.04)" }}
    >
      {/* Accent edge cue (small, never the whole card) */}
      <span className="absolute inset-y-0 start-0 w-[3px]" style={{ background: accent + "AA" }} />

      {/* Executive cover — role-toned, subtly brightens on hover */}
      <div className="h-[56px] w-full transition-[filter] duration-[250ms] group-hover:brightness-[1.04]" style={{ background: coverGradient(tone) }} />

      {contact.pinned && (
        <Pin size={13} className="absolute top-3 end-3.5" style={{ color: C.gold, fill: C.gold }} />
      )}

      <div className="px-5 pb-5">
        {/* Executive header — portrait overlaps the cover */}
        <div className="flex items-end gap-3.5 -mt-9">
          <div className="shrink-0 rounded-full ring-[3px] ring-white shadow-[0_6px_16px_-6px_rgba(28,40,30,0.5)]" style={{ lineHeight: 0 }}>
            <ContactAvatar contact={contact} size={72} />
          </div>
          <div className="min-w-0 flex-1 pb-1">
            <div className="flex items-center gap-2 min-w-0">
              <h3 className={`${nameSize} font-bold text-foreground truncate leading-tight`} style={{ fontFamily: "Georgia, serif" }}>{name}</h3>
              {contact.countryCode && <CountryFlag value={contact.countryCode} size={14} />}
            </div>
            {role && <p className="text-[13px] font-medium text-foreground/70 mt-1 truncate">{role}</p>}
            {(dept || org) && <p className="text-[11px] text-muted-foreground/70 mt-0.5 truncate">{dept || org}</p>}
          </div>
        </div>

        {/* Presence + badges */}
        <div className="flex flex-wrap items-center gap-1.5 mt-3.5">
          {person && <PresenceChip state={presenceFor(contact)} lang={lang} />}
          <TypeBadge type={contact.type} />
          {isVip && contact.vipLevel && <VipBadge level={contact.vipLevel} />}
          <StatusBadge status={contact.status} />
        </div>

        {/* Smart metadata — only when data exists */}
        {(contact.preferredLanguage || contact.securityClearance || contact.activeTasks != null) && (
          <div className="flex flex-wrap items-center gap-1.5 mt-2">
            {contact.preferredLanguage && (
              <MetaChip icon={Languages}>{tl(lang, "Lang", "اللغة")}: {String(contact.preferredLanguage).toUpperCase()}</MetaChip>
            )}
            {contact.securityClearance && (
              <MetaChip icon={ShieldCheck}>{tl(lang, "Clearance", "التصريح")}: {contact.securityClearance}</MetaChip>
            )}
            {contact.activeTasks != null && (
              <MetaChip icon={ClipboardList}>{tl(lang, "Active", "المهام")}: {contact.activeTasks}{contact.taskCapacity ? `/${contact.taskCapacity}` : ""}</MetaChip>
            )}
          </div>
        )}

        {/* Elegant divider */}
        <div className="my-4 h-px" style={{ background: `linear-gradient(90deg, transparent, ${C.border}, transparent)` }} />

        {/* Contact information */}
        {(contact.email || contact.mobile) ? (
          <div className="space-y-2">
            {contact.email && (
              <p className="flex items-center gap-2.5 text-[11.5px] text-muted-foreground truncate">
                <Mail size={13} strokeWidth={1.5} className="shrink-0 opacity-55" />
                <span dir="ltr" className="truncate">{contact.email}</span>
              </p>
            )}
            {contact.mobile && (
              <p className="flex items-center gap-2.5 text-[11.5px] text-muted-foreground truncate">
                <Phone size={13} strokeWidth={1.5} className="shrink-0 opacity-55" />
                <span dir="ltr" className="truncate">{contact.mobile}</span>
              </p>
            )}
          </div>
        ) : (
          <p className="text-[11.5px] text-muted-foreground/50">{org || tl(lang, "—", "—")}</p>
        )}

        {/* Actions */}
        <div className="mt-3.5 flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
          {contact.email && <ActionIcon label={t("contacts.actions.email")} href={`mailto:${contact.email}`}><Mail size={15} strokeWidth={1.6} /></ActionIcon>}
          {contact.mobile && <ActionIcon label={t("contacts.actions.call")} href={`tel:${contact.mobile}`}><Phone size={15} strokeWidth={1.6} /></ActionIcon>}
          {(contact.whatsapp || contact.mobile) && (
            <ActionIcon label={t("contacts.actions.whatsapp")} href={`https://wa.me/${(contact.whatsapp || contact.mobile || "").replace(/[^\d]/g, "")}`}>
              <MessageCircle size={15} strokeWidth={1.6} />
            </ActionIcon>
          )}
          <ActionIcon label={t("contacts.actions.pin")} onClick={() => onPin(contact)}>
            <Pin size={15} strokeWidth={1.6} style={contact.pinned ? { color: C.gold, fill: C.gold } : undefined} />
          </ActionIcon>
        </div>
      </div>
    </button>
  );
}
