import { palette } from "@/theme";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, X, Send, RotateCcw, ChevronDown } from "lucide-react";
import { useLanguage } from "@/i18n/language-context";
import { useAiChat } from "./use-ai-chat";
import { usePageContext } from "./page-context";
import { CompactReply } from "./compact-reply";

const C = { ...palette, border: "#E8DED1" };

export function FloatingAiDock() {
  const { t } = useTranslation();
  const { lang, dir } = useLanguage();
  const { context } = usePageContext();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const { messages, loading, error, send, reset } = useAiChat({ pageContext: context });
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const pageTitle = context ? (lang === "en" ? context.titleEn : context.titleAr) : t("ai.floating.global");

  const presetSuggestions = context?.suggestions ?? [];
  const lastAssistant = [...messages].reverse().find(
    (m): m is Extract<typeof messages[number], { role: "assistant" }> => m.role === "assistant",
  );
  const dynamicChips = lastAssistant?.reply.nextActions ?? [];

  useEffect(() => {
    if (open && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading, open]);

  useEffect(() => {
    if (!open) return;
    const id = setTimeout(() => inputRef.current?.focus(), 220);
    return () => clearTimeout(id);
  }, [open]);

  const handleSend = (text: string) => {
    setInput("");
    void send(text);
  };

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(input);
    }
  };

  return (
    <>
      {/* Floating button — bottom end-side (RTL: left, LTR: right) */}
      <AnimatePresence>
        {!open && (
          <motion.button
            key="dock-fab"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 380, damping: 28 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-6 end-6 z-50 flex items-center gap-2 group"
            style={{
              padding: "11px 16px",
              borderRadius: 999,
              background: "rgba(252, 247, 238, 0.78)",
              backdropFilter: "blur(18px)",
              WebkitBackdropFilter: "blur(18px)",
              border: `1px solid ${C.mediumWood}40`,
              boxShadow: "0 10px 32px rgba(61,53,41,0.18), 0 2px 8px rgba(61,53,41,0.08)",
              cursor: "pointer",
              fontFamily: "inherit",
            }}
            aria-label={t("ai.floating.open")}
          >
            <motion.span
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
              style={{
                width: 8, height: 8, borderRadius: "50%",
                background: `radial-gradient(circle, ${C.mediumWood}, ${C.sunset})`,
                boxShadow: `0 0 0 4px ${C.mediumWood}22`,
              }}
            />
            <span style={{ fontSize: 12, fontWeight: 700, color: C.textPrimary, letterSpacing: lang === "ar" ? "0" : "0.02em" }}>
              {t("ai.floating.shortLabel")}
            </span>
            <Sparkles size={14} strokeWidth={1.6} color={C.mediumWood} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Drawer */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              key="dock-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-40"
              style={{ background: "rgba(61,53,41,0.18)", backdropFilter: "blur(2px)" }}
            />

            {/* Drawer panel — slides in from end-side */}
            <motion.div
              key="dock-drawer"
              initial={{ opacity: 0, x: dir === "rtl" ? -40 : 40, y: 20 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              exit={{ opacity: 0, x: dir === "rtl" ? -40 : 40, y: 20 }}
              transition={{ type: "spring", stiffness: 320, damping: 30 }}
              className="fixed bottom-6 end-6 z-50 flex flex-col"
              style={{
                width: 400,
                maxWidth: "calc(100vw - 32px)",
                height: "min(620px, calc(100vh - 48px))",
                background: "rgba(255, 253, 249, 0.96)",
                backdropFilter: "blur(24px)",
                WebkitBackdropFilter: "blur(24px)",
                border: `1px solid ${C.mediumWood}33`,
                borderRadius: 20,
                boxShadow: "0 24px 56px rgba(61,53,41,0.24), 0 4px 16px rgba(61,53,41,0.10)",
                overflow: "hidden",
              }}
              dir={dir}
            >
              {/* Accent stripe */}
              <div style={{ height: 3, background: `linear-gradient(${dir === "rtl" ? "to left" : "to right"}, ${C.mediumWood}, #97B2B1)` }} />

              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: C.border }}>
                <div className="flex items-center gap-2">
                  {messages.length > 0 && (
                    <button
                      onClick={reset}
                      title={t("ai.reset")}
                      className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:opacity-70"
                      style={{ background: "#F3E7D7", color: C.castleHill }}
                    >
                      <RotateCcw size={12} strokeWidth={2} />
                    </button>
                  )}
                  <button
                    onClick={() => setOpen(false)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:opacity-70"
                    style={{ background: "#F3E7D7", color: C.castleHill }}
                    aria-label={t("common.close")}
                  >
                    <X size={13} strokeWidth={2} />
                  </button>
                </div>
                <div style={{ textAlign: dir === "rtl" ? "right" : "left" }}>
                  <h3
                    style={{
                      fontSize: 14, fontWeight: 800, color: C.textPrimary,
                      fontFamily: lang === "en" ? "'Playfair Display', Georgia, serif" : "Georgia, serif",
                    }}
                  >
                    {t("ai.floating.title")}
                  </h3>
                  <p style={{ fontSize: 9.5, color: C.warmGray, marginTop: 1 }}>
                    {pageTitle}
                  </p>
                </div>
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: "#F3E7D7", color: C.mediumWood }}
                >
                  <Sparkles size={14} strokeWidth={1.5} />
                </div>
              </div>

              {/* Scrollable area */}
              <div
                ref={scrollRef}
                className="flex-1 px-4 py-3 overflow-y-auto"
                style={{ fontSize: 12 }}
              >
                {/* Preset contextual suggestions when no messages */}
                {messages.length === 0 && presetSuggestions.length > 0 && (
                  <div className="mb-3">
                    <p style={{ fontSize: 10, fontWeight: 700, color: C.warmGray, marginBottom: 8, letterSpacing: "0.1em" }}>
                      {t("ai.floating.contextualPrompts")}
                    </p>
                    <div className={`flex flex-wrap gap-1.5 ${dir === "rtl" ? "justify-end" : "justify-start"}`}>
                      {presetSuggestions.map((s, i) => (
                        <button
                          key={i}
                          onClick={() => handleSend(s.prompt)}
                          disabled={loading}
                          style={{
                            fontSize: 10.5, fontWeight: 600,
                            padding: "6px 12px", borderRadius: 999,
                            background: `linear-gradient(135deg, ${C.mediumWood}12, ${C.sunset}40)`,
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

                {messages.length === 0 && presetSuggestions.length === 0 && !loading && (
                  <p style={{ fontSize: 11.5, color: C.warmGray, textAlign: "center", padding: "18px 0", lineHeight: 1.7 }}>
                    {t("ai.floating.idleHint")}
                  </p>
                )}

                <AnimatePresence initial={false}>
                  {messages.map((msg, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.18 }}
                      className="flex flex-col mb-3"
                      style={{ alignItems: msg.role === "user" ? (dir === "rtl" ? "flex-start" : "flex-end") : (dir === "rtl" ? "flex-end" : "flex-start") }}
                    >
                      <span style={{ fontSize: 8.5, fontWeight: 700, color: C.warmGray, marginBottom: 3 }}>
                        {msg.role === "user" ? t("ai.you") : t("ai.assistantTag")}
                      </span>
                      {msg.role === "user" ? (
                        <div
                          style={{
                            maxWidth: "90%",
                            padding: "8px 12px",
                            borderRadius: dir === "rtl" ? "14px 4px 14px 14px" : "4px 14px 14px 14px",
                            background: `linear-gradient(135deg, ${C.mediumWood}22, ${C.sunset}44)`,
                            border: `1px solid ${C.mediumWood}30`,
                            textAlign: dir === "rtl" ? "right" : "left",
                          }}
                        >
                          <p style={{ fontSize: 12, lineHeight: 1.65, color: C.textPrimary, whiteSpace: "pre-wrap" }}>
                            {msg.text}
                          </p>
                        </div>
                      ) : (
                        <div style={{ width: "100%" }}>
                          <CompactReply reply={msg.reply} onAction={handleSend} loading={loading} />
                        </div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>

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
                    className="rounded-xl px-3 py-2 text-xs mt-2"
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
              </div>

              {/* Dynamic suggestion chips from last reply */}
              {dynamicChips.length > 0 && !loading && (
                <div className="px-4 pt-1 pb-2 border-t" style={{ borderColor: C.border }}>
                  <div className={`flex flex-wrap gap-1.5 ${dir === "rtl" ? "justify-end" : "justify-start"}`}>
                    {dynamicChips.slice(0, 4).map((a, i) => (
                      <button
                        key={i}
                        onClick={() => handleSend(a.prompt)}
                        disabled={loading}
                        style={{
                          fontSize: 10, fontWeight: 700,
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
                </div>
              )}

              {/* Input */}
              <div className="px-3 py-3 border-t" style={{ borderColor: C.border, background: C.cream }}>
                <div className="flex items-end gap-2">
                  <button
                    onClick={() => handleSend(input)}
                    disabled={loading || !input.trim()}
                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all"
                    style={{
                      background: input.trim() && !loading ? C.mediumWood : "#E8DED1",
                      color: input.trim() && !loading ? "#fff" : C.warmGray,
                      cursor: input.trim() && !loading ? "pointer" : "default",
                    }}
                    aria-label={t("ai.floating.send")}
                  >
                    <Send size={14} strokeWidth={1.7} style={{ transform: dir === "rtl" ? "scaleX(-1)" : undefined }} />
                  </button>
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKey}
                    placeholder={t("ai.inputPh")}
                    rows={1}
                    dir={dir}
                    style={{
                      flex: 1,
                      fontSize: 12.5,
                      padding: "9px 12px",
                      borderRadius: 12,
                      border: `1px solid ${C.border}`,
                      background: C.floral,
                      color: C.textPrimary,
                      fontFamily: "inherit",
                      resize: "none",
                      outline: "none",
                      maxHeight: 120,
                      textAlign: dir === "rtl" ? "right" : "left",
                    }}
                  />
                </div>
                <p style={{ fontSize: 9, color: C.warmGray, marginTop: 5, textAlign: dir === "rtl" ? "right" : "left" }}>
                  {t("ai.sendHint")}
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

// re-export for convenience
export { ChevronDown };
