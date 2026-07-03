import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/i18n/language-context";
import { motion } from "framer-motion";
import { Gavel, Check, X, Share2, Eye, Clock, TrendingUp, Sparkles, Unlock } from "lucide-react";
import type { Bi, Mission } from "@/lib/mission";
import { ExecutiveAvatar } from "@/components/identity";
import { departmentHead } from "@/lib/identity";
import { C, Panel, Pill, LEVEL_COLOR } from "./panel";

type Resolution = "approved" | "rejected" | "delegated" | "review";
const RES_COLOR: Record<Resolution, string> = { approved: C.mangrove, rejected: C.error, delegated: C.calmTeal, review: C.mediumWood };

export function DecisionInbox({ mission }: { mission: Mission }) {
  const { t } = useTranslation();
  const { lang } = useLanguage();
  const L = (x: Bi) => (lang === "en" ? x.en : x.ar);
  const [resolved, setResolved] = useState<Record<string, Resolution>>({});

  const actions: { key: Resolution; icon: typeof Check; label: string; color: string }[] = [
    { key: "approved", icon: Check, label: t("missionEngine.decisionInbox.approve"), color: C.mangrove },
    { key: "rejected", icon: X, label: t("missionEngine.decisionInbox.reject"), color: C.error },
    { key: "delegated", icon: Share2, label: t("missionEngine.decisionInbox.delegate"), color: C.calmTeal },
    { key: "review", icon: Eye, label: t("missionEngine.decisionInbox.requestReview"), color: C.mediumWood },
  ];

  return (
    <Panel icon={Gavel} title={t("missionEngine.decisionInbox.title")} accent={C.mediumWood}
      action={<span className="text-[11px] px-2 py-0.5 rounded-full font-semibold" style={{ background: C.error + "16", color: C.error }}>{mission.decisions.filter((d) => !resolved[d.id]).length}</span>}>
      {mission.decisions.length === 0 ? (
        <p className="text-[11px] text-muted-foreground italic">{t("missionEngine.decisionInbox.empty")}</p>
      ) : (
        <div className="space-y-3">
          {mission.decisions.map((d) => {
            const r = resolved[d.id];
            return (
              <motion.div key={d.id} layout className="rounded-xl border p-3.5" style={{ borderColor: r ? RES_COLOR[r] + "66" : C.border, background: r ? RES_COLOR[r] + "08" : C.cardBg }}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5 min-w-0">
                    {d.deptKey && <ExecutiveAvatar identity={departmentHead(d.deptKey) ?? { name: t(`contacts.departments.${d.deptKey}`), department: d.deptKey }} size="sm" />}
                    <div className="min-w-0">
                      <h4 className="text-sm font-semibold text-foreground" style={{ fontFamily: "Georgia, serif" }}>{L(d.title)}</h4>
                      <p className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
                        {d.deptKey && <span>{t(`contacts.departments.${d.deptKey}`)}</span>}
                        <span className="flex items-center gap-1"><Clock size={11} /> {L(d.deadline)}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="flex items-center gap-1 text-sm font-bold" style={{ color: C.mangrove }}><TrendingUp size={13} /> +{d.impact}%</span>
                    <Pill label={`${t("missionEngine.decisionInbox.risk")}: ${t(`missionEngine.level.${d.risk}`)}`} color={LEVEL_COLOR[d.risk]} soft />
                  </div>
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <span className="flex items-center gap-1 text-[10px] text-muted-foreground"><Unlock size={11} /> {t("missionEngine.decisionInbox.unlocks")}:</span>
                  {d.unlocks.map((u) => <Pill key={u} label={t(`contacts.departments.${u}`)} color={C.calmTeal} soft />)}
                  <span className="text-[10px] text-muted-foreground ms-1">· {t("missionEngine.decisionInbox.timeSaved")} {d.timeSavedHours}{t("missionEngine.execRecs.hours")}</span>
                </div>

                <p className="flex items-start gap-1.5 text-[11px] text-muted-foreground mt-2"><Sparkles size={11} className="mt-0.5 shrink-0" style={{ color: C.gold }} /> {L(d.recommendation)}</p>

                {r ? (
                  <div className="mt-2.5 flex items-center gap-1.5">
                    <span className="text-[11px] font-medium px-2.5 py-1 rounded-lg" style={{ background: RES_COLOR[r] + "16", color: RES_COLOR[r] }}>{t(`missionEngine.decisionInbox.${r === "review" ? "requestReview" : r}`)}</span>
                    <button onClick={() => setResolved((p) => { const n = { ...p }; delete n[d.id]; return n; })} className="text-[10px] text-muted-foreground hover:text-foreground underline">↺</button>
                  </div>
                ) : (
                  <div className="mt-2.5 grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                    {actions.map((a) => (
                      <button key={a.key} onClick={() => setResolved((p) => ({ ...p, [d.id]: a.key }))}
                        className="flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg text-[11px] font-medium border transition-all hover:shadow-sm"
                        style={a.key === "approved" ? { background: a.color, color: "#fff", borderColor: a.color } : { borderColor: C.border, color: a.color }}>
                        <a.icon size={12} /> {a.label}
                      </button>
                    ))}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </Panel>
  );
}
