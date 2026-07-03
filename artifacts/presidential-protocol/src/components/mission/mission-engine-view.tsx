import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/i18n/language-context";
import { useGetEvent, getGetEventQueryKey } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Route, ArrowRight, ArrowLeft } from "lucide-react";
import { buildMission, missionFromBrief, briefFromEvent, type MissionBrief, type OperationalRelationship } from "@/lib/mission";
import { C } from "./panel";
import { MissionBriefForm } from "./mission-brief";
import { MissionAnalysis } from "./mission-analysis";
import { ExecutiveDailyBrief } from "./executive-daily-brief";
import { ExecutiveCommandBar } from "./executive-command-bar";
import { CommandPalette } from "./command-palette";
import { VerdictBanner } from "./verdict-banner";
import { DecisionInbox } from "./decision-inbox";
import { ExecutiveNotifications } from "./executive-notifications";
import { MissionTimeline } from "./mission-timeline";
import { MissionGraph } from "./mission-graph";
import { ExecutiveCockpit } from "./executive-cockpit";
import { MissionIntelligence } from "./mission-intelligence";
import { MissionDnaPanel } from "./mission-dna-panel";
import { MissionRecommendations } from "./mission-recommendations";
import { OperationalRelationships } from "./operational-relationships";
import { DepartmentPlaybooks } from "./department-playbooks";
import { DiplomaticMemory } from "./diplomatic-memory";
import { MissionHealth } from "./mission-health";
import { ReadinessSimulator } from "./readiness-simulator";
import { MissionBlueprintPanel } from "./mission-blueprint-panel";
import { DepartmentOpsPanel } from "./department-ops-panel";
import { RelationshipDetail } from "./relationship-detail";
import { CommandRibbon } from "./command-ribbon";
import { SituationRoom } from "./situation-room";
import { AiChiefOfStaff } from "./ai-chief-of-staff";
import { ExecutiveKpiWall } from "./executive-kpi-wall";
import { PredictiveReadiness } from "./predictive-readiness";
import { MissionStory } from "./mission-story";
import { OperationalHeatmap } from "./operational-heatmap";
import { OperationsLog } from "./operations-log";

const analyzedCache = new Set<number>();
type Phase = "brief" | "analyzing" | "dailyBrief" | "ready";
const WORKSPACES = ["overview", "operations", "departments", "decisions", "risks", "intelligence", "dossier"] as const;
type Workspace = (typeof WORKSPACES)[number];

export function MissionEngineView({ eventId }: { eventId: number }) {
  const { t } = useTranslation();
  const { dir } = useLanguage();
  const { data: event } = useGetEvent(eventId, { query: { enabled: !!eventId, queryKey: getGetEventQueryKey(eventId) } });

  const [phase, setPhase] = useState<Phase>(() => (analyzedCache.has(eventId) ? "ready" : "brief"));
  const [brief, setBrief] = useState<MissionBrief | null>(null);
  const [selDept, setSelDept] = useState<string | null>(null);
  const [openDept, setOpenDept] = useState<string | null>(null);
  const [openRel, setOpenRel] = useState<OperationalRelationship | null>(null);
  const [focusCritical, setFocusCritical] = useState(true);
  const [workspace, setWorkspace] = useState<Workspace>("overview");
  const [paletteOpen, setPaletteOpen] = useState(false);
  const topRef = useRef<HTMLDivElement>(null);
  const goWorkspace = (w: Workspace) => {
    setWorkspace(w);
    requestAnimationFrame(() => topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  useEffect(() => { if (event && !brief) setBrief(briefFromEvent(event)); }, [event, brief]);
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setPaletteOpen((v) => !v); } };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  const mission = useMemo(() => (brief ? buildMission(missionFromBrief(brief)) : null), [brief]);
  const Arrow = dir === "rtl" ? ArrowLeft : ArrowRight;

  if (!brief) return <div className="space-y-4"><Skeleton className="h-28 rounded-2xl" /><Skeleton className="h-80 rounded-2xl" /></div>;
  if (phase === "brief")
    return <MissionBriefForm brief={brief} onChange={(p) => setBrief({ ...brief, ...p })} onAnalyze={() => setPhase("analyzing")} />;
  if (phase === "analyzing")
    return <MissionAnalysis onDone={() => setPhase("dailyBrief")} />;
  if (!mission) return <Skeleton className="h-96 rounded-2xl" />;
  if (phase === "dailyBrief")
    return <ExecutiveDailyBrief mission={mission} onOpen={() => { analyzedCache.add(eventId); setPhase("ready"); }} />;

  return (
    <div className="space-y-5" ref={topRef}>
      {/* ── Layer 1: sticky executive command + workspace navigator ── */}
      <div className="sticky top-0 z-30 pt-1 pb-2.5 space-y-2" style={{ background: C.pageBg }}>
        <ExecutiveCommandBar mission={mission} onEditBrief={() => setPhase("brief")} onPalette={() => setPaletteOpen(true)} />
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
          {WORKSPACES.map((w) => {
            const active = workspace === w;
            const badge = w === "decisions" ? mission.decisions.length : w === "risks" ? mission.cockpit.criticalRisks : 0;
            return (
              <button key={w} onClick={() => goWorkspace(w)}
                className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full whitespace-nowrap transition-colors shrink-0"
                style={active ? { background: C.mangrove, color: "#fff" } : { background: C.cardBg, color: C.castleHill, border: `1px solid ${C.border}` }}>
                {t(`missionEngine.nav.ws.${w}`)}
                {badge > 0 && <span className="text-[9px] px-1.5 rounded-full font-semibold" style={{ background: active ? "#ffffff33" : C.error + "18", color: active ? "#fff" : C.error }}>{badge}</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Layer 2: switchable workspaces ── */}
      {workspace === "overview" && (
        <div className="space-y-5">
          <CommandRibbon mission={mission} />
          <VerdictBanner mission={mission} />
          <SituationRoom mission={mission} />
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
            <div className="xl:col-span-2">
              <div className="rounded-2xl border p-4" style={{ borderColor: C.border, background: C.cardBg }}>
                <div className="flex items-center gap-2 mb-1">
                  <Route size={15} strokeWidth={1.7} style={{ color: C.error }} />
                  <h3 className="text-sm font-semibold text-foreground" style={{ fontFamily: "Georgia, serif" }}>{t("missionEngine.criticalPath.title")}</h3>
                  <button onClick={() => setFocusCritical((v) => !v)} className="ms-auto text-[11px] px-2.5 py-1 rounded-full font-medium"
                    style={focusCritical ? { background: C.error + "14", color: C.error } : { background: C.border, color: C.warmGray }}>
                    {focusCritical ? t("missionEngine.criticalPath.focus") : t("missionEngine.criticalPath.showAll")}
                  </button>
                </div>
                <p className="text-[11px] text-muted-foreground mb-1">{t("missionEngine.criticalPath.subtitle")}</p>
                <MissionGraph mission={mission} selected={selDept} criticalPath={mission.criticalPath} focusCritical={focusCritical}
                  onSelect={(d) => { setSelDept(d || null); if (d) setOpenDept(d); }}
                  onSelectRelationship={(r) => setOpenRel(r)} />
                <div className="flex items-center flex-wrap gap-1.5 mt-2 pt-3 border-t" style={{ borderColor: C.border }}>
                  {mission.criticalPath.map((d) => (
                    <span key={d} className="flex items-center gap-1.5">
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded-full" style={{ background: C.error + "12", color: C.error }}>{t(`contacts.departments.${d}`)}</span>
                      <Arrow size={11} className="text-muted-foreground" />
                    </span>
                  ))}
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-full" style={{ background: C.mangrove + "12", color: C.mangrove }}>{t("missionEngine.criticalPath.execution")}</span>
                </div>
              </div>
            </div>
            <div className="xl:col-span-1 space-y-5">
              <ExecutiveCockpit mission={mission} />
              <AiChiefOfStaff mission={mission} />
            </div>
          </div>
        </div>
      )}

      {workspace === "operations" && (
        <div className="space-y-5">
          <MissionTimeline />
          <OperationalRelationships mission={mission} onSelect={(r) => setOpenRel(r)} />
          <OperationalHeatmap mission={mission} />
        </div>
      )}

      {workspace === "departments" && (
        <div className="space-y-5">
          <DepartmentPlaybooks mission={mission} highlight={selDept} />
        </div>
      )}

      {workspace === "decisions" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <DecisionInbox mission={mission} />
          <ExecutiveNotifications mission={mission} />
        </div>
      )}

      {workspace === "risks" && (
        <div className="space-y-5">
          <MissionHealth mission={mission} />
          <ReadinessSimulator mission={mission} />
        </div>
      )}

      {workspace === "intelligence" && (
        <div className="space-y-5">
          <ExecutiveKpiWall mission={mission} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <PredictiveReadiness mission={mission} />
            <MissionStory mission={mission} />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <MissionDnaPanel mission={mission} />
            <MissionIntelligence mission={mission} />
          </div>
          <MissionRecommendations mission={mission} />
        </div>
      )}

      {workspace === "dossier" && (
        <div className="space-y-5">
          <MissionBlueprintPanel mission={mission} />
          <DiplomaticMemory mission={mission} />
          <OperationsLog mission={mission} />
        </div>
      )}

      {/* ── Global slide-over drawers + ⌘K command palette ── */}
      <DepartmentOpsPanel mission={mission} deptKey={openDept} onClose={() => setOpenDept(null)} />
      <RelationshipDetail relationship={openRel} onClose={() => setOpenRel(null)} />
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} mission={mission}
        workspaces={WORKSPACES} onWorkspace={(w) => goWorkspace(w as Workspace)} onDept={(d) => setOpenDept(d)} onEditBrief={() => setPhase("brief")} />
    </div>
  );
}
