import { useTranslation } from "react-i18next";
import { EyeOff } from "lucide-react";
import { C } from "./primitives";
import {
  WIDGET_META,
  splitColumns,
  type WidgetId,
  type WidgetItem,
} from "./widget-meta";

function WidgetFrame({
  item,
  node,
  editMode,
  dir,
  onHide,
}: {
  item: WidgetItem;
  node: React.ReactNode;
  editMode: boolean;
  dir: "rtl" | "ltr";
  onHide: (id: WidgetId) => void;
}) {
  const { t } = useTranslation();
  const meta = WIDGET_META[item.id];

  return (
    <div
      className="relative"
      style={
        editMode
          ? {
              borderRadius: 18,
              outline: `1.5px dashed ${C.mediumWood}66`,
              outlineOffset: 3,
            }
          : undefined
      }
    >
      {editMode && (
        <button
          onClick={() => onHide(item.id)}
          title={t("dashboard.customize.hide")}
          className="absolute z-30 flex items-center justify-center transition-all hover:opacity-80"
          style={{
            top: -14,
            insetInlineEnd: 10,
            width: 24,
            height: 24,
            borderRadius: 999,
            border: `1px solid ${C.borderStrong}`,
            background: C.cardBg,
            color: C.castleHill,
            cursor: "pointer",
            boxShadow: C.shadow,
          }}
        >
          <EyeOff size={12} strokeWidth={2} />
        </button>
      )}
      {editMode && (
        <div
          className="absolute z-20 pointer-events-none"
          style={{
            top: -13,
            insetInlineStart: 12,
            fontSize: 9.5,
            fontWeight: 800,
            letterSpacing: "0.04em",
            color: meta.accent,
            background: C.cardBg,
            padding: "1px 8px",
            borderRadius: 999,
            border: `1px solid ${meta.accent}40`,
          }}
        >
          {dir === "rtl" ? meta.titleAr : meta.titleEn}
        </div>
      )}
      {node}
    </div>
  );
}

/**
 * Deterministic two-column dashboard grid.
 *
 * Each visible widget is placed into its canonical column (see widget-meta
 * RIGHT_COLUMN / LEFT_COLUMN). The board is a real CSS Grid (`1fr 1fr`, 24px
 * gap), so both columns always fill the full available width and the browser
 * mirrors them correctly for RTL — the primary column reads first (right in
 * Arabic, left in English). On narrow screens it collapses to a single column.
 */
export function CustomizableGrid({
  items,
  nodes,
  editMode,
  dir,
  onHide,
}: {
  items: WidgetItem[];
  nodes: Partial<Record<WidgetId, React.ReactNode>>;
  editMode: boolean;
  dir: "rtl" | "ltr";
  onHide: (id: WidgetId) => void;
}) {
  const byId = new Map(items.map((w) => [w.id, w]));
  const { right, left } = splitColumns(
    items.filter((w) => !w.hidden).map((w) => w.id),
  );

  const renderColumn = (ids: WidgetId[]) => (
    <div className="flex flex-col gap-6">
      {ids.map((id) => {
        const item = byId.get(id);
        if (!item) return null;
        return (
          <WidgetFrame
            key={id}
            item={item}
            node={nodes[id]}
            editMode={editMode}
            dir={dir}
            onHide={onHide}
          />
        );
      })}
    </div>
  );

  // If everything visible lives in a single canonical column, render one
  // full-width stack so the board never collapses to half its width.
  if (right.length === 0 || left.length === 0) {
    return renderColumn(right.length === 0 ? left : right);
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
      {renderColumn(right)}
      {renderColumn(left)}
    </div>
  );
}
