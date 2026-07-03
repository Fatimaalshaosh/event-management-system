import { Router } from "express";
import { db } from "@workspace/db";
import { travelTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  SearchFlightsBody,
  BookFlightBody,
  GetEventTravelDashboardParams,
} from "@workspace/api-zod";
import {
  travelProviderService,
  ProviderNotConfiguredError,
  UnknownProviderError,
} from "../lib/travel-providers";
import { generatePnr, generateETicketNumber, buildTravelDashboard } from "../lib/flights";
import type { CabinClass } from "../lib/flights";

const router = Router();

function serialize<T extends { createdAt: Date }>(row: T) {
  return { ...row, createdAt: row.createdAt.toISOString() };
}

// Deterministic demo seat assignment: a row 1–40 plus a cabin-appropriate
// letter. Demo only — not a real seat-map allocation.
function generateSeatNumber(seed: string, cabinClass: CabinClass): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const rowBase = cabinClass === "first" ? 1 : cabinClass === "business" ? 5 : 20;
  const row = rowBase + (h % 18);
  const letter = "ABCDEFGH"[h % 6];
  return `${row}${letter}`;
}

function carrierCodeFrom(flightNumber: string): string {
  return (flightNumber.match(/[A-Z0-9]{2}/)?.[0] ?? "XX").slice(0, 2);
}

router.get("/travel-providers", async (req, res) => {
  try {
    res.json(travelProviderService.list());
  } catch (err) {
    req.log.error({ err }, "Failed to list travel providers");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/flights/search", async (req, res) => {
  try {
    const body = SearchFlightsBody.parse(req.body);
    const providerId = body.provider ?? travelProviderService.defaultProviderId;
    const tripType = body.tripType ?? "oneway";
    const offers = travelProviderService.search(providerId, {
      origin: body.origin,
      destination: body.destination,
      date: body.date,
      passengers: body.passengers,
      cabinClass: body.cabinClass as CabinClass,
    });
    const returnOffers =
      tripType === "roundtrip" && body.returnDate
        ? travelProviderService.search(providerId, {
            origin: body.destination,
            destination: body.origin,
            date: body.returnDate,
            passengers: body.passengers,
            cabinClass: body.cabinClass as CabinClass,
          })
        : undefined;
    res.json({ provider: providerId, tripType, offers, ...(returnOffers ? { returnOffers } : {}) });
  } catch (err) {
    if (err instanceof ProviderNotConfiguredError) {
      res.status(422).json({ error: "Provider not configured", provider: err.providerId });
      return;
    }
    if (err instanceof UnknownProviderError) {
      res.status(400).json({ error: "Unknown provider", provider: err.providerId });
      return;
    }
    req.log.error({ err }, "Failed to search flights");
    res.status(400).json({ error: "Bad request" });
  }
});

router.post("/flights/book", async (req, res) => {
  try {
    const body = BookFlightBody.parse(req.body);
    const providerId = body.provider ?? travelProviderService.defaultProviderId;
    if (!travelProviderService.has(providerId)) {
      res.status(422).json({ error: `Unknown booking provider: ${providerId}` });
      return;
    }
    const tripType = body.tripType ?? "oneway";
    const cabinClass = body.cabinClass as CabinClass;
    const seedBase = `${body.flightNumber}|${body.passengerName}|${body.departureTime ?? ""}|${Date.now()}`;
    // One PNR and booking reference cover the whole itinerary; each flown leg
    // carries its own e-ticket number and seat, as real airlines issue them.
    const pnr = generatePnr(seedBase);
    const bookingReference = `PP-${generatePnr(`ref|${seedBase}`)}`;
    const currency = body.currency ?? "AED";

    const outboundValues = {
      eventId: body.eventId,
      direction: body.direction,
      passengerName: body.passengerName,
      passengerNameAr: body.passengerNameAr ?? null,
      guestId: body.guestId ?? null,
      airline: body.airline,
      flightNumber: body.flightNumber,
      aircraft: body.aircraft ?? null,
      origin: body.origin ?? null,
      destination: body.destination ?? null,
      originCity: body.originCity ?? null,
      destinationCity: body.destinationCity ?? null,
      departureTime: body.departureTime ?? null,
      arrivalTime: body.arrivalTime ?? null,
      duration: body.duration ?? null,
      terminal: body.terminal ?? null,
      baggageAllowance: body.baggageAllowance ?? null,
      fareCategory: body.fareCategory ?? null,
      fareAmount: body.fareAmount ?? null,
      currency,
      seatClass: body.cabinClass,
      seatNumber: generateSeatNumber(`${pnr}|outbound`, cabinClass),
      passengerCount: body.passengerCount ?? 1,
      bookingProvider: providerId,
      status: "confirmed",
      tripType,
      legType: "outbound",
      pnr,
      bookingReference,
      eTicketNumber: generateETicketNumber(
        carrierCodeFrom(body.flightNumber),
        `${pnr}|outbound`,
      ),
    };

    const valuesList = [outboundValues];

    if (tripType === "roundtrip" && body.returnLeg) {
      const rl = body.returnLeg;
      valuesList.push({
        eventId: body.eventId,
        direction: body.direction === "arrival" ? "departure" : "arrival",
        passengerName: body.passengerName,
        passengerNameAr: body.passengerNameAr ?? null,
        guestId: body.guestId ?? null,
        airline: rl.airline,
        flightNumber: rl.flightNumber,
        aircraft: rl.aircraft ?? null,
        origin: rl.origin ?? null,
        destination: rl.destination ?? null,
        originCity: rl.originCity ?? null,
        destinationCity: rl.destinationCity ?? null,
        departureTime: rl.departureTime ?? null,
        arrivalTime: rl.arrivalTime ?? null,
        duration: rl.duration ?? null,
        terminal: rl.terminal ?? null,
        baggageAllowance: rl.baggageAllowance ?? null,
        fareCategory: rl.fareCategory ?? null,
        fareAmount: rl.fareAmount ?? null,
        currency,
        seatClass: body.cabinClass,
        seatNumber: generateSeatNumber(`${pnr}|return`, cabinClass),
        passengerCount: body.passengerCount ?? 1,
        bookingProvider: providerId,
        status: "confirmed",
        tripType,
        legType: "return",
        pnr,
        bookingReference,
        eTicketNumber: generateETicketNumber(
          carrierCodeFrom(rl.flightNumber),
          `${pnr}|return`,
        ),
      });
    }

    const rows = await db.insert(travelTable).values(valuesList).returning();
    if (rows.length === 0) {
      res.status(500).json({ error: "Failed to create booking" });
      return;
    }
    res.status(201).json({
      bookingReference,
      eTicketNumber: outboundValues.eTicketNumber,
      pnr,
      tripType,
      bookingProvider: providerId,
      status: outboundValues.status,
      legs: rows.map(serialize),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to book flight");
    res.status(400).json({ error: "Bad request" });
  }
});

router.get("/events/:id/travel-dashboard", async (req, res) => {
  try {
    const { id } = GetEventTravelDashboardParams.parse(req.params);
    const rows = await db.select().from(travelTable).where(eq(travelTable.eventId, id));
    const today = new Date().toISOString().slice(0, 10);
    res.json(buildTravelDashboard(rows, today));
  } catch (err) {
    req.log.error({ err }, "Failed to build travel dashboard");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
