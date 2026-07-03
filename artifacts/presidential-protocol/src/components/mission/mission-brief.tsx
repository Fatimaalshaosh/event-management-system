import { useTranslation } from "react-i18next";
import { useLanguage } from "@/i18n/language-context";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CountrySelect } from "@/components/reference/country-select";
import { Target, Sparkles } from "lucide-react";
import { ChevronEnd } from "@/components/dir-icon";
import type { MissionBrief } from "@/lib/mission";
import { C } from "./panel";

const VIP_LEVELS = ["headOfState", "minister", "ambassador", "seniorOfficial", "standard"];
const EVENT_TYPES = ["stateVisit", "delegation", "reception", "signing", "meeting", "ceremony", "summit", "internal"];
const CATEGORIES = ["visit", "ceremony", "summit", "reception", "internal"];
const PRIORITIES = ["routine", "high", "critical", "flagship"];

export function MissionBriefForm({ brief, onChange, onAnalyze }: {
  brief: MissionBrief;
  onChange: (patch: Partial<MissionBrief>) => void;
  onAnalyze: () => void;
}) {
  const { t } = useTranslation();
  const { dir } = useLanguage();
  const align = dir === "rtl" ? "text-end" : "text-start";

  const field = (label: string, node: React.ReactNode, span?: boolean) => (
    <div className={`space-y-1.5 ${span ? "sm:col-span-2" : ""}`}>
      <Label className={`block text-xs ${align}`}>{label}</Label>
      {node}
    </div>
  );
  const select = (k: keyof MissionBrief, options: string[], tns: string) => (
    <select value={(brief[k] as string) ?? ""} onChange={(e) => onChange({ [k]: e.target.value })}
      className="w-full h-10 rounded-md border bg-background px-3 text-sm outline-none focus:ring-1 focus:ring-primary/30"
      style={{ borderColor: C.border }} dir={dir}>
      {options.map((o) => <option key={o} value={o}>{t(`${tns}.${o}`)}</option>)}
    </select>
  );

  return (
    <div className="max-w-3xl mx-auto">
      <div className="rounded-2xl border overflow-hidden" style={{ borderColor: C.border, background: C.cardBg }}>
        <div className="px-6 pt-6 pb-4 border-b" style={{ borderColor: C.border, background: `linear-gradient(160deg, ${C.mangrove}12, transparent)` }}>
          <div className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: C.mangrove + "1A", color: C.mangrove }}>
              <Target size={18} strokeWidth={1.7} />
            </span>
            <div className={align}>
              <h2 className="text-lg font-bold text-foreground leading-tight" style={{ fontFamily: "Georgia, serif" }}>{t("missionEngine.brief.title")}</h2>
              <p className="text-[11px] text-muted-foreground">{t("missionEngine.brief.subtitle")}</p>
            </div>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {field(t("missionEngine.brief.nameEn"), <Input value={brief.nameEn} onChange={(e) => onChange({ nameEn: e.target.value })} dir="ltr" />)}
          {field(t("missionEngine.brief.nameAr"), <Input value={brief.nameAr} onChange={(e) => onChange({ nameAr: e.target.value })} dir="rtl" className="text-end" />)}
          {field(t("missionEngine.brief.country"), <CountrySelect value={brief.countryCode ?? null} onChange={(code) => onChange({ countryCode: code ?? undefined })} />)}
          {field(t("missionEngine.brief.visitorLevel"), select("vipLevel", VIP_LEVELS, "contacts.vipLevels"))}
          {field(t("missionEngine.brief.eventType"), select("eventType", EVENT_TYPES, "missionEngine.brief.eventTypes"))}
          {field(t("missionEngine.brief.category"), select("category", CATEGORIES, "missionEngine.brief.categories"))}
          {field(t("missionEngine.brief.arrivalDate"), <Input type="date" value={brief.arrivalDate ?? ""} onChange={(e) => onChange({ arrivalDate: e.target.value })} dir="ltr" />)}
          {field(t("missionEngine.brief.departureDate"), <Input type="date" value={brief.departureDate ?? ""} onChange={(e) => onChange({ departureDate: e.target.value })} dir="ltr" />)}
          {field(t("missionEngine.brief.venue"), <Input value={brief.venue ?? ""} onChange={(e) => onChange({ venue: e.target.value })} />)}
          {field(t("missionEngine.brief.delegationSize"), <Input type="number" min={1} value={brief.delegationSize ?? ""} onChange={(e) => onChange({ delegationSize: Number(e.target.value) || undefined })} dir="ltr" />)}
          {field(t("missionEngine.brief.priority"), select("priority", PRIORITIES, "missionEngine.brief.priorities"))}
          {field(t("missionEngine.brief.owner"), <Input value={brief.owner ?? ""} onChange={(e) => onChange({ owner: e.target.value })} placeholder={t("missionEngine.brief.ownerPh")} />)}
        </div>

        <div className="px-6 pb-6 pt-1 flex justify-center">
          <button onClick={onAnalyze} disabled={!brief.nameEn && !brief.nameAr}
            className="flex items-center gap-2 px-7 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:shadow-md disabled:opacity-40"
            style={{ background: C.mangrove }}>
            <Sparkles size={16} strokeWidth={1.8} /> {t("missionEngine.brief.analyze")} <ChevronEnd size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
