import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/i18n/language-context";
import { motion } from "framer-motion";
import {
  BotMessageSquare, FileText, AlertTriangle, Briefcase, ListChecks, Wand2, Play, Sparkles,
} from "lucide-react";
import type { Bi, Mission } from "@/lib/mission";
import { C, Panel } from "./panel";

const ICONS: Record<string, typeof FileText> = {
  summarize: Sparkles, briefing: FileText, predictFailures: AlertTriangle,
  ministerBriefing: Briefcase, protocolChecklist: ListChecks, recommendActions: Wand2,
};

export function AiChiefOfStaff({ mission }: { mission: Mission }) {
  const { t } = useTranslation();
  const { lang } = useLanguage();
  const [sel, setSel] = useState<string | null>(null);
  const L = (x: Bi) => (lang === "en" ? x.en : x.ar);
  const output = mission.command.assistant.find((a) => a.key === sel)?.output;

  return (
    <Panel icon={BotMessageSquare} title={t("missionEngine.assistant.title")} accent={C.gold}
      action={<span className="text-[11px] text-muted-foreground">{t("missionEngine.assistant.subtitle")}</span>}>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {mission.command.assistant.map((a) => {
          const Icon = ICONS[a.key] ?? Sparkles;
          const on = sel === a.key;
          return (
            <button key={a.key} onClick={() => setSel(a.key)}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl border text-start text-xs font-medium transition-all"
              style={on ? { borderColor: C.gold, background: C.gold + "12", color: C.mediumWood } : { borderColor: C.border, color: C.castleHill }}>
              <Icon size={15} strokeWidth={1.7} className="shrink-0" /> {t(`missionEngine.assistant.actions.${a.key}`)}
            </button>
          );
        })}
      </div>

      {output && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-3 rounded-xl p-3.5" style={{ background: C.gold + "0E", border: `1px solid ${C.gold}44` }}>
          <p className="flex items-center gap-1.5 text-[11px] font-medium mb-1.5" style={{ color: C.mediumWood }}>
            <Play size={11} /> {t(`missionEngine.assistant.actions.${sel}`)} · {t("missionEngine.aiGenerated")}
          </p>
          <p className="text-xs text-foreground leading-relaxed">{L(output)}</p>
        </motion.div>
      )}
    </Panel>
  );
}
