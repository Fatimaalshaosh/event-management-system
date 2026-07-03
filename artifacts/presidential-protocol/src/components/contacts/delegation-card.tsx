import { useTranslation } from "react-i18next";
import { useLanguage } from "@/i18n/language-context";
import type { Delegation } from "@workspace/api-client-react";
import { CountryFlag } from "@/components/reference/country-flag";
import { Users, UserCheck, CalendarDays } from "lucide-react";
import { C } from "./contact-shared";

const READINESS: Record<string, { bg: string; color: string }> = {
  planning:   { bg: C.warmGray + "22", color: C.warmGray },
  inProgress: { bg: C.sunset + "44",   color: C.mediumWood },
  ready:      { bg: C.mangrove + "1A", color: C.mangrove },
};

export function DelegationCard({ delegation: d }: { delegation: Delegation }) {
  const { t } = useTranslation();
  const { lang } = useLanguage();
  const name = lang === "en" ? (d.name || d.nameAr) : (d.nameAr || d.name);
  const head = lang === "en" ? (d.headName || d.headNameAr) : (d.headNameAr || d.headName);
  const r = READINESS[d.readinessStatus] ?? READINESS.planning;

  return (
    <div className="rounded-2xl border p-5" style={{ borderColor: C.border, background: `linear-gradient(180deg, ${C.mediumWood}0D, ${C.cardBg} 55%)` }}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            {d.countryCode && <CountryFlag value={d.countryCode} size={16} />}
            <h3 className="font-semibold text-foreground truncate" style={{ fontFamily: "Georgia, serif" }}>{name}</h3>
          </div>
          {head && (
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1.5">
              <UserCheck size={12} strokeWidth={1.6} /> {t("contacts.delegation.head")}: {head}
            </p>
          )}
        </div>
        <span className="text-[11px] px-2 py-0.5 rounded-full font-medium shrink-0" style={{ background: r.bg, color: r.color }}>
          {t(`contacts.delegation.${d.readinessStatus}`, { defaultValue: d.readinessStatus })}
        </span>
      </div>

      <div className="flex items-center gap-4 mt-4 pt-3 border-t text-xs text-muted-foreground" style={{ borderColor: C.border }}>
        <span className="flex items-center gap-1.5"><Users size={13} strokeWidth={1.6} /> {d.memberCount ?? 0} {t("contacts.members")}</span>
        {d.eventId != null && (
          <span className="flex items-center gap-1.5"><CalendarDays size={13} strokeWidth={1.6} /> {t("contacts.delegation.linkedEvent")} #{d.eventId}</span>
        )}
      </div>
    </div>
  );
}
