import { describe, it, expect } from "vitest";
import {
  generateHotelOffers,
  generateConfirmationNumber,
  buildHotelDashboard,
  nightsBetween,
  type HotelSearchCriteria,
  type HotelDashboardRow,
} from "./hotels";

function criteria(overrides: Partial<HotelSearchCriteria> = {}): HotelSearchCriteria {
  return {
    city: "Abu Dhabi",
    checkIn: "2026-06-12",
    checkOut: "2026-06-14",
    guests: 2,
    rooms: 1,
    vipLevel: "vip",
    category: "any",
    ...overrides,
  };
}

describe("generateHotelOffers", () => {
  it("returns between 4 and 6 offers", () => {
    const offers = generateHotelOffers(criteria());
    expect(offers.length).toBeGreaterThanOrEqual(4);
    expect(offers.length).toBeLessThanOrEqual(6);
  });

  it("is deterministic for identical criteria", () => {
    expect(generateHotelOffers(criteria())).toEqual(generateHotelOffers(criteria()));
  });

  it("varies with criteria", () => {
    const a = generateHotelOffers(criteria({ city: "Abu Dhabi" }));
    const b = generateHotelOffers(criteria({ city: "Dubai" }));
    expect(a).not.toEqual(b);
  });

  it("offers every room type with positive prices and capacity", () => {
    for (const o of generateHotelOffers(criteria())) {
      expect(o.rooms.length).toBe(8);
      for (const r of o.rooms) {
        expect(r.pricePerNight).toBeGreaterThan(0);
        expect(r.capacity).toBeGreaterThan(0);
      }
    }
  });

  it("prices a presidential suite higher than a standard room", () => {
    const [offer] = generateHotelOffers(criteria());
    const std = offer!.rooms.find((r) => r.type === "standard")!;
    const pres = offer!.rooms.find((r) => r.type === "presidentialSuite")!;
    expect(pres.pricePerNight).toBeGreaterThan(std.pricePerNight);
  });

  it("scales price up with VIP level", () => {
    const standard = generateHotelOffers(criteria({ vipLevel: "standard" }));
    const headOfState = generateHotelOffers(criteria({ vipLevel: "headOfState" }));
    expect(standard).not.toEqual(headOfState);
  });

  it("filters by category when one is selected", () => {
    const resorts = generateHotelOffers(criteria({ category: "resort" }));
    expect(resorts.length).toBeGreaterThan(0);
    for (const o of resorts) expect(o.category).toBe("resort");
  });

  it("sorts highest rated first", () => {
    const ratings = generateHotelOffers(criteria()).map((o) => o.rating);
    expect([...ratings].sort((a, b) => b - a)).toEqual(ratings);
  });

  it("always carries AED currency", () => {
    for (const o of generateHotelOffers(criteria())) expect(o.currency).toBe("AED");
  });
});

describe("nightsBetween", () => {
  it("counts calendar nights", () => {
    expect(nightsBetween("2026-06-12", "2026-06-14")).toBe(2);
  });

  it("never returns less than 1", () => {
    expect(nightsBetween("2026-06-14", "2026-06-12")).toBe(1);
    expect(nightsBetween("bad", "date")).toBe(1);
  });
});

describe("generateConfirmationNumber", () => {
  it("produces an HTL- prefixed 6-character code", () => {
    expect(generateConfirmationNumber("seed")).toMatch(/^HTL-[A-Z0-9]{6}$/);
  });

  it("is deterministic when seeded", () => {
    expect(generateConfirmationNumber("abc")).toBe(generateConfirmationNumber("abc"));
  });

  it("differs across seeds", () => {
    expect(generateConfirmationNumber("abc")).not.toBe(generateConfirmationNumber("xyz"));
  });

  it("never includes ambiguous I or O characters", () => {
    for (let i = 0; i < 50; i++) {
      expect(generateConfirmationNumber(`s${i}`).slice(4)).not.toMatch(/[IO]/);
    }
  });
});

describe("buildHotelDashboard", () => {
  function row(overrides: Partial<HotelDashboardRow> = {}): HotelDashboardRow {
    return {
      status: "confirmed",
      vipLevel: "standard",
      roomType: "deluxe",
      checkIn: null,
      checkOut: null,
      ...overrides,
    };
  }

  it("tallies status buckets", () => {
    const dash = buildHotelDashboard(
      [
        row({ status: "confirmed" }),
        row({ status: "checked_in" }),
        row({ status: "checked_out" }),
        row({ status: "reserved" }),
        row({ status: "pending" }),
      ],
      "2026-06-12",
    );
    expect(dash.confirmed).toBe(1);
    expect(dash.checkedIn).toBe(1);
    expect(dash.checkedOut).toBe(1);
    expect(dash.pending).toBe(2);
    expect(dash.total).toBe(5);
  });

  it("counts VIP guests and presidential suites", () => {
    const dash = buildHotelDashboard(
      [
        row({ vipLevel: "vvip", roomType: "presidentialSuite" }),
        row({ vipLevel: "vip" }),
        row({ vipLevel: "standard" }),
      ],
      "2026-06-12",
    );
    expect(dash.vipGuests).toBe(2);
    expect(dash.presidentialSuites).toBe(1);
  });

  it("counts arrivals and departures for today, excluding cancelled", () => {
    const dash = buildHotelDashboard(
      [
        row({ checkIn: "2026-06-12" }),
        row({ checkOut: "2026-06-12" }),
        row({ status: "cancelled", checkIn: "2026-06-12" }),
      ],
      "2026-06-12",
    );
    expect(dash.arrivingToday).toBe(1);
    expect(dash.departingToday).toBe(1);
  });
});
