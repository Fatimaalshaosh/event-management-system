import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const travelTable = pgTable("travel", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id"),
  direction: text("direction").notNull().default("arrival"),
  passengerName: text("passenger_name").notNull(),
  passengerNameAr: text("passenger_name_ar"),
  flightNumber: text("flight_number"),
  airline: text("airline"),
  aircraft: text("aircraft"),
  origin: text("origin"),
  destination: text("destination"),
  originCity: text("origin_city"),
  destinationCity: text("destination_city"),
  departureTime: text("departure_time"),
  arrivalTime: text("arrival_time"),
  seatClass: text("seat_class").notNull().default("business"),
  seatNumber: text("seat_number"),
  status: text("status").notNull().default("scheduled"),
  pnr: text("pnr"),
  bookingReference: text("booking_reference"),
  eTicketNumber: text("e_ticket_number"),
  tripType: text("trip_type").notNull().default("oneway"),
  legType: text("leg_type").notNull().default("outbound"),
  terminal: text("terminal"),
  baggageAllowance: text("baggage_allowance"),
  fareCategory: text("fare_category"),
  fareAmount: integer("fare_amount"),
  currency: text("currency").notNull().default("AED"),
  duration: text("duration"),
  guestId: integer("guest_id"),
  bookingProvider: text("booking_provider").notNull().default("demo"),
  passengerCount: integer("passenger_count").notNull().default(1),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertTravelSchema = createInsertSchema(travelTable).omit({ id: true, createdAt: true });
export type InsertTravel = z.infer<typeof insertTravelSchema>;
export type Travel = typeof travelTable.$inferSelect;

export const hotelBookingsTable = pgTable("hotel_bookings", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id"),
  guestId: integer("guest_id"),
  guestName: text("guest_name").notNull(),
  guestNameAr: text("guest_name_ar"),
  hotelName: text("hotel_name"),
  hotelNameAr: text("hotel_name_ar"),
  hotelCategory: text("hotel_category"),
  rating: integer("rating"),
  location: text("location"),
  locationAr: text("location_ar"),
  distanceFromVenue: text("distance_from_venue"),
  roomType: text("room_type").notNull().default("suite"),
  rooms: integer("rooms").notNull().default(1),
  nights: integer("nights"),
  checkIn: text("check_in"),
  checkOut: text("check_out"),
  vipLevel: text("vip_level"),
  amenities: text("amenities"),
  vipServices: text("vip_services"),
  estimatedCost: integer("estimated_cost"),
  currency: text("currency").notNull().default("AED"),
  securityNotes: text("security_notes"),
  dietaryNotes: text("dietary_notes"),
  protocolNotes: text("protocol_notes"),
  specialRequests: text("special_requests"),
  confirmationNumber: text("confirmation_number"),
  bookingProvider: text("booking_provider").notNull().default("demo"),
  status: text("status").notNull().default("reserved"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertHotelBookingSchema = createInsertSchema(hotelBookingsTable).omit({ id: true, createdAt: true });
export type InsertHotelBooking = z.infer<typeof insertHotelBookingSchema>;
export type HotelBooking = typeof hotelBookingsTable.$inferSelect;

export const fleetAssignmentsTable = pgTable("fleet_assignments", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id"),
  vehicleType: text("vehicle_type").notNull().default("sedan"),
  plateNumber: text("plate_number"),
  driverName: text("driver_name"),
  driverNameAr: text("driver_name_ar"),
  assignedTo: text("assigned_to"),
  assignedToAr: text("assigned_to_ar"),
  capacity: integer("capacity").notNull().default(4),
  pickupLocation: text("pickup_location"),
  dropoffLocation: text("dropoff_location"),
  pickupTime: text("pickup_time"),
  status: text("status").notNull().default("assigned"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertFleetAssignmentSchema = createInsertSchema(fleetAssignmentsTable).omit({ id: true, createdAt: true });
export type InsertFleetAssignment = z.infer<typeof insertFleetAssignmentSchema>;
export type FleetAssignment = typeof fleetAssignmentsTable.$inferSelect;

export const giftsTable = pgTable("gifts", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id"),
  recipient: text("recipient").notNull(),
  recipientAr: text("recipient_ar"),
  item: text("item"),
  itemAr: text("item_ar"),
  description: text("description"),
  quantity: integer("quantity").notNull().default(1),
  value: integer("value"),
  currency: text("currency").notNull().default("AED"),
  status: text("status").notNull().default("planned"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertGiftSchema = createInsertSchema(giftsTable).omit({ id: true, createdAt: true });
export type InsertGift = z.infer<typeof insertGiftSchema>;
export type Gift = typeof giftsTable.$inferSelect;

export const budgetItemsTable = pgTable("budget_items", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id"),
  category: text("category").notNull().default("general"),
  item: text("item").notNull(),
  itemAr: text("item_ar"),
  estimatedCost: integer("estimated_cost").notNull().default(0),
  actualCost: integer("actual_cost"),
  currency: text("currency").notNull().default("AED"),
  vendor: text("vendor"),
  status: text("status").notNull().default("estimated"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertBudgetItemSchema = createInsertSchema(budgetItemsTable).omit({ id: true, createdAt: true });
export type InsertBudgetItem = z.infer<typeof insertBudgetItemSchema>;
export type BudgetItem = typeof budgetItemsTable.$inferSelect;

export const documentsTable = pgTable("documents", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id"),
  title: text("title").notNull(),
  titleAr: text("title_ar"),
  docType: text("doc_type").notNull().default("general"),
  referenceNumber: text("reference_number"),
  owner: text("owner"),
  url: text("url"),
  filePath: text("file_path"),
  fileName: text("file_name"),
  status: text("status").notNull().default("pending"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertDocumentSchema = createInsertSchema(documentsTable).omit({ id: true, createdAt: true });
export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Document = typeof documentsTable.$inferSelect;
