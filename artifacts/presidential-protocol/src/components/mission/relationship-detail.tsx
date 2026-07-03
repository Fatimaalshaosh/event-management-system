import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/i18n/language-context";
import { X, Workflow, ArrowRight, ArrowLeft, Sparkles } from "lucide-react";
import type { OperationalRelationship } from "@/lib/mission";
import { C, Pill, STATUS_COLOR, LEVEL_COLOR } from "./panel";

export function RelationshipDetail({ relationship: r, onClose }: {
  relationship: OperationalRelationship | null; onClose: () => void;
}) {
  const { t } = useTranslation();
  const { lang, dir } = useLanguage();
  if (!r) return null;
  const L = <T extends { en: string; ar: string }>(x: T) => (lang === "en" ? x.en : x.ar);
  const Arrow = dir === "rtl" ? ArrowLeft : ArrowRight;

  const explanation = {
    en: `${L(r.reason)} This dependency is ${r.blocking ? "blocking" : "non-blocking"} and is currently ${t(`missionEngine.status.${r.status}`).toLowerCase()}; ${t(`contacts.departments.${r.source}`)} is responsible for clearing it.`,
    ar: `${L(r.reason)} هذه التبعية ${r.blocking ? "معيقة" : "غير معيقة"} وحالتها الآن ${t(`missionEngine.status.${r.status}`)}؛ ${t(`contacts.departments.${r.source}`)} مسؤولة عن معالجتها.`,
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/45 backdrop-blur-[2px]" onClick={onClose} />
      <motion.div dir={dir} initial={{ opacity: 0, scale: 0.96, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.2 }}
        className="relative w-full max-w-md rounded-2xl border shadow-2xl overflow-hidden" style={{ borderColor: C.border, background: C.cardBg }}>
        <div className="px-5 pt-5 pb-3 border-b flex items-center gap-2" style={{ borderColor: C.border, background: `linear-gradient(160deg, ${C.calmTeal}12, transparent)` }}>
          <Workflow size={15} strokeWidth={1.7} style={{ color: C.calmTeal }} />
          <h3 className="text-sm font-semibold text-foreground" style={{ fontFamily: "Georgia, serif" }}>{t("missionEngine.relDetail.title")}</h3>
          <button onClick={onClose} className="ms-auto w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted"><X size={16} /></button>
        </div>

        <div className="p-5 space-y-3.5">
          <div className="flex items-center justify-center gap-2 py-2">
            <span className="text-sm font-semibold text-foreground">{t(`contacts.departments.${r.source}`)}</span>
            <span className="flex flex-col items-center text-[10px] text-muted-foreground"><Arrow size={16} style={{ color: C.calmTeal }} />{t(`missionEngine.rel.${r.type}`)}</span>
            <span className="text-sm font-semibold text-foreground">{t(`contacts.departments.${r.target}`)}</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-1.5">
            <Pill label={r.blocking ? t("missionEngine.blocking") : t("missionEngine.nonBlocking")} color={r.blocking ? C.error : C.mangrove} soft />
            <Pill label={t(`missionEngine.status.${r.status}`)} color={STATUS_COLOR[r.status] ?? C.warmGray} soft />
            <Pill label={`${t("missionEngine.relDetail.impact")} +${r.readinessImpact}%`} color={LEVEL_COLOR[r.risk] ?? C.mediumWood} soft />
          </div>

          <div className="rounded-xl border p-3" style={{ borderColor: C.border }}>
            <p className="text-[11px] text-muted-foreground mb-1">{t("missionEngine.relDetail.reason")}</p>
            <p className="text-xs text-foreground leading-relaxed">{L(r.reason)}</p>
          </div>

          <div className="rounded-xl p-3" style={{ background: C.gold + "12", border: `1px solid ${C.gold}44` }}>
            <p className="flex items-center gap-1.5 text-[11px] font-medium mb-1" style={{ color: C.mediumWood }}><Sparkles size={12} /> {t("missionEngine.relDetail.aiExplanation")}</p>
            <p className="text-xs text-foreground leading-relaxed">{L(explanation)}</p>
          </div>

          <p className="text-[11px] text-center text-muted-foreground">{t("missionEngine.relDetail.responsible")}: <span className="font-medium text-foreground">{t(`contacts.departments.${r.source}`)}</span></p>
        </div>
      </motion.div>
    </div>,
    document.body,
  );
}
