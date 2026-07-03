import { palette } from "@/theme";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ChevronDown, RotateCcw } from "lucide-react";
import { useLanguage } from "@/i18n/language-context";
import { useAiChat } from "./use-ai-chat";
import { usePageContext } from "./page-context";
import { CompactReply } from "./compact-reply";

const C = { ...palette, border: "#E8DED1" };

type Props = {
  /** Page-level copilot title key, e.g. "ai.copilot.event.title" */
  titleKey: string;
  /** Page-level copilot subtitle key */
  subtitleKey: string;
  /** Inline preset suggestions (uses page-context.suggestions if omitted) */
  suggestions?: Array<{ labelAr: string; labelEn: string; prompt: string }>;
};

/**
 * Compact contextual AI panel for individual pages (event-detail, fleet, reports).
 * Quiet by default — collapsed analysis, prominent smart chips, expands on first message.
 */
export function ContextualCopilot({ titleKey, subtitleKey, suggestions }: Props) {
  const { t } = useTranslation();
  const { lang, dir } = useLanguage();
  const { context } = usePageContext();
  const { messages, loading, error, send, reset } = useAiChat({ pageContext: context });
  const [expanded, setExpanded] = useState(false);

  const presets = suggestions ?? context?.suggestions ?? [];
  const lastAssistant = [...messages].reverse().find(
    (m): m is Extract<typeof messages[number], { role: "assistant" }> => m.role === "assistant",
  );

  const triggerSend = (prompt: string) => {
    setExpanded(true);
    void send(prompt);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="rounded-2xl overflow-hidden"
      style={{
        background: `linear-gradient(135deg, rgba(252,247,238,0.65), rgba(255,253,249,0.95))`,
        border: `1px solid ${C.mediumWood}33`,
        boxShadow: "0 2px 12px rgba(61,53,41,0.06)",
      }}
      dir={dir}
    >
      {/* Accent stripe */}
      <div style={{ height: 2, background: `linear-gradient(${dir === "rtl" ? "to left" : "to right"}, ${C.mediumWood}, #97B2B1)` }} />

      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-3"
        style={{ borderBottom: expanded ? `1px solid ${C.border}` : "none" }}
      >
        <div className="flex items-center gap-2">
          {messages.length > 0 && (
            <button
              onClick={reset}
              title={t("ai.reset")}
              className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:opacity-70"
              style={{ background: "#F3E7D7", color: C.castleHill }}
            >
              <RotateCcw size={11} strokeWidth={2} />
            </button>
          )}
          <button
            onClick={() => setExpanded((v) => !v)}
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:opacity-70"
            style={{ background: "#F3E7D7", color: C.castleHill }}
            aria-label={expanded ? t("common.close") : t("ai.copilot.expand")}
          >
            <motion.div animate={{ rotate: expanded ? 0 : (dir === "rtl" ? 90 : -90) }} transition={{ duration: 0.2 }}>
              <ChevronDown size={13} />
            </motion.div>
          </button>
        </div>
        <div style={{ textAlign: dir === "rtl" ? "right" : "left", flex: 1, paddingInline: 10 }}>
          <h3
            style={{
              fontSize: 13, fontWeight: 800, color: C.textPrimary,
              fontFamily: lang === "en" ? "'Playfair Display', Georgia, serif" : "Georgia, serif",
            }}
          >
            {t(titleKey)}
          </h3>
          <p style={{ fontSize: 10, color: C.warmGray, marginTop: 1 }}>{t(subtitleKey)}</p>
        </div>
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: "#F3E7D7", color: C.mediumWood }}
        >
          <Sparkles size={14} strokeWidth={1.5} />
        </div>
      </div>

      {/* Always-visible suggestion chips (when not expanded) */}
      {!expanded && presets.length > 0 && (
        <div className="px-5 py-3">
          <div className={`flex flex-wrap gap-1.5 ${dir === "rtl" ? "justify-end" : "justify-start"}`}>
            {presets.map((s, i) => (
              <button
                key={i}
                onClick={() => triggerSend(s.prompt)}
                disabled={loading}
                style={{
                  fontSize: 11, fontWeight: 600,
                  padding: "6px 13px", borderRadius: 999,
                  background: `linear-gradient(135deg, ${C.mediumWood}10, ${C.sunset}38)`,
                  border: `1px solid ${C.mediumWood}38`,
                  color: C.textPrimary, cursor: loading ? "default" : "pointer",
                  fontFamily: "inherit", transition: "all 0.15s",
                  opacity: loading ? 0.5 : 1,
                }}
              >
                {lang === "en" ? s.labelEn : s.labelAr}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Expanded chat view */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{ overflow: "hidden" }}
          >
            <div className="px-5 py-4 space-y-3" style={{ maxHeight: 540, overflowY: "auto" }}>
              {presets.length > 0 && messages.length === 0 && (
                <div className={`flex flex-wrap gap-1.5 ${dir === "rtl" ? "justify-end" : "justify-start"}`}>
                  {presets.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => triggerSend(s.prompt)}
                      disabled={loading}
                      style={{
                        fontSize: 11, fontWeight: 600,
                        padding: "6px 13px", borderRadius: 999,
                        background: `linear-gradient(135deg, ${C.mediumWood}10, ${C.sunset}38)`,
                        border: `1px solid ${C.mediumWood}38`,
                        color: C.textPrimary, cursor: loading ? "default" : "pointer",
                        fontFamily: "inherit",
                        opacity: loading ? 0.5 : 1,
                      }}
                    >
                      {lang === "en" ? s.labelEn : s.labelAr}
                    </button>
                  ))}
                </div>
              )}

              {messages.map((msg, i) => (
                <div
                  key={i}
                  className="flex flex-col"
                  style={{ alignItems: msg.role === "user" ? (dir === "rtl" ? "flex-start" : "flex-end") : (dir === "rtl" ? "flex-end" : "flex-start") }}
                >
                  <span style={{ fontSize: 9, fontWeight: 700, color: C.warmGray, marginBottom: 3 }}>
                    {msg.role === "user" ? t("ai.you") : t("ai.assistantTag")}
                  </span>
                  {msg.role === "user" ? (
                    <div
                      style={{
                        maxWidth: "88%",
                        padding: "8px 12px",
                        borderRadius: dir === "rtl" ? "14px 4px 14px 14px" : "4px 14px 14px 14px",
                        background: `linear-gradient(135deg, ${C.mediumWood}22, ${C.sunset}44)`,
                        border: `1px solid ${C.mediumWood}30`,
                        textAlign: dir === "rtl" ? "right" : "left",
                      }}
                    >
                      <p style={{ fontSize: 12, lineHeight: 1.7, color: C.textPrimary, whiteSpace: "pre-wrap" }}>
                        {msg.text}
                      </p>
                    </div>
                  ) : (
                    <div style={{ width: "100%" }}>
                      <CompactReply reply={msg.reply} onAction={triggerSend} loading={loading} />
                    </div>
                  )}
                </div>
              ))}

              {loading && (
                <div className="flex items-center gap-1.5 py-2" style={{ justifyContent: dir === "rtl" ? "flex-end" : "flex-start" }}>
                  {[0, 0.15, 0.3].map((delay, i) => (
                    <motion.div
                      key={i}
                      animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 0.9, repeat: Infinity, delay, ease: "easeInOut" }}
                      style={{ width: 6, height: 6, borderRadius: "50%", background: C.mediumWood }}
                    />
                  ))}
                </div>
              )}

              {error && (
                <div
                  className="rounded-xl px-3 py-2 text-xs"
                  style={{
                    background: "rgba(200,75,56,0.06)",
                    border: "1px solid rgba(200,75,56,0.16)",
                    color: "#8B2020",
                    textAlign: dir === "rtl" ? "right" : "left",
                  }}
                >
                  {error}
                </div>
              )}

              {/* Dynamic follow-up chips */}
              {lastAssistant && lastAssistant.reply.nextActions.length > 0 && !loading && (
                <div className={`flex flex-wrap gap-1.5 ${dir === "rtl" ? "justify-end" : "justify-start"} pt-1`}>
                  {lastAssistant.reply.nextActions.slice(0, 4).map((a, i) => (
                    <button
                      key={i}
                      onClick={() => triggerSend(a.prompt)}
                      style={{
                        fontSize: 10.5, fontWeight: 700,
                        padding: "5px 11px", borderRadius: 999,
                        background: `linear-gradient(135deg, ${C.mangrove}10, #97B2B122)`,
                        border: `1px solid ${C.mangrove}40`,
                        color: C.mangrove, cursor: "pointer",
                        fontFamily: "inherit",
                      }}
                    >
                      {a.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
