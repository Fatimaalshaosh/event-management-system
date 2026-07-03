import type { AssistantAction, CommandIntel, Countdown, DeptPresence, HeatCell, LogEntry, ReadinessForecast, StoryEvent } from "./types";

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

/* ── Dynamic mission story (demo timeline narrative) ──── */
function buildStory(): StoryEvent[] {
  return [
    { time: "08:30", text: { en: "Media completed the press draft.", ar: "أكمل الإعلام مسودة البيان الصحفي." }, tone: "good" },
    { time: "09:10", text: { en: "Protocol approved the seating order.", ar: "اعتمدت المراسم ترتيب الجلوس." }, tone: "good" },
    { time: "09:45", text: { en: "Airport clearance still pending.", ar: "لا يزال تصريح المطار معلّقاً." }, tone: "warn" },
    { time: "10:20", text: { en: "Security confidence increased to 91%.", ar: "ارتفعت الثقة الأمنية إلى ٩١٪." }, tone: "good" },
    { time: "10:40", text: { en: "Readiness improved from 68% to 71%.", ar: "تحسّنت الجاهزية من ٦٨٪ إلى ٧١٪." }, tone: "good" },
    { time: "11:05", text: { en: "AI flagged a media accreditation blocker.", ar: "رصد الذكاء الاصطناعي عائقاً في اعتماد الإعلام." }, tone: "warn" },
  ];
}

/* ── Predictive readiness per milestone ───────────────── */
function buildPredictive(overall: number, countdown: Countdown): ReadinessForecast[] {
  const arr = countdown.projectedReadiness;
  return [
    { key: "tomorrow", value: clamp(overall + 5), confidence: "high" },
    { key: "h48", value: clamp(overall + 9), confidence: "high" },
    { key: "arrival", value: arr, confidence: "medium" },
    { key: "opening", value: clamp(arr + 3), confidence: "medium" },
    { key: "mainMeeting", value: clamp(arr + 5), confidence: "medium" },
    { key: "closing", value: 97, confidence: "low" },
    { key: "departure", value: 99, confidence: "low" },
  ];
}

/* ── Government operations log ─────────────────────────── */
function buildOpsLog(): LogEntry[] {
  return [
    { id: "l1", time: "11:05", type: "ai", text: { en: "AI recommended approving official titles.", ar: "أوصى الذكاء الاصطناعي باعتماد الألقاب الرسمية." } },
    { id: "l2", time: "10:40", type: "change", text: { en: "Readiness recalculated to 71%.", ar: "أُعيد حساب الجاهزية إلى ٧١٪." } },
    { id: "l3", time: "10:20", type: "approval", text: { en: "Security checkpoint plan approved.", ar: "اعتُمدت خطة نقاط التفتيش الأمنية." } },
    { id: "l4", time: "09:45", type: "delay", text: { en: "Airport clearance delayed.", ar: "تأخر تصريح المطار." } },
    { id: "l5", time: "09:10", type: "decision", text: { en: "Seating order approved by Protocol.", ar: "اعتمدت المراسم ترتيب الجلوس." } },
    { id: "l6", time: "08:50", type: "escalation", text: { en: "Logistics escalated arrival-time risk.", ar: "صعّدت اللوجستيات مخاطر وقت الوصول." } },
    { id: "l7", time: "08:30", type: "notification", text: { en: "Media press draft completed.", ar: "اكتملت مسودة البيان الصحفي." } },
  ];
}

/* ── Operational heat map ─────────────────────────────── */
function buildHeatmap(presence: DeptPresence[]): HeatCell[] {
  return presence.map((p) => {
    const load = p.workload;
    const state: HeatCell["state"] = load >= 85 ? "overloaded" : load >= 70 ? "busy" : load >= 40 ? "normal" : "idle";
    return { deptKey: p.deptKey, load, state };
  });
}

/* ── AI Chief of Staff actions (demo outputs) ─────────── */
const ASSISTANT: AssistantAction[] = [
  { key: "summarize", output: { en: "Mission is at 71% readiness, BLOCKED by pending official titles which freeze media, invitations and logistics. Three executive decisions are queued — approving titles before 2 PM lifts readiness ~9% and unblocks three departments.", ar: "المهمة عند ٧١٪ جاهزية، متوقفة بسبب الألقاب الرسمية المعلّقة التي تجمّد الإعلام والدعوات واللوجستيات. توجد ٣ قرارات تنفيذية — اعتماد الألقاب قبل الساعة الثانية يرفع الجاهزية ~٩٪ ويفك حجب ٣ إدارات." } },
  { key: "briefing", output: { en: "Executive briefing drafted — Status: BLOCKED · Root cause: official titles · Decisions: approve titles + arrival sequence · Projected readiness on arrival: 89%.", ar: "تمت صياغة الإحاطة التنفيذية — الحالة: متوقفة · السبب الجذري: الألقاب الرسمية · القرارات: اعتماد الألقاب وتسلسل الوصول · الجاهزية المتوقعة عند الوصول: ٨٩٪." } },
  { key: "predictFailures", output: { en: "Top predicted failure: media accreditation misses the embargo window if titles are not approved by 2 PM. Secondary: fleet timing slips if the arrival time stays unconfirmed.", ar: "أبرز فشل متوقّع: يفوت اعتماد الإعلام نافذة الحظر إن لم تُعتمد الألقاب قبل الساعة ٢. ثانوياً: ينزلق توقيت الأسطول إن بقي وقت الوصول غير مؤكد." } },
  { key: "ministerBriefing", output: { en: "Minister briefing generated: bilateral objectives, delegation profile, protocol honours, gift selection and the two decisions awaiting executive approval.", ar: "تم إنشاء إحاطة الوزير: أهداف ثنائية، ملف الوفد، مراسم البروتوكول، اختيار الهدايا، والقرارَان بانتظار الاعتماد التنفيذي." } },
  { key: "protocolChecklist", output: { en: "Protocol checklist generated: red carpet, national anthem, 21-gun salute, seating precedence, gift exchange, official photo, departure honours.", ar: "تم إنشاء قائمة المراسم: السجادة الحمراء، النشيد الوطني، تحية المدفعية، أسبقية الجلوس، تبادل الهدايا، الصورة الرسمية، مراسم المغادرة." } },
  { key: "recommendActions", output: { en: "Recommended now: (1) Approve official titles, (2) Confirm arrival time with the embassy, (3) Clear the guest list for security.", ar: "موصى به الآن: (١) اعتماد الألقاب الرسمية، (٢) تأكيد وقت الوصول مع السفارة، (٣) اعتماد قائمة الضيوف أمنياً." } },
];

export function buildCommandIntel(p: { overall: number; countdown: Countdown; presence: DeptPresence[] }): CommandIntel {
  return {
    story: buildStory(),
    predictive: buildPredictive(p.overall, p.countdown),
    opsLog: buildOpsLog(),
    heatmap: buildHeatmap(p.presence),
    assistant: ASSISTANT,
  };
}
