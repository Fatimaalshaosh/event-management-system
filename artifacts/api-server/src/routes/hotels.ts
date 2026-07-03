import { Router } from "express";
import { db } from "@workspace/db";
import { hotelBookingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  SearchHotelsBody,
  BookHotelBody,
  GetEventHotelDashboardParams,
} from "@workspace/api-zod";
import {
  hotelProviderService,
  HotelProviderNotConfiguredError,
  UnknownHotelProviderError,
} from "../lib/hotel-providers";
import {
  generateConfirmationNumber,
  buildHotelDashboard,
  nightsBetween,
} from "../lib/hotels";
import type { HotelCategory, VipLevel } from "../lib/hotels";

const router = Router();

function serialize<T extends { createdAt: Date }>(row: T) {
  return { ...row, createdAt: row.createdAt.toISOString() };
}

router.get("/hotel-providers", async (req, res) => {
  try {
    res.json(hotelProviderService.list());
  } catch (err) {
    req.log.error({ err }, "Failed to list hotel providers");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/hotels/search", async (req, res) => {
  try {
    const body = SearchHotelsBody.parse(req.body);
    const offers = hotelProviderService.search(body.provider, {
      city: body.city,
      checkIn: body.checkIn,
      checkOut: body.checkOut,
      guests: body.guests ?? 1,
      rooms: body.rooms ?? 1,
      vipLevel: (body.vipLevel ?? "standard") as VipLevel,
      category: (body.category ?? "any") as HotelCategory | "any",
    });
    res.json({ provider: body.provider ?? hotelProviderService.defaultProviderId, offers });
  } catch (err) {
    if (err instanceof HotelProviderNotConfiguredError) {
      res.status(422).json({ error: "Provider not configured", provider: err.providerId });
      return;
    }
    if (err instanceof UnknownHotelProviderError) {
      res.status(400).json({ error: "Unknown provider", provider: err.providerId });
      return;
    }
    req.log.error({ err }, "Failed to search hotels");
    res.status(400).json({ error: "Bad request" });
  }
});

router.post("/hotels/book", async (req, res) => {
  try {
    const body = BookHotelBody.parse(req.body);
    const providerId = hotelProviderService.assertBookable(body.provider);
    const confirmationNumber = generateConfirmationNumber(
      `${body.hotelName}|${body.guestName}|${body.checkIn ?? ""}|${Date.now()}`,
    );
    const nights =
      body.checkIn && body.checkOut ? nightsBetween(body.checkIn, body.checkOut) : null;
    const rooms = body.rooms ?? 1;
    const estimatedCost =
      body.pricePerNight != null && nights != null
        ? body.pricePerNight * nights * rooms
        : null;

    const [row] = await db
      .insert(hotelBookingsTable)
      .values({
        eventId: body.eventId,
        guestId: body.guestId ?? null,
        guestName: body.guestName,
        guestNameAr: body.guestNameAr ?? null,
        hotelName: body.hotelName,
        hotelNameAr: body.hotelNameAr ?? null,
        hotelCategory: body.hotelCategory ?? null,
        rating: body.rating ?? null,
        location: body.location ?? null,
        locationAr: body.locationAr ?? null,
        distanceFromVenue: body.distanceFromVenue ?? null,
        roomType: body.roomType,
        rooms,
        nights,
        checkIn: body.checkIn ?? null,
        checkOut: body.checkOut ?? null,
        vipLevel: body.vipLevel ?? null,
        amenities: body.amenities ?? null,
        vipServices: body.vipServices ?? null,
        estimatedCost,
        currency: "AED",
        securityNotes: body.securityNotes ?? null,
        dietaryNotes: body.dietaryNotes ?? null,
        protocolNotes: body.protocolNotes ?? null,
        specialRequests: body.specialRequests ?? null,
        confirmationNumber,
        bookingProvider: providerId,
        status: "confirmed",
      })
      .returning();
    if (!row) {
      res.status(500).json({ error: "Failed to create booking" });
      return;
    }
    res.status(201).json(serialize(row));
  } catch (err) {
    if (err instanceof HotelProviderNotConfiguredError) {
      res.status(422).json({ error: "Provider not configured", provider: err.providerId });
      return;
    }
    if (err instanceof UnknownHotelProviderError) {
      res.status(400).json({ error: "Unknown provider", provider: err.providerId });
      return;
    }
    req.log.error({ err }, "Failed to book hotel");
    res.status(400).json({ error: "Bad request" });
  }
});

router.get("/events/:id/hotel-dashboard", async (req, res) => {
  try {
    const { id } = GetEventHotelDashboardParams.parse(req.params);
    const rows = await db
      .select()
      .from(hotelBookingsTable)
      .where(eq(hotelBookingsTable.eventId, id));
    const today = new Date().toISOString().slice(0, 10);
    res.json(buildHotelDashboard(rows, today));
  } catch (err) {
    req.log.error({ err }, "Failed to build hotel dashboard");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
