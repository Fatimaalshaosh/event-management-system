
import { Star } from "lucide-react";
import { T } from "./event-utils";


/* Extracted from events-sections.tsx — shared section header. */
export function SectionHeader({
  Icon,
  accent,
  title,
  subtitle,
  count,
  dir,
}: {
  Icon: typeof Star;
  accent: string;
  title: string;
  subtitle: string;
  count: number;
  dir: "rtl" | "ltr";
}) {
  return (
    <div
      className="flex items-center gap-3"
      style={{ flexDirection: dir === "rtl" ? "row-reverse" : "row" }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 12,
          background: accent + "1A",
          color: accent,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Icon size={20} strokeWidth={1.7} />
      </div>
      <div style={{ textAlign: dir === "rtl" ? "right" : "left", flex: 1 }}>
        <div className="flex items-center gap-2" style={{ justifyContent: dir === "rtl" ? "flex-end" : "flex-start" }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, color: T.textPrimary, fontFamily: "Georgia, serif" }}>
            {title}
          </h2>
          <span
            style={{
              fontSize: 11,
              fontWeight: 800,
              color: accent,
              background: accent + "1A",
              borderRadius: 999,
              padding: "1px 9px",
            }}
          >
            {count}
          </span>
        </div>
        <p style={{ fontSize: 12, color: T.warmGray, marginTop: 2 }}>{subtitle}</p>
      </div>
    </div>
  );
}
