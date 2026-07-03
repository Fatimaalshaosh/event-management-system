import { palette as C } from "@/theme";
import type { IdentityInput } from "@/lib/identity";
import { ExecutiveAvatar, type AvatarSize } from "./executive-avatar";

const PX: Record<AvatarSize, number> = { xs: 24, sm: 32, md: 40, lg: 56, xl: 96 };

/** Overlapping portrait stack with a "+N" overflow chip (Notion/Loop-style). */
export function AvatarGroup({ identities, max = 4, size = "sm" }: { identities: IdentityInput[]; max?: number; size?: AvatarSize }) {
  const shown = identities.slice(0, max);
  const extra = identities.length - shown.length;
  const px = PX[size];
  return (
    <div className="flex items-center">
      {shown.map((id, i) => (
        <span key={id.id ?? id.name} style={{ marginInlineStart: i === 0 ? 0 : -8, zIndex: shown.length - i }}>
          <ExecutiveAvatar identity={id} size={size} showPresence={false} />
        </span>
      ))}
      {extra > 0 && (
        <span className="inline-flex items-center justify-center rounded-full text-[10px] font-semibold"
          style={{ width: px, height: px, marginInlineStart: -8, background: C.cardBg, border: `1px solid ${C.border}`, color: C.warmGray, boxShadow: "0 1px 3px rgba(28,40,30,.18)" }}>
          +{extra}
        </span>
      )}
    </div>
  );
}
