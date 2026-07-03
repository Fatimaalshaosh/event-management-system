import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/i18n/language-context";
import { ScrollText, Search } from "lucide-react";
import type { Bi, Mission } from "@/lib/mission";
import { C, Panel } from "./panel";

const TYPE_COLOR: Record<string, string> = {
  ai: C.castleHill, approval: C.mangrove, delay: C.error, decision: C.mediumWood,
  escalation: C.sunset, change: C.calmTeal, notification: C.warmGray,
};

export function OperationsLog({ mission }: { mission: Mission }) {
  const { t } = useTranslation();
  const { lang } = useLanguage();
  const [q, setQ] = useState("");
  const L = (x: Bi) => (lang === "en" ? x.en : x.ar);
  const ql = q.trim().toLowerCase();
  const filtered = mission.command.opsLog.filter((e) => !ql || L(e.text).toLowerCase().includes(ql) || t(`missionEngine.log.types.${e.type}`).toLowerCase().includes(ql));

  return (
    <Panel icon={ScrollText} title={t("missionEngine.log.title")} accent={C.mediumWood}>
      <div className="relative mb-3">
        <Search className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground/50" size={14} strokeWidth={1.5} />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("missionEngine.log.search")}
          className="w-full h-9 rounded-lg border bg-background pe-9 ps-3 text-xs outline-none focus:ring-1 focus:ring-primary/30" style={{ borderColor: C.border }} />
      </div>
      <div className="space-y-1">
        {filtered.map((e) => (
          <div key={e.id} className="flex items-center gap-2.5 py-1.5 border-t first:border-t-0" style={{ borderColor: C.border }}>
            <span className="text-[10px] font-mono text-muted-foreground w-12 shrink-0" dir="ltr">{e.time}</span>
            <span className="text-[9px] px-1.5 py-0.5 rounded-full font-medium shrink-0" style={{ background: (TYPE_COLOR[e.type] ?? C.warmGray) + "18", color: TYPE_COLOR[e.type] ?? C.warmGray }}>{t(`missionEngine.log.types.${e.type}`)}</span>
            <span className="text-[11px] text-foreground">{L(e.text)}</span>
          </div>
        ))}
      </div>
    </Panel>
  );
}
