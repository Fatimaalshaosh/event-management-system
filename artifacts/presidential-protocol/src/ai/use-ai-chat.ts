import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/i18n/language-context";
import type { AssistantReply, ChatMessage, PageContext } from "./types";

type Options = {
  pageContext?: PageContext | null;
  autoBrief?: boolean;
};

export function useAiChat({ pageContext, autoBrief = false }: Options = {}) {
  const { t } = useTranslation();
  const { lang } = useLanguage();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dailyBrief, setDailyBrief] = useState<AssistantReply | null>(null);
  const [briefLoading, setBriefLoading] = useState(autoBrief);
  const ctxRef = useRef<PageContext | null>(pageContext ?? null);
  ctxRef.current = pageContext ?? null;

  useEffect(() => {
    if (!autoBrief) return;
    let cancelled = false;
    setBriefLoading(true);
    (async () => {
      try {
        const res = await fetch(`/api/ai-assistant/daily-brief?lang=${lang}`);
        if (!res.ok) throw new Error("brief failed");
        const data = (await res.json()) as AssistantReply;
        if (!cancelled) setDailyBrief(data);
      } catch {
        /* silent */
      } finally {
        if (!cancelled) setBriefLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [lang, autoBrief]);

  const send = useCallback(
    async (text: string, opts?: { reportTitle?: string }): Promise<AssistantReply | null> => {
      const trimmed = text.trim();
      if (!trimmed || loading) return null;
      const rTitle = opts?.reportTitle ?? t("report.defaultTitle");
      setError(null);
      setMessages((prev) => [...prev, { role: "user", text: trimmed }]);
      setLoading(true);
      try {
        const ctx = ctxRef.current;
        const body: Record<string, unknown> = { message: trimmed, lang };
        if (ctx) {
          body.context = {
            page: ctx.page,
            pageTitle: lang === "en" ? ctx.titleEn : ctx.titleAr,
            ...(ctx.data ?? {}),
          };
        }
        const res = await fetch("/api/ai-assistant", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!res.ok) {
          const errBody = (await res.json().catch(() => ({}))) as { error?: string };
          throw new Error(errBody.error ?? t("ai.error"));
        }
        const data = (await res.json()) as AssistantReply;
        setMessages((prev) => [...prev, { role: "assistant", reply: data, reportTitle: rTitle }]);
        return data;
      } catch (err) {
        const msg = err instanceof Error ? err.message : t("ai.error");
        setError(msg);
        setMessages((prev) => prev.slice(0, -1));
        return null;
      } finally {
        setLoading(false);
      }
    },
    [loading, t, lang],
  );

  const reset = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return { messages, loading, error, dailyBrief, briefLoading, send, reset };
}
