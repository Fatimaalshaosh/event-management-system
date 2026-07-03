import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { FileText, FileSpreadsheet, Download } from "lucide-react";
import { format } from "date-fns";
import { ar, enUS } from "date-fns/locale";
import type { Report } from "@workspace/api-client-react";
import { SectionCard, C } from "../primitives";
import type { Lang } from "../../events/event-utils";

const FORMAT_ICON: Record<string, typeof FileText> = {
  PDF: FileText,
  Excel: FileSpreadsheet,
  CSV: Download,
};

export function RecentReportsWidget({
  reports,
  lang,
  loading,
}: {
  reports: Report[];
  lang: Lang;
  loading: boolean;
}) {
  const { t } = useTranslation();
  const dir = lang === "ar" ? "rtl" : "ltr";
  const locale = lang === "ar" ? ar : enUS;
  const recent = [...reports]
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
    .slice(0, 5);

  return (
    <SectionCard title={t("dashboard.recentReports.title")} accent={C.mediumWood}>
      {loading ? (
        <p style={{ fontSize: 12, color: C.warmGray, textAlign: dir === "rtl" ? "right" : "left" }}>
          {t("common.loading")}
        </p>
      ) : recent.length === 0 ? (
        <div className="text-center py-6" style={{ color: C.warmGray }}>
          <FileText size={30} className="mx-auto mb-2 opacity-20" />
          <p className="text-xs">{t("dashboard.recentReports.empty")}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {recent.map((r) => {
            const Icon = FORMAT_ICON[r.format] ?? FileText;
            const name = lang === "ar" ? r.nameAr || r.name : r.name;
            return (
              <div
                key={r.id}
                className="flex items-center justify-between gap-3 rounded-xl"
                style={{ background: C.pageBg, border: `1px solid ${C.border}`, padding: "10px 12px" }}
              >
                <span
                  className="text-xs px-2 py-0.5 rounded font-mono font-bold shrink-0"
                  style={{ background: `${C.sunset}55`, color: C.mediumWood }}
                >
                  {r.format}
                </span>
                <div className="flex items-center gap-2.5 min-w-0 flex-1" style={{ flexDirection: dir === "rtl" ? "row-reverse" : "row", justifyContent: dir === "rtl" ? "flex-start" : "flex-end" }}>
                  <div className="min-w-0" style={{ textAlign: dir === "rtl" ? "right" : "left" }}>
                    <p className="truncate" style={{ fontSize: 12.5, fontWeight: 700, color: C.textPrimary }} title={name}>
                      {name}
                    </p>
                    <p style={{ fontSize: 10, color: C.warmGray, marginTop: 1 }}>
                      {format(new Date(r.createdAt), "d MMM yyyy · HH:mm", { locale })}
                    </p>
                  </div>
                  <div
                    className="shrink-0 rounded-lg flex items-center justify-center"
                    style={{ width: 30, height: 30, background: `${C.mediumWood}18`, color: C.mediumWood }}
                  >
                    <Icon size={14} strokeWidth={1.6} />
                  </div>
                </div>
              </div>
            );
          })}
          <Link
            href="/reports"
            className="block text-center text-xs font-medium pt-1 transition-all hover:opacity-70"
            style={{ color: C.mediumWood }}
          >
            {t("common.viewAll")}
          </Link>
        </div>
      )}
    </SectionCard>
  );
}
