import { palette } from "@/theme";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/i18n/language-context";
import { AlertTriangle, Sparkles, Zap } from "lucide-react";
import type { AssistantReply } from "./types";

const C = palette;

const SEV: Record<AssistantReply["risks"][number]["severity"], { color: string; bg: string; border: string }> = {
  critical: { color: "#8B2020", bg: "rgba(200,75,56,0.10)", border: "rgba(200,75,56,0.30)" },
  high:     { color: "#A0522D", bg: "rgba(173,137,101,0.14)", border: "rgba(173,137,101,0.35)" },
  medium:   { color: "#7A4F2D", bg: "rgba(235,204,173,0.45)", border: "rgba(173,137,101,0.30)" },
  low:      { color: "#2D5554", bg: "rgba(151,178,177,0.20)", border: "rgba(151,178,177,0.45)" },
};

/** Compact assistant reply view — for floating dock + contextual copilot. */
export function CompactReply({
  reply,
  onAction,
  loading,
}: {
  reply: AssistantReply;
  onAction: (prompt: string) => void;
  loading: boolean;
}) {
  const { t } = useTranslation();
  const { dir } = useLanguage();
  const align = dir === "rtl" ? "right" : "left";
  const justify = dir === "rtl" ? "justify-end" : "justify-start";

  return (
    <div className="space-y-2.5" style={{ textAlign: align }}>
      {/* Analysis */}
      <div
        style={{
          padding: "10px 13px",
          borderRadius: 12,
          background: "#F8F1E6",
          border: "1px solid #E2D8CC",
        }}
      >
        <div className={`flex items-center gap-1.5 mb-1.5 ${justify}`}>
          <Sparkles size={10} strokeWidth={1.8} color={C.mediumWood} />
          <span style={{ fontSize: 8.5, fontWeight: 800, letterSpacing: "0.16em", color: C.castleHill }}>
            {t("ai.executiveAnalysis")}
          </span>
        </div>
        <p style={{ fontSize: 12, lineHeight: 1.75, color: C.textPrimary, whiteSpace: "pre-wrap" }}>
          {reply.analysis}
        </p>
      </div>

      {/* Sections — compact list */}
      {reply.sections.length > 0 && (
        <div className="space-y-1.5">
          {reply.sections.map((s, i) => (
            <div
              key={i}
              style={{
                padding: "8px 12px",
                borderRadius: 10,
                background: "#FFFDF9",
                border: "1px solid rgba(103,90,81,0.16)",
              }}
            >
              <p style={{ fontSize: 11, fontWeight: 700, color: C.textPrimary, marginBottom: 4 }}>
                {s.title}
              </p>
              <p style={{ fontSize: 11, lineHeight: 1.7, color: C.warmGray, whiteSpace: "pre-wrap" }}>
                {s.body}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Risks */}
      {reply.risks.length > 0 && (
        <div className="space-y-1.5">
          <div className={`flex items-center gap-1.5 ${justify}`}>
            <AlertTriangle size={10} strokeWidth={1.8} color="#A0522D" />
            <span style={{ fontSize: 8.5, fontWeight: 800, letterSpacing: "0.16em", color: "#A0522D" }}>
              {t("ai.operationalAlerts")}
            </span>
          </div>
          {reply.risks.map((r, i) => {
            const sev = SEV[r.severity];
            return (
              <div
                key={i}
                style={{
                  padding: "8px 11px",
                  borderRadius: 10,
                  background: sev.bg,
                  border: `1px solid ${sev.border}`,
                }}
              >
                <div className="flex items-start gap-2 mb-1" style={{ flexDirection: dir === "rtl" ? "row-reverse" : "row" }}>
                  <span
                    style={{
                      fontSize: 8, fontWeight: 800, padding: "1.5px 6px",
                      borderRadius: 999, background: sev.color, color: "#fff",
                      whiteSpace: "nowrap", letterSpacing: "0.04em",
                    }}
                  >
                    {t(`severity.${r.severity}`)}
                  </span>
                  <p style={{ fontSize: 11, fontWeight: 700, color: sev.color, flex: 1, lineHeight: 1.4 }}>
                    {r.title}
                  </p>
                </div>
                {r.mitigation && (
                  <p style={{ fontSize: 10.5, color: C.textPrimary, lineHeight: 1.6 }}>
                    <span style={{ fontWeight: 700, color: sev.color }}>{t("ai.suggestedAction")}: </span>
                    {r.mitigation}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Next actions — chips */}
      {reply.nextActions.length > 0 && (
        <div>
          <div className={`flex items-center gap-1.5 mb-1.5 ${justify}`}>
            <Zap size={10} strokeWidth={1.8} color={C.mangrove} />
            <span style={{ fontSize: 8.5, fontWeight: 800, letterSpacing: "0.16em", color: C.mangrove }}>
              {t("ai.nextSuggestions")}
            </span>
          </div>
          <div className={`flex flex-wrap gap-1.5 ${justify}`}>
            {reply.nextActions.map((a, i) => (
              <button
                key={i}
                onClick={() => onAction(a.prompt)}
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
              >
                {a.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
