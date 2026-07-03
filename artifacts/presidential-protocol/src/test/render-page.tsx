import type { ReactElement } from "react";
import { render } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Router } from "wouter";
import { memoryLocation } from "wouter/memory-location";
import { LanguageProvider } from "@/i18n/language-context";
import { PageContextProvider } from "@/ai/page-context";
import { TooltipProvider } from "@/components/ui/tooltip";

/**
 * Shape of a react-query useQuery result as the pages actually consume it.
 * Only the handful of fields the components read are required; the rest are
 * filled with inert defaults so a mocked hook is a drop-in replacement.
 */
export function queryResult<T>(data: T, isLoading = false) {
  return {
    data,
    isLoading,
    isPending: isLoading,
    isError: false,
    error: null,
    isSuccess: !isLoading,
    isFetching: isLoading,
    refetch: () => Promise.resolve(),
    status: isLoading ? "pending" : "success",
  };
}

/**
 * Shape of a react-query useMutation result. `mutate` defaults to a spy-able
 * no-op; pass your own (e.g. a vi.fn) to assert calls.
 */
export function mutationResult(
  mutate: (...args: unknown[]) => void = () => {},
  isPending = false,
) {
  return {
    mutate,
    mutateAsync: () => Promise.resolve(),
    isPending,
    isError: false,
    isSuccess: false,
    error: null,
    reset: () => {},
    status: isPending ? "pending" : "idle",
  };
}

/**
 * Renders a full page with every provider the app wires up in production:
 * QueryClient, Language (RTL/i18n), AI page-context, tooltips, and a wouter
 * router backed by an in-memory location so navigation never touches the DOM
 * history. Retries are disabled so error states resolve immediately in tests.
 */
export function renderPage(ui: ReactElement, { path = "/" }: { path?: string } = {}) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });
  const { hook } = memoryLocation({ path });

  return render(
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <PageContextProvider>
          <TooltipProvider>
            <Router hook={hook}>{ui}</Router>
          </TooltipProvider>
        </PageContextProvider>
      </LanguageProvider>
    </QueryClientProvider>,
  );
}
