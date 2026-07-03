import { useTranslation } from "react-i18next";
import { useLanguage } from "@/i18n/language-context";
import {
  History, MapPin, Gift, Heart, BookOpen, Repeat, Lightbulb, Award, CalendarClock,
  Languages, Armchair, Utensils, Moon, Shield, CameraOff, Car, Handshake, AlertTriangle,
} from "lucide-react";
import type { Bi, Mission } from "@/lib/mission";
import { C, Panel } from "./panel";

type Section = { icon: typeof MapPin; label: string; items: Bi[] };

export function DiplomaticMemory({ mission }: { mission: Mission }) {
  const { t } = useTranslation();
  const { lang } = useLanguage();
  const m = mission.memory;
  const L = (x: Bi) => (lang === "en" ? x.en : x.ar);

  if (!m) {
    return (
      <Panel icon={History} title={t("missionEngine.memory")} accent={C.mediumWood}>
        <p className="text-[11px] text-muted-foreground italic">{t("missionEngine.noMemory")}</p>
      </Panel>
    );
  }

  const opt = (icon: typeof MapPin, key: string, items?: Bi[]): Section[] =>
    items && items.length ? [{ icon, label: t(`missionEngine.mem.${key}`), items }] : [];

  const sections: Section[] = [
    { icon: MapPin, label: t("missionEngine.mem.previousVisits"), items: m.previousVisits },
    { icon: Gift, label: t("missionEngine.mem.previousGifts"), items: m.previousGifts },
    ...opt(Award, "preferredProtocol", m.preferredProtocol),
    ...opt(CalendarClock, "meetingPreferences", m.meetingPreferences),
    { icon: Heart, label: t("missionEngine.mem.preferences"), items: m.preferences },
    ...opt(Languages, "interpreterHistory", m.interpreterHistory),
    ...opt(Armchair, "seating", m.seating),
    ...opt(Utensils, "meals", m.meals),
    ...opt(Moon, "religious", m.religious),
    ...opt(Shield, "securityPrefs", m.securityPrefs),
    ...opt(CameraOff, "mediaRestrictions", m.mediaRestrictions),
    ...opt(Car, "transportPrefs", m.transportPrefs),
    { icon: BookOpen, label: t("missionEngine.mem.cultural"), items: m.cultural },
    ...opt(Handshake, "executiveRelationships", m.executiveRelationships),
    { icon: Repeat, label: t("missionEngine.mem.reciprocity"), items: m.reciprocity },
    ...opt(AlertTriangle, "commonRisks", m.commonRisks),
    { icon: Lightbulb, label: t("missionEngine.mem.lessons"), items: m.lessons },
  ];

  return (
    <Panel icon={History} title={t("missionEngine.memory")} accent={C.mediumWood}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {sections.map((s) => (
          <div key={s.label} className="rounded-xl border p-2.5" style={{ borderColor: C.border }}>
            <p className="flex items-center gap-1.5 text-[11px] font-medium mb-1.5" style={{ color: C.castleHill }}>
              <s.icon size={12} strokeWidth={1.7} /> {s.label}
            </p>
            <ul className="space-y-1">
              {s.items.map((it, i) => <li key={i} className="text-[11px] text-muted-foreground flex gap-1.5"><span style={{ color: C.mediumWood }}>•</span>{L(it)}</li>)}
            </ul>
          </div>
        ))}
      </div>
    </Panel>
  );
}
