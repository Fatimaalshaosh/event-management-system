import { Field, ProfileRow, EmptyState } from "@/components/shared/primitives";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import { useLanguage } from "@/i18n/language-context";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { motion } from "framer-motion";
import { Search, Ticket, Users, Plane, PlaneLanding, PlaneTakeoff, Trash2, Clock, Luggage, Building2, Car, Loader2, MapPin, ArrowRight } from "lucide-react";
import {
  useGetEventTravelDashboard, getGetEventTravelDashboardQueryKey,
  useListTravelProviders,
  useSearchFlights,
  useBookFlight,
  useListEventTravel, getListEventTravelQueryKey, useUpdateTravel, useDeleteTravel,
  useListEventGuests,
  useListEventFleet,
  useListEventHotelBookings,
} from "@workspace/api-client-react";

import { C, CabinClass, Direction, TRAVEL_STATUSES, statusStyle } from "@/components/event-command/flights/shared";
import { AirportAutocomplete } from "@/components/reference/airport-autocomplete";

/* Extracted from flights-tab.tsx — dashboard/search/bookings/guests views. */
export function DashboardView({ eventId }: { eventId: number }) {
  const { t } = useTranslation();
  const { data, isLoading } = useGetEventTravelDashboard(eventId, {
    query: { queryKey: getGetEventTravelDashboardQueryKey(eventId) },
  });

  const cards: { key: string; value: number; color: string; icon: typeof Plane }[] = [
    { key: "total", value: data?.total ?? 0, color: C.castleHill, icon: Ticket },
    { key: "arrivingToday", value: data?.arrivingToday ?? 0, color: C.mangrove, icon: PlaneLanding },
    { key: "departingToday", value: data?.departingToday ?? 0, color: C.calmTeal, icon: PlaneTakeoff },
    { key: "confirmed", value: data?.confirmed ?? 0, color: C.mangrove, icon: Plane },
    { key: "pending", value: data?.pending ?? 0, color: C.mediumWood, icon: Clock },
    { key: "delayed", value: data?.delayed ?? 0, color: "#DC2626", icon: Clock },
    { key: "cancelled", value: data?.cancelled ?? 0, color: "#DC2626", icon: Trash2 },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Array.from({ length: 7 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {cards.map((c, i) => (
        <motion.div
          key={c.key}
          className="rounded-2xl border p-4 text-end"
          style={{ borderColor: C.border, background: C.cardBg }}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.03 }}
        >
          <div className="flex items-center justify-between">
            <span className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: c.color + "1A" }}>
              <c.icon size={17} strokeWidth={1.5} style={{ color: c.color }} />
            </span>
            <span className="text-3xl font-bold" style={{ color: c.color, fontFamily: "Georgia, serif" }}>{c.value}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-3">{t(`pages.commandCenter.flights.dashboard.${c.key}`)}</p>
        </motion.div>
      ))}
    </div>
  );
}

/* ---------------- Search & Book ---------------- */

export type Offer = {
  id: string; airline: string; airlineAr: string; flightNumber: string;
  origin: string; destination: string; departureTime: string; arrivalTime: string;
  duration: string; terminal: string; baggageAllowance: string; fareCategory: string;
  cabinClass: string; price: number; currency: string; seatsAvailable: number;
};

export function SearchView({ eventId, onBooked }: { eventId: number; onBooked: () => void }) {
  const { t } = useTranslation();
  const { lang, dir } = useLanguage();
  const { toast } = useToast();
  const tf = (k: string) => t(`pages.commandCenter.flights.${k}`);

  const { data: providers } = useListTravelProviders();
  const [provider, setProvider] = useState("demo");
  const [origin, setOrigin] = useState("AUH");
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState("");
  const [passengers, setPassengers] = useState("1");
  const [cabinClass, setCabinClass] = useState<CabinClass>("business");

  const search = useSearchFlights();
  const [offers, setOffers] = useState<Offer[] | null>(null);
  const [selected, setSelected] = useState<Offer | null>(null);

  const runSearch = () => {
    search.mutate(
      { data: { provider, origin, destination, date, passengers: Number(passengers) || 1, cabinClass } },
      {
        onSuccess: (res: { offers: Offer[] }) => setOffers(res.offers),
        onError: () => {
          setOffers([]);
          toast({ title: tf("providerUnavailable"), variant: "destructive" });
        },
      },
    );
  };

  const canSearch = origin.trim() && destination.trim() && date.trim();

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border p-5" style={{ borderColor: C.border, background: C.cardBg }}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label={tf("provider")}>
            <div className="flex flex-wrap gap-2 justify-end">
              {(providers ?? []).map((p) => (
                <button
                  key={p.id}
                  type="button"
                  disabled={p.status !== "active"}
                  onClick={() => setProvider(p.id)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium border transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  style={provider === p.id
                    ? { background: C.mangrove, color: "#fff", borderColor: C.mangrove }
                    : { borderColor: C.border, color: C.castleHill }}
                >
                  {lang === "en" ? p.name : p.nameAr}
                  {p.status !== "active" && ` · ${tf(`providerStatus.${p.status}`)}`}
                </button>
              ))}
            </div>
          </Field>
          <div className="hidden md:block" />
          <Field label={tf("search.origin")} half>
            <AirportAutocomplete value={origin} onChange={(v) => setOrigin(v)} placeholder={tf("search.originPh")} />
          </Field>
          <Field label={tf("search.destination")} half>
            <AirportAutocomplete value={destination} onChange={(v) => setDestination(v)} placeholder={tf("search.destinationPh")} />
          </Field>
          <Field label={tf("search.date")} half>
            <Input dir="ltr" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </Field>
          <Field label={tf("search.passengers")} half>
            <Input dir="ltr" type="number" min={1} value={passengers} onChange={(e) => setPassengers(e.target.value)} />
          </Field>
          <Field label={tf("search.cabinClass")}>
            <div className="flex flex-wrap gap-2 justify-end">
              {(["first", "business", "economy"] as CabinClass[]).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCabinClass(c)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium border transition-all"
                  style={cabinClass === c
                    ? { background: C.calmTeal, color: "#fff", borderColor: C.calmTeal }
                    : { borderColor: C.border, color: C.castleHill }}
                >
                  {tf(`cabin.${c}`)}
                </button>
              ))}
            </div>
          </Field>
        </div>
        <p className="text-[11px] text-muted-foreground mt-3 text-end">{tf("providerHint")}</p>
        <div className="flex justify-end mt-4">
          <Button onClick={runSearch} disabled={!canSearch || search.isPending} className="rounded-xl px-6">
            {search.isPending ? (
              <span className="flex items-center gap-2"><Loader2 size={14} className="animate-spin" /> {tf("search.searching")}</span>
            ) : (
              <span className="flex items-center gap-2"><Search size={14} /> {tf("search.searchBtn")}</span>
            )}
          </Button>
        </div>
      </div>

      {offers === null ? (
        <EmptyState text={tf("search.empty")} />
      ) : offers.length === 0 ? (
        <EmptyState text={tf("search.noResults")} />
      ) : (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-end" style={{ color: C.castleHill }}>{tf("search.results")}</h3>
          {offers.map((o, idx) => (
            <motion.div
              key={o.id}
              className="rounded-2xl border p-4"
              style={{ borderColor: C.border, background: C.cardBg }}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.03 }}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Button onClick={() => setSelected(o)} className="rounded-xl px-5" style={{ background: C.mangrove }}>
                    {tf("search.book")}
                  </Button>
                  <div className="text-start">
                    <p className="text-lg font-bold" style={{ color: C.mangrove, fontFamily: "Georgia, serif" }}>
                      {o.price.toLocaleString()} <span className="text-xs font-normal">{o.currency}</span>
                    </p>
                    <p className="text-[11px] text-muted-foreground">{t("pages.commandCenter.flights.search.seatsLeft", { count: o.seatsAvailable })}</p>
                  </div>
                </div>
                <div className="text-end min-w-0">
                  <div className="flex items-center gap-2 justify-end">
                    <span className="text-sm font-semibold text-foreground">{lang === "en" ? o.airline : o.airlineAr}</span>
                    <span className="text-xs font-mono px-2 py-0.5 rounded" style={{ background: C.sunset + "44", color: C.castleHill }} dir="ltr">{o.flightNumber}</span>
                    <Plane size={14} strokeWidth={1.5} style={{ color: C.calmTeal }} />
                  </div>
                  <div className="flex items-center gap-2 justify-end mt-1.5 text-sm" dir="ltr">
                    <span className="font-semibold">{o.origin}</span>
                    <span className="text-[11px] text-muted-foreground">{o.departureTime.split(" ")[1]}</span>
                    <ArrowRight size={13} style={{ color: C.warmGray }} />
                    <span className="text-[11px] text-muted-foreground">{o.arrivalTime.split(" ")[1]}</span>
                    <span className="font-semibold">{o.destination}</span>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 justify-end text-[11px] text-muted-foreground mt-2">
                    <Detail icon={Clock} text={o.duration} />
                    <Detail icon={MapPin} text={`${tf("search.terminal")} ${o.terminal}`} />
                    <Detail icon={Luggage} text={o.baggageAllowance} />
                    <span><span className="font-medium" style={{ color: C.castleHill }}>{tf("search.fare")}: </span>{o.fareCategory}</span>
                    <span><span className="font-medium" style={{ color: C.castleHill }}>{tf("search.cabinClass")}: </span>{tf(`cabin.${o.cabinClass}`)}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {selected && (
        <BookDialog
          eventId={eventId}
          offer={selected}
          provider={provider}
          onClose={() => setSelected(null)}
          onBooked={() => { setSelected(null); onBooked(); }}
        />
      )}
    </div>
  );
}

export function BookDialog({
  eventId, offer, provider, onClose, onBooked,
}: { eventId: number; offer: Offer; provider: string; onClose: () => void; onBooked: () => void }) {
  const { t } = useTranslation();
  const { lang, dir } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const tf = (k: string) => t(`pages.commandCenter.flights.${k}`);

  const { data: guests } = useListEventGuests(eventId);
  const flightGuests = (guests ?? []).filter((g) => g.requiresFlight);

  const [direction, setDirection] = useState<Direction>("arrival");
  const [guestId, setGuestId] = useState<number | null>(null);
  const [passengerName, setPassengerName] = useState("");
  const [passengerNameAr, setPassengerNameAr] = useState("");
  const book = useBookFlight();

  const pickGuest = (g: { id: number; fullName: string; fullNameAr?: string | null } | null) => {
    if (!g) { setGuestId(null); setPassengerName(""); setPassengerNameAr(""); return; }
    setGuestId(g.id);
    setPassengerName(g.fullName);
    setPassengerNameAr(g.fullNameAr ?? "");
  };

  const confirm = () => {
    book.mutate(
      {
        data: {
          eventId,
          provider,
          direction,
          passengerName: passengerName.trim(),
          passengerNameAr: passengerNameAr.trim() || undefined,
          guestId: guestId ?? undefined,
          airline: lang === "en" ? offer.airline : offer.airlineAr,
          flightNumber: offer.flightNumber,
          origin: offer.origin,
          destination: offer.destination,
          departureTime: offer.departureTime,
          arrivalTime: offer.arrivalTime,
          duration: offer.duration,
          terminal: offer.terminal,
          baggageAllowance: offer.baggageAllowance,
          fareCategory: offer.fareCategory,
          cabinClass: offer.cabinClass as CabinClass,
        },
      },
      {
        onSuccess: (row: { pnr?: string | null }) => {
          toast({ title: tf("booking.success"), description: t("pages.commandCenter.flights.booking.successDesc", { pnr: row.pnr ?? "" }) });
          queryClient.invalidateQueries({ queryKey: getListEventTravelQueryKey(eventId) });
          queryClient.invalidateQueries({ queryKey: getGetEventTravelDashboardQueryKey(eventId) });
          onBooked();
        },
        onError: () => toast({ title: tf("booking.error"), variant: "destructive" }),
      },
    );
  };

  return (
    <Dialog open onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="sm:max-w-[520px]" dir={dir}>
        <DialogHeader>
          <DialogTitle className={dir === "rtl" ? "text-end" : "text-start"}>{tf("booking.title")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="rounded-xl border p-3 text-end" style={{ borderColor: C.border, background: C.sunset + "1A" }}>
            <div className="flex items-center gap-2 justify-end text-sm font-semibold">
              {lang === "en" ? offer.airline : offer.airlineAr}
              <span className="font-mono text-xs" dir="ltr">{offer.flightNumber}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1" dir="ltr">{offer.origin} → {offer.destination} · {offer.departureTime}</p>
          </div>

          <Field label={tf("booking.direction")}>
            <div className="flex gap-2 justify-end">
              {(["arrival", "departure"] as Direction[]).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDirection(d)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium border transition-all"
                  style={direction === d
                    ? { background: C.mangrove, color: "#fff", borderColor: C.mangrove }
                    : { borderColor: C.border, color: C.castleHill }}
                >
                  {tf(`dir.${d}`)}
                </button>
              ))}
            </div>
          </Field>

          {flightGuests.length > 0 && (
            <Field label={tf("booking.assignGuest")}>
              <div className="flex flex-wrap gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => pickGuest(null)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium border transition-all"
                  style={guestId === null
                    ? { background: C.castleHill, color: "#fff", borderColor: C.castleHill }
                    : { borderColor: C.border, color: C.castleHill }}
                >
                  {tf("booking.unassigned")}
                </button>
                {flightGuests.map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => pickGuest(g)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium border transition-all"
                    style={guestId === g.id
                      ? { background: C.mangrove, color: "#fff", borderColor: C.mangrove }
                      : { borderColor: C.border, color: C.castleHill }}
                  >
                    {lang === "en" ? g.fullName : (g.fullNameAr || g.fullName)}
                  </button>
                ))}
              </div>
            </Field>
          )}

          <Field label={tf("booking.passengerAr")} >
            <Input dir="rtl" value={passengerNameAr} onChange={(e) => setPassengerNameAr(e.target.value)} />
          </Field>
          <Field label={tf("booking.passengerEn")}>
            <Input dir="ltr" value={passengerName} onChange={(e) => setPassengerName(e.target.value)} />
          </Field>

          <div className="flex justify-start gap-3 pt-2 border-t border-border">
            <Button onClick={confirm} disabled={book.isPending || !passengerName.trim()} className="rounded-xl px-6">
              {book.isPending ? (
                <span className="flex items-center gap-2"><Loader2 size={14} className="animate-spin" /> {tf("booking.confirming")}</span>
              ) : tf("booking.confirm")}
            </Button>
            <Button variant="outline" onClick={onClose} className="rounded-xl px-5">{tf("booking.cancel")}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ---------------- Bookings ---------------- */

export function BookingsView({ eventId }: { eventId: number }) {
  const { t } = useTranslation();
  const { lang } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const tf = (k: string) => t(`pages.commandCenter.flights.${k}`);

  const { data, isLoading } = useListEventTravel(eventId, { query: { queryKey: getListEventTravelQueryKey(eventId) } });
  const update = useUpdateTravel();
  const del = useDeleteTravel();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: getListEventTravelQueryKey(eventId) });
    queryClient.invalidateQueries({ queryKey: getGetEventTravelDashboardQueryKey(eventId) });
  };

  const cycleStatus = (r: { id: number; status: string }) => {
    const idx = TRAVEL_STATUSES.indexOf(r.status as (typeof TRAVEL_STATUSES)[number]);
    const next = TRAVEL_STATUSES[(idx + 1) % TRAVEL_STATUSES.length];
    update.mutate({ id: r.id, data: { status: next } }, { onSuccess: invalidate });
  };

  const remove = (r: { id: number }) => {
    del.mutate({ id: r.id }, {
      onSuccess: () => { toast({ title: tf("bookings.deleted") }); invalidate(); },
    });
  };

  const records = data ?? [];

  if (isLoading) {
    return <div className="grid grid-cols-1 md:grid-cols-2 gap-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />)}</div>;
  }
  if (records.length === 0) return <EmptyState text={tf("bookings.empty")} />;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {records.map((r, idx) => {
        const name = lang === "en" ? (r.passengerName || r.passengerNameAr) : (r.passengerNameAr || r.passengerName);
        const DirIcon = r.direction === "departure" ? PlaneTakeoff : PlaneLanding;
        return (
          <motion.div
            key={r.id}
            className="rounded-2xl border p-4"
            style={{ borderColor: C.border, background: C.cardBg }}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.03 }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => remove(r)}
                  title={tf("bookings.delete")}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-[#DC2626] hover:bg-[#DC262610] transition-colors"
                >
                  <Trash2 size={13} strokeWidth={1.5} />
                </button>
                <button
                  onClick={() => cycleStatus(r)}
                  title={tf("bookings.changeStatus")}
                  className="text-xs px-2.5 py-1 rounded-full font-medium transition-all"
                  style={statusStyle(r.status)}
                >
                  {tf(`st.${r.status}`)}
                </button>
              </div>
              <div className="text-end min-w-0 flex-1">
                <div className="flex items-center gap-2 justify-end mb-1.5">
                  <span className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: C.calmTeal + "1A" }}>
                    <DirIcon size={14} strokeWidth={1.5} style={{ color: C.calmTeal }} />
                  </span>
                  <p className="text-sm font-semibold text-foreground truncate">{name || "—"}</p>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 justify-end text-[11px] text-muted-foreground">
                  {r.pnr && <span><span className="font-medium" style={{ color: C.castleHill }}>{tf("bookings.pnr")}: </span><span className="font-mono" dir="ltr">{r.pnr}</span></span>}
                  {r.flightNumber && <span><span className="font-medium" style={{ color: C.castleHill }}>{tf("bookings.flight")}: </span><span dir="ltr">{r.flightNumber}</span></span>}
                  {(r.origin || r.destination) && <span dir="ltr">{r.origin} → {r.destination}</span>}
                  {r.airline && <span>{r.airline}</span>}
                  {r.departureTime && <span><span className="font-medium" style={{ color: C.castleHill }}>{tf("bookings.departure")}: </span><span dir="ltr">{r.departureTime}</span></span>}
                  {r.arrivalTime && <span><span className="font-medium" style={{ color: C.castleHill }}>{tf("bookings.arrival")}: </span><span dir="ltr">{r.arrivalTime}</span></span>}
                  {r.seatClass && <span>{tf(`cabin.${r.seatClass}`)}</span>}
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

/* ---------------- Guest Travel Profiles ---------------- */

export function GuestsView({ eventId }: { eventId: number }) {
  const { t } = useTranslation();
  const { lang } = useLanguage();
  const tf = (k: string) => t(`pages.commandCenter.flights.${k}`);

  const { data: guests, isLoading } = useListEventGuests(eventId);
  const { data: travel } = useListEventTravel(eventId, { query: { queryKey: getListEventTravelQueryKey(eventId) } });
  const { data: fleet } = useListEventFleet(eventId);
  const { data: hotels } = useListEventHotelBookings(eventId);

  const norm = (s?: string | null) => (s ?? "").trim().toLowerCase();

  if (isLoading) {
    return <div className="grid grid-cols-1 md:grid-cols-2 gap-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-40 rounded-2xl" />)}</div>;
  }

  const list = guests ?? [];
  if (list.length === 0) return <EmptyState text={tf("guests.empty")} />;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {list.map((g, idx) => {
        const gName = norm(g.fullName);
        const gNameAr = norm(g.fullNameAr);
        const flight = (travel ?? []).find((f) =>
          (f.guestId != null && f.guestId === g.id) ||
          norm(f.passengerName) === gName ||
          (gNameAr && norm(f.passengerNameAr) === gNameAr));
        const vehicle = (fleet ?? []).find((v) => norm(v.assignedTo) === gName || (gNameAr && norm(v.assignedToAr) === gNameAr));
        const hotel = (hotels ?? []).find((h) => norm(h.guestName) === gName || (gNameAr && norm(h.guestNameAr) === gNameAr));
        const display = lang === "en" ? (g.fullName || g.fullNameAr) : (g.fullNameAr || g.fullName);

        return (
          <motion.div
            key={g.id}
            className="rounded-2xl border p-4 text-end"
            style={{ borderColor: C.border, background: C.cardBg }}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.03 }}
          >
            <div className="flex items-center gap-2 justify-end mb-3">
              {flight && (
                <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={statusStyle(flight.status)}>
                  {tf(`st.${flight.status}`)}
                </span>
              )}
              <p className="text-sm font-semibold text-foreground truncate">{display || "—"}</p>
              <span className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: C.mangrove + "1A" }}>
                <Users size={14} strokeWidth={1.5} style={{ color: C.mangrove }} />
              </span>
            </div>

            <ProfileRow icon={Plane} label={tf("guests.flightInfo")} value={flight ? `${flight.airline ?? ""} ${flight.flightNumber ?? ""}`.trim() : null} empty={tf("guests.noFlight")} ltr />
            {flight && (
              <>
                {flight.pnr && <ProfileRow icon={Ticket} label={tf("guests.bookingRef")} value={flight.pnr} ltr mono />}
                {flight.arrivalTime && <ProfileRow icon={PlaneLanding} label={tf("guests.arrivalDetails")} value={flight.arrivalTime} ltr />}
                {flight.departureTime && <ProfileRow icon={PlaneTakeoff} label={tf("guests.departureDetails")} value={flight.departureTime} ltr />}
              </>
            )}
            <ProfileRow icon={Car} label={tf("guests.assignedVehicle")} value={vehicle ? (lang === "en" ? (vehicle.driverName || vehicle.plateNumber) : (vehicle.driverNameAr || vehicle.plateNumber)) : null} empty={tf("guests.noVehicle")} />
            <ProfileRow icon={Building2} label={tf("guests.assignedHotel")} value={hotel ? (lang === "en" ? (hotel.hotelName || hotel.hotelNameAr) : (hotel.hotelNameAr || hotel.hotelName)) : null} empty={tf("guests.noHotel")} />
          </motion.div>
        );
      })}
    </div>
  );
}

/* ---------------- Shared bits ---------------- */


export function Detail({ icon: Icon, text }: { icon: typeof Clock; text: string }) {
  return (
    <span className="flex items-center gap-1">
      <Icon size={11} strokeWidth={1.5} /> {text}
    </span>
  );
}



