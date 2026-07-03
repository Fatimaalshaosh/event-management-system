import { useEffect, useState } from "react";
import { useLocation, useSearch } from "wouter";

/**
 * Build a query string (including the leading "?") from a search term.
 * Returns "" when the term is empty so the URL stays clean.
 */
export function buildSearchQuery(search: string): string {
  const q = search.trim();
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  const s = params.toString();
  return s ? `?${s}` : "";
}

/** Parse the search term back out of a URL query string. */
export function parseSearchQuery(searchStr: string): string {
  return new URLSearchParams(searchStr).get("q") ?? "";
}

/**
 * Persist a list page's search term in the URL query string so a refreshed or
 * shared link reopens the same pre-filtered view. Mirrors the pattern used on
 * the events page (buildEventsSearch / parseEventsSearch).
 *
 * @param basePath the page's own route, e.g. "/visits"
 */
export function useUrlSearchState(
  basePath: string,
): [string, (value: string) => void] {
  const searchString = useSearch();
  const [, setLocation] = useLocation();
  const [search, setSearch] = useState(() => parseSearchQuery(searchString));

  // Mirror the search term into the URL (replace, so we don't pollute browser
  // history on every keystroke).
  useEffect(() => {
    const qs = buildSearchQuery(search);
    setLocation(`${basePath}${qs}`, { replace: true });
  }, [search, setLocation, basePath]);

  return [search, setSearch];
}
