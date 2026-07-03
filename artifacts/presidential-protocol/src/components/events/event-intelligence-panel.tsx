import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/i18n/language-context";
import { useTranslation } from "react-i18next";
import { palette as C } from "@/theme";
import { Sparkles, Check, Circle, ArrowRight, Gauge, Boxes, ListChecks, Wallet, GitBranch, Building2 } from "lucide-react";
import { eventTypeByKey } from "./event-type-selection";

/* Executive Intelligence layer for the Create Event workflow — an ADDITIVE live
 * panel: a Readiness Meter, an AI Digital Twin, Cost & Resource prediction, an
 * auto-completing AI Checklist and a What-Happens-Next guide. Everything derives
 * live from the existing react-hook-form values; no existing logic is touched. */

const L = (lang: string, en: string, ar: string) => (lang === "en" ? en : ar);
type V = Record<string, unknown>;
const str = (v: unknown) => (v == null ? "" : String(v)).trim();

/** Complexity (0..1) from the visit type — drives every prediction. */
function complexityOf(visitType: string, vip: string): number {
  const t = visitType.toLowerCase();
  let base = /royal|state/.test(t) ? 1 : /official|summit/.test(t) ? 0.78 : /diplomatic|conference|signing|ceremony/.test(t) ? 0.58 : /working|media/.test(t) ? 0.42 : /internal|cabinet|emergency/.test(t) ? 0.26 : 0.5;
  if (/head_of_state|royal/.test(vip)) base = Math.min(1, base + 0.08);
  if (/minister/.test(vip)) base = Math.min(1, base + 0.03);
  return base;
}

function readinessOf(v: V): number {
  const w: [string, number][] = [
    ["name", 10], ["delegationCountry", 12], ["visitType", 8], ["vipLevel", 12], ["date", 10],
    ["location", 10], ["delegateName", 12], ["securityLevel", 8], ["protocolLevel", 8], ["delegateCount", 5], ["durationDays", 5],
  ];
  let sum = 0;
  for (const [k, pts] of w) if (str(v[k])) sum += pts;
  return Math.min(100, Math.round(sum));
}

function resourcesOf(v: V, cx: number) {
  const guests = Number(str(v.delegateCount)) || Math.round(cx * 40);
  const days = Math.max(1, Number(str(v.durationDays)) || 1);
  const intl = str(v.delegationCountry) && str(v.delegationCountry).toUpperCase() !== "AE";
  const r = (n: number) => Math.max(0, Math.round(n));
  const budget = 0.3 + cx * 1.4 + guests * 0.004 + days * 0.12; // in AED millions
  return {
    budget: `AED ${budget.toFixed(1)}M`,
    protocolStaff: r(4 + cx * 16),
    security: r(6 + cx * 48),
    vehicles: r(3 + cx * 14),
    motorcycles: r(cx * 5),
    hotels: cx > 0.6 ? 2 : 1,
    vipSuites: r(1 + cx * 3),
    drivers: r(3 + cx * 8),
    interpreters: intl ? r(1 + cx * 2) : 1,
    mediaCrew: r(cx * 9),
    medical: cx > 0.5 ? 2 : 1,
  };
}

function checklistOf(v: V, lang: string, cx: number) {
  const base: { label: string; done: boolean }[] = [
    { label: L(lang, "Event identity defined", "تحديد هوية الفعالية"), done: !!str(v.name) },
    { label: L(lang, "Country selected", "اختيار الدولة"), done: !!str(v.delegationCountry) },
    { label: L(lang, "VIP level set", "تحديد مستوى الشخصية"), done: !!str(v.vipLevel) },
    { label: L(lang, "Visit date scheduled", "جدولة تاريخ الزيارة"), done: !!str(v.date) },
    { label: L(lang, "Venue selected", "اختيار المكان"), done: !!str(v.location) },
    { label: L(lang, "Delegation defined", "تحديد الوفد"), done: !!str(v.delegateName) },
    { label: L(lang, "Security level set", "تحديد مستوى الأمن"), done: !!str(v.securityLevel) },
    { label: L(lang, "Protocol level set", "تحديد مستوى البروتوكول"), done: !!str(v.protocolLevel) },
  ];
  if (cx > 0.55) base.push(
    { label: L(lang, "Motorcade required", "الموكب مطلوب"), done: !!str(v.transportNeeds) },
    { label: L(lang, "Interpreter assigned", "تعيين مترجم"), done: false },
    { label: L(lang, "Protocol gift selected", "اختيار هدية البروتوكول"), done: false },
    { label: L(lang, "Media briefing prepared", "إعداد إحاطة إعلامية"), done: false },
  );
  return base;
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-2xl border p-4 ${className}`} style={{ borderColor: C.border, background: "linear-gradient(180deg,#FFFFFF,#FCFAF6)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.85)" }}>{children}</div>;
}
function Head({ icon: Icon, children }: { icon: typeof Gauge; children: React.ReactNode }) {
  return <p className="text-[11px] font-semibold text-muted-foreground tracking-wide flex items-center gap-1.5 mb-3"><Icon size={12} /> {children}</p>;
}
function Stat({ label, value, color }: { label: string; value: string | number; color?: string }) {
  return (
    <div className="rounded-xl border px-2.5 py-2" style={{ borderColor: C.border, background: "#fff" }}>
      <AnimatePresence mode="popLayout"><motion.p key={String(value)} initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }} transition={{ duration: 0.25 }} className="text-[15px] font-bold tabular-nums" style={{ color: color ?? C.textPrimary, fontFamily: "Georgia, serif" }}>{value}</motion.p></AnimatePresence>
      <p className="text-[9.5px] text-muted-foreground leading-tight mt-0.5">{label}</p>
    </div>
  );
}

export function EventIntelligencePanel({ values, eventType }: { values: V; eventType?: string }) {
  const { lang } = useLanguage();
  const { t } = useTranslation();
  /** Humanize a stored key into its executive label (never raw debug text). */
  const lbl = (key: string, raw: string) => { if (!raw) return "—"; const v = t(key); return v === key ? raw : v; };
  const et = eventTypeByKey(eventType);
  const cx = et ? et.complexity : complexityOf(str(values.visitType), str(values.vipLevel));
  const readiness = useMemo(() => readinessOf(values), [values]);
  const res = useMemo(() => resourcesOf(values, cx), [values, cx]);
  const checks = useMemo(() => checklistOf(values, lang, cx), [values, lang, cx]);
  const done = checks.filter((c) => c.done).length;
  const confidence = readiness >= 80 ? L(lang, "High", "عالية") : readiness >= 50 ? L(lang, "Medium", "متوسطة") : L(lang, "Building", "قيد البناء");
  const status = readiness >= 80 ? L(lang, "Ready for AI Review", "جاهز لمراجعة الذكاء") : readiness >= 50 ? L(lang, "Gathering details", "جمع التفاصيل") : L(lang, "In progress", "قيد التقدم");
  const meterColor = readiness >= 80 ? C.mangrove : readiness >= 50 ? C.gold : C.castleHill;

  const r = 46, circ = 2 * Math.PI * r;
  const twin: [string, string][] = [
    [L(lang, "Type", "النوع"), et ? L(lang, et.en, et.ar) : lbl(`pages.createOfficialEvent.visitTypes.${str(values.visitType)}`, str(values.visitType))],
    [L(lang, "Country", "الدولة"), lbl(`countries.${str(values.delegationCountry)}`, str(values.delegationCountry))],
    [L(lang, "Delegation Leader", "رئيس الوفد"), str(values.delegateName) || lbl(`pages.createOfficialEvent.vipLevels.${str(values.vipLevel)}`, str(values.vipLevel))],
    [L(lang, "Date & Time", "التاريخ والوقت"), str(values.date) ? str(values.date).replace("T", " · ") : "—"],
    [L(lang, "Venue", "المكان"), str(values.location) || "—"],
    [L(lang, "Delegation Size", "عدد المرافقين"), str(values.delegateCount) ? `${str(values.delegateCount)} ${L(lang, "members", "مرافق")}` : "—"],
    [L(lang, "Protocol Level", "مستوى البروتوكول"), lbl(`pages.createOfficialEvent.protocolLevels.${str(values.protocolLevel)}`, str(values.protocolLevel))],
    [L(lang, "Security Level", "مستوى الأمن"), lbl(`pages.createOfficialEvent.securityLevels.${str(values.securityLevel)}`, str(values.securityLevel))],
  ];
  const milestones = ([
    [L(lang, "Event named", "تسمية الفعالية"), !!str(values.name)],
    [L(lang, "Country selected", "اختيار الدولة"), !!str(values.delegationCountry)],
    [L(lang, "VIP identified", "تحديد الشخصية"), !!str(values.delegateName)],
    [L(lang, "Date scheduled", "جدولة التاريخ"), !!str(values.date)],
    [L(lang, "Venue selected", "اختيار المكان"), !!str(values.location)],
    [L(lang, "Protocol generated", "توليد البروتوكول"), !!str(values.protocolLevel)],
    [L(lang, "Security set", "تحديد الأمن"), !!str(values.securityLevel)],
  ] as [string, boolean][]).filter(([, d]) => d);
  if (readiness >= 80) milestones.push([L(lang, "Ready for AI Review", "جاهز لمراجعة الذكاء"), true]);

  const next = readiness >= 80
    ? { t: L(lang, "Executive AI Review", "مراجعة الذكاء التنفيذي"), d: L(lang, "~12 seconds", "~12 ثانية"), why: L(lang, "AI will analyze protocol, security, logistics, VIP, media and risks.", "سيحلل الذكاء البروتوكول والأمن واللوجستيات والشخصيات والإعلام والمخاطر.") }
    : readiness >= 50
      ? { t: L(lang, "Complete key details", "أكمل التفاصيل الأساسية"), d: L(lang, "~2 minutes", "~دقيقتان"), why: L(lang, "Add venue, delegation and security to unlock AI Review.", "أضف المكان والوفد والأمن لفتح مراجعة الذكاء.") }
      : { t: L(lang, "Continue building the event", "واصل بناء الفعالية"), d: L(lang, "~3 minutes", "~3 دقائق"), why: L(lang, "Executive AI builds the event with you as you fill the essentials.", "يبني الذكاء التنفيذي الفعالية معك أثناء إدخال الأساسيات.") };

  return (
    <div className="space-y-4 lg:sticky lg:top-4">
      {/* Readiness meter */}
      <Card>
        <Head icon={Gauge}>{L(lang, "EXECUTIVE READINESS", "الجاهزية التنفيذية")}</Head>
        <div className="flex items-center gap-4">
          <div className="relative shrink-0" style={{ width: 108, height: 108 }}>
            <svg width="108" height="108" viewBox="0 0 108 108">
              <circle cx="54" cy="54" r={r} fill="none" stroke={C.border} strokeWidth="8" />
              <motion.circle cx="54" cy="54" r={r} fill="none" stroke={meterColor} strokeWidth="8" strokeLinecap="round"
                transform="rotate(-90 54 54)" strokeDasharray={circ} initial={false} animate={{ strokeDashoffset: circ * (1 - readiness / 100) }} transition={{ duration: 0.8, ease: "easeOut" }} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <AnimatePresence mode="popLayout"><motion.span key={readiness} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-[26px] font-bold tabular-nums" style={{ color: meterColor, fontFamily: "Georgia, serif" }}>{readiness}%</motion.span></AnimatePresence>
            </div>
          </div>
          <div className="min-w-0">
            <p className="text-[11px] text-muted-foreground">{L(lang, "AI Confidence", "ثقة الذكاء")}</p>
            <p className="text-[15px] font-bold" style={{ color: meterColor, fontFamily: "Georgia, serif" }}>{confidence}</p>
            <p className="text-[11px] text-muted-foreground mt-2">{L(lang, "Status", "الحالة")}</p>
            <p className="text-[12.5px] font-medium text-foreground">{status}</p>
          </div>
        </div>
      </Card>

      {/* Digital twin */}
      <Card>
        <Head icon={Sparkles}>{L(lang, "EXECUTIVE SUMMARY", "الملخص التنفيذي")}</Head>
        <div className="space-y-1.5">
          {twin.map(([k, val]) => (
            <div key={k} className="flex items-center justify-between gap-3 text-[12px]">
              <span className="text-muted-foreground">{k}</span>
              <AnimatePresence mode="popLayout"><motion.span key={val} initial={{ opacity: 0, x: 4 }} animate={{ opacity: 1, x: 0 }} className="font-medium text-foreground truncate max-w-[150px] text-end" style={{ color: val === "—" ? C.warmGray : C.textPrimary }}>{val}</motion.span></AnimatePresence>
            </div>
          ))}
        </div>
      </Card>

      {/* Executive timeline */}
      <Card>
        <Head icon={GitBranch}>{L(lang, "EXECUTIVE TIMELINE", "الخط الزمني التنفيذي")}</Head>
        {milestones.length === 0 ? (
          <p className="text-[12px] text-muted-foreground">{L(lang, "Start building the event to populate the timeline.", "ابدأ ببناء الفعالية لملء الخط الزمني.")}</p>
        ) : (
          <div className="relative ps-4"><span className="absolute inset-y-1 start-[5px] w-px" style={{ background: C.border }} />
            <div className="space-y-2.5">
              <AnimatePresence>{milestones.map(([label], i) => (
                <motion.div key={label} initial={{ opacity: 0, x: 4 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.25, delay: Math.min(i * 0.04, 0.3) }} className="relative flex items-center gap-2.5">
                  <span className="absolute -start-4 w-[11px] h-[11px] rounded-full ring-2 ring-white flex items-center justify-center" style={{ background: C.mangrove }}><Check size={7} className="text-white" /></span>
                  <span className="text-[12px] text-foreground/85">{label}</span>
                </motion.div>
              ))}</AnimatePresence>
            </div>
          </div>
        )}
      </Card>

      {/* Cost & resources */}
      <Card>
        <Head icon={Wallet}>{L(lang, "COST & RESOURCE PREDICTION", "توقّع الكلفة والموارد")}</Head>
        <div className="rounded-xl px-3 py-2.5 mb-2.5 flex items-center justify-between" style={{ background: C.mangrove + "0E" }}>
          <span className="text-[11px] text-muted-foreground">{L(lang, "Estimated Budget", "الميزانية المقدّرة")}</span>
          <AnimatePresence mode="popLayout"><motion.span key={res.budget} initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-[16px] font-bold" style={{ color: C.mangrove, fontFamily: "Georgia, serif" }}>{res.budget}</motion.span></AnimatePresence>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <Stat label={L(lang, "Protocol", "بروتوكول")} value={res.protocolStaff} />
          <Stat label={L(lang, "Security", "أمن")} value={res.security} color={C.castleHill} />
          <Stat label={L(lang, "Vehicles", "مركبات")} value={res.vehicles} />
          <Stat label={L(lang, "Motorcycles", "دراجات")} value={res.motorcycles} />
          <Stat label={L(lang, "Hotels", "فنادق")} value={res.hotels} />
          <Stat label={L(lang, "VIP Suites", "أجنحة")} value={res.vipSuites} color={C.gold} />
          <Stat label={L(lang, "Drivers", "سائقون")} value={res.drivers} />
          <Stat label={L(lang, "Interpreters", "مترجمون")} value={res.interpreters} />
          <Stat label={L(lang, "Media", "إعلام")} value={res.mediaCrew} />
        </div>
      </Card>

      {/* Required departments (event-type driven) */}
      {et && (
        <Card>
          <Head icon={Building2}>{L(lang, "REQUIRED DEPARTMENTS", "الإدارات المطلوبة")}</Head>
          <div className="flex flex-wrap gap-1.5">{et.depts.map(([en, ar]) => <span key={en} className="text-[11px] px-2 py-1 rounded-md" style={{ background: C.mangrove + "10", color: C.mangrove }}>{L(lang, en, ar)}</span>)}</div>
        </Card>
      )}

      {/* AI checklist */}
      <Card>
        <Head icon={ListChecks}>{L(lang, "AI EXECUTIVE CHECKLIST", "قائمة التحقق التنفيذية")} · {done}/{checks.length}</Head>
        <div className="h-1.5 rounded-full mb-3 overflow-hidden" style={{ background: C.border }}>
          <motion.div className="h-full rounded-full" style={{ background: C.mangrove }} initial={false} animate={{ width: `${Math.round((done / checks.length) * 100)}%` }} transition={{ duration: 0.5 }} />
        </div>
        <div className="space-y-1.5">
          {checks.map((c, i) => (
            <div key={i} className="flex items-center gap-2 text-[12px]">
              <motion.span initial={false} animate={{ scale: c.done ? 1 : 0.9 }} className="w-4 h-4 rounded-full flex items-center justify-center shrink-0" style={{ background: c.done ? C.mangrove : "transparent", border: c.done ? "none" : `1.5px solid ${C.border}` }}>
                {c.done ? <Check size={11} className="text-white" /> : <Circle size={5} className="text-muted-foreground/40" />}
              </motion.span>
              <span style={{ color: c.done ? C.textPrimary : C.warmGray, textDecoration: "none" }}>{c.label}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* What happens next */}
      <Card className="!bg-none" >
        <Head icon={ArrowRight}>{L(lang, "WHAT HAPPENS NEXT", "ما الخطوة التالية")}</Head>
        <p className="text-[13px] font-semibold text-foreground" style={{ fontFamily: "Georgia, serif" }}>{next.t}</p>
        <p className="text-[12px] text-muted-foreground leading-relaxed mt-1">{next.why}</p>
        <div className="mt-2.5 inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-md" style={{ background: C.gold + "14", color: C.mediumWood }}><Boxes size={12} /> {L(lang, "Estimated time", "الوقت المقدّر")}: {next.d}</div>
      </Card>
    </div>
  );
}
