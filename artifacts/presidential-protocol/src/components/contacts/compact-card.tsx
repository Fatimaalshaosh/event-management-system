import { useTranslation } from "react-i18next";
import { useLanguage } from "@/i18n/language-context";
import type { Contact } from "@workspace/api-client-react";
import { CountryFlag } from "@/components/reference/country-flag";
import { Pin } from "lucide-react";
import {
  C, ContactAvatar, nameOf, roleOf, IS_PERSON, accentFor, CARD_SURFACE,
  PRESENCE_META, presenceFor, tl,
} from "./contact-shared";

/**
 * Compact directory card — same design language as the executive card, ~40%
 * denser. Portrait + name + position + department + presence + flag; email and
 * phone live in the ExecutiveAvatar hover card. Built for operational users.
 */
export function CompactCard({ contact, onOpen }: { contact: Contact; onOpen: (c: Contact) => void }) {
  const { t } = useTranslation();
  const { lang } = useLanguage();
  const name = nameOf(contact, lang);
  const role = roleOf(contact, lang);
  const dept = contact.departmentKey ? t(`contacts.departments.${contact.departmentKey}`) : "";
  const accent = accentFor(contact);
  const person = IS_PERSON(contact.type);
  const pm = PRESENCE_META[presenceFor(contact)];

  return (
    <button
      type="button"
      onClick={() => onOpen(contact)}
      className="group relative text-start w-full flex items-center gap-3.5 rounded-[14px] border overflow-hidden ps-4 pe-3.5 py-3 transition-all duration-[250ms] ease-out hover:-translate-y-0.5 hover:shadow-[0_12px_26px_-16px_rgba(28,40,30,0.45)]"
      style={{ borderColor: C.border, background: CARD_SURFACE, boxShadow: "inset 0 1px 0 rgba(255,255,255,0.85)" }}
    >
      <span className="absolute inset-y-0 start-0 w-[3px]" style={{ background: accent + "AA" }} />
      <div className="shrink-0 rounded-full ring-2 ring-white shadow-[0_4px_12px_-5px_rgba(28,40,30,0.5)]" style={{ lineHeight: 0 }}>
        <ContactAvatar contact={contact} size={52} hover />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-semibold text-[14px] text-foreground truncate" style={{ fontFamily: "Georgia, serif" }}>{name}</span>
          {contact.countryCode && <CountryFlag value={contact.countryCode} size={12} />}
          {contact.pinned && <Pin size={11} style={{ color: C.gold, fill: C.gold }} />}
        </div>
        <span className="block text-[11px] text-muted-foreground truncate mt-0.5">
          {role}{role && dept ? " · " : ""}{dept}
        </span>
      </div>
      {person && (
        <span className="shrink-0 inline-flex items-center gap-1.5 text-[10px] font-medium px-2 py-1 rounded-full"
          style={{ background: pm.color + "14", color: pm.color }}>
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: pm.color }} />
          <span className="hidden md:inline">{tl(lang, pm.en, pm.ar)}</span>
        </span>
      )}
    </button>
  );
}
