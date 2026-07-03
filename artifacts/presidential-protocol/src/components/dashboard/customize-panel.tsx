import { motion } from "framer-motion";
import { Eye, EyeOff, LayoutGrid } from "lucide-react";
import { useTranslation } from "react-i18next";
import { C } from "./primitives";
import { WIDGET_META, type WidgetId, type WidgetItem } from "./widget-meta";

export function CustomizePanel({
  items,
  dir,
  onShow,
  onHide,
}: {
  items: WidgetItem[];
  dir: "rtl" | "ltr";
  onShow: (id: WidgetId) => void;
  onHide: (id: WidgetId) => void;
}) {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border p-5"
      style={{ background: C.cardBg, borderColor: C.border, boxShadow: C.shadow }}
      dir={dir}
    >
      <div className="flex items-center justify-between mb-4">
        <span style={{ fontSize: 11, color: C.warmGray, fontWeight: 600 }}>
          {t("dashboard.customize.panelHint")}
        </span>
        <div className="flex items-center gap-2">
          <h3 className="text-base font-bold" style={{ color: C.textPrimary, fontFamily: "Georgia, serif" }}>
            {t("dashboard.customize.widgets")}
          </h3>
          <LayoutGrid size={16} style={{ color: C.mediumWood }} />
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
        {items.map((w) => {
          const meta = WIDGET_META[w.id];
          const Icon = meta.icon;
          const visible = !w.hidden;
          return (
            <button
              key={w.id}
              onClick={() => (visible ? onHide(w.id) : onShow(w.id))}
              className="flex items-center justify-between gap-2 transition-all hover:opacity-90"
              style={{
                padding: "10px 12px",
                borderRadius: 14,
                fontFamily: "inherit",
                cursor: "pointer",
                textAlign: dir === "rtl" ? "right" : "left",
                background: visible ? `${meta.accent}10` : C.pageBg,
                border: `1px solid ${visible ? `${meta.accent}33` : C.border}`,
              }}
            >
              <div className="flex items-center gap-2 min-w-0">
                <div
                  className="shrink-0 rounded-lg flex items-center justify-center"
                  style={{
                    width: 28, height: 28,
                    background: visible ? meta.accent : `${C.warmGray}22`,
                    color: visible ? "#fff" : C.warmGray,
                  }}
                >
                  <Icon size={14} strokeWidth={1.7} />
                </div>
                <span
                  className="truncate"
                  style={{ fontSize: 11.5, fontWeight: 700, color: visible ? C.textPrimary : C.warmGray }}
                >
                  {dir === "rtl" ? meta.titleAr : meta.titleEn}
                </span>
              </div>
              <span style={{ color: visible ? meta.accent : C.warmGray, flexShrink: 0 }}>
                {visible ? <Eye size={14} strokeWidth={1.9} /> : <EyeOff size={14} strokeWidth={1.9} />}
              </span>
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}
