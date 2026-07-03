import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Check, Loader2, Radar } from "lucide-react";
import { C } from "./panel";

const STAGES = [
  "created", "analyzingContext", "loadingDna", "generatingBlueprint", "detectingDepartments",
  "buildingRelationships", "generatingPlaybooks", "calculatingReadiness", "preparingCockpit", "ready",
] as const;

/** Executive analysis sequence — the engine "thinking" before the dashboard. */
export function MissionAnalysis({ onDone }: { onDone: () => void }) {
  const { t } = useTranslation();
  const [i, setI] = useState(0);

  useEffect(() => {
    if (i >= STAGES.length) {
      const tm = setTimeout(onDone, 550);
      return () => clearTimeout(tm);
    }
    const tm = setTimeout(() => setI((v) => v + 1), i === 0 ? 480 : 430);
    return () => clearTimeout(tm);
  }, [i, onDone]);

  const pct = Math.round((Math.min(i, STAGES.length) / STAGES.length) * 100);

  return (
    <div className="max-w-xl mx-auto py-6">
      <div className="rounded-2xl border p-8" style={{ borderColor: C.border, background: `linear-gradient(165deg, ${C.mangrove}0E, ${C.cardBg} 60%)` }}>
        <div className="flex flex-col items-center text-center mb-6">
          <motion.span className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3"
            style={{ background: C.mangrove + "1A", color: C.mangrove }}
            animate={{ scale: [1, 1.08, 1] }} transition={{ repeat: Infinity, duration: 1.6 }}>
            <Radar size={26} strokeWidth={1.6} />
          </motion.span>
          <h2 className="text-lg font-bold text-foreground" style={{ fontFamily: "Georgia, serif" }}>
            {t(`missionEngine.analysis.${STAGES[Math.min(i, STAGES.length - 1)]}`)}
          </h2>
          <div className="w-full h-1.5 rounded-full overflow-hidden mt-4" style={{ background: C.border }}>
            <motion.div className="h-full rounded-full" style={{ background: C.mangrove }}
              animate={{ width: `${pct}%` }} transition={{ duration: 0.35 }} />
          </div>
        </div>

        <div className="space-y-2">
          {STAGES.map((s, idx) => {
            const state = idx < i ? "done" : idx === i ? "current" : "todo";
            return (
              <motion.div key={s} className="flex items-center gap-2.5"
                animate={{ opacity: state === "todo" ? 0.4 : 1 }} transition={{ duration: 0.3 }}>
                <span className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                  style={state === "done" ? { background: C.mangrove, color: "#fff" }
                    : state === "current" ? { background: C.mangrove + "1A", color: C.mangrove }
                    : { background: C.border }}>
                  {state === "done" ? <Check size={12} strokeWidth={3} />
                    : state === "current" ? <Loader2 size={12} className="animate-spin" />
                    : <span className="w-1.5 h-1.5 rounded-full" style={{ background: C.warmGray }} />}
                </span>
                <span className="text-xs font-medium" style={{ color: state === "todo" ? C.warmGray : "var(--foreground)" }}>
                  {t(`missionEngine.analysis.${s}`)}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
