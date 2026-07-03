import { useMemo, useState, type ElementType } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/i18n/language-context";
import { palette as C } from "@/theme";
import {
  Flag, Crown, Users, Building2, Briefcase, Presentation, FileSignature, Plane,
  Radio, GraduationCap, AlertTriangle, ShieldCheck, PartyPopper, Shapes, Sparkles, ArrowLeft,
} from "lucide-react";

/* Phase 1 — Executive event-type selection. The user must choose a type before
 * the form appears; nothing is preselected. The chosen type drives the form's
 * visitType and the Executive AI panel (complexity, cost, checklist, departments).
 * Pure presentation — no business logic or backend change. */

const L = (lang: string, en: string, ar: string) => (lang === "en" ? en : ar);

export type EventTypeDef = {
  key: string; en: string; ar: string; descEn: string; descAr: string;
  icon: ElementType; complexity: number; visitType: string; confidence: number;
  depts: [string, string][];
};

export const EVENT_TYPES: EventTypeDef[] = [
  { key: "official", en: "Official Visit", ar: "زيارة رسمية", descEn: "Visiting official with full protocol", descAr: "مسؤول رسمي ببروتوكول كامل", icon: Flag, complexity: 0.78, visitType: "official", confidence: 0.95, depts: [["Protocol", "البروتوكول"], ["Security", "الأمن"], ["Logistics", "اللوجستيات"]] },
  { key: "state", en: "State Visit", ar: "زيارة دولة", descEn: "Head of state, highest protocol", descAr: "رئيس دولة، أعلى بروتوكول", icon: Crown, complexity: 1, visitType: "state", confidence: 0.96, depts: [["Protocol", "البروتوكول"], ["Security", "الأمن"], ["Media", "الإعلام"], ["Logistics", "اللوجستيات"]] },
  { key: "delegation", en: "Delegation Reception", ar: "استقبال وفد", descEn: "External delegation reception", descAr: "استقبال وفد خارجي", icon: Users, complexity: 0.6, visitType: "official", confidence: 0.92, depts: [["Protocol", "البروتوكول"], ["Hospitality", "الضيافة"], ["Logistics", "اللوجستيات"]] },
  { key: "internal", en: "Internal Event", ar: "فعالية داخلية", descEn: "Internal organizational event", descAr: "فعالية تنظيمية داخلية", icon: Building2, complexity: 0.26, visitType: "working", confidence: 0.9, depts: [["Operations", "العمليات"], ["IT / AV", "تقنية المعلومات"]] },
  { key: "meeting", en: "Executive Meeting", ar: "اجتماع تنفيذي", descEn: "Leadership meeting with decisions", descAr: "اجتماع قيادي مع قرارات", icon: Briefcase, complexity: 0.3, visitType: "working", confidence: 0.91, depts: [["Secretariat", "الأمانة"], ["Operations", "العمليات"]] },
  { key: "conference", en: "Conference / Summit", ar: "مؤتمر / قمة", descEn: "Multi-delegation conference", descAr: "مؤتمر متعدد الوفود", icon: Presentation, complexity: 0.82, visitType: "official", confidence: 0.9, depts: [["Protocol", "البروتوكول"], ["Media", "الإعلام"], ["Security", "الأمن"], ["Logistics", "اللوجستيات"]] },
  { key: "signing", en: "Signing Ceremony", ar: "مراسم توقيع", descEn: "Agreement signing ceremony", descAr: "مراسم توقيع اتفاقية", icon: FileSignature, complexity: 0.58, visitType: "official", confidence: 0.9, depts: [["Protocol", "البروتوكول"], ["Media", "الإعلام"]] },
  { key: "airport", en: "Airport Reception", ar: "استقبال المطار", descEn: "VIP arrival at the airport", descAr: "استقبال شخصية في المطار", icon: Plane, complexity: 0.55, visitType: "official", confidence: 0.93, depts: [["Protocol", "البروتوكول"], ["Security", "الأمن"], ["Logistics", "اللوجستيات"]] },
  { key: "media", en: "Media Event", ar: "فعالية إعلامية", descEn: "Press / media engagement", descAr: "فعالية صحفية / إعلامية", icon: Radio, complexity: 0.42, visitType: "working", confidence: 0.88, depts: [["Media", "الإعلام"], ["Operations", "العمليات"]] },
  { key: "workshop", en: "Government Workshop", ar: "ورشة حكومية", descEn: "Internal government workshop", descAr: "ورشة عمل حكومية", icon: GraduationCap, complexity: 0.35, visitType: "working", confidence: 0.89, depts: [["Operations", "العمليات"], ["IT / AV", "تقنية المعلومات"]] },
  { key: "emergency", en: "Emergency Meeting", ar: "اجتماع طارئ", descEn: "Urgent leadership briefing", descAr: "إحاطة قيادية عاجلة", icon: AlertTriangle, complexity: 0.5, visitType: "working", confidence: 0.9, depts: [["Security", "الأمن"], ["Operations", "العمليات"]] },
  { key: "inspection", en: "Protocol Inspection", ar: "تفتيش بروتوكولي", descEn: "Readiness / protocol inspection", descAr: "تفتيش الجاهزية والبروتوكول", icon: ShieldCheck, complexity: 0.4, visitType: "working", confidence: 0.87, depts: [["Protocol", "البروتوكول"], ["Security", "الأمن"]] },
  { key: "national", en: "National Celebration", ar: "احتفال وطني", descEn: "National day / celebration", descAr: "يوم وطني / احتفال", icon: PartyPopper, complexity: 0.85, visitType: "state", confidence: 0.9, depts: [["Protocol", "البروتوكول"], ["Media", "الإعلام"], ["Security", "الأمن"], ["Logistics", "اللوجستيات"]] },
  { key: "other", en: "Other", ar: "أخرى", descEn: "AI recommends the closest workflow", descAr: "يقترح الذكاء أقرب مسار", icon: Shapes, complexity: 0.5, visitType: "working", confidence: 0.7, depts: [["Operations", "العمليات"]] },
];

export const eventTypeByKey = (k?: string) => EVENT_TYPES.find((e) => e.key === k);

const cxLabel = (cx: number, lang: string) => cx >= 0.7 ? L(lang, "High", "عالٍ") : cx >= 0.4 ? L(lang, "Medium", "متوسط") : L(lang, "Low", "بسيط");
const cxColor = (cx: number) => cx >= 0.7 ? (C.alert ?? "#C0623F") : cx >= 0.4 ? C.gold : C.mangrove;

/** Keyword recommendation from a free-text brief. */
function recommend(textRaw: string): { type: EventTypeDef; reasonEn: string; reasonAr: string } | null {
  const t = textRaw.toLowerCase();
  if (!t.trim()) return null;
  const pick = (k: string) => eventTypeByKey(k)!;
  if (/delegation|وفد/.test(t) && !/head of state|president|king|رئيس دولة/.test(t)) return { type: pick("delegation"), reasonEn: "External delegation and reception venue; no head-of-state detected.", reasonAr: "وفد خارجي ومكان استقبال؛ لا توجد إشارة لرئيس دولة." };
  if (/head of state|president|king|emir|prime minister|رئيس دولة|ملك|أمير/.test(t)) return { type: pick("state"), reasonEn: "Head-of-state language detected — highest protocol.", reasonAr: "إشارة إلى رئيس دولة — أعلى بروتوكول." };
  if (/airport|arrival|flight|مطار|وصول|رحلة/.test(t)) return { type: pick("airport"), reasonEn: "Arrival / airport context detected.", reasonAr: "سياق وصول / مطار." };
  if (/conference|summit|مؤتمر|قمة/.test(t)) return { type: pick("conference"), reasonEn: "Multi-delegation conference context.", reasonAr: "سياق مؤتمر متعدد الوفود." };
  if (/signing|agreement|توقيع|اتفاق/.test(t)) return { type: pick("signing"), reasonEn: "Agreement signing context.", reasonAr: "سياق توقيع اتفاقية." };
  if (/media|press|إعلام|صحفي/.test(t)) return { type: pick("media"), reasonEn: "Media / press context.", reasonAr: "سياق إعلامي / صحفي." };
  if (/emergency|urgent|طارئ|عاجل/.test(t)) return { type: pick("emergency"), reasonEn: "Urgency detected.", reasonAr: "تم رصد طابع عاجل." };
  if (/meeting|اجتماع/.test(t)) return { type: pick("meeting"), reasonEn: "Internal meeting context.", reasonAr: "سياق اجتماع داخلي." };
  if (/internal|workshop|داخلي|ورشة/.test(t)) return { type: pick("internal"), reasonEn: "Internal event context.", reasonAr: "سياق فعالية داخلية." };
  if (/official|رسمية/.test(t)) return { type: pick("official"), reasonEn: "Official visit context.", reasonAr: "سياق زيارة رسمية." };
  return { type: pick("other"), reasonEn: "Not enough signal — start neutral; AI will refine.", reasonAr: "إشارة غير كافية — ابدأ محايداً وسيحسّن الذكاء." };
}

export function EventTypeSelection({ onSelect }: { onSelect: (t: EventTypeDef) => void }) {
  const { lang } = useLanguage();
  const [brief, setBrief] = useState("");
  const rec = useMemo(() => recommend(brief), [brief]);

  return (
    <div className="space-y-7">
      <div className="text-start">
        <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.36em", color: C.castleHill, marginBottom: 8 }}>{L(lang, "NEW EVENT", "فعالية جديدة")}</p>
        <h1 className="text-3xl font-bold" style={{ color: C.textPrimary, fontFamily: "Georgia, serif", lineHeight: 1.15 }}>{L(lang, "What type of event are you creating?", "ما نوع الفعالية التي تريد إنشاءها؟")}</h1>
        <p className="text-sm mt-2" style={{ color: C.warmGray }}>{L(lang, "Select an event type to begin. Nothing is assumed — the form and Executive AI adapt to your choice.", "اختر نوع الفعالية للبدء. لا افتراضات مسبقة — يتكيّف النموذج والذكاء التنفيذي مع اختيارك.")}</p>
      </div>

      {/* AI brief recommender */}
      <div className="rounded-2xl border p-4" style={{ borderColor: C.border, background: "linear-gradient(180deg,#FFFFFF,#FCFAF6)" }}>
        <p className="text-[11px] font-semibold text-muted-foreground tracking-wide flex items-center gap-1.5 mb-2.5"><Sparkles size={12} style={{ color: C.gold }} /> {L(lang, "DESCRIBE YOUR EVENT (OPTIONAL)", "صف فعاليتك (اختياري)")}</p>
        <input value={brief} onChange={(e) => setBrief(e.target.value)} placeholder={L(lang, "e.g. We are receiving a delegation from Saudi Arabia at Qasr Al Watan…", "مثال: نستقبل وفداً من المملكة العربية السعودية في قصر الوطن…")}
          className="w-full h-11 rounded-xl border bg-card px-3.5 text-sm outline-none focus:ring-1 focus:ring-primary/30" style={{ borderColor: C.border }} />
        {rec && (
          <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="mt-3 flex items-center gap-3 rounded-xl px-3 py-2.5" style={{ background: C.gold + "0E" }}>
            <rec.type.icon size={18} style={{ color: C.mediumWood }} className="shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-[12.5px] font-semibold text-foreground">{L(lang, "Suggested", "المقترح")}: {L(lang, rec.type.en, rec.type.ar)} <span className="text-[11px] font-normal text-muted-foreground">· {Math.round(rec.type.confidence * 100)}%</span></p>
              <p className="text-[11px] text-muted-foreground">{L(lang, rec.reasonEn, rec.reasonAr)}</p>
            </div>
            <button onClick={() => onSelect(rec.type)} className="shrink-0 text-xs font-medium px-3 py-1.5 rounded-lg text-white" style={{ background: C.mangrove }}>{L(lang, "Use this", "اعتمد")}</button>
          </motion.div>
        )}
      </div>

      {/* Type cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {EVENT_TYPES.map((et, i) => (
          <motion.button key={et.key} type="button" onClick={() => onSelect(et)}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: Math.min(i * 0.025, 0.25) }}
            className="group text-start rounded-2xl border p-5 transition-all duration-[250ms] hover:-translate-y-1 hover:shadow-[0_18px_40px_-22px_rgba(28,40,30,0.45)]"
            style={{ borderColor: C.border, background: "linear-gradient(180deg,#FFFFFF,#FCFAF6)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.85)" }}>
            <div className="flex items-start justify-between gap-3">
              <span className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: C.mangrove + "12", color: C.mangrove }}><et.icon size={20} strokeWidth={1.6} /></span>
              <span className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-[3px] rounded-md" style={{ background: C.gold + "14", color: C.mediumWood }}><Sparkles size={9} /> {Math.round(et.confidence * 100)}%</span>
            </div>
            <h3 className="text-[15px] font-bold text-foreground mt-3" style={{ fontFamily: "Georgia, serif" }}>{L(lang, et.en, et.ar)}</h3>
            <p className="text-[12px] text-muted-foreground mt-1 leading-relaxed">{L(lang, et.descEn, et.descAr)}</p>
            <div className="flex flex-wrap gap-1.5 mt-3">
              {et.depts.slice(0, 3).map(([en, ar]) => <span key={en} className="text-[10px] px-1.5 py-0.5 rounded-md" style={{ background: C.warmGray + "12", color: C.warmGray }}>{L(lang, en, ar)}</span>)}
            </div>
            <div className="flex items-center justify-between mt-3 pt-3 border-t" style={{ borderColor: C.border }}>
              <span className="text-[11px] text-muted-foreground">{L(lang, "Complexity", "التعقيد")}: <span className="font-medium" style={{ color: cxColor(et.complexity) }}>{cxLabel(et.complexity, lang)}</span></span>
              <span className="text-[11px] font-medium inline-flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: C.mangrove }}>{L(lang, "Select", "اختيار")} <ArrowLeft size={12} className="rtl:rotate-0 ltr:rotate-180" /></span>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
