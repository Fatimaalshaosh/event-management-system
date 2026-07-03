import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/i18n/language-context";
import { useCreateTask, useListContactsByType, type Contact } from "@workspace/api-client-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { palette } from "@/theme";
import { motion, AnimatePresence } from "framer-motion";
import {
  Target, Sparkles, Star, Users, UserCog, Crown, Bot, UserCheck, GitBranch,
  Check, X, Loader2, ListTree, Wand2, ChevronDown, GripVertical,
} from "lucide-react";
import { ChevronEnd } from "@/components/dir-icon";
import { DEPARTMENTS, DEPARTMENT_BY_KEY, availabilityColor, parseRoles } from "@/components/contacts/org-structure";
import { ContactAvatar, nameOf } from "@/components/contacts/contact-shared";
import { recommendDepartments, bestEmployee, scoreEmployee, generateSubtasks } from "./mission-engine";

const C = palette;
const CATEGORIES = ["protocol", "logistics", "security", "media", "planning"] as const;
const PRIORITIES = ["low", "medium", "high", "critical"] as const;
const CAT_COLOR: Record<string, string> = {
  protocol: C.mangrove, logistics: C.mediumWood, security: C.castleHill, media: C.sunset, planning: C.calmTeal,
};
type Mode = "head" | "ai" | "choose" | "split";

function Stars({ score }: { score: number }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={11} strokeWidth={1.5} style={{ color: i <= score ? C.gold : C.border, fill: i <= score ? C.gold : "transparent" }} />
      ))}
    </span>
  );
}

export function MissionAssignmentModal({ open, onOpenChange, eventId, onCreated }: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  eventId: number;
  onCreated: () => void;
}) {
  const { t } = useTranslation();
  const { lang, dir } = useLanguage();
  const align = dir === "rtl" ? "text-end" : "text-start";
  const createTask = useCreateTask();
  const { data: internal } = useListContactsByType("internal");

  const [stage, setStage] = useState<1 | 2>(1);
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("protocol");
  const [priority, setPriority] = useState<(typeof PRIORITIES)[number]>("medium");
  const [form, setForm] = useState({ title: "", titleAr: "", description: "", dueDate: "", readinessImpact: "10" });
  const [selectedDept, setSelectedDept] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode | null>(null);
  const [chosenUser, setChosenUser] = useState<Contact | null>(null);
  const [treeOpen, setTreeOpen] = useState(true);
  const [subtasksOn, setSubtasksOn] = useState(false);
  const [picked, setPicked] = useState<Set<number>>(new Set());
  const [dragOver, setDragOver] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const users = internal ?? [];
  const deptUsers = (k: string) => users.filter((u) => u.departmentKey === k);
  const recs = useMemo(() => recommendDepartments(category, form.title, form.titleAr), [category, form.title, form.titleAr]);
  const recMap = useMemo(() => Object.fromEntries(recs.map((r) => [r.deptKey, r.score])), [recs]);

  const dept = selectedDept ? DEPARTMENT_BY_KEY[selectedDept] : null;
  const members = selectedDept ? deptUsers(selectedDept) : [];
  const headName = dept ? (lang === "en" ? dept.headEn : dept.headAr) : "";
  const aiBest = useMemo(() => bestEmployee(members, category), [members, category]);
  const subtaskTpls = useMemo(() => generateSubtasks(category), [category]);

  const owner =
    mode === "head" || mode === "split" ? headName
    : mode === "ai" ? (aiBest ? nameOf(aiBest, lang) : headName)
    : mode === "choose" ? (chosenUser ? nameOf(chosenUser, lang) : "")
    : "";

  const reset = () => {
    setStage(1); setCategory("protocol"); setPriority("medium");
    setForm({ title: "", titleAr: "", description: "", dueDate: "", readinessImpact: "10" });
    setSelectedDept(null); setMode(null); setChosenUser(null); setSubtasksOn(false); setPicked(new Set());
  };

  const selectDept = (k: string) => { setSelectedDept(k); setMode(null); setChosenUser(null); };

  const canConfirm = !!selectedDept && (mode === "head" || mode === "ai" || mode === "split" || (mode === "choose" && !!chosenUser));

  const confirm = async () => {
    if (!canConfirm || !dept) return;
    setSubmitting(true);
    const team = t(`contacts.departments.${dept.key}`);
    const base = { eventId, status: "pending" as const, priority, category, team, assignedTo: owner || undefined };
    try {
      await createTask.mutateAsync({
        data: {
          ...base,
          title: form.title,
          titleAr: form.titleAr || undefined,
          description: form.description || undefined,
          dueDate: form.dueDate || undefined,
          readinessImpact: Number(form.readinessImpact) || 0,
        },
      });
      if (subtasksOn) {
        for (const idx of picked) {
          const s = subtaskTpls[idx];
          if (s) await createTask.mutateAsync({ data: { ...base, title: s.en, titleAr: s.ar, readinessImpact: 5 } });
        }
      }
      onCreated();
      onOpenChange(false);
      reset();
    } finally {
      setSubmitting(false);
    }
  };

  const ASSIGN: { mode: Mode; icon: typeof Crown; label: string }[] = [
    { mode: "head", icon: Crown, label: t("mission.assignHead") },
    { mode: "ai", icon: Bot, label: t("mission.assignAi") },
    { mode: "choose", icon: UserCheck, label: t("mission.assignChoose") },
    { mode: "split", icon: GitBranch, label: t("mission.assignSplit") },
  ];

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) reset(); }}>
      <DialogContent className="w-[calc(100%-1.5rem)] sm:max-w-4xl max-h-[90vh] p-0 gap-0 flex flex-col overflow-hidden" dir={dir}>
        {/* Header / stepper */}
        <div className="shrink-0 px-6 pt-5 pb-4 border-b" style={{ borderColor: C.border, background: `linear-gradient(160deg, ${C.mangrove}12, transparent)` }}>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: C.mangrove + "1A", color: C.mangrove }}>
              <Target size={18} strokeWidth={1.7} />
            </div>
            <div className={align}>
              <h2 className="text-lg font-bold text-foreground leading-tight" style={{ fontFamily: "Georgia, serif" }}>{t("mission.subtitle")}</h2>
              <p className="text-[11px] text-muted-foreground">{t("mission.title")}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-3">
            {[1, 2].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 text-xs font-medium" style={{ color: stage >= s ? C.mangrove : C.warmGray }}>
                  <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px]" style={stage >= s ? { background: C.mangrove, color: "#fff" } : { background: C.border, color: C.warmGray }}>{s}</span>
                  {s === 1 ? t("mission.step1") : t("mission.step2")}
                </div>
                {s === 1 && <div className="w-8 h-px" style={{ background: C.border }} />}
              </div>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <AnimatePresence mode="wait">
            {stage === 1 ? (
              <motion.div key="s1" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} className="space-y-5">
                <div>
                  <Label className={`block text-xs mb-1.5 ${align}`}>{t("pages.commandCenter.tasks.category")}</Label>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map((c) => (
                      <button key={c} type="button" onClick={() => setCategory(c)} className="px-3 py-1.5 rounded-lg text-xs font-medium border transition-all"
                        style={category === c ? { background: CAT_COLOR[c], color: "#fff", borderColor: CAT_COLOR[c] } : { borderColor: C.border, color: C.castleHill }}>
                        {t(`pages.commandCenter.tasks.cat.${c}`)}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className={`block text-xs mb-1.5 ${align}`}>{t("pages.commandCenter.tasks.priority")}</Label>
                  <div className="flex flex-wrap gap-2">
                    {PRIORITIES.map((p) => (
                      <button key={p} type="button" onClick={() => setPriority(p)} className="px-3 py-1.5 rounded-lg text-xs font-medium border transition-all"
                        style={priority === p ? { background: C.mediumWood, color: "#fff", borderColor: C.mediumWood } : { borderColor: C.border, color: C.castleHill }}>
                        {t(`pages.commandCenter.tasks.priority${p.charAt(0).toUpperCase() + p.slice(1)}`)}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className={`block text-xs ${align}`}>{t("pages.commandCenter.tasks.titleAr")}</Label>
                    <Input value={form.titleAr} onChange={(e) => setForm({ ...form, titleAr: e.target.value })} dir="rtl" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className={`block text-xs ${align}`}>{t("pages.commandCenter.tasks.titleEn")}</Label>
                    <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} dir="ltr" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className={`block text-xs ${align}`}>{t("pages.commandCenter.tasks.due")}</Label>
                    <Input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} dir="ltr" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className={`block text-xs ${align}`}>{t("pages.commandCenter.tasks.impact")} (%)</Label>
                    <Input type="number" min={0} max={100} value={form.readinessImpact} onChange={(e) => setForm({ ...form, readinessImpact: e.target.value })} dir="ltr" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className={`block text-xs ${align}`}>{t("pages.commandCenter.tasks.description")}</Label>
                  <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </div>
              </motion.div>
            ) : (
              <motion.div key="s2" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} className="space-y-5">
                {/* AI recommendations */}
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <Sparkles size={14} style={{ color: C.gold }} />
                    <h3 className="text-sm font-semibold text-foreground">{t("mission.recommended")}</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recs.map((r) => (
                      <button key={r.deptKey} type="button" onClick={() => selectDept(r.deptKey)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl border text-xs transition-all"
                        style={selectedDept === r.deptKey ? { borderColor: C.mangrove, background: C.mangrove + "0F" } : { borderColor: C.border, background: C.cardBg }}>
                        <Stars score={r.score} />
                        <span className="font-medium text-foreground">{t(`contacts.departments.${r.deptKey}`)}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Drag mission -> department command cards */}
                <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-4">
                  {/* Mission card (draggable) */}
                  <div
                    draggable
                    onDragStart={(e) => e.dataTransfer.setData("text/plain", "mission")}
                    className="rounded-2xl border-2 border-dashed p-4 cursor-grab active:cursor-grabbing self-start"
                    style={{ borderColor: CAT_COLOR[category], background: CAT_COLOR[category] + "0D" }}
                  >
                    <div className="flex items-center gap-1.5 text-[10px] font-medium mb-1.5" style={{ color: CAT_COLOR[category] }}>
                      <GripVertical size={12} /> {t("mission.mission")}
                    </div>
                    <p className="text-sm font-semibold text-foreground leading-snug">{(lang === "en" ? form.title : form.titleAr) || form.title || form.titleAr}</p>
                    <span className="inline-block mt-2 text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: CAT_COLOR[category] + "22", color: CAT_COLOR[category] }}>
                      {t(`pages.commandCenter.tasks.cat.${category}`)}
                    </span>
                    <p className="text-[10px] text-muted-foreground mt-2.5">{t("mission.dragHint")}</p>
                  </div>

                  {/* Department command cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {DEPARTMENTS.map((d) => {
                      const dm = deptUsers(d.key);
                      const avail = dm.filter((u) => u.availability === "available").length;
                      const on = selectedDept === d.key;
                      const over = dragOver === d.key;
                      const Icon = d.icon;
                      return (
                        <button key={d.key} type="button"
                          onClick={() => selectDept(d.key)}
                          onDragOver={(e) => { e.preventDefault(); setDragOver(d.key); }}
                          onDragLeave={() => setDragOver((p) => (p === d.key ? null : p))}
                          onDrop={(e) => { e.preventDefault(); setDragOver(null); selectDept(d.key); }}
                          className="text-start rounded-xl border p-3 transition-all"
                          style={{
                            borderColor: on ? d.color : over ? d.color : C.border,
                            background: on || over ? d.color + "0F" : C.cardBg,
                            boxShadow: over ? `0 0 0 2px ${d.color}55` : undefined,
                          }}>
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: d.color + "1A", color: d.color }}>
                                <Icon size={16} strokeWidth={1.6} />
                              </span>
                              <span className="text-sm font-semibold text-foreground truncate" style={{ fontFamily: "Georgia, serif" }}>{t(`contacts.departments.${d.key}`)}</span>
                            </div>
                            {recMap[d.key] ? <Stars score={recMap[d.key]} /> : null}
                          </div>
                          <p className="text-[11px] text-muted-foreground mt-1.5 truncate">{t("mission.head")}: {lang === "en" ? d.headEn : d.headAr}</p>
                          <div className="mt-2 h-1 rounded-full overflow-hidden" style={{ background: C.border }}>
                            <div className="h-full rounded-full" style={{ width: `${d.readiness}%`, background: d.color }} />
                          </div>
                          <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
                            <span className="flex items-center gap-1"><Users size={11} /> {dm.length} {t("mission.members")}</span>
                            <span style={{ color: C.mangrove }}>{avail} {t("mission.available")}</span>
                            <span className="ms-auto font-semibold" style={{ color: d.color }}>{d.readiness}%</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Assign panel */}
                {!dept ? (
                  <div className="rounded-xl border border-dashed p-6 text-center text-xs text-muted-foreground" style={{ borderColor: C.border }}>
                    {t("mission.selectDept")}
                  </div>
                ) : (
                  <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border p-4 space-y-4" style={{ borderColor: C.border, background: C.cardBg }}>
                    <div className="flex items-center gap-1.5">
                      <UserCog size={14} style={{ color: dept.color }} />
                      <h3 className="text-sm font-semibold text-foreground">{t("mission.assignTo")} — {t(`contacts.departments.${dept.key}`)}</h3>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {ASSIGN.map((a) => (
                        <button key={a.mode} type="button" onClick={() => { setMode(a.mode); if (a.mode === "split") setSubtasksOn(true); }}
                          className="flex flex-col items-center gap-1.5 px-2 py-3 rounded-xl border text-xs font-medium transition-all"
                          style={mode === a.mode ? { borderColor: dept.color, background: dept.color + "12", color: dept.color } : { borderColor: C.border, color: C.castleHill }}>
                          <a.icon size={18} strokeWidth={1.6} />
                          <span className="text-center leading-tight">{a.label}</span>
                        </button>
                      ))}
                    </div>

                    {/* Head */}
                    {mode === "head" && (
                      <div className="flex items-center gap-2.5 rounded-lg p-3" style={{ background: dept.color + "0D" }}>
                        <Crown size={16} style={{ color: dept.color }} />
                        <div>
                          <p className="text-sm font-medium text-foreground">{headName}</p>
                          <p className="text-[11px] text-muted-foreground">{t("mission.pendingAssignment")}</p>
                        </div>
                      </div>
                    )}

                    {/* AI best */}
                    {mode === "ai" && (aiBest ? (
                      <div className="rounded-lg p-3 space-y-1.5" style={{ background: dept.color + "0D" }}>
                        <div className="flex items-center gap-2.5">
                          <ContactAvatar contact={aiBest} size={36} hover={false} />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{nameOf(aiBest, lang)}</p>
                            <p className="text-[11px] flex items-center gap-1" style={{ color: C.gold }}><Bot size={11} /> {t("mission.aiPicked")}</p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {scoreEmployee(aiBest, category).reasons.map((r) => (
                            <span key={r} className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: C.mangrove + "14", color: C.mangrove }}>{t(`mission.${r}`)}</span>
                          ))}
                        </div>
                      </div>
                    ) : <p className="text-[11px] text-muted-foreground italic">{t("mission.noEmployees")}</p>)}

                    {/* Choose employee — org tree */}
                    {mode === "choose" && (
                      <div className="rounded-lg border" style={{ borderColor: C.border }}>
                        <button type="button" onClick={() => setTreeOpen((v) => !v)} className="w-full flex items-center justify-between gap-2 px-3 py-2.5 text-start">
                          <span className="flex items-center gap-2 text-xs font-medium text-foreground">
                            <ListTree size={14} style={{ color: dept.color }} /> {t("mission.structure")}
                          </span>
                          <ChevronDown size={14} className="text-muted-foreground transition-transform" style={{ transform: treeOpen ? "rotate(180deg)" : "none" }} />
                        </button>
                        {treeOpen && (
                          <div className="px-3 pb-3">
                            {/* Head node */}
                            <div className="flex items-center gap-2 ps-1 pb-2 mb-1 border-b" style={{ borderColor: C.border }}>
                              <Crown size={13} style={{ color: dept.color }} />
                              <span className="text-xs font-medium text-foreground">{headName}</span>
                              <span className="text-[10px] text-muted-foreground">· {t("mission.head")}</span>
                            </div>
                            {members.length === 0 ? (
                              <p className="text-[11px] text-muted-foreground italic ps-5">{t("mission.noEmployees")}</p>
                            ) : (
                              <div className="space-y-0.5 ps-3 border-s" style={{ borderColor: C.border }}>
                                {members.map((u) => {
                                  const isBest = aiBest?.id === u.id;
                                  const sel = chosenUser?.id === u.id;
                                  const cap = u.taskCapacity ?? 0, act = u.activeTasks ?? 0;
                                  return (
                                    <button key={u.id} type="button" onClick={() => setChosenUser(u)}
                                      className="w-full flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-start transition-colors hover:bg-muted/50"
                                      style={sel ? { background: dept.color + "14" } : undefined}>
                                      <ContactAvatar contact={u} size={30} hover={false} />
                                      <div className="min-w-0 flex-1">
                                        <span className="block text-xs font-medium text-foreground truncate">{nameOf(u, lang)}</span>
                                        <span className="block text-[10px] text-muted-foreground truncate">
                                          {parseRoles(u.workflowRoles)[0] ? t(`contacts.roles.${parseRoles(u.workflowRoles)[0]}`, { defaultValue: "" }) : ""}{cap ? ` · ${act}/${cap}` : ""}
                                        </span>
                                      </div>
                                      {isBest && <span className="text-[9px] px-1.5 py-0.5 rounded-full shrink-0" style={{ background: C.gold + "22", color: C.mediumWood }}>{t("mission.recommendedBadge")}</span>}
                                      {u.availability && <span className="w-2 h-2 rounded-full shrink-0" style={{ background: availabilityColor[u.availability] ?? C.warmGray }} />}
                                      {sel && <Check size={13} strokeWidth={2} style={{ color: dept.color }} className="shrink-0" />}
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Split / subtasks */}
                    {(mode === "split" || subtasksOn) && (
                      <div className="rounded-lg border p-3" style={{ borderColor: C.border }}>
                        <div className="flex items-center gap-1.5 mb-2">
                          <Wand2 size={13} style={{ color: C.gold }} />
                          <span className="text-xs font-medium text-foreground">{t("mission.subtasks")}</span>
                          <span className="text-[10px] text-muted-foreground">· {t("mission.subtasksHint")}</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                          {subtaskTpls.map((s, i) => {
                            const on = picked.has(i);
                            return (
                              <button key={i} type="button" onClick={() => setPicked((p) => { const n = new Set(p); n.has(i) ? n.delete(i) : n.add(i); return n; })}
                                className="flex items-center gap-2 rounded-lg border px-2.5 py-2 text-start transition-all"
                                style={on ? { borderColor: dept.color, background: dept.color + "0D" } : { borderColor: C.border }}>
                                <span className="w-4 h-4 rounded flex items-center justify-center shrink-0" style={on ? { background: dept.color, color: "#fff" } : { border: `1px solid ${C.border}` }}>
                                  {on && <Check size={11} strokeWidth={3} />}
                                </span>
                                <span className="text-[11px] text-foreground truncate">{lang === "en" ? s.en : s.ar}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="shrink-0 flex items-center gap-3 px-6 py-4 border-t" style={{ borderColor: C.border }}>
          {stage === 1 ? (
            <>
              <button type="button" disabled={!form.title && !form.titleAr} onClick={() => setStage(2)}
                className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-medium text-white transition-all disabled:opacity-40" style={{ background: C.mangrove }}>
                {t("mission.next")} <ChevronEnd size={15} />
              </button>
              <button type="button" onClick={() => onOpenChange(false)} className="px-5 py-2 rounded-xl text-sm font-medium border" style={{ borderColor: C.border }}>{t("common.cancel")}</button>
            </>
          ) : (
            <>
              <button type="button" disabled={!canConfirm || submitting} onClick={confirm}
                className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-medium text-white transition-all disabled:opacity-40" style={{ background: C.mangrove }}>
                {submitting ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />} {t("mission.confirm")}
              </button>
              <button type="button" onClick={() => setStage(1)} className="px-5 py-2 rounded-xl text-sm font-medium border" style={{ borderColor: C.border }}>{t("mission.back")}</button>
              <button type="button" onClick={() => onOpenChange(false)} className="ms-auto text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"><X size={14} /> {t("common.cancel")}</button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
