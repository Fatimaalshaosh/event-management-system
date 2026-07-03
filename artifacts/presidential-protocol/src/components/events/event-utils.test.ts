import { describe, it, expect } from "vitest";
import type { Event } from "@workspace/api-client-react";
import {
  evName,
  evLocation,
  evCountry,
  eventId,
  eventTimeMinutes,
  readinessBand,
  matchesSearch,
  applyFilters,
  activeFilterCount,
  uniqueOptions,
  emptyFilters,
  deriveEventAlerts,
  buildEventsSearch,
  parseEventsSearch,
  DEFAULT_VIEW,
  type Filters,
} from "./event-utils";
import { format } from "date-fns";

function makeEvent(overrides: Partial<Event> = {}): Event {
  return {
    id: 1,
    name: "State Visit",
    nameAr: "زيارة دولة",
    location: "Abu Dhabi",
    locationAr: "أبوظبي",
    country: "UAE",
    countryAr: "الإمارات",
    date: "2026-07-01",
    time: null,
    status: "upcoming",
    eventType: "visitOfficial",
    priority: "high",
    vipLevel: "headOfState",
    riskLevel: "low",
    readinessPercent: 85,
    pendingTasksCount: 0,
    ...overrides,
  } as unknown as Event;
}

describe("localized field getters", () => {
  it("prefers English fields in en and Arabic fields in ar", () => {
    const e = makeEvent();
    expect(evName(e, "en")).toBe("State Visit");
    expect(evName(e, "ar")).toBe("زيارة دولة");
    expect(evLocation(e, "en")).toBe("Abu Dhabi");
    expect(evCountry(e, "ar")).toBe("الإمارات");
  });

  it("falls back to the other language when one is missing", () => {
    const e = makeEvent({ name: "", nameAr: "زيارة" });
    expect(evName(e, "en")).toBe("زيارة");
  });
});

describe("eventId", () => {
  it("zero-pads to three digits with EV- prefix", () => {
    expect(eventId(makeEvent({ id: 7 }))).toBe("EV-007");
    expect(eventId(makeEvent({ id: 142 }))).toBe("EV-142");
  });
});

describe("eventTimeMinutes", () => {
  it("returns sentinel when there is no time", () => {
    expect(eventTimeMinutes(makeEvent({ time: null }))).toBe(9999);
  });

  it("parses 24h time into minutes from midnight", () => {
    expect(eventTimeMinutes(makeEvent({ time: "09:30" }))).toBe(9 * 60 + 30);
  });

  it("handles Arabic PM marker", () => {
    expect(eventTimeMinutes(makeEvent({ time: "03:00 م" }))).toBe(15 * 60);
  });
});

describe("readinessBand", () => {
  it("buckets percentages into high/medium/low", () => {
    expect(readinessBand(90)).toBe("high");
    expect(readinessBand(80)).toBe("high");
    expect(readinessBand(55)).toBe("medium");
    expect(readinessBand(40)).toBe("medium");
    expect(readinessBand(10)).toBe("low");
  });
});

describe("matchesSearch", () => {
  it("matches blank query", () => {
    expect(matchesSearch(makeEvent(), "  ")).toBe(true);
  });

  it("matches across both languages and the formatted id", () => {
    const e = makeEvent({ id: 12 });
    expect(matchesSearch(e, "abu dhabi")).toBe(true);
    expect(matchesSearch(e, "زيارة")).toBe(true);
    expect(matchesSearch(e, "EV-012")).toBe(true);
    expect(matchesSearch(e, "nonexistent")).toBe(false);
  });
});

describe("applyFilters + activeFilterCount", () => {
  it("emptyFilters keeps every event and counts zero", () => {
    expect(activeFilterCount(emptyFilters)).toBe(0);
    expect(applyFilters(makeEvent(), emptyFilters)).toBe(true);
  });

  it("filters by status and readiness band", () => {
    const e = makeEvent({ status: "confirmed", readinessPercent: 30 });
    const f: Filters = { ...emptyFilters, status: "confirmed", readiness: "low" };
    expect(applyFilters(e, f)).toBe(true);
    expect(activeFilterCount(f)).toBe(2);
    expect(applyFilters(makeEvent({ status: "upcoming" }), f)).toBe(false);
  });
});

describe("uniqueOptions", () => {
  it("dedupes by canonical value and sorts by label", () => {
    const events = [
      makeEvent({ id: 1, country: "UAE", countryAr: "الإمارات" }),
      makeEvent({ id: 2, country: "Egypt", countryAr: "مصر" }),
      makeEvent({ id: 3, country: "UAE", countryAr: "الإمارات" }),
    ];
    const opts = uniqueOptions(
      events,
      (e) => e.country,
      (e) => e.country ?? "",
    );
    expect(opts.map((o) => o.value)).toEqual(["Egypt", "UAE"]);
  });
});

describe("deriveEventAlerts", () => {
  it("returns no alerts for a healthy completed event", () => {
    const e = makeEvent({ status: "completed", readinessPercent: 100 });
    expect(deriveEventAlerts(e, new Date("2026-06-01T00:00:00Z"))).toEqual([]);
  });

  it("flags low readiness as critical when far below threshold", () => {
    const e = makeEvent({ readinessPercent: 20, status: "upcoming" });
    const alerts = deriveEventAlerts(e, new Date("2026-06-01T00:00:00Z"));
    const low = alerts.find((a) => a.key === "readinessLow");
    expect(low?.severity).toBe("critical");
  });

  it("flags urgent priority and high risk", () => {
    const e = makeEvent({
      priority: "urgent",
      riskLevel: "high",
      readinessPercent: 100,
      status: "upcoming",
    });
    const keys = deriveEventAlerts(e, new Date("2026-06-01T00:00:00Z")).map(
      (a) => a.key,
    );
    expect(keys).toContain("urgent");
    expect(keys).toContain("highRisk");
  });
});

describe("buildEventsSearch / parseEventsSearch view state", () => {
  const today = new Date();

  it("omits default view, today's anchor and a false cancelled toggle", () => {
    const qs = buildEventsSearch(emptyFilters, "", {
      view: DEFAULT_VIEW,
      anchor: today,
      showCancelled: false,
    });
    expect(qs).toBe("");
  });

  it("serializes a non-default view, a non-today date and the cancelled toggle", () => {
    const anchor = new Date("2026-09-15T00:00:00");
    const qs = buildEventsSearch(emptyFilters, "", {
      view: "week",
      anchor,
      showCancelled: true,
    });
    const params = new URLSearchParams(qs.replace(/^\?/, ""));
    expect(params.get("view")).toBe("week");
    expect(params.get("date")).toBe("2026-09-15");
    expect(params.get("cancelled")).toBe("1");
  });

  it("round-trips view state alongside filters and search", () => {
    const filters: Filters = { ...emptyFilters, status: "confirmed" };
    const anchor = new Date("2027-01-20T00:00:00");
    const qs = buildEventsSearch(filters, "summit", {
      view: "day",
      anchor,
      showCancelled: true,
    });
    const parsed = parseEventsSearch(qs);
    expect(parsed.filters.status).toBe("confirmed");
    expect(parsed.search).toBe("summit");
    expect(parsed.view).toBe("day");
    expect(format(parsed.anchor, "yyyy-MM-dd")).toBe("2027-01-20");
    expect(parsed.showCancelled).toBe(true);
  });

  it("falls back to defaults for missing or invalid params", () => {
    const parsed = parseEventsSearch("");
    expect(parsed.view).toBe(DEFAULT_VIEW);
    expect(parsed.showCancelled).toBe(false);
    expect(format(parsed.anchor, "yyyy-MM-dd")).toBe(format(today, "yyyy-MM-dd"));

    const bad = parseEventsSearch("?view=galaxy&date=not-a-date");
    expect(bad.view).toBe(DEFAULT_VIEW);
    expect(format(bad.anchor, "yyyy-MM-dd")).toBe(format(today, "yyyy-MM-dd"));
  });
});
