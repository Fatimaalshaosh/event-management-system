import { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { FolderOpen, ChevronDown } from "lucide-react";
import { C } from "./panel";

/** Progressive disclosure — all secondary intelligence folded into one premium,
 * collapsible section so the top of the dashboard stays purely operational. */
export function MissionDossier({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-2xl border overflow-hidden" style={{ borderColor: C.border, background: C.cardBg }}>
      <button onClick={() => setOpen((v) => !v)} className="w-full flex items-center justify-between gap-3 px-5 py-4 text-start transition-colors hover:bg-muted/20">
        <span className="flex items-center gap-2.5 min-w-0">
          <span className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: C.mediumWood + "1A", color: C.mediumWood }}>
            <FolderOpen size={17} strokeWidth={1.7} />
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-semibold text-foreground" style={{ fontFamily: "Georgia, serif" }}>{t("missionEngine.dossier.title")}</span>
            <span className="block text-[11px] text-muted-foreground truncate">{t("missionEngine.dossier.subtitle")}</span>
          </span>
        </span>
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground shrink-0">
          {open ? t("missionEngine.dossier.close") : t("missionEngine.dossier.open")}
          <ChevronDown size={15} className="transition-transform" style={{ transform: open ? "rotate(180deg)" : "none" }} />
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
            <div className="px-5 pb-5 pt-1 space-y-5 border-t" style={{ borderColor: C.border }}>
              <div className="pt-4 space-y-5">{children}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
