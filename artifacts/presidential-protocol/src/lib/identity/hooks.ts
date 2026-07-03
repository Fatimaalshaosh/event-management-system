import { useEffect, useMemo, useState } from "react";
import { resolveIdentity } from "./resolver";
import { portraitService } from "./service";
import { usePeopleVersion } from "./people-source";
import type { IdentityInput, PortraitRequest, ResolvedIdentity } from "./types";

export function useResolvedIdentity(input: IdentityInput): ResolvedIdentity {
  // Re-resolve when the canonical Contacts source loads/changes, so avatars and
  // hover cards upgrade to canonical name / title / portrait.
  const peopleVersion = usePeopleVersion();
  return useMemo(() => resolveIdentity(input),
    [input.id, input.name, input.gender, input.nationality, input.role, input.department, input.presence, peopleVersion]);
}

/** Returns the best portrait now (cached/procedural) and upgrades to the active
 * provider's result when it resolves. */
export function usePortrait(req: PortraitRequest): string {
  const [url, setUrl] = useState(() => portraitService.getPlaceholder(req));
  useEffect(() => {
    let on = true;
    Promise.resolve(portraitService.resolve(req)).then((u) => { if (on) setUrl(u); }).catch(() => {});
    return () => { on = false; };
  }, [req.key]);
  return url;
}
