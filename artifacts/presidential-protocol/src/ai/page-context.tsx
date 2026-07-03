import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { PageContext } from "./types";

type Ctx = {
  context: PageContext | null;
  setContext: (ctx: PageContext | null) => void;
};

const PageContextCtx = createContext<Ctx | null>(null);

export function PageContextProvider({ children }: { children: React.ReactNode }) {
  const [context, setContext] = useState<PageContext | null>(null);
  const value = useMemo(() => ({ context, setContext }), [context]);
  return <PageContextCtx.Provider value={value}>{children}</PageContextCtx.Provider>;
}

export function usePageContext(): Ctx {
  const ctx = useContext(PageContextCtx);
  if (!ctx) throw new Error("usePageContext must be used inside PageContextProvider");
  return ctx;
}

/** Register a page-level AI context that is auto-cleared on unmount. */
export function useRegisterPageContext(ctx: PageContext | null) {
  const { setContext } = usePageContext();
  const stable = useCallback(() => ctx, [JSON.stringify(ctx)]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    setContext(stable());
    return () => setContext(null);
  }, [stable, setContext]);
}
