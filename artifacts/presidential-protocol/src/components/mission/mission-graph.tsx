import { useTranslation } from "react-i18next";
import { useLanguage } from "@/i18n/language-context";
import { palette } from "@/theme";
import { Target } from "lucide-react";
import { DEPARTMENT_BY_KEY } from "@/components/contacts/org-structure";
import { departmentHead, resolveIdentity, portraitService } from "@/lib/identity";
import type { Mission, MissionStream, OperationalRelationship } from "@/lib/mission";

const C = palette;
const VW = 760, VH = 560, CX = 380, CY = 278, RX = 296, RY = 206;

const STATUS_COLOR: Record<MissionStream["status"], string> = {
  ready: C.mangrove, inProgress: C.calmTeal, blocked: C.error, notStarted: C.warmGray,
};
const EDGE_COLOR = (status: string) =>
  status === "blocked" ? C.error : status === "atRisk" ? C.sunset : C.border;

/** Executive Mission Graph — the mission at the centre, operational streams in
 * orbit, with curved typed dependency edges. Bespoke (SVG edges + positioned
 * orb nodes), not a generic chart. */
export function MissionGraph({ mission, onSelect, onSelectRelationship, selected, criticalPath, focusCritical }: {
  mission: Mission;
  onSelect?: (deptKey: string) => void;
  onSelectRelationship?: (r: OperationalRelationship) => void;
  selected?: string | null;
  criticalPath?: string[];
  focusCritical?: boolean;
}) {
  const crit = new Set(criticalPath ?? []);
  const dimNode = (k: string) => Boolean(focusCritical && crit.size && !crit.has(k));
  const { t } = useTranslation();
  const { lang, dir } = useLanguage();
  const streams = mission.blueprint.streams;
  const n = streams.length;

  const pos = streams.map((s, i) => {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / n;
    return { s, x: CX + RX * Math.cos(a), y: CY + RY * Math.sin(a) };
  });
  const byDept = Object.fromEntries(pos.map((p) => [p.s.deptKey, p]));

  return (
    <div className="relative w-full" style={{ aspectRatio: `${VW} / ${VH}` }} dir={dir}>
      <svg viewBox={`0 0 ${VW} ${VH}`} className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid meet">
        <defs>
          {["blocked", "atRisk", "open"].map((k) => (
            <marker key={k} id={`arrow-${k}`} viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M0 0 L8 4 L0 8 z" fill={EDGE_COLOR(k)} />
            </marker>
          ))}
        </defs>

        {/* Spokes from mission centre to each stream */}
        {pos.map((p) => (
          <line key={`sp-${p.s.deptKey}`} x1={CX} y1={CY} x2={p.x} y2={p.y}
            stroke={DEPARTMENT_BY_KEY[p.s.deptKey]?.color ?? C.border} strokeWidth={1} opacity={0.13} />
        ))}

        {/* Typed dependency edges */}
        {mission.relationships.map((r) => {
          const a = byDept[r.source], b = byDept[r.target];
          if (!a || !b) return null;
          const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
          const qx = mx + (CX - mx) * 0.28, qy = my + (CY - my) * 0.28;
          const col = EDGE_COLOR(r.status);
          const d = `M ${a.x} ${a.y} Q ${qx} ${qy} ${b.x} ${b.y}`;
          const onCrit = crit.has(r.source) && crit.has(r.target);
          const edgeDim = Boolean(focusCritical && crit.size && !onCrit);
          const baseOp = r.status === "open" ? 0.4 : 0.85;
          return (
            <g key={r.id} style={{ cursor: onSelectRelationship ? "pointer" : undefined }} onClick={() => onSelectRelationship?.(r)}>
              <path d={d} fill="none" stroke="transparent" strokeWidth={14} />
              <path d={d} fill="none" stroke={col} strokeWidth={onCrit ? (r.blocking ? 3 : 2) : r.blocking ? 2 : 1.25} opacity={edgeDim ? baseOp * 0.18 : baseOp}
                strokeDasharray={r.blocking ? undefined : "4 4"}
                markerEnd={`url(#arrow-${r.status === "blocked" ? "blocked" : r.status === "atRisk" ? "atRisk" : "open"})`} />
            </g>
          );
        })}
      </svg>

      {/* Centre — the Mission */}
      <button
        type="button"
        onClick={() => onSelect?.("")}
        className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center rounded-2xl border text-center shadow-sm transition-transform hover:scale-[1.02]"
        style={{
          left: `${(CX / VW) * 100}%`, top: `${(CY / VH) * 100}%`,
          width: "21%", minWidth: 128, padding: "12px 10px",
          background: `linear-gradient(160deg, ${C.mangrove}1A, ${C.cardBg})`, borderColor: C.mangrove + "66",
        }}
      >
        <span className="w-8 h-8 rounded-xl flex items-center justify-center mb-1" style={{ background: C.mangrove + "22", color: C.mangrove }}>
          <Target size={17} strokeWidth={1.7} />
        </span>
        <span className="text-[11px] text-muted-foreground">{t("missionEngine.mission")}</span>
        <span className="text-xs font-bold text-foreground leading-tight line-clamp-2" style={{ fontFamily: "Georgia, serif" }}>
          {lang === "en" ? mission.ctx.nameEn : mission.ctx.nameAr}
        </span>
        <span className="text-lg font-bold mt-0.5" style={{ color: C.mangrove }}>{mission.cockpit.readiness}%</span>
      </button>

      {/* Stream orbs */}
      {pos.map(({ s, x, y }) => {
        const dept = DEPARTMENT_BY_KEY[s.deptKey];
        const Icon = dept?.icon ?? Target;
        const ring = 2 * Math.PI * 22;
        const on = selected === s.deptKey;
        const statusCol = STATUS_COLOR[s.status];
        const isCrit = Boolean(focusCritical && crit.has(s.deptKey));
        const accent = dept?.color ?? C.mangrove;
        const head = departmentHead(s.deptKey);
        const rid = head ? resolveIdentity(head) : null;
        const headReq = rid ? { key: rid.key, name: rid.name, gender: rid.gender, nationality: rid.nationality, role: rid.role, department: rid.department } : null;
        return (
          <button
            key={s.deptKey}
            type="button"
            onClick={() => onSelect?.(s.deptKey)}
            className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center transition-all hover:scale-105 focus:outline-none"
            style={{ left: `${(x / VW) * 100}%`, top: `${(y / VH) * 100}%`, width: "13%", minWidth: 76, opacity: dimNode(s.deptKey) ? 0.35 : 1 }}
            title={t(`contacts.departments.${s.deptKey}`)}
          >
            <span className="relative inline-flex items-center justify-center" style={{ width: 52, height: 52 }}>
              <svg width="52" height="52" className="absolute inset-0 -rotate-90">
                <circle cx="26" cy="26" r="22" fill={C.cardBg} stroke={C.border} strokeWidth="3" />
                <circle cx="26" cy="26" r="22" fill="none" stroke={dept?.color ?? C.mangrove} strokeWidth="3"
                  strokeLinecap="round" strokeDasharray={ring} strokeDashoffset={ring * (1 - s.readiness / 100)} />
              </svg>
              <span className="relative flex items-center justify-center rounded-full overflow-hidden"
                style={{ width: 34, height: 34, background: accent + (isCrit ? "26" : "1A"), color: accent,
                  boxShadow: on ? `0 0 0 3px ${accent}55` : isCrit ? `0 0 0 3px ${C.gold}66, 0 0 14px ${C.gold}55` : undefined }}>
                {rid
                  ? <img src={rid.portraitUrl} alt="" className="w-full h-full object-cover" onError={(e) => { if (headReq) (e.currentTarget as HTMLImageElement).src = portraitService.fallback(headReq); }} />
                  : <Icon size={16} strokeWidth={1.7} />}
              </span>
              <span className="absolute -top-0.5 -end-0.5 w-3 h-3 rounded-full border-2"
                style={{ background: statusCol, borderColor: C.cardBg }} title={t(`missionEngine.status.${s.status}`)} />
            </span>
            <span className="text-[10px] font-medium text-foreground mt-1 leading-tight text-center line-clamp-2">
              {t(`contacts.departments.${s.deptKey}`)}
            </span>
            <span className="text-[10px] font-semibold" style={{ color: dept?.color ?? C.mangrove }}>{s.readiness}%</span>
          </button>
        );
      })}
    </div>
  );
}
