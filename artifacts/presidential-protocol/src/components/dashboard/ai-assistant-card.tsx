
import type { AssistantReply, ChatMessage } from "@/ai/types";

import { useGetDashboardSummary } from "@workspace/api-client-react";

import { Sparkles, AlertTriangle, Zap, Send, RotateCcw, ChevronDown, Sunrise } from "lucide-react";


import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/i18n/language-context";



import { ExecutiveReportModal, type ExecutiveReportData } from "@/components/executive-report";

import { FileText as FileTextIcon } from "lucide-react";

import { useState, useRef, useEffect } from "react";


import { C, LiveDot } from "@/components/dashboard/primitives";










/* Extracted verbatim from dashboard.tsx — AI assistant card cluster. */
const SEVERITY_STYLE: Record<AssistantReply["risks"][number]["severity"], { color: string; bg: string; border: string }> = {
  critical: { color: "#8B2020", bg: "rgba(200,75,56,0.10)", border: "rgba(200,75,56,0.30)" },
  high:     { color: "#A0522D", bg: "rgba(173,137,101,0.14)", border: "rgba(173,137,101,0.35)" },
  medium:   { color: "#7A4F2D", bg: "rgba(235,204,173,0.45)", border: "rgba(173,137,101,0.30)" },
  low:      { color: "#2D5554", bg: "rgba(151,178,177,0.20)", border: "rgba(151,178,177,0.45)" },
};

/* Pretty-printed Arabic body — preserves line breaks, bullets, numbering */
function FormattedBody({ body }: { body: string }) {
  const lines = body.split("\n").map((l) => l.trim()).filter(Boolean);
  return (
    <div className="text-end" style={{ fontSize: 11.5, lineHeight: 1.85, color: C.textPrimary }}>
      {lines.map((line, i) => {
        const isBullet = /^[•\-–]\s/.test(line) || /^[\u0660-\u0669\d]+[\.\-\)]\s/.test(line);
        return (
          <p key={i} style={{
            marginBottom: i === lines.length - 1 ? 0 : 4,
            paddingInlineStart: isBullet ? 6 : 0,
            position: "relative",
          }}>
            {line}
          </p>
        );
      })}
    </div>
  );
}

export function AssistantReplyView({
  reply,
  onAction,
  onOpenReport,
  reportTitle,
  loading,
}: {
  reply: AssistantReply;
  onAction: (prompt: string) => void;
  onOpenReport?: (title: string, data: AssistantReply) => void;
  reportTitle?: string;
  loading: boolean;
}) {
  const { t } = useTranslation();
  const { dir } = useLanguage();
  const [openSection, setOpenSection] = useState<number | null>(0);
  const isReportLike = reply.sections.length > 0 || reply.risks.length > 0;
  const effectiveTitle = reportTitle ?? t("report.defaultTitle");

  return (
    <div style={{ maxWidth: "96%" }}>
      {/* Executive analysis block */}
      <div style={{
        padding: "11px 14px",
        borderRadius: "4px 14px 14px 14px",
        background: "#F8F1E6",
        border: "1px solid #E2D8CC",
        textAlign: "end",
      }}>
        <div className="flex items-center justify-between gap-2 mb-1.5">
          {isReportLike && onOpenReport && (
            <button
              onClick={() => onOpenReport(effectiveTitle, reply)}
              className="flex items-center gap-1 transition-all hover:opacity-80"
              style={{
                fontSize: 9.5, fontWeight: 800, padding: "3px 9px",
                borderRadius: 999, background: C.mediumWood, color: "#fff",
                border: "none", cursor: "pointer", fontFamily: "inherit",
              }}
            >
              <FileTextIcon size={10} strokeWidth={2} />
              {t("ai.viewAsReport")}
            </button>
          )}
          <div className="flex items-center gap-1.5">
            <span style={{ fontSize: 8.5, fontWeight: 800, letterSpacing: "0.18em", color: C.castleHill }}>
              {t("ai.executiveAnalysis")}
            </span>
            <Sparkles size={10} strokeWidth={1.8} color={C.mediumWood} />
          </div>
        </div>
        <p style={{ fontSize: 12, lineHeight: 1.85, color: C.textPrimary, whiteSpace: "pre-wrap" }}>
          {reply.analysis}
        </p>
      </div>

      {/* Sections — collapsible cards */}
      {reply.sections.length > 0 && (
        <div className="mt-2.5 space-y-1.5">
          {reply.sections.map((section, idx) => {
            const open = openSection === idx;
            return (
              <div key={idx}
                style={{
                  borderRadius: 12,
                  background: "#FFFDF9",
                  border: `1px solid ${C.border}`,
                  overflow: "hidden",
                }}>
                <button
                  onClick={() => setOpenSection(open ? null : idx)}
                  className="w-full flex items-center justify-between gap-2 transition-colors"
                  style={{
                    padding: "8px 12px",
                    background: open ? "rgba(173,137,101,0.06)" : "transparent",
                    cursor: "pointer", fontFamily: "inherit", border: "none",
                  }}
                >
                  <motion.div animate={{ rotate: open ? 0 : -90 }} transition={{ duration: 0.2 }}>
                    <ChevronDown size={12} color={C.castleHill} />
                  </motion.div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: C.textPrimary, textAlign: "end", flex: 1 }}>
                    {section.title}
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {open && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.22 }}
                      style={{ overflow: "hidden" }}
                    >
                      <div style={{ padding: "2px 14px 12px" }}>
                        <FormattedBody body={section.body} />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}

      {/* Risk alerts */}
      {reply.risks.length > 0 && (
        <div className="mt-2.5">
          <div className={`flex items-center gap-1.5 mb-1.5 ${dir === "rtl" ? "justify-end" : "justify-start"}`}>
            <span style={{ fontSize: 8.5, fontWeight: 800, letterSpacing: "0.18em", color: "#A0522D" }}>
              {t("ai.operationalAlerts")}
            </span>
            <AlertTriangle size={10} strokeWidth={1.8} color="#A0522D" />
          </div>
          <div className="space-y-1.5">
            {reply.risks.map((risk, i) => {
              const sev = SEVERITY_STYLE[risk.severity];
              return (
                <div key={i}
                  style={{
                    padding: "8px 11px",
                    borderRadius: 10,
                    background: sev.bg,
                    border: `1px solid ${sev.border}`,
                    textAlign: "end",
                  }}>
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <span style={{
                      fontSize: 8, fontWeight: 800, padding: "1.5px 6px",
                      borderRadius: 999, background: sev.color, color: "#fff",
                      whiteSpace: "nowrap", letterSpacing: "0.04em",
                    }}>
                      {t(`severity.${risk.severity}`)}
                    </span>
                    <p style={{ fontSize: 11, fontWeight: 700, color: sev.color, flex: 1, lineHeight: 1.4 }}>
                      {risk.title}
                    </p>
                  </div>
                  {risk.impact && (
                    <p style={{ fontSize: 10.5, color: C.textPrimary, lineHeight: 1.65, marginTop: 2 }}>
                      <span style={{ fontWeight: 700, color: sev.color }}>{t("ai.impact")}: </span>
                      {risk.impact}
                    </p>
                  )}
                  {risk.mitigation && (
                    <p style={{ fontSize: 10.5, color: C.textPrimary, lineHeight: 1.65, marginTop: 2 }}>
                      <span style={{ fontWeight: 700, color: sev.color }}>{t("ai.suggestedAction")}: </span>
                      {risk.mitigation}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Next actions — clickable smart chips */}
      {reply.nextActions.length > 0 && (
        <div className="mt-2.5">
          <div className={`flex items-center gap-1.5 mb-1.5 ${dir === "rtl" ? "justify-end" : "justify-start"}`}>
            <span style={{ fontSize: 8.5, fontWeight: 800, letterSpacing: "0.18em", color: C.mangrove }}>
              {t("ai.nextSuggestions")}
            </span>
            <Zap size={10} strokeWidth={1.8} color={C.mangrove} />
          </div>
          <div className={`flex flex-wrap gap-1.5 ${dir === "rtl" ? "justify-end" : "justify-start"}`}>
            {reply.nextActions.map((action, i) => (
              <button key={i}
                onClick={() => onAction(action.prompt)}
                disabled={loading}
                style={{
                  fontSize: 10.5, fontWeight: 700,
                  padding: "6px 12px", borderRadius: 999,
                  background: `linear-gradient(135deg, ${C.mangrove}10, ${C.calmTeal}22)`,
                  border: `1px solid ${C.mangrove}40`,
                  color: C.mangrove, cursor: loading ? "default" : "pointer",
                  fontFamily: "inherit", transition: "all 0.15s",
                  opacity: loading ? 0.5 : 1,
                }}
                onMouseEnter={(e) => {
                  if (loading) return;
                  (e.currentTarget as HTMLButtonElement).style.background = `linear-gradient(135deg, ${C.mangrove}25, ${C.calmTeal}35)`;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = `linear-gradient(135deg, ${C.mangrove}10, ${C.calmTeal}22)`;
                }}
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function AiAssistantCard() {
  const [input, setInput]       = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [dailyBrief, setDailyBrief] = useState<AssistantReply | null>(null);
  const [briefLoading, setBriefLoading] = useState(true);
  const [briefOpen, setBriefOpen] = useState(true);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportData, setReportData] = useState<ExecutiveReportData | null>(null);
  const { data: reportSummary } = useGetDashboardSummary();
  const { t } = useTranslation();
  const { lang } = useLanguage();
  const [reportTitle, setReportTitle] = useState(() => t("report.defaultTitle"));
  const messagesEndRef           = useRef<HTMLDivElement>(null);
  const inputRef                 = useRef<HTMLTextAreaElement>(null);

  const openReport = (title: string, data: ExecutiveReportData) => {
    setReportTitle(title);
    setReportData(data);
    setReportOpen(true);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  /* Auto-load daily executive brief once per session */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/ai-assistant/daily-brief?lang=${lang}`);
        if (!res.ok) throw new Error("brief failed");
        const data = (await res.json()) as AssistantReply;
        if (!cancelled) setDailyBrief(data);
      } catch {
        /* silently skip the brief */
      } finally {
        if (!cancelled) setBriefLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [lang]);

  const send = async (text: string, opts?: { reportTitle?: string; autoOpenReport?: boolean }) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    const rTitle = opts?.reportTitle ?? t("report.defaultTitle");
    setError(null);
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: trimmed }]);
    setLoading(true);
    try {
      const res = await fetch("/api/ai-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed, lang }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(body.error ?? t("ai.error"));
      }
      const data = (await res.json()) as AssistantReply;
      setMessages((prev) => [...prev, { role: "assistant", reply: data, reportTitle: rTitle }]);
      if (opts?.autoOpenReport && (data.sections.length > 0 || data.risks.length > 0)) {
        openReport(rTitle, data);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : t("ai.error");
      setError(msg);
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  };

  const reset = () => { setMessages([]); setError(null); setInput(""); };

  return (
    <div className="rounded-2xl border overflow-hidden flex flex-col"
      style={{ background: "#FFFDF9", borderColor: "#E8DED1", boxShadow: C.shadowLg }}>

      {/* Accent stripe */}
      <div style={{ height: 3, background: `linear-gradient(to left, ${C.mediumWood}, ${C.calmTeal})`, flexShrink: 0 }} />

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "#E8DED1", flexShrink: 0 }}>
        <div className="flex items-center gap-2">
          {messages.length > 0 && (
            <button onClick={reset} title={t("ai.reset")}
              className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:opacity-70"
              style={{ background: "#F3E7D7", color: C.castleHill }}>
              <RotateCcw size={12} strokeWidth={2} />
            </button>
          )}
          <LiveDot color={C.mediumWood} />
          <span style={{ fontSize: 9, color: C.warmGray, fontWeight: 600 }}>{t("ai.live")}</span>
        </div>
        <div className="text-end">
          <h2 className="text-base font-bold" style={{ color: "#4B4038", fontFamily: lang === "en" ? "'Playfair Display', Georgia, serif" : "Georgia, serif" }}>{t("ai.title")}</h2>
          <p className="text-[10px] mt-0.5" style={{ color: "#95837A" }}>{t("ai.subtitle")}</p>
        </div>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: "#F3E7D7", color: "#AD8965" }}>
          <Sparkles size={16} strokeWidth={1.5} />
        </div>
      </div>

      {/* Messages area */}
      <div className="px-4 py-3 flex flex-col gap-3 overflow-y-auto" style={{ minHeight: 220, maxHeight: 520 }}>

        {/* Daily Executive Brief — auto-loaded once per session */}
        {(briefLoading || dailyBrief) && messages.length === 0 && (
          <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <div style={{
              borderRadius: 14,
              background: `linear-gradient(135deg, ${C.sunset}55, #FFFDF9 60%)`,
              border: `1px solid ${C.mediumWood}33`,
              overflow: "hidden",
            }}>
              <button
                onClick={() => setBriefOpen(!briefOpen)}
                className="w-full flex items-center justify-between gap-2"
                style={{ padding: "10px 12px", background: "transparent", border: "none", cursor: "pointer", fontFamily: "inherit" }}
              >
                <motion.div animate={{ rotate: briefOpen ? 0 : -90 }} transition={{ duration: 0.2 }}>
                  <ChevronDown size={13} color={C.mediumWood} />
                </motion.div>
                <div className="flex items-center gap-2">
                  <div className="text-end">
                    <p style={{ fontSize: 11.5, fontWeight: 800, color: C.textPrimary, fontFamily: lang === "en" ? "'Playfair Display', Georgia, serif" : "Georgia, serif" }}>
                      {t("ai.dailyBrief")}
                    </p>
                    <p style={{ fontSize: 9, color: C.warmGray, marginTop: 1 }}>
                      {briefLoading ? t("common.loading") : t("ai.dailyBriefTagline")}
                    </p>
                  </div>
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: C.mediumWood, color: "#fff" }}>
                    <Sunrise size={13} strokeWidth={1.7} />
                  </div>
                </div>
              </button>
              <AnimatePresence initial={false}>
                {briefOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    style={{ overflow: "hidden" }}
                  >
                    <div style={{ padding: "0 12px 12px" }}>
                      {briefLoading ? (
                        <div className="flex items-center gap-1.5 justify-end py-2">
                          {[0, 0.15, 0.3].map((delay, i) => (
                            <motion.div key={i}
                              animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
                              transition={{ duration: 0.9, repeat: Infinity, delay, ease: "easeInOut" }}
                              style={{ width: 5, height: 5, borderRadius: "50%", background: C.mediumWood }} />
                          ))}
                        </div>
                      ) : dailyBrief ? (
                        <AssistantReplyView
                          reply={dailyBrief}
                          onAction={(p) => send(p)}
                          onOpenReport={openReport}
                          reportTitle={t("ai.dailyBrief")}
                          loading={loading}
                        />
                      ) : null}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {messages.length === 0 && !loading && !briefLoading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-center py-2">
            <p style={{ fontSize: 11, color: C.warmGray, lineHeight: 1.7 }}>
              {t("ai.idleHint")}
            </p>
          </motion.div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.22 }}
              className="flex flex-col"
              style={{ alignItems: msg.role === "user" ? "flex-start" : "flex-end" }}>
              {/* Role label */}
              <span style={{ fontSize: 9, fontWeight: 700, marginBottom: 3, color: C.warmGray,
                paddingInlineStart: 4 }}>
                {msg.role === "user" ? t("ai.you") : t("ai.assistantTag")}
              </span>
              {msg.role === "user" ? (
                <div style={{
                  maxWidth: "92%",
                  padding: "9px 13px",
                  borderRadius: "14px 4px 14px 14px",
                  background: `linear-gradient(135deg, ${C.mediumWood}22, ${C.sunset}44)`,
                  border: `1px solid ${C.mediumWood}30`,
                  textAlign: "end",
                }}>
                  <p style={{ fontSize: 12, lineHeight: 1.75, color: C.textPrimary, whiteSpace: "pre-wrap" }}>
                    {msg.text}
                  </p>
                </div>
              ) : (
                <AssistantReplyView
                  reply={msg.reply}
                  onAction={(p) => send(p)}
                  onOpenReport={openReport}
                  reportTitle={msg.reportTitle}
                  loading={loading}
                />
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Loading indicator */}
        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex flex-col" style={{ alignItems: "flex-end" }}>
            <span style={{ fontSize: 9, fontWeight: 700, marginBottom: 3, color: C.warmGray, paddingInlineStart: 4 }}>
              {t("ai.assistantTag")}
            </span>
            <div style={{ padding: "10px 14px", borderRadius: "4px 14px 14px 14px", background: "#F3EDE4", border: "1px solid #E2D8CC" }}>
              <div className="flex items-center gap-1.5">
                {[0, 0.15, 0.3].map((delay, i) => (
                  <motion.div key={i}
                    animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 0.9, repeat: Infinity, delay, ease: "easeInOut" }}
                    style={{ width: 6, height: 6, borderRadius: "50%", background: C.mediumWood }} />
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Error message */}
        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="rounded-xl px-4 py-3 text-end text-xs"
            style={{ background: "rgba(200,75,56,0.06)", border: "1px solid rgba(200,75,56,0.16)", color: "#8B2020" }}>
            {error}
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Dynamic contextual AI suggestions — sourced from the latest reply,
          or the daily brief on first load. No static buttons. */}
      {(() => {
        const lastAssistant = [...messages].reverse().find((m): m is Extract<ChatMessage, { role: "assistant" }> => m.role === "assistant");
        const suggestions = lastAssistant?.reply.nextActions ?? dailyBrief?.nextActions ?? [];
        if (suggestions.length === 0 || loading) return null;
        return (
          <motion.div
            initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="px-4 pt-1 pb-2"
            style={{ flexShrink: 0 }}
          >
            <div className="flex items-center justify-end gap-1.5 mb-2">
              <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.2em", color: C.castleHill }}>
                {t("ai.contextualSuggestions")}
              </span>
              <Sparkles size={9} strokeWidth={2} color={C.mediumWood} />
              <div style={{ width: 14, height: 1, background: C.border }} />
            </div>
            <div className="flex flex-wrap gap-1.5 justify-end">
              {suggestions.slice(0, 6).map((s, i) => (
                <button
                  key={`${s.label}-${i}`}
                  onClick={() => send(s.prompt, { reportTitle: s.label, autoOpenReport: true })}
                  disabled={loading}
                  style={{
                    fontSize: 10.5, fontWeight: 700,
                    padding: "6px 12px", borderRadius: 999,
                    background: "#FFFDF9",
                    border: `1px solid ${C.mediumWood}33`,
                    color: C.textPrimary,
                    cursor: loading ? "default" : "pointer",
                    fontFamily: "inherit",
                    transition: "all 0.15s",
                    lineHeight: 1.3,
                    textAlign: "end",
                  }}
                  onMouseEnter={(e) => {
                    if (loading) return;
                    const el = e.currentTarget as HTMLButtonElement;
                    el.style.background = `${C.sunset}55`;
                    el.style.borderColor = `${C.mediumWood}66`;
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLButtonElement;
                    el.style.background = "#FFFDF9";
                    el.style.borderColor = `${C.mediumWood}33`;
                  }}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </motion.div>
        );
      })()}

      {/* Input area */}
      <div className="px-4 pb-4 pt-2" style={{ flexShrink: 0 }}>
        <div style={{
          display: "flex", alignItems: "flex-end", gap: 8,
          background: "#F8F3EC", border: `1.5px solid ${C.border}`,
          borderRadius: 16, padding: "8px 8px 8px 12px",
          transition: "border-color 0.2s",
        }}
          onFocusCapture={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = C.mediumWood; }}
          onBlurCapture={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = C.border; }}
        >
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t("ai.inputPh")}
            disabled={loading}
            rows={1}
            style={{
              flex: 1, background: "transparent", border: "none", outline: "none",
              resize: "none", fontFamily: "inherit", fontSize: 12, color: C.textPrimary,
              lineHeight: 1.6, textAlign: lang === "ar" ? "right" : "left",
              maxHeight: 96, overflowY: "auto",
            }}
            onInput={(e) => {
              const t = e.currentTarget;
              t.style.height = "auto";
              t.style.height = Math.min(t.scrollHeight, 96) + "px";
            }}
          />
          <button
            onClick={() => send(input)}
            disabled={!input.trim() || loading}
            style={{
              width: 32, height: 32, borderRadius: 10, border: "none",
              background: input.trim() && !loading ? C.mediumWood : C.border,
              color: input.trim() && !loading ? "#fff" : C.warmGray,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: input.trim() && !loading ? "pointer" : "default",
              transition: "all 0.2s", flexShrink: 0,
            }}
          >
            <Send size={13} strokeWidth={2} />
          </button>
        </div>
        <p style={{ fontSize: 9, color: C.warmGray, textAlign: lang === "ar" ? "right" : "left", marginTop: 5 }}>
          {t("ai.sendHint")}
        </p>
      </div>

      <ExecutiveReportModal
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        title={reportTitle}
        data={reportData ? { ...reportData, logistics: reportSummary?.logistics } : reportData}
        onAction={(p) => send(p)}
      />
    </div>
  );
}

/* ─── Main page ───────────────────────────────────────────────── */
