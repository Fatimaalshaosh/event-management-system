import { formatCurrency as fmtMoney } from "@/lib/format";
import type { Event } from "@workspace/api-client-react";
import { useGetReportsLogistics } from "@workspace/api-client-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  startOfDay,
  endOfDay,
  parseISO,
  isWithinInterval,
  format,
} from "date-fns";
import { ar, enUS } from "date-fns/locale";
import {
  FileText,
  FileSpreadsheet,
  FileType,
  Printer,
  Mail,
  Archive,
  Sparkles,
  Download,
  Loader2,
} from "lucide-react";
import { T, type Lang, evName, evCountry, eventId } from "./event-utils";
import { useToast } from "@/hooks/use-toast";
import { IS_DEMO, demoAssistantReply } from "@/demo/demo-ai";
import {
  ExecutiveReportModal,
  type ExecutiveReportData,
} from "@/components/executive-report";

type Period = "day" | "week" | "month" | "year" | "custom";
type ReportType =
  | "summary"
  | "readiness"
  | "visits"
  | "protocol"
  | "approvals"
  | "executive";
type Fmt = "pdf" | "excel" | "word";

const PERIODS: Period[] = ["day", "week", "month", "year", "custom"];
const REPORT_TYPES: ReportType[] = [
  "summary",
  "readiness",
  "visits",
  "protocol",
  "approvals",
  "executive",
];
const FORMATS: { value: Fmt; Icon: typeof FileText }[] = [
  { value: "pdf", Icon: FileText },
  { value: "excel", Icon: FileSpreadsheet },
  { value: "word", Icon: FileType },
];

function eventsForType(events: Event[], type: ReportType): Event[] {
  switch (type) {
    case "visits":
      return events.filter(
        (e) =>
          e.eventType === "visitOfficial" ||
          e.eventType === "delegationReception",
      );
    case "protocol":
      return events.filter(
        (e) =>
          e.eventType === "protocolMeeting" ||
          e.eventType === "coordinationMeeting" ||
          e.eventType === "nationalEvent",
      );
    default:
      return events;
  }
}

function esc(s: string): string {
  return s.replace(/[&<>"]/g, (c) =>
    c === "&" ? "&amp;" : c === "<" ? "&lt;" : c === ">" ? "&gt;" : "&quot;",
  );
}


export function ReportCenter({ events, lang }: { events: Event[]; lang: Lang }) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const dir = lang === "ar" ? "rtl" : "ltr";
  const locale = lang === "ar" ? ar : enUS;

  const [period, setPeriod] = useState<Period>("month");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [reportType, setReportType] = useState<ReportType>("summary");
  const [fmt, setFmt] = useState<Fmt>("pdf");
  const [aiLoading, setAiLoading] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportData, setReportData] = useState<ExecutiveReportData | null>(null);
  const [reportTitle, setReportTitle] = useState("");

  const range = useMemo(() => {
    const now = new Date();
    if (period === "day") return { start: startOfDay(now), end: endOfDay(now) };
    if (period === "week")
      return {
        start: startOfWeek(now, { weekStartsOn: 0 }),
        end: endOfWeek(now, { weekStartsOn: 0 }),
      };
    if (period === "month")
      return { start: startOfMonth(now), end: endOfMonth(now) };
    if (period === "year")
      return { start: startOfYear(now), end: endOfYear(now) };
    const s = from ? startOfDay(parseISO(from)) : startOfYear(now);
    const e = to ? endOfDay(parseISO(to)) : endOfYear(now);
    return { start: s, end: e };
  }, [period, from, to]);

  const inRange = useMemo(() => {
    const pool = eventsForType(events, reportType);
    return pool.filter((e) => {
      try {
        return isWithinInterval(parseISO(e.date), range);
      } catch {
        return false;
      }
    });
  }, [events, reportType, range]);

  const scopeIds = useMemo(
    () => inRange.map((e) => e.id).join(","),
    [inRange],
  );
  const { data: scopedLogistics } = useGetReportsLogistics({
    eventIds: scopeIds,
  });

  const periodText = useMemo(() => {
    if (period === "custom" && (from || to))
      return `${from || "—"} → ${to || "—"}`;
    return `${format(range.start, "d MMM yyyy", { locale })} → ${format(range.end, "d MMM yyyy", { locale })}`;
  }, [period, from, to, range, locale]);

  function buildTitle(): string {
    return `${t(`pages.events.reportCenter.types.${reportType}`)} · ${periodText}`;
  }

  function buildHtml(): string {
    const title = buildTitle();
    const head = [
      t("pages.events.card.delegation"),
      "ID",
      t("pages.events.title"),
      t("pages.events.filters.status"),
      t("pages.events.card.readiness"),
    ];
    const rows = inRange
      .map(
        (e) => `<tr>
        <td>${esc(evCountry(e, lang) || "—")}</td>
        <td>${esc(eventId(e))}</td>
        <td>${esc(evName(e, lang))}</td>
        <td>${esc(t(`status.${e.status}`))}</td>
        <td>${e.readinessPercent}%</td>
      </tr>`,
      )
      .join("");
    return `<!doctype html><html dir="${dir}" lang="${lang}"><head><meta charset="utf-8" />
    <title>${esc(title)}</title>
    <style>
      body { font-family: 'Noto Sans Arabic', Arial, sans-serif; color: ${T.textPrimary}; padding: 32px; }
      .sub { color: ${T.castleHill}; font-size: 11px; letter-spacing: .12em; font-weight: 700; }
      h1 { font-size: 22px; margin: 6px 0 2px; }
      h2 { font-size: 15px; margin: 26px 0 8px; color: ${T.mangrove}; }
      .meta { color: ${T.warmGray}; font-size: 12px; margin-bottom: 18px; }
      table { width: 100%; border-collapse: collapse; font-size: 12px; }
      th, td { border: 1px solid ${T.border}; padding: 7px 9px; text-align: ${dir === "rtl" ? "right" : "left"}; }
      th { background: ${T.sunset}44; font-weight: 700; }
      footer { margin-top: 22px; color: ${T.warmGray}; font-size: 10.5px; }
    </style></head><body>
      <div class="sub">${esc(t("report.authority"))}</div>
      <h1>${esc(t(`pages.events.reportCenter.types.${reportType}`))}</h1>
      <div class="meta">${esc(periodText)} · ${t("pages.events.reportCenter.rangeCount", { count: inRange.length })}</div>
      <table><thead><tr>${head.map((h) => `<th>${esc(h)}</th>`).join("")}</tr></thead>
      <tbody>${rows || `<tr><td colspan="${head.length}">—</td></tr>`}</tbody></table>
      ${buildLogisticsHtml()}
      <footer>${esc(t("report.footer"))}</footer>
    </body></html>`;
  }

  function buildLogisticsHtml(): string {
    const lg = scopedLogistics;
    if (!lg) return "";
    const variance = lg.budgetActual - lg.budgetEstimated;
    const moneyRows: [string, string][] = [
      [t("report.logistics.estimatedBudget"), fmtMoney(lg.budgetEstimated, lg.currency, lang)],
      [t("report.logistics.actualBudget"), fmtMoney(lg.budgetActual, lg.currency, lang)],
      [t("report.logistics.variance"), fmtMoney(variance, lg.currency, lang)],
    ];
    const countRows: [string, string][] = [
      [t("report.logistics.travel"), String(lg.travel)],
      [t("report.logistics.hotel"), String(lg.hotel)],
      [t("report.logistics.fleet"), String(lg.fleet)],
      [t("report.logistics.gifts"), String(lg.gifts)],
      [t("report.logistics.documents"), String(lg.documents)],
    ];
    const tr = ([label, value]: [string, string]) =>
      `<tr><td><b>${esc(label)}</b></td><td>${esc(value)}</td></tr>`;
    return `<h2>${esc(t("report.logistics.title"))}</h2>
      <table><tbody>
        ${moneyRows.map(tr).join("")}
        ${countRows.map(tr).join("")}
      </tbody></table>`;
  }

  function downloadBlob(content: string, mime: string, ext: string) {
    const blob = new Blob(["\ufeff" + content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${reportType}-${format(new Date(), "yyyyMMdd")}.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function exportReport() {
    const html = buildHtml();
    if (fmt === "pdf") {
      const w = window.open("", "_blank", "width=900,height=900");
      if (!w) return;
      w.document.open();
      w.document.write(html);
      w.document.close();
      setTimeout(() => w.print(), 350);
    } else if (fmt === "excel") {
      downloadBlob(html, "application/vnd.ms-excel", "xls");
    } else {
      downloadBlob(html, "application/msword", "doc");
    }
  }

  function printReport() {
    const html = buildHtml();
    const w = window.open("", "_blank", "width=900,height=900");
    if (!w) return;
    w.document.open();
    w.document.write(html);
    w.document.close();
    setTimeout(() => w.print(), 350);
  }

  function emailReport() {
    const subject = encodeURIComponent(buildTitle());
    const body = encodeURIComponent(
      inRange.map((e) => `• ${evName(e, lang)} — ${e.readinessPercent}%`).join("\n"),
    );
    window.open(`mailto:?subject=${subject}&body=${body}`, "_blank");
    toast({ title: t("pages.events.reportCenter.emailed") });
  }

  function archiveReport() {
    try {
      const key = "pp_report_archive";
      const prev = JSON.parse(localStorage.getItem(key) ?? "[]") as unknown[];
      prev.push({
        title: buildTitle(),
        type: reportType,
        period: periodText,
        count: inRange.length,
        at: new Date().toISOString(),
      });
      localStorage.setItem(key, JSON.stringify(prev));
    } catch {
      /* ignore storage errors */
    }
    toast({ title: t("pages.events.reportCenter.archived") });
  }

  async function generateAi() {
    if (aiLoading) return;
    setAiLoading(true);
    const typeLabel = t(`pages.events.reportCenter.types.${reportType}`);
    const names = inRange
      .slice(0, 20)
      .map((e) => `- ${evName(e, lang)} (${e.readinessPercent}%, ${t(`status.${e.status}`)})`)
      .join("\n");
    const message =
      lang === "ar"
        ? `أعد تقريراً تنفيذياً بعنوان «${typeLabel}» للفترة ${periodText}. عدد الفعاليات: ${inRange.length}.\nالفعاليات:\n${names}`
        : `Prepare an executive report titled "${typeLabel}" for the period ${periodText}. Events count: ${inRange.length}.\nEvents:\n${names}`;
    const title = buildTitle();
    try {
      if (IS_DEMO) { setReportTitle(title); setReportData(demoAssistantReply(lang)); setReportOpen(true); return; }
      const res = await fetch("/api/ai-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, lang }),
      });
      if (!res.ok) throw new Error("ai failed");
      const data = (await res.json()) as ExecutiveReportData;
      setReportTitle(title);
      setReportData(data);
      setReportOpen(true);
    } catch {
      toast({ title: t("ai.error"), variant: "destructive" });
    } finally {
      setAiLoading(false);
    }
  }

  const pill = (active: boolean): React.CSSProperties => ({
    padding: "7px 14px",
    borderRadius: 10,
    fontSize: 12.5,
    fontWeight: 700,
    cursor: "pointer",
    border: `1px solid ${active ? T.mangrove + "66" : T.border}`,
    background: active ? T.mangrove + "12" : T.cardBg,
    color: active ? T.mangrove : T.textPrimary,
    transition: "all 0.15s",
  });

  return (
    <section
      className="space-y-5 p-5 rounded-2xl"
      style={{ background: T.cardBg, border: `1px solid ${T.border}` }}
      dir={dir}
    >
      <div style={{ textAlign: dir === "rtl" ? "right" : "left" }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: T.textPrimary, fontFamily: "Georgia, serif" }}>
          {t("pages.events.reportCenter.title")}
        </h2>
        <p style={{ fontSize: 12.5, color: T.warmGray, marginTop: 2 }}>
          {t("pages.events.reportCenter.subtitle")}
        </p>
      </div>

      {/* Period */}
      <div className="space-y-2" style={{ textAlign: dir === "rtl" ? "right" : "left" }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: T.warmGray }}>
          {t("pages.events.reportCenter.period")}
        </span>
        <div className="flex flex-wrap gap-2">
          {PERIODS.map((p) => (
            <button key={p} type="button" onClick={() => setPeriod(p)} style={pill(period === p)}>
              {t(`pages.events.reportCenter.${p}`)}
            </button>
          ))}
        </div>
        {period === "custom" && (
          <div className="flex flex-wrap items-end gap-3" style={{ marginTop: 4 }}>
            <label className="flex flex-col gap-1" style={{ fontSize: 11, color: T.warmGray }}>
              {t("pages.events.reportCenter.from")}
              <input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                style={{ height: 36, borderRadius: 9, border: `1px solid ${T.border}`, padding: "0 10px", fontSize: 12.5, color: T.textPrimary, background: T.cardBg }}
              />
            </label>
            <label className="flex flex-col gap-1" style={{ fontSize: 11, color: T.warmGray }}>
              {t("pages.events.reportCenter.to")}
              <input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                style={{ height: 36, borderRadius: 9, border: `1px solid ${T.border}`, padding: "0 10px", fontSize: 12.5, color: T.textPrimary, background: T.cardBg }}
              />
            </label>
          </div>
        )}
      </div>

      {/* Report type */}
      <div className="space-y-2" style={{ textAlign: dir === "rtl" ? "right" : "left" }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: T.warmGray }}>
          {t("pages.events.reportCenter.reportType")}
        </span>
        <div className="grid gap-2" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))" }}>
          {REPORT_TYPES.map((rt) => (
            <button
              key={rt}
              type="button"
              onClick={() => setReportType(rt)}
              className="flex items-center justify-between gap-2"
              style={{
                padding: "10px 13px",
                borderRadius: 11,
                fontSize: 12.5,
                fontWeight: 600,
                cursor: "pointer",
                textAlign: dir === "rtl" ? "right" : "left",
                border: `1px solid ${reportType === rt ? T.mangrove + "66" : T.border}`,
                background: reportType === rt ? T.mangrove + "10" : T.cardBg,
                color: reportType === rt ? T.mangrove : T.textPrimary,
              }}
            >
              {t(`pages.events.reportCenter.types.${rt}`)}
            </button>
          ))}
        </div>
      </div>

      {/* Format + count */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span style={{ fontSize: 11, fontWeight: 700, color: T.warmGray }}>
            {t("pages.events.reportCenter.format")}
          </span>
          {FORMATS.map(({ value, Icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => setFmt(value)}
              className="flex items-center gap-1.5"
              style={pill(fmt === value)}
            >
              <Icon size={14} strokeWidth={1.8} />
              {t(`pages.events.reportCenter.formats.${value}`)}
            </button>
          ))}
        </div>
        <span style={{ fontSize: 12, fontWeight: 700, color: T.mangrove }}>
          {t("pages.events.reportCenter.rangeCount", { count: inRange.length })}
        </span>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-2 pt-1" style={{ borderTop: `1px solid ${T.borderSoft}`, paddingTop: 14 }}>
        <button
          type="button"
          onClick={exportReport}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:shadow-sm"
          style={{ background: T.mangrove, color: "#fff" }}
        >
          <Download size={15} strokeWidth={2} />
          {t("pages.events.reportCenter.generate")}
        </button>
        <button type="button" onClick={printReport} className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-semibold" style={{ border: `1px solid ${T.border}`, color: T.textPrimary, background: T.cardBg }}>
          <Printer size={15} strokeWidth={1.8} /> {t("pages.events.reportCenter.print")}
        </button>
        <button type="button" onClick={emailReport} className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-semibold" style={{ border: `1px solid ${T.border}`, color: T.textPrimary, background: T.cardBg }}>
          <Mail size={15} strokeWidth={1.8} /> {t("pages.events.reportCenter.email")}
        </button>
        <button type="button" onClick={archiveReport} className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-semibold" style={{ border: `1px solid ${T.border}`, color: T.textPrimary, background: T.cardBg }}>
          <Archive size={15} strokeWidth={1.8} /> {t("pages.events.reportCenter.archive")}
        </button>
        <button
          type="button"
          onClick={generateAi}
          disabled={aiLoading}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:shadow-sm"
          style={{ background: T.mediumWood, color: "#fff", marginInlineStart: "auto", opacity: aiLoading ? 0.7 : 1 }}
        >
          {aiLoading ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} strokeWidth={1.8} />}
          {aiLoading ? t("pages.events.reportCenter.generating") : t("pages.events.reportCenter.generateAi")}
        </button>
      </div>

      <ExecutiveReportModal
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        title={reportTitle}
        data={reportData ? { ...reportData, logistics: scopedLogistics } : reportData}
      />
    </section>
  );
}
