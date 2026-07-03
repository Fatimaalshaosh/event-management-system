import { useTranslation } from "react-i18next";
import { badgeFor } from "@/lib/identity";

/** Small role/department badge chip shown beside names. */
export function ExecutiveBadge({ department, showLabel = false }: { department?: string; showLabel?: boolean }) {
  const { t } = useTranslation();
  const b = badgeFor(department);
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full" style={{ background: b.color + "18", color: b.color }}>
      <span>{b.glyph}</span>
      {showLabel && department && <span>{t(`contacts.departments.${department}`)}</span>}
    </span>
  );
}
