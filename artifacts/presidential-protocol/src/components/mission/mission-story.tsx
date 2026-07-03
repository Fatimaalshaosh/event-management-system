import { useTranslation } from "react-i18next";
import { useLanguage } from "@/i18n/language-context";
import { Newspaper } from "lucide-react";
import type { Bi, Mission } from "@/lib/mission";
import { C, Panel } from "./panel";

const TONE: Record<string, string> = { good: C.mangrove, warn: C.sunset, info: C.castleHill };

export function MissionStory({ mission }: { mission: Mission }) {
  const { t } = useTranslation();
  const { lang } = useLanguage();
  const L = (x: Bi) => (lang === "en" ? x.en : x.ar);

  return (
    <Panel icon={Newspaper} title={t("missionEngine.story.title")} accent={C.calmTeal}>
      <div className="ps-2">
        {[...mission.command.story].reverse().map((e, i, arr) => (
          <div key={i} className="flex gap-3 relative pb-3 last:pb-0">
            <div className="flex flex-col items-center">
              <span className="w-2.5 h-2.5 rounded-full mt-1 shrink-0" style={{ background: TONE[e.tone] ?? C.castleHill }} />
              {i < arr.length - 1 && <span className="w-px flex-1 mt-1" style={{ background: C.border }} />}
            </div>
            <div className="pb-1">
              <span className="text-[10px] font-mono text-muted-foreground" dir="ltr">{e.time}</span>
              <p className="text-xs text-foreground leading-relaxed">{L(e.text)}</p>
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}
