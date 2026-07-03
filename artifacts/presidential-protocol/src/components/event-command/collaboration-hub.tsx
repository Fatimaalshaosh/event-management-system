import { useMemo, useRef, useState, type ElementType } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/i18n/language-context";
import { palette as C } from "@/theme";
import { ExecutiveAvatar } from "@/components/identity";
import { CURRENT_USER } from "@/lib/identity";
import type { IdentityInput } from "@/lib/identity";
import {
  MessagesSquare, Gavel, ListChecks, CheckSquare, FolderClosed, Images, Mic,
  FileText, GitBranch, ShieldAlert, Sparkles, Archive as ArchiveIcon, Pin, Search,
  Reply, Send, Paperclip, Plus, Clock, ChevronRight, Lock, Wand2,
  Square, Bell, Play, ShieldQuestion, X, ArrowUpCircle, CalendarClock, Check, Activity as ActivityIcon,
} from "lucide-react";

/* Executive Collaboration Hub — a single event's live, interactive workspace.
 * One shared store drives Discussions, Decisions, Tasks, Approvals, Risks,
 * Timeline, Activity and Notifications, so any action updates every section.
 * Demo-state but realistic. Reuses the Executive Identity system + palette. */

const L = (lang: string, en: string, ar: string) => (lang === "en" ? en : ar);
const SURFACE = "linear-gradient(180deg, #FFFFFF 0%, #FCFAF6 100%)";

type SectionKey =
  | "discussions" | "decisions" | "tasks" | "approvals" | "files" | "photos"
  | "voice" | "minutes" | "timeline" | "risks" | "ai" | "archive";

const NAV: { key: SectionKey; en: string; ar: string; icon: ElementType }[] = [
  { key: "discussions", en: "Discussions", ar: "النقاشات", icon: MessagesSquare },
  { key: "decisions", en: "Decisions", ar: "القرارات", icon: Gavel },
  { key: "tasks", en: "Tasks", ar: "المهام", icon: ListChecks },
  { key: "approvals", en: "Approvals", ar: "الموافقات", icon: CheckSquare },
  { key: "files", en: "Files", ar: "الملفات", icon: FolderClosed },
  { key: "photos", en: "Photos", ar: "الصور", icon: Images },
  { key: "voice", en: "Voice Notes", ar: "الملاحظات الصوتية", icon: Mic },
  { key: "minutes", en: "Meeting Minutes", ar: "محاضر الاجتماعات", icon: FileText },
  { key: "timeline", en: "Timeline", ar: "الخط الزمني", icon: GitBranch },
  { key: "risks", en: "Risks", ar: "المخاطر", icon: ShieldAlert },
  { key: "ai", en: "AI Assistant", ar: "المساعد الذكي", icon: Sparkles },
  { key: "archive", en: "Archive", ar: "الأرشيف", icon: ArchiveIcon },
];

const P = (id: number | string, name: string, role: string, department: string): IdentityInput => ({ id, name, role, department });
const AI_AUTHOR: IdentityInput = { id: 9001, name: "Executive AI", role: "Chief of Staff Assistant", department: "chairmanOffice" };
const A = {
  me: CURRENT_USER as IdentityInput,
  protocol: P(3, "Layla Al Mansoori", "Protocol Director", "protocol"),
  security: P(19, "Ali Al Mazrouei", "Security Coordinator", "security"),
  logistics: P(43, "Ahmed Al Zaabi", "Logistics Lead", "logistics"),
  procurement: P(7, "Ahmed Al Marri", "Procurement Manager", "procurement"),
  liaison: P(18, "Aisha Al Hammadi", "Liaison Officer", "protocol"),
};
const PEOPLE = [A.me, A.protocol, A.security, A.logistics, A.procurement, A.liaison];
const findPerson = (name: string) => PEOPLE.find((p) => p.name === name) ?? A.me;
const REACTIONS = ["👍", "❤️", "✔️", "⚠️", "👏"];
const ESCALATE_TO = [["Director", "مدير"], ["Executive Director", "مدير تنفيذي"], ["Secretary General", "أمين عام"], ["Chairman", "الرئيس"], ["CEO", "الرئيس التنفيذي"]] as const;

/* ── store types ── */
type Kind = "msg" | "voice" | "ai";
type Voice = { dur: string; transcript: string; summary: string };
type Meta = { task?: number; decision?: number; approval?: number; risk?: number; followup?: boolean; escalated?: string };
type Msg = { id: number; kind: Kind; author: IdentityInput; at: string; body: string; reacts: Record<string, number>; replies: number; parentId?: number; pinned?: boolean; edited?: boolean; thinking?: boolean; voice?: Voice; files?: string[] };
type Decision = { id: number; t: string; by: IdentityInput; at: string; status: readonly [string, string]; rel: string };
type Task = { id: number; t: string; assignee: IdentityInput; at: string; status: string; priority?: string; due?: string };
type Approval = { id: number; t: string; approver: IdentityInput; at: string; due: string; priority: string; status: string };
type Risk = { id: number; t: string; sev: readonly [string, string]; owner: IdentityInput; status: string; ai: string };
type TL = { id: number; at: string; c: string; text: string };
type Notif = { id: number; at: string; text: string };
type Act = { id: number; at: string; who: IdentityInput | null; text: string };
type Store = { messages: Msg[]; decisions: Decision[]; tasks: Task[]; approvals: Approval[]; risks: Risk[]; timeline: TL[]; notifs: Notif[]; activity: Act[]; meta: Record<number, Meta>; myReacts: string[]; archived: boolean };

const SEED: Store = {
  messages: [
    { id: 1, kind: "msg", author: A.protocol, at: "09:10", body: "Please confirm whether Entrance B is approved for the VIP arrival. The Chairman prefers it. @Aisha Al Hammadi kindly align the reception line.", reacts: { "👍": 3 }, replies: 0, pinned: true },
    { id: 2, kind: "msg", author: A.logistics, at: "09:22", body: "The motorcade is delayed by 12 minutes due to a checkpoint. Requesting guidance.", reacts: {}, replies: 0 },
    { id: 3, kind: "msg", author: A.procurement, at: "09:40", body: "The gift list has been routed for executive approval. @AI please summarize the open items before the 11:00 sync.", reacts: { "✔️": 1 }, replies: 0 },
  ],
  decisions: [{ id: 1, t: "Chairman approved VIP arrival via Entrance B", by: A.protocol, at: "09:14", status: ["Approved", C.mangrove], rel: "Discussion #1" }],
  tasks: [{ id: 1, t: "Align reception line to Entrance B", assignee: A.liaison, at: "09:23", status: "In progress", priority: "High" }],
  approvals: [{ id: 1, t: "Gift list executive approval", approver: A.protocol, at: "09:41", due: "Today 13:00", priority: "High", status: "Pending" }],
  risks: [{ id: 1, t: "Perimeter 2 buffer may delay motorcade", sev: ["High", C.alert ?? "#C0623F"], owner: A.logistics, status: "Open", ai: "Add a 10-minute contingency and pre-stage a backup vehicle." }],
  timeline: [
    { id: 1, at: "09:10", c: C.calmTeal, text: "Protocol opened a discussion on VIP arrival" },
    { id: 2, at: "09:14", c: C.mangrove, text: "Chairman approved Entrance B" },
  ],
  notifs: [], activity: [
    { id: 1, at: "09:14", who: A.protocol, text: "created a Decision" },
    { id: 2, at: "09:23", who: A.liaison, text: "was assigned a Task" },
  ], meta: {}, myReacts: [], archived: false,
};

/* ── shared store hook ── */
function useHub(lang: string) {
  const [s, setS] = useState<Store>(SEED);
  const seq = useRef(1000);
  const id = () => ++seq.current;
  const now = () => new Date().toLocaleTimeString(lang === "ar" ? "ar" : "en-GB", { hour: "2-digit", minute: "2-digit" });
  const log = (text: string, c: string) => setS((p) => ({ ...p, timeline: [...p.timeline, { id: id(), at: now(), c, text }] }));
  const notify = (text: string) => setS((p) => ({ ...p, notifs: [{ id: id(), at: now(), text }, ...p.notifs] }));
  const act = (who: IdentityInput | null, text: string) => setS((p) => ({ ...p, activity: [{ id: id(), at: now(), who, text }, ...p.activity] }));
  const mark = (mid: number | undefined, m: Meta) => { if (mid != null) setS((p) => ({ ...p, meta: { ...p.meta, [mid]: { ...p.meta[mid], ...m } } })); };

  const addMessage = (author: IdentityInput, body: string, extra: Partial<Msg> = {}) => {
    const mid = id();
    setS((p) => ({ ...p, messages: [...p.messages, { id: mid, kind: "msg", author, at: now(), body, reacts: {}, replies: 0, ...extra }] }));
    if (!extra.thinking && !extra.parentId) log(`${author.name}: ${body.slice(0, 44)}${body.length > 44 ? "…" : ""}`, C.calmTeal);
    return mid;
  };
  const addReply = (parentId: number, body: string) => {
    addMessage(A.me, body, { parentId });
    setS((p) => ({ ...p, messages: p.messages.map((m) => m.id === parentId ? { ...m, replies: m.replies + 1 } : m) }));
    act(A.me, L(lang, "replied in a discussion", "ردّ في نقاش"));
  };
  const addVoice = (author: IdentityInput, voice: Voice) => {
    setS((p) => ({ ...p, messages: [...p.messages, { id: id(), kind: "voice", author, at: now(), body: "", reacts: {}, replies: 0, voice }] }));
    log(`${L(lang, "Voice note transcribed", "تفريغ ملاحظة صوتية")}: ${voice.summary}`, C.castleHill); act(author, L(lang, "recorded a voice note", "سجّل ملاحظة صوتية"));
  };
  const askAI = (prompt: string) => {
    const tid = addMessage(AI_AUTHOR, L(lang, "Thinking…", "جارٍ التحليل…"), { kind: "ai", thinking: true });
    setTimeout(() => {
      const reply = aiReply(prompt, s, lang);
      setS((p) => ({ ...p, messages: p.messages.map((m) => m.id === tid ? { ...m, thinking: false, body: reply } : m) }));
      log(L(lang, "Executive AI generated a response", "أنشأ الذكاء التنفيذي رداً"), C.gold); act(AI_AUTHOR, L(lang, "generated an AI response", "أنشأ رداً ذكياً"));
    }, 1400);
  };
  const toggleReact = (mid: number, emoji: string) => {
    const key = `${mid}:${emoji}`;
    setS((p) => {
      const mine = p.myReacts.includes(key);
      return {
        ...p,
        myReacts: mine ? p.myReacts.filter((k) => k !== key) : [...p.myReacts, key],
        messages: p.messages.map((m) => m.id === mid ? { ...m, reacts: { ...m.reacts, [emoji]: Math.max(0, (m.reacts[emoji] ?? 0) + (mine ? -1 : 1)) } } : m),
      };
    });
  };
  const pin = (mid: number) => setS((p) => ({ ...p, messages: p.messages.map((m) => m.id === mid ? { ...m, pinned: !m.pinned } : m) }));
  const attach = (mid: number, file: string) => { setS((p) => ({ ...p, messages: p.messages.map((m) => m.id === mid ? { ...m, files: [...(m.files ?? []), file] } : m) })); act(A.me, L(lang, "attached a file", "أرفق ملفاً")); };

  const addTask = (f: { t: string; assignee: IdentityInput; priority?: string; due?: string }, srcMid?: number) => {
    const rid = id(); setS((p) => ({ ...p, tasks: [{ id: rid, t: f.t, assignee: f.assignee, at: now(), status: "Open", priority: f.priority, due: f.due }, ...p.tasks] }));
    log(`${L(lang, "Task created", "إنشاء مهمة")}: ${f.t} → ${f.assignee.name}`, C.mediumWood); notify(`${L(lang, "Task assigned to", "مهمة أُسندت إلى")} ${f.assignee.name}`); act(A.me, L(lang, "created a Task", "أنشأ مهمة")); mark(srcMid, { task: rid }); return rid;
  };
  const addDecision = (f: { t: string; by: IdentityInput; rel?: string }, srcMid?: number) => {
    const rid = id(); setS((p) => ({ ...p, decisions: [{ id: rid, t: f.t, by: f.by, at: now(), status: ["Approved", C.mangrove], rel: f.rel ?? L(lang, "Discussion", "نقاش") }, ...p.decisions] }));
    log(`${L(lang, "Decision recorded", "تسجيل قرار")}: ${f.t}`, C.mangrove); notify(`${L(lang, "New decision", "قرار جديد")}: ${f.t}`); act(f.by, L(lang, "created a Decision", "أنشأ قراراً")); mark(srcMid, { decision: rid }); return rid;
  };
  const addApproval = (f: { t: string; approver: IdentityInput; due: string; priority: string }, srcMid?: number) => {
    const rid = id(); setS((p) => ({ ...p, approvals: [{ id: rid, t: f.t, approver: f.approver, at: now(), due: f.due, priority: f.priority, status: "Pending" }, ...p.approvals] }));
    log(`${L(lang, "Approval requested", "طلب موافقة")}: ${f.t}`, C.castleHill); notify(`${L(lang, "Approval routed to", "موافقة موجهة إلى")} ${f.approver.name}`); act(A.me, L(lang, "requested an Approval", "طلب موافقة")); mark(srcMid, { approval: rid }); return rid;
  };
  const addRisk = (f: { t: string; owner: IdentityInput; sev?: readonly [string, string]; ai?: string }, srcMid?: number) => {
    const rid = id(); setS((p) => ({ ...p, risks: [{ id: rid, t: f.t, sev: f.sev ?? ["Medium", C.gold], owner: f.owner, status: "Open", ai: f.ai ?? L(lang, "Mitigation recommended before the arrival window.", "يُوصى بالتخفيف قبل وقت الوصول.") }, ...p.risks] }));
    log(`${L(lang, "Risk logged", "تسجيل خطر")}: ${f.t}`, C.gold); notify(`${L(lang, "New risk", "خطر جديد")}: ${f.t}`); act(f.owner, L(lang, "logged a Risk", "سجّل خطراً")); mark(srcMid, { risk: rid }); return rid;
  };
  const escalate = (mid: number, to: string) => { mark(mid, { escalated: to }); log(`${L(lang, "Escalated to", "تصعيد إلى")} ${to}`, C.alert ?? "#C0623F"); notify(`${L(lang, "Escalation to", "تصعيد إلى")} ${to}`); act(A.me, `${L(lang, "escalated to", "صعّد إلى")} ${to}`); };
  const followup = (mid: number, f: { date: string; person: IdentityInput }) => { mark(mid, { followup: true }); log(`${L(lang, "Follow-up scheduled", "جدولة متابعة")} · ${f.date} · ${f.person.name}`, C.calmTeal); notify(`${L(lang, "Follow-up scheduled with", "متابعة مجدولة مع")} ${f.person.name}`); act(A.me, L(lang, "scheduled a Follow-up", "جدول متابعة")); };
  const setArchived = (v: boolean) => { setS((p) => ({ ...p, archived: v })); if (v) log(L(lang, "Event collaboration archived (read-only)", "أرشفة تعاون الفعالية (للقراءة فقط)"), C.warmGray); };

  return { s, addMessage, addReply, addVoice, askAI, toggleReact, pin, attach, addTask, addDecision, addApproval, addRisk, escalate, followup, setArchived };
}
type Hub = ReturnType<typeof useHub>;

function aiReply(prompt: string, s: Store, lang: string): string {
  const p = prompt.toLowerCase();
  if (/risk|مخاطر/.test(p)) return L(lang, `Identified ${s.risks.length} risk(s). Highest: "${s.risks[0]?.t ?? "—"}". Mitigation advised before the arrival window.`, `تم تحديد ${s.risks.length} خطر. الأعلى: "${s.risks[0]?.t ?? "—"}".`);
  if (/approval|موافق/.test(p)) return L(lang, `${s.approvals.filter((a) => a.status === "Pending").length} pending approval(s): gift list, final guest list before 14:00.`, `${s.approvals.filter((a) => a.status === "Pending").length} موافقة معلقة: قائمة الهدايا، قائمة الضيوف قبل 14:00.`);
  if (/minutes|محضر|brief|إحاطة|sitrep|موقف/.test(p)) return L(lang, `Drafted: summary, attendees, ${s.decisions.length} decision(s), ${s.tasks.length} action(s), ${s.risks.length} risk(s), owners and deadlines.`, `تمت الصياغة: ملخص، الحضور، ${s.decisions.length} قرار، ${s.tasks.length} إجراء، ${s.risks.length} خطر.`);
  if (/stakeholder|أصحاب/.test(p)) return L(lang, "Missing stakeholders: Medical lead not yet engaged for the arrival window.", "أصحاب مصلحة مفقودون: لم يُشرك مسؤول الطوارئ الطبية بعد.");
  if (/email|بريد/.test(p)) return L(lang, "Drafted a formal coordination email to Security & Protocol leads.", "تمت صياغة بريد تنسيق رسمي لقادة الأمن والبروتوكول.");
  return L(lang, `Executive summary — ${s.decisions.length} decision(s), ${s.tasks.length} task(s), ${s.approvals.length} approval(s), ${s.risks.length} risk(s). No blocking conflicts for the 11:00 sync.`, `ملخص تنفيذي — ${s.decisions.length} قرار، ${s.tasks.length} مهمة، ${s.approvals.length} موافقة، ${s.risks.length} خطر.`);
}

/* keyword-driven smart suggestions */
function suggestFor(body: string, lang: string): { label: string; kind: "task" | "risk" | "decision" | "notify" }[] {
  const b = body.toLowerCase();
  const out: { label: string; kind: "task" | "risk" | "decision" | "notify" }[] = [];
  if (/delay|delayed|late|متأخر|تأخر/.test(b)) out.push({ label: L(lang, "Create Task", "إنشاء مهمة"), kind: "task" }, { label: L(lang, "Create Risk", "إنشاء خطر"), kind: "risk" }, { label: L(lang, "Notify Logistics", "إبلاغ اللوجستيات"), kind: "notify" }, { label: L(lang, "Notify Security", "إبلاغ الأمن"), kind: "notify" });
  if (/arrival|changed|change|الوصول|تغيير|غيّر/.test(b)) out.push({ label: L(lang, "Update Timeline", "تحديث الخط الزمني"), kind: "notify" }, { label: L(lang, "Notify Protocol", "إبلاغ البروتوكول"), kind: "notify" }, { label: L(lang, "Create Decision", "إنشاء قرار"), kind: "decision" });
  return out.slice(0, 4);
}

/* ── chrome ── */
function SectionHead({ title, subtitle, action }: { title: string; subtitle: string; action?: React.ReactNode }) {
  return <div className="flex items-end justify-between gap-4 mb-5"><div><h2 className="text-[19px] font-bold text-foreground" style={{ fontFamily: "Georgia, serif" }}>{title}</h2><p className="text-xs text-muted-foreground mt-1">{subtitle}</p></div>{action}</div>;
}
function Panel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-2xl border ${className}`} style={{ borderColor: C.border, background: SURFACE, boxShadow: "inset 0 1px 0 rgba(255,255,255,0.85)" }}>{children}</div>;
}
function StatusPill({ label, color }: { label: string; color: string }) {
  return <span className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-[3px] rounded-md tracking-[0.02em]" style={{ background: color + "14", color, boxShadow: `inset 0 0 0 1px ${color}26` }}>{label}</span>;
}
function Empty({ icon: Icon, title, hint }: { icon: ElementType; title: string; hint: string }) {
  return <div className="text-center py-16 px-6"><Icon size={34} className="mx-auto mb-3 opacity-15" /><p className="text-sm font-medium text-foreground/80" style={{ fontFamily: "Georgia, serif" }}>{title}</p><p className="text-xs text-muted-foreground mt-1.5 max-w-md mx-auto leading-relaxed">{hint}</p></div>;
}
function Body({ text }: { text: string }) {
  const parts = text.split(/(@AI|@[A-Z][\w'-]+(?:\s[A-Z][\w'-]+)?)/g);
  return <p className="text-[13px] text-foreground/85 leading-relaxed">{parts.map((p, i) => /^@/.test(p) ? <span key={i} className="font-medium" style={{ color: p === "@AI" ? C.gold : C.calmTeal }}>{p}</span> : <span key={i}>{p}</span>)}</p>;
}
function Waveform({ color }: { color: string }) {
  const bars = Array.from({ length: 28 }, (_, i) => 5 + Math.round(Math.abs(Math.sin(i * 1.3)) * 16));
  return <div className="flex items-center gap-[2px] h-6">{bars.map((h, i) => <span key={i} className="w-[2px] rounded-full" style={{ height: h, background: color, opacity: 0.55 }} />)}</div>;
}

/* ── Executive Drawer (premium, blurred backdrop, 250ms) ── */
function ExecDrawer({ open, title, onClose, onSubmit, submitLabel, lang, children }: { open: boolean; title: string; onClose: () => void; onSubmit?: () => void; submitLabel?: string; lang: string; children: React.ReactNode }) {
  const { dir } = useLanguage();
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} onClick={onClose} className="fixed inset-0 z-40" style={{ background: "rgba(20,28,22,0.28)", backdropFilter: "blur(3px)" }} />
          <motion.div initial={{ x: dir === "rtl" ? "-100%" : "100%" }} animate={{ x: 0 }} exit={{ x: dir === "rtl" ? "-100%" : "100%" }} transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed inset-y-0 z-50 w-full max-w-md flex flex-col" style={{ [dir === "rtl" ? "left" : "right"]: 0, background: SURFACE, borderInlineStart: `1px solid ${C.border}`, boxShadow: "0 0 60px -10px rgba(28,40,30,0.4)" }} dir={dir}>
            <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: C.border }}>
              <h3 className="text-[15px] font-bold text-foreground" style={{ fontFamily: "Georgia, serif" }}>{title}</h3>
              <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-muted"><X size={16} className="text-muted-foreground" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-3.5">{children}</div>
            <div className="flex items-center gap-2 px-5 py-4 border-t" style={{ borderColor: C.border }}>
              <button onClick={onSubmit} className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white transition-all hover:shadow-sm" style={{ background: C.mangrove }}>{submitLabel ?? L(lang, "Save", "حفظ")}</button>
              <button onClick={onClose} className="px-4 py-2.5 rounded-xl text-sm font-medium border" style={{ borderColor: C.border }}>{L(lang, "Cancel", "إلغاء")}</button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="text-[11px] font-medium text-muted-foreground">{label}</span><div className="mt-1">{children}</div></label>;
}
const inputCls = "w-full h-10 rounded-xl border bg-card px-3 text-[13px] outline-none focus:ring-1 focus:ring-primary/30";
function PersonSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return <select value={value} onChange={(e) => onChange(e.target.value)} className={inputCls} style={{ borderColor: C.border }}>{PEOPLE.map((p) => <option key={String(p.id)} value={p.name}>{p.name}</option>)}</select>;
}

type DrawerKind = "task" | "decision" | "approval" | "risk" | "followup";
function RecordDrawer({ kind, msg, hub, lang, onClose }: { kind: DrawerKind; msg: Msg | null; hub: Hub; lang: string; onClose: () => void }) {
  const seed = msg?.body?.slice(0, 70) ?? "";
  const [f, setF] = useState<Record<string, string>>({ title: seed, assignee: A.liaison.name, owner: A.logistics.name, approver: A.protocol.name, person: A.security.name, priority: "High", severity: "Medium", type: "Operational", date: "Today 14:00", due: "Today 13:00", desc: "" });
  const set = (k: string) => (v: string) => setF((p) => ({ ...p, [k]: v }));
  const submit = () => {
    const t = f.title.trim() || L(lang, "Untitled", "بدون عنوان");
    if (kind === "task") hub.addTask({ t, assignee: findPerson(f.assignee), priority: f.priority, due: f.due }, msg?.id);
    if (kind === "decision") hub.addDecision({ t, by: findPerson(f.owner), rel: msg ? `Discussion #${msg.id}` : undefined }, msg?.id);
    if (kind === "approval") hub.addApproval({ t, approver: findPerson(f.approver), due: f.due, priority: f.priority }, msg?.id);
    if (kind === "risk") hub.addRisk({ t, owner: findPerson(f.owner), sev: [f.severity, f.severity === "High" ? (C.alert ?? "#C0623F") : f.severity === "Low" ? C.calmTeal : C.gold] }, msg?.id);
    if (kind === "followup" && msg) hub.followup(msg.id, { date: f.date, person: findPerson(f.person) });
    onClose();
  };
  const title = { task: L(lang, "Create Task", "إنشاء مهمة"), decision: L(lang, "Create Decision", "إنشاء قرار"), approval: L(lang, "Create Approval", "إنشاء موافقة"), risk: L(lang, "Convert to Risk", "تحويل إلى خطر"), followup: L(lang, "Schedule Follow-up", "جدولة متابعة") }[kind];
  return (
    <ExecDrawer open title={title} onClose={onClose} onSubmit={submit} submitLabel={title} lang={lang}>
      {kind !== "followup" && <Field label={L(lang, "Title", "العنوان")}><input value={f.title} onChange={(e) => set("title")(e.target.value)} className={inputCls} style={{ borderColor: C.border }} /></Field>}
      {(kind === "task" || kind === "decision" || kind === "risk") && <Field label={L(lang, "Description", "الوصف")}><textarea value={f.desc} onChange={(e) => set("desc")(e.target.value)} rows={3} className="w-full rounded-xl border bg-card px-3 py-2 text-[13px] outline-none focus:ring-1 focus:ring-primary/30" style={{ borderColor: C.border }} /></Field>}
      {kind === "task" && <><Field label={L(lang, "Assignee", "المكلَّف")}><PersonSelect value={f.assignee} onChange={set("assignee")} /></Field><Field label={L(lang, "Priority", "الأولوية")}><select value={f.priority} onChange={(e) => set("priority")(e.target.value)} className={inputCls} style={{ borderColor: C.border }}>{["High", "Medium", "Low"].map((x) => <option key={x}>{x}</option>)}</select></Field><Field label={L(lang, "Due Date", "تاريخ الاستحقاق")}><input value={f.due} onChange={(e) => set("due")(e.target.value)} className={inputCls} style={{ borderColor: C.border }} /></Field></>}
      {kind === "decision" && <><Field label={L(lang, "Decision Type", "نوع القرار")}><select value={f.type} onChange={(e) => set("type")(e.target.value)} className={inputCls} style={{ borderColor: C.border }}>{["Operational", "Protocol", "Security", "Strategic"].map((x) => <option key={x}>{x}</option>)}</select></Field><Field label={L(lang, "Decision Owner", "صاحب القرار")}><PersonSelect value={f.owner} onChange={set("owner")} /></Field><Field label={L(lang, "Effective Date", "تاريخ السريان")}><input value={f.due} onChange={(e) => set("due")(e.target.value)} className={inputCls} style={{ borderColor: C.border }} /></Field></>}
      {kind === "approval" && <><Field label={L(lang, "Approver", "المعتمِد")}><PersonSelect value={f.approver} onChange={set("approver")} /></Field><Field label={L(lang, "Priority", "الأولوية")}><select value={f.priority} onChange={(e) => set("priority")(e.target.value)} className={inputCls} style={{ borderColor: C.border }}>{["High", "Medium", "Low"].map((x) => <option key={x}>{x}</option>)}</select></Field><Field label={L(lang, "Due Date", "تاريخ الاستحقاق")}><input value={f.due} onChange={(e) => set("due")(e.target.value)} className={inputCls} style={{ borderColor: C.border }} /></Field></>}
      {kind === "risk" && <><Field label={L(lang, "Severity", "الخطورة")}><select value={f.severity} onChange={(e) => set("severity")(e.target.value)} className={inputCls} style={{ borderColor: C.border }}>{["High", "Medium", "Low"].map((x) => <option key={x}>{x}</option>)}</select></Field><Field label={L(lang, "Owner", "المسؤول")}><PersonSelect value={f.owner} onChange={set("owner")} /></Field></>}
      {kind === "followup" && <><Field label={L(lang, "Date & Time", "التاريخ والوقت")}><input value={f.date} onChange={(e) => set("date")(e.target.value)} className={inputCls} style={{ borderColor: C.border }} /></Field><Field label={L(lang, "Responsible Person", "الشخص المسؤول")}><PersonSelect value={f.person} onChange={set("person")} /></Field></>}
      {msg && <div className="rounded-xl border p-3 text-[11.5px] text-muted-foreground" style={{ borderColor: C.border, background: "#fff" }}><span className="font-medium">{L(lang, "Related discussion", "النقاش المرتبط")}:</span> {msg.body.slice(0, 80)}…</div>}
    </ExecDrawer>
  );
}

/* ── AI menu ── */
const AI_MENU = [
  { en: "Summarize Discussion", ar: "تلخيص النقاش", p: "summarize" }, { en: "Generate Executive Brief", ar: "إحاطة تنفيذية", p: "brief" },
  { en: "Generate Meeting Minutes", ar: "إنشاء المحضر", p: "minutes" }, { en: "Identify Risks", ar: "تحديد المخاطر", p: "risk" },
  { en: "Detect Missing Approvals", ar: "كشف الموافقات الناقصة", p: "approval" }, { en: "Detect Missing Stakeholders", ar: "كشف أصحاب المصلحة", p: "stakeholder" },
  { en: "Draft Official Email", ar: "صياغة بريد رسمي", p: "email" }, { en: "Generate SITREP", ar: "تقرير موقف", p: "sitrep" },
];

/* ── Discussions (interactive) ── */
function Discussions({ lang, hub, goto }: { lang: string; hub: Hub; goto: (s: SectionKey) => void }) {
  const { s } = hub; const archived = s.archived;
  const [q, setQ] = useState(""); const [draft, setDraft] = useState("");
  const [rec, setRec] = useState(0); const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const [demoRunning, setDemoRunning] = useState(false);
  const [drawer, setDrawer] = useState<{ kind: DrawerKind; msg: Msg | null } | null>(null);
  const [replyTo, setReplyTo] = useState<number | null>(null); const [reply, setReply] = useState("");
  const [aiMenu, setAiMenu] = useState(false); const [escMenu, setEscMenu] = useState<number | null>(null);

  const tops = useMemo(() => {
    const t = q.trim().toLowerCase();
    const base = s.messages.filter((m) => !m.parentId);
    return t ? base.filter((m) => (m.body + m.author.name + (m.voice?.transcript ?? "")).toLowerCase().includes(t)) : base;
  }, [s.messages, q]);
  const pinned = tops.filter((m) => m.pinned);

  const send = (text?: string) => { const body = (text ?? draft).trim(); if (!body || archived) return; setDraft(""); if (/@ai/i.test(body)) { hub.addMessage(A.me, body); hub.askAI(body); } else hub.addMessage(A.me, body); };
  const startRec = () => { if (archived) return; setRec(1); timer.current = setInterval(() => setRec((r) => r + 1), 1000); };
  const stopRec = () => { if (timer.current) clearInterval(timer.current); const dur = `0:${String(rec).padStart(2, "0")}`; setRec(0); hub.addVoice(A.me, { dur, transcript: L(lang, "Please update the reception entrance to Gate B and notify Security.", "يرجى تحديث مدخل الاستقبال إلى البوابة B وإبلاغ الأمن."), summary: L(lang, "Reception entrance changed to Gate B. Security notification required.", "تغيير مدخل الاستقبال إلى البوابة B. يلزم إبلاغ الأمن.") }); };
  const sendReply = (pid: number) => { if (!reply.trim()) return; hub.addReply(pid, reply.trim()); setReply(""); setReplyTo(null); };

  const runDemo = async () => {
    if (demoRunning || archived) return; setDemoRunning(true);
    const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
    hub.addMessage(A.protocol, L(lang, "The Chairman prefers Entrance B for the arrival. Please confirm clearance.", "يفضّل الرئيس المدخل B للوصول. يرجى تأكيد التصريح.")); await wait(1300);
    hub.addMessage(A.security, L(lang, "Entrance B requires additional checkpoint clearance before approval.", "يتطلب المدخل B تصريح نقطة تفتيش إضافية قبل الاعتماد.")); await wait(1300);
    hub.addMessage(A.logistics, L(lang, "Understood. The motorcade route will be updated accordingly.", "مفهوم. سيتم تحديث مسار الموكب وفقاً لذلك.")); await wait(1100);
    hub.askAI("summarize"); await wait(1800);
    hub.addDecision({ t: L(lang, "Entrance B approved with additional checkpoint", "اعتماد المدخل B مع نقطة تفتيش إضافية"), by: A.protocol }); await wait(900);
    hub.addTask({ t: L(lang, "Arrange additional checkpoint clearance", "ترتيب تصريح نقطة تفتيش إضافية"), assignee: A.security, priority: "High" }); await wait(900);
    hub.addApproval({ t: L(lang, "Checkpoint clearance approval", "موافقة تصريح نقطة التفتيش"), approver: A.security, due: "Today 13:00", priority: "High" }); await wait(900);
    hub.addRisk({ t: L(lang, "Checkpoint clearance may impact the arrival window", "قد يؤثر تصريح نقطة التفتيش على وقت الوصول"), owner: A.security, sev: ["High", C.alert ?? "#C0623F"] });
    setDemoRunning(false);
  };

  const ActionBtn = ({ icon: Icon, label, onClick, color }: { icon: ElementType; label: string; onClick: () => void; color?: string }) => (
    <button onClick={onClick} className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-md hover:bg-muted transition-colors" style={{ color: color ?? C.warmGray }}><Icon size={12} /> {label}</button>
  );

  const Card = (m: Msg) => {
    const meta = s.meta[m.id] ?? {}; const childReplies = s.messages.filter((x) => x.parentId === m.id); const sugg = m.kind === "msg" ? suggestFor(m.body, lang) : [];
    return (
      <motion.div key={m.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
        <div className="group rounded-2xl border p-4 transition-all duration-[250ms] hover:shadow-[0_12px_28px_-20px_rgba(28,40,30,0.5)]" style={{ borderColor: m.kind === "ai" ? C.gold + "44" : meta.escalated ? (C.alert ?? "#C0623F") + "55" : C.border, background: m.kind === "ai" ? `linear-gradient(180deg, ${C.gold}0A, #FFFFFF)` : SURFACE }}>
          <div className="flex gap-3.5">
            <div className="shrink-0 rounded-full ring-2 ring-white shadow-sm" style={{ lineHeight: 0 }}><ExecutiveAvatar identity={m.author} size={40} hover={m.kind !== "ai"} showPresence={false} /></div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[13px] font-semibold text-foreground" style={{ fontFamily: "Georgia, serif" }}>{m.author.name}</span>
                {m.kind === "ai" && <StatusPill label={L(lang, "AI", "ذكاء")} color={C.gold} />}
                <span className="text-[11px] text-muted-foreground">· {m.author.role}</span>
                <span className="text-[11px] text-muted-foreground/70 flex items-center gap-1"><Clock size={10} /> {m.at}</span>
                {m.pinned && <Pin size={11} style={{ color: C.gold, fill: C.gold }} />}
                {meta.escalated && <StatusPill label={`${L(lang, "Escalated", "مُصعّد")} · ${meta.escalated}`} color={C.alert ?? "#C0623F"} />}
              </div>

              {m.kind === "voice" && m.voice ? (
                <div className="mt-2 rounded-xl border p-3" style={{ borderColor: C.border, background: "#fff" }}>
                  <div className="flex items-center gap-3"><span className="w-8 h-8 rounded-full flex items-center justify-center text-white" style={{ background: C.castleHill }}><Play size={14} /></span><Waveform color={C.castleHill} /><span className="text-[11px] text-muted-foreground tabular-nums">{m.voice.dur}</span></div>
                  <p className="text-[12px] text-foreground/80 mt-2.5"><span className="font-medium text-muted-foreground">{L(lang, "Transcript", "التفريغ")}: </span>{m.voice.transcript}</p>
                  <div className="mt-2 flex items-start gap-1.5 rounded-lg px-2.5 py-1.5" style={{ background: C.gold + "0E" }}><Sparkles size={12} style={{ color: C.gold }} className="mt-0.5 shrink-0" /><p className="text-[11.5px] text-foreground/80">{m.voice.summary}</p></div>
                </div>
              ) : m.thinking ? <p className="text-[13px] text-muted-foreground mt-1.5 inline-flex items-center gap-1.5"><Sparkles size={12} style={{ color: C.gold }} className="animate-pulse" /> {m.body}</p> : <div className="mt-1.5"><Body text={m.body} /></div>}

              {m.files && m.files.length > 0 && <div className="flex flex-wrap gap-1.5 mt-2">{m.files.map((f, i) => <span key={i} className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-md border" style={{ borderColor: C.border, background: "#fff" }}><FileText size={11} className="text-muted-foreground" /> {f}</span>)}</div>}

              {/* reactions */}
              {!m.thinking && (
                <div className="flex items-center gap-1 mt-2.5 flex-wrap">
                  {REACTIONS.map((e) => { const n = m.reacts[e] ?? 0; const mine = s.myReacts.includes(`${m.id}:${e}`); return (
                    <button key={e} onClick={() => !archived && hub.toggleReact(m.id, e)} className="inline-flex items-center gap-1 text-[12px] px-1.5 py-0.5 rounded-md transition-colors" style={{ background: mine ? C.mangrove + "1A" : "transparent", boxShadow: mine ? `inset 0 0 0 1px ${C.mangrove}44` : "none" }}>
                      <span>{e}</span>{n > 0 && <span className="text-[10px] text-muted-foreground">{n}</span>}
                    </button>
                  ); })}
                </div>
              )}

              {/* confirmations */}
              {(meta.task || meta.decision || meta.approval || meta.risk) && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {meta.task != null && <ConfirmTag color={C.mediumWood} label={L(lang, "Task Created", "تم إنشاء مهمة")} onView={() => goto("tasks")} lang={lang} />}
                  {meta.decision != null && <ConfirmTag color={C.mangrove} label={L(lang, "Decision Created", "تم إنشاء قرار")} onView={() => goto("decisions")} lang={lang} />}
                  {meta.approval != null && <ConfirmTag color={C.castleHill} label={L(lang, "Approval Created", "تم إنشاء موافقة")} onView={() => goto("approvals")} lang={lang} />}
                  {meta.risk != null && <ConfirmTag color={C.gold} label={L(lang, "Risk Created", "تم إنشاء خطر")} onView={() => goto("risks")} lang={lang} />}
                </div>
              )}

              {/* smart suggestions */}
              {sugg.length > 0 && !archived && (
                <div className="flex flex-wrap gap-1.5 mt-2.5 rounded-xl px-2.5 py-2" style={{ background: C.gold + "0A" }}>
                  <span className="inline-flex items-center gap-1 text-[10.5px] font-medium" style={{ color: C.mediumWood }}><Sparkles size={11} style={{ color: C.gold }} /> {L(lang, "AI suggests", "يقترح الذكاء")}:</span>
                  {sugg.map((sg, i) => <button key={i} onClick={() => { if (sg.kind === "notify") hub.escalate(m.id, sg.label); else setDrawer({ kind: sg.kind as DrawerKind, msg: m }); }} className="text-[10.5px] px-2 py-0.5 rounded-full border hover:bg-white transition-colors" style={{ borderColor: C.gold + "55", color: C.mediumWood }}>{sg.label}</button>)}
                </div>
              )}

              {/* action bar */}
              {!archived && !m.thinking && (
                <div className="mt-2.5 flex items-center gap-0.5 flex-wrap opacity-80 group-hover:opacity-100 transition-opacity">
                  <ActionBtn icon={Reply} label={L(lang, "Reply", "رد")} onClick={() => setReplyTo(replyTo === m.id ? null : m.id)} />
                  <ActionBtn icon={Pin} label={m.pinned ? L(lang, "Unpin", "إلغاء") : L(lang, "Pin", "تثبيت")} onClick={() => hub.pin(m.id)} />
                  {m.kind !== "ai" && <>
                    <ActionBtn icon={ListChecks} label={L(lang, "Task", "مهمة")} onClick={() => setDrawer({ kind: "task", msg: m })} />
                    <ActionBtn icon={Gavel} label={L(lang, "Decision", "قرار")} onClick={() => setDrawer({ kind: "decision", msg: m })} />
                    <ActionBtn icon={CheckSquare} label={L(lang, "Approval", "موافقة")} onClick={() => setDrawer({ kind: "approval", msg: m })} />
                    <ActionBtn icon={ShieldAlert} label={L(lang, "Risk", "خطر")} onClick={() => setDrawer({ kind: "risk", msg: m })} />
                    <ActionBtn icon={CalendarClock} label={L(lang, "Follow-up", "متابعة")} onClick={() => setDrawer({ kind: "followup", msg: m })} />
                    <ActionBtn icon={Paperclip} label={L(lang, "Attach", "إرفاق")} onClick={() => hub.attach(m.id, L(lang, "Checkpoint-plan.pdf", "خطة-التفتيش.pdf"))} />
                    <div className="relative inline-block">
                      <ActionBtn icon={ArrowUpCircle} label={L(lang, "Escalate", "تصعيد")} onClick={() => setEscMenu(escMenu === m.id ? null : m.id)} color={C.alert ?? "#C0623F"} />
                      {escMenu === m.id && <div className="absolute z-30 mt-1 w-48 rounded-xl border p-1 shadow-xl" style={{ borderColor: C.border, background: "#fff" }}>{ESCALATE_TO.map(([en, ar]) => <button key={en} onClick={() => { hub.escalate(m.id, L(lang, en, ar)); setEscMenu(null); }} className="w-full text-start px-2.5 py-1.5 rounded-lg text-[12px] hover:bg-muted">{L(lang, en, ar)}</button>)}</div>}
                    </div>
                  </>}
                </div>
              )}

              {/* inline reply composer */}
              {replyTo === m.id && !archived && (
                <div className="mt-2.5 flex items-end gap-2">
                  <textarea value={reply} onChange={(e) => setReply(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendReply(m.id); } }} rows={1} placeholder={L(lang, "Write a reply…", "اكتب رداً…")} className="flex-1 resize-none rounded-xl border bg-card px-3 py-2 text-[12.5px] outline-none focus:ring-1 focus:ring-primary/30" style={{ borderColor: C.border }} />
                  <button onClick={() => sendReply(m.id)} className="w-9 h-9 rounded-xl flex items-center justify-center text-white" style={{ background: C.mangrove }}><Send size={14} /></button>
                </div>
              )}

              {/* nested replies */}
              {childReplies.length > 0 && (
                <div className="mt-3 ps-3 space-y-2.5" style={{ borderInlineStart: `2px solid ${C.border}` }}>
                  {childReplies.map((r) => (
                    <div key={r.id} className="flex gap-2.5">
                      <ExecutiveAvatar identity={r.author} size={24} hover={false} showPresence={false} />
                      <div className="min-w-0"><div className="flex items-center gap-1.5"><span className="text-[12px] font-semibold text-foreground">{r.author.name}</span><span className="text-[10px] text-muted-foreground">{r.at}</span></div><Body text={r.body} /></div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div>
      <SectionHead title={L(lang, "Executive Discussions", "النقاشات التنفيذية")} subtitle={L(lang, "Live and interactive — every message is an actionable executive record.", "مباشر وتفاعلي — كل رسالة سجل تنفيذي قابل للتنفيذ.")}
        action={<div className="flex items-center gap-2"><button onClick={runDemo} disabled={demoRunning || archived} className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-xl text-white disabled:opacity-50 transition-all hover:shadow-sm" style={{ background: C.castleHill }}><Play size={13} /> {demoRunning ? L(lang, "Running…", "جارٍ…") : L(lang, "Run Live Demo", "تشغيل عرض حي")}</button><div className="relative"><Search className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground/50" size={14} /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder={L(lang, "Search", "بحث")} className="h-9 w-36 rounded-xl border bg-card pe-9 ps-3.5 text-xs outline-none focus:ring-1 focus:ring-primary/30" style={{ borderColor: C.border }} /></div></div>} />

      {pinned.length > 0 && !q && <div className="mb-4"><p className="text-[11px] font-semibold text-muted-foreground mb-2 flex items-center gap-1.5"><Pin size={11} style={{ color: C.gold }} /> {L(lang, "Pinned Discussions", "النقاشات المثبّتة")}</p><div className="space-y-3">{pinned.map(Card)}</div></div>}
      <div className="space-y-3"><AnimatePresence>{tops.filter((m) => !m.pinned || q).map(Card)}</AnimatePresence></div>

      {/* composer */}
      {archived ? <Panel className="mt-5 p-4"><p className="text-[12px] text-muted-foreground inline-flex items-center gap-2"><Lock size={13} /> {L(lang, "This event collaboration is archived and read-only.", "تعاون هذه الفعالية مؤرشف وللقراءة فقط.")}</p></Panel>
        : rec > 0 ? <Panel className="mt-5 p-3.5"><div className="flex items-center gap-3"><span className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ background: C.alert ?? "#C0623F" }} /><span className="text-[13px] font-medium text-foreground">{L(lang, "Recording", "جارٍ التسجيل")} · <span className="tabular-nums">0:{String(rec).padStart(2, "0")}</span></span><Waveform color={C.castleHill} /><button onClick={stopRec} className="ms-auto inline-flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-xl text-white" style={{ background: C.alert ?? "#C0623F" }}><Square size={12} /> {L(lang, "Stop Recording", "إيقاف التسجيل")}</button></div></Panel>
        : <Panel className="mt-5 p-3.5">
            <div className="flex items-center gap-1.5 mb-2.5 relative">
              <button onClick={() => setAiMenu(!aiMenu)} className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full border transition-colors hover:bg-muted" style={{ borderColor: C.gold + "55", color: C.mediumWood }}><Wand2 size={11} style={{ color: C.gold }} /> {L(lang, "Executive AI", "الذكاء التنفيذي")} <ChevronRight size={10} className={aiMenu ? "rotate-90 transition-transform" : "transition-transform"} /></button>
              {aiMenu && <div className="absolute top-8 z-30 w-60 rounded-xl border p-1 shadow-xl" style={{ borderColor: C.border, background: "#fff" }}>{AI_MENU.map((a) => <button key={a.p} onClick={() => { setAiMenu(false); hub.addMessage(A.me, `@AI ${L(lang, a.en, a.ar)}`); hub.askAI(a.p); }} className="w-full text-start px-2.5 py-1.5 rounded-lg text-[12px] hover:bg-muted flex items-center gap-2"><Sparkles size={11} style={{ color: C.gold }} /> {L(lang, a.en, a.ar)}</button>)}</div>}
            </div>
            <div className="flex items-end gap-2">
              <button onClick={startRec} title={L(lang, "Record voice note", "تسجيل صوتي")} className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center border text-muted-foreground hover:bg-muted transition-colors" style={{ borderColor: C.border }}><Mic size={15} /></button>
              <textarea value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }} rows={1} placeholder={L(lang, "Write a message…  @name to mention, @AI for assistance", "اكتب رسالة…  @الاسم للإشارة، @AI للمساعدة")} className="flex-1 resize-none rounded-xl border bg-card px-3.5 py-2.5 text-[13px] outline-none focus:ring-1 focus:ring-primary/30" style={{ borderColor: C.border }} />
              <button onClick={() => send()} disabled={!draft.trim()} className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-white disabled:opacity-40 transition-all hover:shadow-sm" style={{ background: C.mangrove }}><Send size={15} /></button>
            </div>
          </Panel>}

      {drawer && <RecordDrawer kind={drawer.kind} msg={drawer.msg} hub={hub} lang={lang} onClose={() => setDrawer(null)} />}
    </div>
  );
}
function ConfirmTag({ color, label, onView, lang }: { color: string; label: string; onView: () => void; lang: string }) {
  return <span className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-1 rounded-md" style={{ background: color + "12", color, boxShadow: `inset 0 0 0 1px ${color}26` }}><Check size={11} /> {label}<button onClick={onView} className="underline underline-offset-2 opacity-80 hover:opacity-100">{L(lang, "View", "عرض")}</button></span>;
}

/* ── Decisions / Tasks / Approvals / Risks / Timeline ── */
function Decisions({ lang, hub }: { lang: string; hub: Hub }) {
  return <div><SectionHead title={L(lang, "Official Decisions", "القرارات الرسمية")} subtitle={L(lang, "Every executive decision recorded with maker, time and source.", "كل قرار تنفيذي موثق بصاحبه ووقته ومصدره.")} /><div className="space-y-3">{hub.s.decisions.map((d) => <motion.div key={d.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}><div className="flex items-center gap-3.5 rounded-2xl border p-4" style={{ borderColor: C.border, background: SURFACE }}><div className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: d.status[1] + "14", color: d.status[1] }}><Gavel size={16} /></div><div className="min-w-0 flex-1"><p className="text-[14px] font-semibold text-foreground truncate" style={{ fontFamily: "Georgia, serif" }}>{d.t}</p><p className="text-[11px] text-muted-foreground mt-0.5">{d.by.name} · {d.at} · {d.rel}</p></div><StatusPill label={d.status[0]} color={d.status[1]} /><ChevronRight size={15} className="text-muted-foreground/40" /></div></motion.div>)}</div></div>;
}
function Tasks({ lang, hub }: { lang: string; hub: Hub }) {
  return <div><SectionHead title={L(lang, "Tasks", "المهام")} subtitle={L(lang, "Action items created from discussions and decisions.", "مهام منشأة من النقاشات والقرارات.")} /><div className="space-y-3">{hub.s.tasks.map((tk) => <motion.div key={tk.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}><div className="flex items-center gap-3.5 rounded-2xl border p-4" style={{ borderColor: C.border, background: SURFACE }}><span className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: C.mediumWood + "14", color: C.mediumWood }}><ListChecks size={15} /></span><div className="min-w-0 flex-1"><p className="text-[13.5px] font-semibold text-foreground truncate" style={{ fontFamily: "Georgia, serif" }}>{tk.t}</p><p className="text-[11px] text-muted-foreground mt-0.5">{tk.at}{tk.due ? ` · ${tk.due}` : ""}</p></div>{tk.priority && <StatusPill label={tk.priority} color={tk.priority === "High" ? (C.alert ?? "#C0623F") : C.gold} />}<div className="flex items-center gap-1.5 shrink-0"><ExecutiveAvatar identity={tk.assignee} size={24} hover={false} showPresence={false} /><span className="text-[11px] text-muted-foreground hidden sm:inline">{tk.assignee.name}</span></div><StatusPill label={tk.status} color={C.calmTeal} /></div></motion.div>)}</div></div>;
}
function Approvals({ lang, hub }: { lang: string; hub: Hub }) {
  return <div><SectionHead title={L(lang, "Approval Conversations", "محادثات الموافقات")} subtitle={L(lang, "Approved · Returned · Closed — no email needed.", "معتمد · معاد · مغلق — دون بريد.")} /><div className="space-y-3">{hub.s.approvals.map((a) => { const col = a.status === "Approved" ? C.mangrove : a.status === "Returned" ? C.gold : C.castleHill; return <motion.div key={a.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}><div className="flex items-center gap-3.5 rounded-2xl border p-4" style={{ borderColor: C.border, background: SURFACE }}><span className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: col + "14", color: col }}><CheckSquare size={15} /></span><div className="min-w-0 flex-1"><p className="text-[13.5px] font-semibold text-foreground truncate" style={{ fontFamily: "Georgia, serif" }}>{a.t}</p><p className="text-[11px] text-muted-foreground mt-0.5">{a.approver.name} · {a.due}</p></div><StatusPill label={a.priority} color={a.priority === "High" ? (C.alert ?? "#C0623F") : C.gold} /><StatusPill label={a.status} color={col} /></div></motion.div>; })}{hub.s.approvals.length === 0 && <Panel><Empty icon={CheckSquare} title={L(lang, "No approvals open", "لا توجد موافقات")} hint={L(lang, "Create one from a discussion message.", "أنشئ واحدة من رسالة نقاش.")} /></Panel>}</div></div>;
}
function Risks({ lang, hub }: { lang: string; hub: Hub }) {
  return <div><SectionHead title={L(lang, "Risks & Issues", "المخاطر والقضايا")} subtitle={L(lang, "Executive risk register with owner, status and AI recommendation.", "سجل المخاطر مع المسؤول والحالة وتوصية الذكاء.")} /><div className="space-y-3">{hub.s.risks.map((r) => <motion.div key={r.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}><div className="rounded-2xl border p-4" style={{ borderColor: C.border, background: SURFACE }}><div className="flex items-center gap-2.5"><StatusPill label={r.sev[0]} color={r.sev[1]} /><p className="text-[14px] font-semibold text-foreground flex-1 min-w-0 truncate" style={{ fontFamily: "Georgia, serif" }}>{r.t}</p><span className="text-[11px] text-muted-foreground">{r.status}</span></div><div className="flex items-center gap-2 mt-2.5 ps-0.5"><ExecutiveAvatar identity={r.owner} size={24} hover={false} showPresence={false} /><span className="text-[11px] text-muted-foreground">{r.owner.name}</span></div><div className="mt-2.5 flex items-start gap-2 rounded-xl px-3 py-2" style={{ background: C.gold + "0E" }}><Sparkles size={13} style={{ color: C.gold }} className="mt-0.5 shrink-0" /><p className="text-[12px] text-foreground/80"><span className="font-medium" style={{ color: C.mediumWood }}>{L(lang, "AI recommendation", "توصية الذكاء")}: </span>{r.ai}</p></div></div></motion.div>)}</div></div>;
}
function Timeline({ lang, hub }: { lang: string; hub: Hub }) {
  const items = [...hub.s.timeline].reverse();
  return <div><SectionHead title={L(lang, "Decision Timeline", "الخط الزمني للقرارات")} subtitle={L(lang, "Every activity, automatically documented.", "كل نشاط يُوثّق تلقائياً.")} /><Panel className="p-5"><div className="relative ps-5"><span className="absolute inset-y-1 start-[5px] w-px" style={{ background: C.border }} /><div className="space-y-5">{items.map((e, i) => <motion.div key={e.id} initial={{ opacity: 0, x: 6 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.25, delay: Math.min(i * 0.03, 0.3) }} className="relative flex items-start gap-3"><span className="absolute -start-5 top-1 w-[11px] h-[11px] rounded-full ring-2 ring-white" style={{ background: e.c }} /><span className="text-[11px] font-semibold tabular-nums text-muted-foreground w-12 shrink-0">{e.at}</span><p className="text-[13px] text-foreground/85">{e.text}</p></motion.div>)}</div></div></Panel></div>;
}
function AIAssistant({ lang, hub }: { lang: string; hub: Hub }) {
  const [open, setOpen] = useState<number | null>(null);
  return <div><SectionHead title={L(lang, "Executive AI Assistant", "المساعد التنفيذي الذكي")} subtitle={L(lang, "Context-aware executive AI across the event.", "ذكاء تنفيذي مدرك للسياق عبر الفعالية.")} /><div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{AI_MENU.map((a, i) => <button key={i} onClick={() => setOpen(open === i ? null : i)} className="text-start rounded-2xl border p-4 transition-all hover:shadow-[0_12px_28px_-20px_rgba(28,40,30,0.5)]" style={{ borderColor: open === i ? C.gold + "66" : C.border, background: SURFACE }}><div className="flex items-center gap-2.5"><span className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: C.gold + "16", color: C.gold }}><Sparkles size={15} /></span><span className="text-[13px] font-semibold text-foreground">{L(lang, a.en, a.ar)}</span></div>{open === i && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[12px] text-foreground/75 leading-relaxed mt-3 pt-3 border-t" style={{ borderColor: C.border }}>{aiReply(a.p, hub.s, lang)}</motion.p>}</button>)}</div></div>;
}
function VoiceList({ lang, hub }: { lang: string; hub: Hub }) {
  const voices = hub.s.messages.filter((m) => m.kind === "voice");
  return <div><SectionHead title={L(lang, "Voice Notes", "الملاحظات الصوتية")} subtitle={L(lang, "Recorded in Discussions — transcribed and summarized by AI.", "تُسجَّل في النقاشات — تُفرَّغ وتُلخَّص بالذكاء.")} />{voices.length === 0 ? <Panel><Empty icon={Mic} title={L(lang, "No voice notes yet", "لا توجد ملاحظات صوتية")} hint={L(lang, "Use the microphone in the Discussions composer.", "استخدم الميكروفون في محرّر النقاشات.")} /></Panel> : <div className="space-y-3">{voices.map((m) => <div key={m.id} className="rounded-2xl border p-4" style={{ borderColor: C.border, background: SURFACE }}><div className="flex items-center gap-2 mb-2"><ExecutiveAvatar identity={m.author} size={24} hover={false} showPresence={false} /><span className="text-[12px] font-medium text-foreground">{m.author.name}</span><span className="text-[11px] text-muted-foreground">· {m.at}</span></div><div className="flex items-center gap-3"><span className="w-8 h-8 rounded-full flex items-center justify-center text-white" style={{ background: C.castleHill }}><Play size={14} /></span><Waveform color={C.castleHill} /><span className="text-[11px] text-muted-foreground">{m.voice?.dur}</span></div><p className="text-[12px] text-foreground/80 mt-2.5">{m.voice?.transcript}</p></div>)}</div>}</div>;
}
function Scaffold({ lang, section, hub }: { lang: string; section: SectionKey; hub: Hub }) {
  const meta: Record<string, { icon: ElementType; t: [string, string]; s: [string, string]; e: [string, string] }> = {
    files: { icon: FolderClosed, t: ["Files", "الملفات"], s: ["Drag & drop, versioning, preview, OCR, AI summary.", "سحب وإفلات، إصدارات، معاينة، OCR، تلخيص."], e: ["Drop files to begin", "أفلت الملفات"] },
    photos: { icon: Images, t: ["Photos", "الصور"], s: ["Albums with VIP recognition and suggested captions.", "ألبومات مع التعرف على الشخصيات."], e: ["No photos uploaded", "لا توجد صور"] },
    minutes: { icon: FileText, t: ["AI Meeting Minutes", "محاضر بالذكاء"], s: ["Auto summary, attendees, decisions, actions, risks.", "ملخص تلقائي، الحضور، القرارات، الإجراءات."], e: ["Generate from a discussion", "أنشئ من نقاش"] },
  };
  const m = meta[section] ?? meta.files;
  return <div><SectionHead title={L(lang, m.t[0], m.t[1])} subtitle={L(lang, m.s[0], m.s[1])} action={<button disabled={hub.s.archived} className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-xl text-white disabled:opacity-50" style={{ background: C.mangrove }}><Plus size={14} /> {L(lang, "New", "جديد")}</button>} /><Panel><Empty icon={m.icon} title={L(lang, m.e[0], m.e[1])} hint={L(lang, m.s[0], m.s[1])} /></Panel></div>;
}
function Archive({ lang, hub }: { lang: string; hub: Hub }) {
  const pinned = hub.s.messages.filter((m) => m.pinned);
  return <div><SectionHead title={L(lang, "Event Archive", "أرشيف الفعالية")} subtitle={L(lang, "On completion, everything becomes read-only and searchable forever.", "عند الاكتمال يصبح كل شيء للقراءة فقط.")} /><div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">{([["Decisions", "القرارات", hub.s.decisions.length], ["Tasks", "المهام", hub.s.tasks.length], ["Approvals", "الموافقات", hub.s.approvals.length], ["Risks", "المخاطر", hub.s.risks.length]] as const).map(([en, ar, n]) => <div key={en} className="rounded-2xl border p-4" style={{ borderColor: C.border, background: SURFACE }}><p className="text-2xl font-bold" style={{ color: C.mangrove, fontFamily: "Georgia, serif" }}>{n}</p><p className="text-[11px] text-muted-foreground mt-1">{L(lang, en, ar)}</p></div>)}</div>{pinned.length > 0 && <Panel className="p-4"><p className="text-[11px] font-semibold text-muted-foreground mb-2.5 flex items-center gap-1.5"><Pin size={11} style={{ color: C.gold }} /> {L(lang, "Pinned highlights", "أبرز المثبّتات")}</p><div className="space-y-2">{pinned.map((m) => <p key={m.id} className="text-[12.5px] text-foreground/80 flex items-start gap-2"><span className="text-muted-foreground tabular-nums shrink-0">{m.at}</span> {m.body || m.voice?.summary}</p>)}</div></Panel>}</div>;
}

/* ── Activity feed (compact) ── */
function ActivityFeed({ lang, hub }: { lang: string; hub: Hub }) {
  const items = hub.s.activity.slice(0, 5);
  if (items.length === 0) return null;
  return (
    <div className="rounded-2xl border p-3 sticky top-4 mt-3" style={{ borderColor: C.border, background: SURFACE }}>
      <p className="px-1 pb-2 text-[11px] font-semibold text-muted-foreground tracking-wide flex items-center gap-1.5"><ActivityIcon size={12} /> {L(lang, "ACTIVITY", "النشاط")}</p>
      <div className="space-y-2">{items.map((a) => <div key={a.id} className="flex items-center gap-2"><div className="shrink-0">{a.who ? <ExecutiveAvatar identity={a.who} size={22} hover={false} showPresence={false} /> : <span className="w-[22px] h-[22px] rounded-full flex items-center justify-center" style={{ background: C.gold + "1A", color: C.gold }}><Sparkles size={11} /></span>}</div><p className="text-[11.5px] text-foreground/80 leading-tight"><span className="font-medium">{a.who?.name ?? L(lang, "AI", "الذكاء")}</span> {a.text} <span className="text-muted-foreground">· {a.at}</span></p></div>)}</div>
    </div>
  );
}

export function EventCollaborationHub({ eventId: _eventId }: { eventId: number }) {
  const { lang, dir } = useLanguage();
  const hub = useHub(lang);
  const [section, setSection] = useState<SectionKey>("discussions");
  const [notifOpen, setNotifOpen] = useState(false);

  const render = () => {
    switch (section) {
      case "discussions": return <Discussions lang={lang} hub={hub} goto={setSection} />;
      case "decisions": return <Decisions lang={lang} hub={hub} />;
      case "tasks": return <Tasks lang={lang} hub={hub} />;
      case "approvals": return <Approvals lang={lang} hub={hub} />;
      case "timeline": return <Timeline lang={lang} hub={hub} />;
      case "risks": return <Risks lang={lang} hub={hub} />;
      case "ai": return <AIAssistant lang={lang} hub={hub} />;
      case "voice": return <VoiceList lang={lang} hub={hub} />;
      case "archive": return <Archive lang={lang} hub={hub} />;
      default: return <Scaffold lang={lang} section={section} hub={hub} />;
    }
  };

  return (
    <div dir={dir}>
      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <div className="flex items-center gap-2"><span className="w-8 h-8 rounded-xl flex items-center justify-center text-white" style={{ background: C.mangrove }}><MessagesSquare size={16} /></span><h2 className="text-[17px] font-bold text-foreground" style={{ fontFamily: "Georgia, serif" }}>{L(lang, "Collaboration Hub", "مركز التعاون")}</h2></div>
        <div className="flex items-center gap-2">
          <button onClick={() => hub.setArchived(!hub.s.archived)} className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-xl border transition-colors hover:bg-muted" style={{ borderColor: C.border, color: hub.s.archived ? C.mangrove : C.warmGray }}>{hub.s.archived ? <ShieldQuestion size={13} /> : <ArchiveIcon size={13} />} {hub.s.archived ? L(lang, "Exit Archive Preview", "إنهاء المعاينة") : L(lang, "Preview Archive Mode", "معاينة الأرشيف")}</button>
          <div className="relative">
            <button onClick={() => setNotifOpen((o) => !o)} className="relative w-9 h-9 rounded-xl flex items-center justify-center border transition-colors hover:bg-muted" style={{ borderColor: C.border }}><Bell size={15} className="text-muted-foreground" />{hub.s.notifs.length > 0 && <span className="absolute -top-1 -end-1 min-w-[16px] h-4 px-1 rounded-full text-[9px] font-bold text-white flex items-center justify-center" style={{ background: C.alert ?? "#C0623F" }}>{hub.s.notifs.length}</span>}</button>
            {notifOpen && <div className="absolute end-0 mt-2 w-72 rounded-2xl border p-2 z-[60] shadow-xl" style={{ borderColor: C.border, background: "#fff" }}><div className="flex items-center justify-between px-2 py-1.5"><span className="text-[11px] font-semibold text-muted-foreground">{L(lang, "Notifications", "الإشعارات")}</span><button onClick={() => setNotifOpen(false)}><X size={13} className="text-muted-foreground" /></button></div>{hub.s.notifs.length === 0 ? <p className="text-[12px] text-muted-foreground px-2 py-4 text-center">{L(lang, "No notifications", "لا إشعارات")}</p> : <div className="max-h-72 overflow-y-auto">{hub.s.notifs.map((n) => <div key={n.id} className="px-2 py-2 rounded-lg hover:bg-muted/40"><p className="text-[12px] text-foreground/85">{n.text}</p><p className="text-[10px] text-muted-foreground mt-0.5">{n.at}</p></div>)}</div>}</div>}
          </div>
        </div>
      </div>

      {hub.s.archived && <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="mb-4 rounded-2xl border px-4 py-3 flex items-center gap-2.5" style={{ borderColor: C.gold + "55", background: C.gold + "12" }}><Lock size={15} style={{ color: C.mediumWood }} /><p className="text-[13px] font-medium" style={{ color: C.mediumWood }}>{L(lang, "Archived Event Collaboration — read-only. Decisions, files, timeline and minutes remain searchable.", "تعاون فعالية مؤرشف — للقراءة فقط.")}</p></motion.div>}

      <div className="flex gap-6">
        <aside className="w-56 shrink-0 hidden md:block">
          <div className="rounded-2xl border p-2 sticky top-4" style={{ borderColor: C.border, background: SURFACE }}>
            <p className="px-3 pt-2 pb-2.5 text-[11px] font-semibold text-muted-foreground tracking-wide">{L(lang, "WORKSPACES", "مساحات العمل")}</p>
            <nav className="space-y-0.5">{NAV.map((n) => { const on = section === n.key; const count = n.key === "decisions" ? hub.s.decisions.length : n.key === "tasks" ? hub.s.tasks.length : n.key === "approvals" ? hub.s.approvals.length : n.key === "risks" ? hub.s.risks.length : 0; return <button key={n.key} onClick={() => setSection(n.key)} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[12.5px] font-medium transition-all duration-200" style={on ? { background: C.mangrove, color: "#fff", boxShadow: `0 2px 8px -3px ${C.mangrove}88` } : { color: C.warmGray }}><n.icon size={15} strokeWidth={1.7} style={{ opacity: on ? 1 : 0.75 }} /> <span className="flex-1 text-start">{L(lang, n.en, n.ar)}</span>{count > 0 && <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full" style={on ? { background: "rgba(255,255,255,0.22)" } : { background: C.border, color: C.castleHill }}>{count}</span>}</button>; })}</nav>
          </div>
          <ActivityFeed lang={lang} hub={hub} />
        </aside>

        <div className="md:hidden -mb-2 w-full"><div className="flex gap-1.5 overflow-x-auto pb-2">{NAV.map((n) => <button key={n.key} onClick={() => setSection(n.key)} className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium border" style={section === n.key ? { background: C.mangrove, color: "#fff", borderColor: C.mangrove } : { borderColor: C.border, color: C.warmGray }}><n.icon size={12} /> {L(lang, n.en, n.ar)}</button>)}</div></div>

        <motion.div key={section} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, ease: "easeOut" }} className="flex-1 min-w-0">{render()}</motion.div>
      </div>
    </div>
  );
}
