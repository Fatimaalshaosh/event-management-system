import { formatCurrency as fmtMoney } from "@/lib/format";
import { palette } from "@/theme";





import type { AssistantReply } from "@/ai/types";

const P = palette;

/* Extracted from executive-report.tsx — report types + printable-HTML builder. */
export type ExecutiveReportLogistics = {
  travel: number;
  hotel: number;
  fleet: number;
  gifts: number;
  documents: number;
  budgetEstimated: number;
  budgetActual: number;
  currency: string;
};

/** Shared assistant reply shape + optional logistics for the printable report. */
export type ExecutiveReportData = AssistantReply & {
  logistics?: ExecutiveReportLogistics;
};

export function todayLong(lang: "ar" | "en") {
  return new Date().toLocaleDateString(lang === "ar" ? "ar-AE" : "en-GB", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });
}

export function todayTime(lang: "ar" | "en") {
  return new Date().toLocaleTimeString(lang === "ar" ? "ar-AE" : "en-GB", { hour: "2-digit", minute: "2-digit" });
}

export function esc(s: string): string {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export type ReportLabels = {
  lang: "ar" | "en";
  dir: "rtl" | "ltr";
  severity: Record<"critical" | "high" | "medium" | "low", string>;
  operationalAlerts: string;
  nextSteps: string;
  executiveSummary: string;
  impact: string;
  action: string;
  authority: string;
  fullAuthority: string;
  preparedBy: string;
  relatedEntity: string;
  footer: string;
  at: string;
  loading: string;
  logistics: {
    title: string;
    estimatedBudget: string;
    actualBudget: string;
    variance: string;
    travel: string;
    hotel: string;
    fleet: string;
    gifts: string;
    documents: string;
  };
};

export function buildPrintableHtml(title: string, data: ExecutiveReportData, labels: ReportLabels, related?: string): string {
  const risksHtml = data.risks.length
    ? `<h2>${esc(labels.operationalAlerts)}</h2>${data.risks.map((r) => `
        <div class="risk risk-${esc(r.severity)}">
          <div class="risk-head">
            <span class="badge">${esc(labels.severity[r.severity])}</span>
            <strong>${esc(r.title)}</strong>
          </div>
          ${r.impact ? `<p><b>${esc(labels.impact)}:</b> ${esc(r.impact)}</p>` : ""}
          ${r.mitigation ? `<p><b>${esc(labels.action)}:</b> ${esc(r.mitigation)}</p>` : ""}
        </div>`).join("")}`
    : "";

  const sectionsHtml = data.sections.map((s) => `
    <section><h2>${esc(s.title)}</h2><div class="body">${s.body
      .split("\n").map((l) => l.trim()).filter(Boolean)
      .map((l) => `<p>${esc(l)}</p>`).join("")}</div></section>`).join("");

  const nextHtml = data.nextActions.length
    ? `<h2>${esc(labels.nextSteps)}</h2><ol class="next">${data.nextActions.map((a) => `<li>${esc(a.label)}</li>`).join("")}</ol>`
    : "";

  const lg = data.logistics;
  const logisticsHtml = lg
    ? `<h2>${esc(labels.logistics.title)}</h2>
      <table class="logi">
        <tr>
          <td><b>${esc(labels.logistics.estimatedBudget)}</b></td>
          <td>${esc(fmtMoney(lg.budgetEstimated, lg.currency, labels.lang))}</td>
          <td><b>${esc(labels.logistics.actualBudget)}</b></td>
          <td>${esc(fmtMoney(lg.budgetActual, lg.currency, labels.lang))}</td>
        </tr>
        <tr>
          <td><b>${esc(labels.logistics.variance)}</b></td>
          <td colspan="3">${esc(fmtMoney(lg.budgetActual - lg.budgetEstimated, lg.currency, labels.lang))}</td>
        </tr>
        <tr>
          <td><b>${esc(labels.logistics.travel)}</b></td><td>${lg.travel}</td>
          <td><b>${esc(labels.logistics.hotel)}</b></td><td>${lg.hotel}</td>
        </tr>
        <tr>
          <td><b>${esc(labels.logistics.fleet)}</b></td><td>${lg.fleet}</td>
          <td><b>${esc(labels.logistics.gifts)}</b></td><td>${lg.gifts}</td>
        </tr>
        <tr>
          <td><b>${esc(labels.logistics.documents)}</b></td><td>${lg.documents}</td>
          <td></td><td></td>
        </tr>
      </table>`
    : "";

  const bodyFont = labels.lang === "ar"
    ? `"Noto Sans Arabic","Segoe UI",Tahoma,sans-serif`
    : `"Inter","Helvetica Neue",Helvetica,Arial,sans-serif`;
  const headingFont = labels.lang === "ar"
    ? `Georgia, serif`
    : `"Playfair Display", Georgia, serif`;
  const olDir = labels.dir === "rtl" ? "20px" : "20px";
  const olStartPad = labels.dir === "rtl" ? "0" : "20px";

  return `<!doctype html><html lang="${labels.lang}" dir="${labels.dir}"><head><meta charset="utf-8">
<title>${esc(title)}</title>
<style>
  @page { size: A4; margin: 18mm; }
  body { font-family: ${bodyFont}; color:${P.textPrimary}; background:${P.floralWhite}; margin:0; padding:0; direction:${labels.dir}; }
  .doc { max-width: 820px; margin: 0 auto; background:${P.paperBg}; padding: 40px 48px; border: 1px solid ${P.borderSolid}; }
  .stripe { height: 4px; background: linear-gradient(to ${labels.dir === "rtl" ? "left" : "right"}, ${P.mediumWood}, ${P.calmTeal}); margin: -40px -48px 28px; }
  header.report-head { display:flex; justify-content:space-between; align-items:flex-start; gap:24px; border-bottom: 1px solid ${P.borderSolid}; padding-bottom:18px; margin-bottom:24px; }
  header.report-head .meta { font-size: 11px; color:${P.warmGray}; line-height:1.9; }
  header.report-head h1 { font-family: ${headingFont}; font-size: 26px; color:${P.textPrimary}; margin: 0 0 6px; letter-spacing: ${labels.lang === "en" ? "-0.005em" : "0"}; }
  header.report-head .subtitle { font-size: 11px; color:${P.castleHill}; letter-spacing: 0.18em; font-weight: 700; text-transform: ${labels.lang === "en" ? "uppercase" : "none"}; }
  .summary { background: linear-gradient(135deg, ${P.sunset}33, ${P.paperBg} 70%); border:1px solid ${P.mediumWood}33; border-radius: 12px; padding: 18px 22px; margin-bottom: 28px; }
  .summary .label { font-size: 10px; color:${P.castleHill}; letter-spacing:0.2em; font-weight:800; margin-bottom: 8px; text-transform: ${labels.lang === "en" ? "uppercase" : "none"}; }
  .summary p { font-size: 14px; line-height:2; margin:0; color:${P.textPrimary}; }
  section { margin: 22px 0; page-break-inside: avoid; }
  h2 { font-family: ${headingFont}; font-size: 17px; color:${P.mangrove}; border-bottom: 1px solid ${P.borderSolid}; padding-bottom: 6px; margin: 24px 0 12px; letter-spacing: ${labels.lang === "en" ? "-0.003em" : "0"}; }
  .body p { font-size: 13.5px; line-height: 2; margin: 0 0 5px; }
  .risk { border-radius: 10px; padding: 12px 14px; margin: 8px 0; }
  .risk.risk-critical { background: rgba(200,75,56,0.10); border: 1px solid rgba(200,75,56,0.30); }
  .risk.risk-high     { background: rgba(173,137,101,0.14); border: 1px solid rgba(173,137,101,0.35); }
  .risk.risk-medium   { background: rgba(235,204,173,0.45); border: 1px solid rgba(173,137,101,0.30); }
  .risk.risk-low      { background: rgba(151,178,177,0.20); border: 1px solid rgba(151,178,177,0.45); }
  .risk-head { display:flex; gap:10px; align-items:center; margin-bottom:6px; }
  .badge { font-size: 9.5px; font-weight: 800; padding: 2px 8px; border-radius: 999px; color:#fff; background:${P.mediumWood}; letter-spacing: 0.04em; text-transform: ${labels.lang === "en" ? "uppercase" : "none"}; }
  .risk.risk-critical .badge { background: #8B2020; }
  .risk.risk-high     .badge { background: #A0522D; }
  .risk.risk-medium   .badge { background: #7A4F2D; }
  .risk.risk-low      .badge { background: #2D5554; }
  .risk p { font-size: 12.5px; line-height: 1.9; margin: 3px 0; }
  ol.next { padding-inline-start: ${olStartPad}; padding-inline-end: ${olDir}; }
  ol.next li { font-size: 13px; line-height: 2; margin-bottom: 4px; }
  table.logi { width: 100%; border-collapse: collapse; margin: 8px 0; }
  table.logi td { font-size: 12.5px; padding: 8px 12px; border: 1px solid ${P.borderSolid}; text-align: ${labels.dir === "rtl" ? "right" : "left"}; }
  table.logi td b { color: ${P.castleHill}; font-weight: 700; }
  footer { margin-top: 36px; padding-top: 14px; border-top: 1px solid ${P.borderSolid}; display:flex; justify-content:space-between; font-size: 10.5px; color:${P.warmGray}; }
</style></head><body><div class="doc"><div class="stripe"></div>
  <header class="report-head">
    <div class="meta">
      <div>${esc(todayLong(labels.lang))}</div>
      <div>${esc(labels.at)} ${esc(todayTime(labels.lang))}</div>
      <div>${esc(labels.preparedBy)}</div>
      ${related ? `<div>${esc(labels.relatedEntity)}: ${esc(related)}</div>` : ""}
    </div>
    <div style="text-align:${labels.dir === "rtl" ? "right" : "left"}">
      <div class="subtitle">${esc(labels.authority)}</div>
      <h1>${esc(title)}</h1>
    </div>
  </header>
  <div class="summary">
    <div class="label">${esc(labels.executiveSummary)}</div>
    <p>${esc(data.analysis)}</p>
  </div>
  ${sectionsHtml}
  ${logisticsHtml}
  ${risksHtml}
  ${nextHtml}
  <footer>
    <span>${esc(labels.footer)}</span>
    <span>${esc(labels.fullAuthority)}</span>
  </footer>
</div></body></html>`;
}
