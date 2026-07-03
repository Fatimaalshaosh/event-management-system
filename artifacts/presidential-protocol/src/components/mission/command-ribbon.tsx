import { useEffect, useState, type ElementType } from "react";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/i18n/language-context";
import {
  ShieldCheck, ShieldAlert, ShieldX, Gauge, Clock, Gavel, AlertTriangle, Users, UserCircle,
  Sparkles, GitBranch, Cloud, Shield, Truck, Radio, Wallet,
} from "lucide-react";
import type { Mission, Tone } from "@/lib/mission";
import { C } from "./panel";

const TONE: Record<Tone, string> = { good: C.mangrove, warn: C.sunset, risk: C.error, info: C.castleHill };

function useClock() {
  const [t, setT] = useState(() => new Date());
  useEffect(() => { const id = setInterval(() => setT(new Date()), 1000); return () => clearInterval(id); }, []);
  return t.toLocaleTimeString("en-GB");
}

export function CommandRibbon({ mission }: { mission: Mission }) {
  const { t } = useTranslation();
  const { lang } = useLanguage();
  const clock = useClock();
  const v = mission.verdict.level;
  const vTone: Tone = v === "blocked" ? "risk" : v === "atRisk" ? "warn" : "good";
  const VIcon = v === "blocked" ? ShieldX : v === "atRisk" ? ShieldAlert : ShieldCheck;
  const r = mission.cockpit.readiness;
  const waiting = mission.presence.filter((p) => p.waitingOn).length;
  const L = <T extends { en: string; ar: string }>(x: T) => (lang === "en" ? x.en : x.ar);

  const items: { key: string; icon: ElementType; value: string; tone: Tone }[] = [
    { key: "status", icon: VIcon, value: L(mission.verdict.headline), tone: vTone },
    { key: "readiness", icon: Gauge, value: `${r}%`, tone: r >= 85 ? "good" : r >= 70 ? "warn" : "risk" },
    { key: "countdown", icon: Clock, value: L(mission.countdown.label), tone: "info" },
    { key: "todayActions", icon: Gavel, value: String(mission.decisions.length), tone: "warn" },
    { key: "criticalItem", icon: AlertTriangle, value: t("missionEngine.ribbon.criticalVal"), tone: "risk" },
    { key: "deptsWaiting", icon: Users, value: String(waiting), tone: waiting ? "warn" : "good" },
    { key: "owner", icon: UserCircle, value: t("missionEngine.ribbon.ownerVal"), tone: "info" },
    { key: "lastAiUpdate", icon: Sparkles, value: t("missionEngine.ribbon.lastUpdateVal"), tone: "info" },
    { key: "phase", icon: GitBranch, value: t(`missionEngine.phases.${mission.lifecycle.current}`), tone: "info" },
    { key: "clock", icon: Clock, value: clock, tone: "info" },
    { key: "weather", icon: Cloud, value: t("missionEngine.ribbon.weatherVal"), tone: "good" },
    { key: "threat", icon: ShieldAlert, value: t("missionEngine.ribbon.threatVal"), tone: "warn" },
    { key: "transport", icon: Truck, value: t("missionEngine.ribbon.transportVal"), tone: "good" },
    { key: "security", icon: Shield, value: t("missionEngine.ribbon.securityVal"), tone: "good" },
    { key: "media", icon: Radio, value: t("missionEngine.ribbon.mediaVal"), tone: "warn" },
    { key: "budget", icon: Wallet, value: t("missionEngine.ribbon.budgetVal"), tone: "good" },
  ];

  return (
    <div className="rounded-2xl border overflow-x-auto" style={{ borderColor: C.border, background: C.cardBg }}>
      <div className="flex items-stretch divide-x" style={{ minWidth: "max-content" }}>
        {items.map((it) => {
          const col = TONE[it.tone];
          return (
            <div key={it.key} className="flex items-center gap-2 px-3.5 py-2.5 shrink-0" style={{ borderColor: C.border }}>
              <it.icon size={15} strokeWidth={1.7} style={{ color: col }} />
              <div>
                <p className="text-[9px] uppercase tracking-wide text-muted-foreground leading-none">{t(`missionEngine.ribbon.${it.key}`)}</p>
                <p className="text-xs font-semibold leading-tight mt-0.5" style={{ color: it.tone === "info" ? "var(--foreground)" : col }}>{it.value}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
