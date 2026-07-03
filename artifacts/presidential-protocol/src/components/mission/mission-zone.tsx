import { useState, type ElementType, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { C } from "./panel";

/** A collapsible operational zone — lets executives focus on one area without
 * scrolling through the whole page. */
export function MissionZone({ icon: Icon, title, accent, defaultOpen, children }: {
  icon: ElementType; title: string; accent?: string; defaultOpen?: boolean; children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen ?? false);
  const col = accent ?? C.mediumWood;
  return (
    <div className="rounded-2xl border overflow-hidden" style={{ borderColor: C.border, background: C.cardBg }}>
      <button onClick={() => setOpen((v) => !v)} className="w-full flex items-center justify-between gap-3 px-5 py-3.5 text-start transition-colors hover:bg-muted/20">
        <span className="flex items-center gap-2.5 min-w-0">
          <span className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: col + "1A", color: col }}>
            <Icon size={16} strokeWidth={1.7} />
          </span>
          <span className="text-sm font-semibold text-foreground truncate" style={{ fontFamily: "Georgia, serif" }}>{title}</span>
        </span>
        <ChevronDown size={16} className="text-muted-foreground shrink-0 transition-transform" style={{ transform: open ? "rotate(180deg)" : "none" }} />
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
