import { palette } from "@/theme";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { ChevronEnd } from "@/components/dir-icon";

/* ─── Design tokens (shared dashboard palette) ────────────────── */
export const C = { ...palette, border: "rgba(103,90,81,0.15)", shadow: "0 4px 20px rgba(61,53,41,0.10), 0 1px 6px rgba(61,53,41,0.06)" };

/* ─── Animated circular ring ──────────────────────────────────── */
export function CircularRing({ pct, color, label, sublabel }: {
  pct: number; color: string; label: string; sublabel: string;
}) {
  const r = 30;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <motion.div
      className="flex flex-col items-center gap-2"
      whileHover={{ scale: 1.04 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
    >
      <div className="relative w-[72px] h-[72px]">
        <div
          style={{
            position: "absolute", inset: 4, borderRadius: "50%",
            background: `${color}12`,
            boxShadow: `0 0 14px ${color}28`,
          }}
        />
        <svg width="72" height="72" viewBox="0 0 72 72" style={{ transform: "rotate(-90deg)", position: "relative", zIndex: 1 }}>
          <circle cx="36" cy="36" r={r} fill="none" stroke={`${color}20`} strokeWidth="4" />
          <circle
            cx="36" cy="36" r={r} fill="none" stroke={color} strokeWidth="4"
            strokeDasharray={`${dash} ${circ}`}
            strokeLinecap="round"
            style={{ transition: "stroke-dasharray 1s cubic-bezier(0.4,0,0.2,1)" }}
          />
        </svg>
        <span
          className="absolute inset-0 flex items-center justify-center text-xs font-bold"
          style={{ color, fontFamily: "Georgia, serif", zIndex: 2 }}
        >
          {pct}%
        </span>
      </div>
      <p className="text-center text-xs font-semibold" style={{ color: C.textPrimary }}>{label}</p>
      <p className="text-center text-[10px]" style={{ color: C.warmGray }}>{sublabel}</p>
    </motion.div>
  );
}

/* ─── Live pulse dot ──────────────────────────────────────────── */
export function LiveDot({ color = C.mangrove }: { color?: string }) {
  return (
    <span className="relative flex h-2 w-2">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60" style={{ background: color }} />
      <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: color }} />
    </span>
  );
}

/* ─── Section card ────────────────────────────────────────────── */
export function SectionCard({ title, linkHref, linkLabel, children, accent }: {
  title: string; linkHref?: string; linkLabel?: string;
  children: React.ReactNode; accent?: string;
}) {
  const { t } = useTranslation();
  const label = linkLabel ?? t("common.viewAll");
  return (
    <div
      className="rounded-2xl border overflow-hidden h-full"
      style={{ background: C.cardBg, borderColor: C.border, boxShadow: C.shadow }}
    >
      {accent && <div style={{ height: 3, background: `linear-gradient(to left, ${accent}, ${accent}00)` }} />}
      <div className="p-6">
        <div className="flex items-center justify-between mb-5">
          {linkHref && (
            <Link
              href={linkHref}
              className="text-xs font-medium flex items-center gap-1 transition-all hover:opacity-70"
              style={{ color: C.mangrove }}
            >
              {label} <ChevronEnd size={14} />
            </Link>
          )}
          <h2 className="text-lg font-bold text-end" style={{ color: C.textPrimary, fontFamily: "Georgia, serif" }}>
            {title}
          </h2>
        </div>
        {children}
      </div>
    </div>
  );
}
