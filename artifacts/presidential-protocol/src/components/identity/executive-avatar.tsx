import { useState } from "react";
import { useLanguage } from "@/i18n/language-context";
import { palette as C } from "@/theme";
import { useResolvedIdentity, usePortrait, portraitService, type IdentityInput } from "@/lib/identity";
import { PresenceDot } from "./presence";
import { ExecutiveHoverCard } from "./executive-hover-card";

export type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";
const PX: Record<AvatarSize, number> = { xs: 24, sm: 32, md: 40, lg: 56, xl: 96 };

/** The one avatar used everywhere a person appears. Resolves a deterministic
 * portrait, presence and badge from any identity input. */
export function ExecutiveAvatar({
  identity, size = "md", showPresence = true, showBadge = false, ring = false, hover = true, onClick, className,
}: {
  identity: IdentityInput;
  /** A named token, or an exact pixel size for premium executive layouts. */
  size?: AvatarSize | number;
  showPresence?: boolean;
  showBadge?: boolean;
  ring?: boolean;
  hover?: boolean;
  onClick?: () => void;
  className?: string;
}) {
  const { lang } = useLanguage();
  const id = useResolvedIdentity(identity);
  const req = { key: id.key, employeeId: id.employeeId, name: id.name, gender: id.gender, nationality: id.nationality, role: id.role, department: id.department };
  const url = usePortrait(req);
  const [broken, setBroken] = useState(false);
  const px = typeof size === "number" ? size : PX[size];
  const dot = Math.max(8, Math.round(px * 0.3));
  const name = lang === "ar" && id.nameAr ? id.nameAr : id.name;

  const img = (
    <span className="relative inline-flex shrink-0" style={{ width: px, height: px }}>
      <img src={broken ? portraitService.fallback(req) : url} alt={name} width={px} height={px} loading="lazy" onError={() => setBroken(true)} className="rounded-full object-cover w-full h-full"
        style={{ border: ring ? `2px solid ${id.deptColor}` : `1px solid ${C.border}`, boxShadow: "0 1px 3px rgba(28,40,30,.18)", background: C.cardBg }} />
      {showPresence && <PresenceDot presence={id.presence} size={dot} />}
      {showBadge && (
        <span className="absolute -top-1 rounded-full flex items-center justify-center" style={{ insetInlineStart: "-4px", width: dot + 4, height: dot + 4, background: "var(--card,#fff)", fontSize: dot - 1 }}>{id.badge.glyph}</span>
      )}
    </span>
  );

  const node = onClick
    ? <button type="button" onClick={onClick} className={className} aria-label={name}>{img}</button>
    : <span className={className}>{img}</span>;

  return hover ? <ExecutiveHoverCard identity={id}>{node}</ExecutiveHoverCard> : node;
}
