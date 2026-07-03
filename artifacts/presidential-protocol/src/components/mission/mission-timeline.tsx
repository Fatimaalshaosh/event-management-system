import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Check, GitCommitHorizontal } from "lucide-react";
import { C, Panel } from "./panel";

const STEPS = [
  "created", "analyzed", "dnaGenerated", "blueprintGenerated", "relationshipsBuilt",
  "departmentsAssigned", "resourcesCalculated", "readinessCalculated", "executiveReview", "active",
] as const;
const CURRENT = 8; // executiveReview

/** Progressive executive mission timeline — animates in on mount. */
export function MissionTimeline() {
  const { t } = useTranslation();
  return (
    <Panel icon={GitCommitHorizontal} title={t("missionEngine.timeline.title")} accent={C.calmTeal}>
      <div className="flex items-start gap-0 overflow-x-auto pb-1">
        {STEPS.map((s, i) => {
          const state = i < CURRENT ? "done" : i === CURRENT ? "current" : "todo";
          return (
            <motion.div key={s} className="flex flex-col items-center shrink-0" style={{ minWidth: 92 }}
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
              <div className="flex items-center w-full">
                <span className="h-px flex-1" style={{ background: i === 0 ? "transparent" : i <= CURRENT ? C.mangrove : C.border }} />
                <span className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                  style={state === "done" ? { background: C.mangrove, color: "#fff" }
                    : state === "current" ? { background: C.mangrove + "22", color: C.mangrove, boxShadow: `0 0 0 3px ${C.mangrove}33` }
                    : { background: C.border, color: C.warmGray }}>
                  {state === "done" ? <Check size={12} strokeWidth={3} /> : <span className="w-2 h-2 rounded-full" style={{ background: state === "current" ? C.mangrove : C.warmGray }} />}
                </span>
                <span className="h-px flex-1" style={{ background: i === STEPS.length - 1 ? "transparent" : i < CURRENT ? C.mangrove : C.border }} />
              </div>
              <span className="text-[10px] text-center mt-1.5 leading-tight px-1" style={{ color: state === "todo" ? C.warmGray : "var(--foreground)" }}>
                {t(`missionEngine.timeline.${s}`)}
              </span>
            </motion.div>
          );
        })}
      </div>
    </Panel>
  );
}
