import { describe, it, expect } from "vitest";
import {
  generateFlightOffers,
  generatePnr,
  buildTravelDashboard,
  type FlightSearchCriteria,
  type TravelDashboardRow,
} from "./flights";

function criteria(overrides: Partial<FlightSearchCriteria> = {}): FlightSearchCriteria {
  return {
    origin: "AUH",
    destination: "LHR",
    date: "2026-06-10",
    passengers: 2,
    cabinClass: "business",
    ...overrides,
  };
}

describe("generateFlightOffers", () => {
  it("returns between 4 and 6 offers", () => {
    const offers = generateFlightOffers(criteria());
    expect(offers.length).toBeGreaterThanOrEqual(4);
    expect(offers.length).toBeLessThanOrEqual(6);
  });

  it("is deterministic for identical criteria", () => {
    expect(generateFlightOffers(criteria())).toEqual(generateFlightOffers(criteria()));
  });

  it("varies with criteria", () => {
    const a = generateFlightOffers(criteria({ destination: "LHR" }));
    const b = generateFlightOffers(criteria({ destination: "JFK" }));
    expect(a).not.toEqual(b);
  });

  it("sorts offers cheapest first", () => {
    const offers = generateFlightOffers(criteria());
    const prices = offers.map((o) => o.price);
    expect([...prices].sort((x, y) => x - y)).toEqual(prices);
  });

  it("prices first class higher than economy", () => {
    const first = generateFlightOffers(criteria({ cabinClass: "first" }));
    const economy = generateFlightOffers(criteria({ cabinClass: "economy" }));
    const minFirst = Math.min(...first.map((o) => o.price));
    const minEconomy = Math.min(...economy.map((o) => o.price));
    expect(minFirst).toBeGreaterThan(minEconomy);
  });

  it("carries through origin, destination and cabin class", () => {
    const offers = generateFlightOffers(criteria({ origin: "DXB", destination: "CDG" }));
    for (const o of offers) {
      expect(o.origin).toBe("DXB");
      expect(o.destination).toBe("CDG");
      expect(o.cabinClass).toBe("business");
      expect(o.currency).toBe("AED");
    }
  });
});

describe("generatePnr", () => {
  it("produces a 6-character uppercase code", () => {
    expect(generatePnr("seed")).toMatch(/^[A-Z0-9]{6}$/);
  });

  it("is deterministic when seeded", () => {
    expect(generatePnr("abc")).toBe(generatePnr("abc"));
  });

  it("differs across seeds", () => {
    expect(generatePnr("abc")).not.toBe(generatePnr("xyz"));
  });

  it("never includes ambiguous I or O characters", () => {
    for (let i = 0; i < 50; i++) {
      expect(generatePnr(`s${i}`)).not.toMatch(/[IO]/);
    }
  });
});

describe("buildTravelDashboard", () => {
  function row(overrides: Partial<TravelDashboardRow> = {}): TravelDashboardRow {
    return {
      direction: "arrival",
      status: "confirmed",
      departureTime: null,
      arrivalTime: null,
      ...overrides,
    };
  }

  it("counts arrivals and departures for today", () => {
    const dash = buildTravelDashboard(
      [
        row({ direction: "arrival", arrivalTime: "2026-06-10 09:00" }),
        row({ direction: "departure", departureTime: "2026-06-10 18:00" }),
        row({ direction: "arrival", arrivalTime: "2026-06-11 09:00" }),
      ],
      "2026-06-10",
    );
    expect(dash.arrivingToday).toBe(1);
    expect(dash.departingToday).toBe(1);
    expect(dash.total).toBe(3);
  });

  it("tallies status buckets", () => {
    const dash = buildTravelDashboard(
      [
        row({ status: "confirmed" }),
        row({ status: "pending" }),
        row({ status: "delayed" }),
        row({ status: "cancelled" }),
        row({ status: "confirmed" }),
      ],
      "2026-06-10",
    );
    expect(dash.confirmed).toBe(2);
    expect(dash.pending).toBe(1);
    expect(dash.delayed).toBe(1);
    expect(dash.cancelled).toBe(1);
  });

  it("excludes cancelled flights from today's arrivals", () => {
    const dash = buildTravelDashboard(
      [row({ direction: "arrival", status: "cancelled", arrivalTime: "2026-06-10 09:00" })],
      "2026-06-10",
    );
    expect(dash.arrivingToday).toBe(0);
    expect(dash.cancelled).toBe(1);
  });
});
