import { useTranslation } from "react-i18next";
import { useLanguage } from "@/i18n/language-context";
import { Fingerprint, Check, Minus } from "lucide-react";
import { CountryFlag } from "@/components/reference/country-flag";
import type { Mission, MissionDNA } from "@/lib/mission";
import { C, Panel, Pill, LEVEL_COLOR } from "./panel";

const MEDIA_COLOR: Record<string, string> = { international: C.error, national: C.mediumWood, internal: C.warmGray };

export function MissionDnaPanel({ mission }: { mission: Mission }) {
  const { t } = useTranslation();
  const { lang } = useLanguage();
  const d = mission.dna;
  const L = <T extends { en: string; ar: string }>(x: T) => (lang === "en" ? x.en : x.ar);

  const bools: { k: keyof MissionDNA; label: string }[] = [
    { k: "interpreterRequired", label: t("missionEngine.dnaFields.interpreter") },
    { k: "giftsRequired", label: t("missionEngine.dnaFields.gifts") },
    { k: "fleetRequired", label: t("missionEngine.dnaFields.fleet") },
    { k: "hotelRequired", label: t("missionEngine.dnaFields.hotel") },
    { k: "airportProtocolRequired", label: t("missionEngine.dnaFields.airportProtocol") },
    { k: "culturalConsiderations", label: t("missionEngine.dnaFields.cultural") },
    { k: "previousVisitMemory", label: t("missionEngine.dnaFields.previousMemory") },
    { k: "specialProtocolRules", label: t("missionEngine.dnaFields.specialRules") },
  ];

  return (
    <Panel icon={Fingerprint} title={t("missionEngine.dna")} accent={C.castleHill}
      action={d.countryCode ? <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><CountryFlag value={d.countryCode} size={13} /> {L(d.label)}</span> : <span className="text-xs text-muted-foreground">{L(d.label)}</span>}>
      <div className="flex flex-wrap gap-1.5 mb-3">
        <Pill label={`${t("missionEngine.dnaFields.protocolLevel")}: ${t(`missionEngine.level.${d.protocolLevel}`)}`} color={LEVEL_COLOR[d.protocolLevel]} soft />
        <Pill label={`${t("missionEngine.dnaFields.securityLevel")}: ${t(`missionEngine.level.${d.securityLevel}`)}`} color={LEVEL_COLOR[d.securityLevel]} soft />
        <Pill label={`${t("missionEngine.dnaFields.mediaLevel")}: ${t(`missionEngine.media.${d.mediaLevel}`)}`} color={MEDIA_COLOR[d.mediaLevel]} soft />
        <Pill label={`${t("missionEngine.dnaFields.riskSensitivity")}: ${t(`missionEngine.level.${d.riskSensitivity}`)}`} color={LEVEL_COLOR[d.riskSensitivity]} soft />
        {d.language && <Pill label={`${t("missionEngine.dnaFields.language")}: ${L(d.language)}`} color={C.castleHill} soft />}
      </div>

      <div className="flex flex-wrap gap-1.5 mb-3">
        {bools.map((b) => {
          const on = Boolean(d[b.k]);
          return (
            <span key={String(b.k)} className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full"
              style={{ background: on ? C.mangrove + "14" : C.border, color: on ? C.mangrove : C.warmGray }}>
              {on ? <Check size={10} strokeWidth={2.5} /> : <Minus size={10} />} {b.label}
            </span>
          );
        })}
      </div>

      <ul className="space-y-1">
        {d.traits.map((tr, i) => (
          <li key={i} className="text-[11px] text-foreground flex gap-1.5"><span style={{ color: C.gold }}>◆</span>{L(tr)}</li>
        ))}
      </ul>
    </Panel>
  );
}
