import { useTranslation } from "react-i18next";
import { useLanguage } from "@/i18n/language-context";
import { FileStack, Boxes, PackageCheck, Target, StickyNote } from "lucide-react";
import type { Bi, Mission } from "@/lib/mission";
import { C, Panel, Pill, LEVEL_COLOR } from "./panel";

export function MissionBlueprintPanel({ mission }: { mission: Mission }) {
  const { t } = useTranslation();
  const { lang } = useLanguage();
  const s = mission.summary;
  const L = (x: Bi) => (lang === "en" ? x.en : x.ar);

  const metric = (label: string, value: string | number) => (
    <div className="rounded-xl border p-2.5 text-center" style={{ borderColor: C.border }}>
      <p className="text-lg font-bold text-foreground" style={{ fontFamily: "Georgia, serif" }}>{value}</p>
      <p className="text-[10px] text-muted-foreground leading-tight">{label}</p>
    </div>
  );
  const list = (icon: typeof Boxes, label: string, items: Bi[], color: string) => (
    <div>
      <p className="flex items-center gap-1.5 text-[11px] font-medium mb-1.5" style={{ color: C.castleHill }}>{(() => { const Ic = icon; return <Ic size={12} strokeWidth={1.7} />; })()} {label}</p>
      <ul className="space-y-1">{items.map((it, i) => <li key={i} className="text-[11px] text-muted-foreground flex gap-1.5"><span style={{ color }}>•</span>{L(it)}</li>)}</ul>
    </div>
  );

  return (
    <Panel icon={FileStack} title={t("missionEngine.summaryPanel.title")} accent={C.mediumWood}>
      <div className="rounded-xl p-3 mb-3" style={{ background: C.mangrove + "0A", border: `1px solid ${C.border}` }}>
        <p className="text-[11px] text-muted-foreground mb-0.5">{t("missionEngine.summaryPanel.objective")}</p>
        <p className="text-sm text-foreground leading-relaxed">{L(s.objective)}</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-4">
        <div className="rounded-xl border p-2.5 text-center" style={{ borderColor: C.border }}>
          <Pill label={t(`missionEngine.level.${s.complexity}`)} color={LEVEL_COLOR[s.complexity]} soft />
          <p className="text-[10px] text-muted-foreground mt-1.5 leading-tight">{t("missionEngine.summaryPanel.complexity")}</p>
        </div>
        {metric(t("missionEngine.summaryPanel.streams"), s.streamsCount)}
        {metric(t("missionEngine.summaryPanel.requiredDepts"), s.requiredDepts)}
        {metric(t("missionEngine.summaryPanel.optionalDepts"), s.optionalDepts)}
        {metric(t("missionEngine.decisions"), mission.blueprint.decisions.length)}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {list(Boxes, t("missionEngine.summaryPanel.assets"), s.assets, C.mediumWood)}
        {list(PackageCheck, t("missionEngine.summaryPanel.deliverables"), s.deliverables, C.calmTeal)}
        {list(Target, t("missionEngine.summaryPanel.successCriteria"), s.successCriteria, C.mangrove)}
        {list(StickyNote, t("missionEngine.summaryPanel.executiveNotes"), s.executiveNotes, C.gold)}
      </div>
    </Panel>
  );
}
