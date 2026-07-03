import { Field, EmptyState } from "@/components/shared/primitives";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import { useLanguage } from "@/i18n/language-context";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";

import { motion } from "framer-motion";
import { Search, BedDouble, ShieldCheck, Star, MapPin, Loader2, Crown, LogIn, LogOut, Clock, CheckCircle2, Coffee, GitCompare, Wallet } from "lucide-react";
import { useListHotelProviders, useSearchHotels, useBookHotel, useGetEventHotelDashboard, getGetEventHotelDashboardQueryKey, getListEventHotelBookingsQueryKey, useListEventGuests } from "@workspace/api-client-react";

import { C, VipLevel, Category, CATEGORIES, VIP_LEVELS, AMENITY_ICONS, availabilityStyle } from "@/components/event-command/hotels/shared";

/* Extracted from hotels/views.tsx — dashboard/search/compare/book views. */
export function DashboardView({ eventId }: { eventId: number }) {
  const { t } = useTranslation();
  const { data, isLoading } = useGetEventHotelDashboard(eventId, {
    query: { queryKey: getGetEventHotelDashboardQueryKey(eventId) },
  });

  const cards: { key: string; value: number; color: string; icon: typeof BedDouble }[] = [
    { key: "total", value: data?.total ?? 0, color: C.castleHill, icon: BedDouble },
    { key: "confirmed", value: data?.confirmed ?? 0, color: C.mangrove, icon: CheckCircle2 },
    { key: "pending", value: data?.pending ?? 0, color: C.mediumWood, icon: Clock },
    { key: "checkedIn", value: data?.checkedIn ?? 0, color: C.mangrove, icon: LogIn },
    { key: "checkedOut", value: data?.checkedOut ?? 0, color: C.calmTeal, icon: LogOut },
    { key: "vipGuests", value: data?.vipGuests ?? 0, color: C.mediumWood, icon: Crown },
    { key: "presidentialSuites", value: data?.presidentialSuites ?? 0, color: C.mangrove, icon: Star },
    { key: "arrivingToday", value: data?.arrivingToday ?? 0, color: C.calmTeal, icon: LogIn },
    { key: "departingToday", value: data?.departingToday ?? 0, color: C.castleHill, icon: LogOut },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {Array.from({ length: 9 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
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
          <p className="text-xs text-muted-foreground mt-3">{t(`pages.commandCenter.hotels.dashboard.${c.key}`)}</p>
        </motion.div>
      ))}
    </div>
  );
}

/* ---------------- Search & Book ---------------- */

export type RoomOption = { type: string; capacity: number; pricePerNight: number; available: number };
export type Offer = {
  id: string; name: string; nameAr: string; category: string; rating: number;
  location: string; locationAr: string; distanceFromVenue: string; image: string;
  amenities: string[]; vipServices: string[]; cancellationPolicy: string;
  cancellationPolicyAr: string; rooms: RoomOption[]; currency: string; availability: string;
};
export type SearchMeta = { checkIn: string; checkOut: string; rooms: number; vipLevel: VipLevel };

export function SearchView({ eventId, onBooked }: { eventId: number; onBooked: () => void }) {
  const { t } = useTranslation();
  const { lang } = useLanguage();
  const { toast } = useToast();
  const tf = (k: string) => t(`pages.commandCenter.hotels.${k}`);

  const { data: providers } = useListHotelProviders();
  const [provider, setProvider] = useState("demo");
  const [city, setCity] = useState("Abu Dhabi");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState("2");
  const [rooms, setRooms] = useState("1");
  const [vipLevel, setVipLevel] = useState<VipLevel>("vip");
  const [category, setCategory] = useState<Category>("any");

  const search = useSearchHotels();
  const [offers, setOffers] = useState<Offer[] | null>(null);
  const [selected, setSelected] = useState<Offer | null>(null);
  const [compareMode, setCompareMode] = useState(false);
  const [compareIds, setCompareIds] = useState<string[]>([]);

  const runSearch = () => {
    search.mutate(
      { data: { provider, city, checkIn, checkOut, guests: Number(guests) || 1, rooms: Number(rooms) || 1, vipLevel, category } },
      {
        onSuccess: (res: { offers: Offer[] }) => { setOffers(res.offers); setCompareIds([]); },
        onError: () => {
          setOffers([]);
          toast({ title: tf("providerUnavailable"), variant: "destructive" });
        },
      },
    );
  };

  const toggleCompare = (id: string) => {
    setCompareIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : prev.length < 3 ? [...prev, id] : prev);
  };

  const canSearch = city.trim() && checkIn.trim() && checkOut.trim();
  const meta: SearchMeta = { checkIn, checkOut, rooms: Number(rooms) || 1, vipLevel };
  const compared = (offers ?? []).filter((o) => compareIds.includes(o.id));

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
          <Field label={tf("search.city")} half>
            <Input value={city} placeholder={tf("search.cityPh")} onChange={(e) => setCity(e.target.value)} className="text-end" />
          </Field>
          <Field label={tf("search.guests")} half>
            <Input dir="ltr" type="number" min={1} value={guests} onChange={(e) => setGuests(e.target.value)} />
          </Field>
          <Field label={tf("search.checkIn")} half>
            <Input dir="ltr" type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} />
          </Field>
          <Field label={tf("search.checkOut")} half>
            <Input dir="ltr" type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} />
          </Field>
          <Field label={tf("search.rooms")} half>
            <Input dir="ltr" type="number" min={1} value={rooms} onChange={(e) => setRooms(e.target.value)} />
          </Field>
          <Field label={tf("search.vipLevel")} half>
            <div className="flex flex-wrap gap-2 justify-end">
              {VIP_LEVELS.map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setVipLevel(v)}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all"
                  style={vipLevel === v
                    ? { background: C.mediumWood, color: "#fff", borderColor: C.mediumWood }
                    : { borderColor: C.border, color: C.castleHill }}
                >
                  {tf(`vip.${v}`)}
                </button>
              ))}
            </div>
          </Field>
          <Field label={tf("search.category")}>
            <div className="flex flex-wrap gap-2 justify-end">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategory(c)}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all"
                  style={category === c
                    ? { background: C.calmTeal, color: "#fff", borderColor: C.calmTeal }
                    : { borderColor: C.border, color: C.castleHill }}
                >
                  {tf(`category.${c}`)}
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
          <div className="flex items-center justify-between">
            <button
              onClick={() => { setCompareMode((m) => !m); setCompareIds([]); }}
              className="flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-lg border transition-all"
              style={compareMode
                ? { background: C.calmTeal, color: "#fff", borderColor: C.calmTeal }
                : { borderColor: C.border, color: C.castleHill }}
            >
              <GitCompare size={13} /> {tf("search.compare")}
            </button>
            <h3 className="text-sm font-semibold text-end" style={{ color: C.castleHill }}>{tf("search.results")}</h3>
          </div>

          {compareMode && compared.length >= 2 && <CompareTable offers={compared} />}

          {offers.map((o, idx) => (
            <motion.div
              key={o.id}
              className="rounded-2xl border overflow-hidden"
              style={{ borderColor: compareIds.includes(o.id) ? C.calmTeal : C.border, background: C.cardBg }}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.03 }}
            >
              <div className="flex flex-col md:flex-row-reverse">
                <div
                  className="md:w-48 h-32 md:h-auto bg-cover bg-center shrink-0"
                  style={{ backgroundImage: `url(${o.image})`, backgroundColor: C.sunset + "44" }}
                />
                <div className="flex-1 p-4 text-end">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={availabilityStyle(o.availability)}>
                      {tf(`availability.${o.availability}`)}
                    </span>
                    <div className="min-w-0">
                      <p className="text-base font-bold text-foreground truncate" style={{ fontFamily: "Georgia, serif" }}>
                        {lang === "en" ? o.name : o.nameAr}
                      </p>
                      <div className="flex items-center gap-2 justify-end mt-1">
                        <span className="text-[11px] text-muted-foreground">{lang === "en" ? o.location : o.locationAr}</span>
                        <span className="flex items-center gap-0.5">
                          {Array.from({ length: o.rating }).map((_, i) => (
                            <Star key={i} size={11} strokeWidth={0} fill={C.mediumWood} />
                          ))}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-x-3 gap-y-1 justify-end text-[11px] text-muted-foreground mt-2">
                    <span className="px-2 py-0.5 rounded-full" style={{ background: C.sunset + "33", color: C.castleHill }}>{tf(`category.${o.category}`)}</span>
                    <span className="flex items-center gap-1"><MapPin size={11} /> {tf("search.distance")}: {o.distanceFromVenue}</span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 justify-end mt-2">
                    {o.amenities.slice(0, 5).map((a) => {
                      const Icon = AMENITY_ICONS[a] ?? Coffee;
                      return (
                        <span key={a} className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full" style={{ background: C.calmTeal + "1A", color: "#3F6663" }}>
                          <Icon size={10} /> {tf(`amenity.${a}`)}
                        </span>
                      );
                    })}
                  </div>

                  {o.vipServices.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 justify-end mt-1.5">
                      {o.vipServices.slice(0, 4).map((s) => (
                        <span key={s} className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full" style={{ background: C.mediumWood + "1A", color: C.mediumWood }}>
                          <Crown size={10} /> {tf(`vipService.${s}`)}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-end justify-between gap-2 mt-3 pt-3 border-t" style={{ borderColor: C.border }}>
                    <div className="flex items-center gap-2">
                      <Button onClick={() => setSelected(o)} className="rounded-xl px-5" style={{ background: C.mangrove }}>
                        {tf("search.book")}
                      </Button>
                      {compareMode && (
                        <button
                          onClick={() => toggleCompare(o.id)}
                          className="text-xs px-3 py-1.5 rounded-lg border transition-all"
                          style={compareIds.includes(o.id)
                            ? { background: C.calmTeal, color: "#fff", borderColor: C.calmTeal }
                            : { borderColor: C.border, color: C.castleHill }}
                        >
                          {compareIds.includes(o.id) ? tf("search.added") : tf("search.addCompare")}
                        </button>
                      )}
                    </div>
                    <div className="text-end">
                      <p className="text-lg font-bold" style={{ color: C.mangrove, fontFamily: "Georgia, serif" }}>
                        {o.rooms[0]?.pricePerNight.toLocaleString()} <span className="text-xs font-normal">{o.currency}</span>
                      </p>
                      <p className="text-[10px] text-muted-foreground">{tf("search.fromPerNight")}</p>
                    </div>
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
          meta={meta}
          onClose={() => setSelected(null)}
          onBooked={() => { setSelected(null); onBooked(); }}
        />
      )}
    </div>
  );
}

export function CompareTable({ offers }: { offers: Offer[] }) {
  const { t } = useTranslation();
  const { lang } = useLanguage();
  const tf = (k: string) => t(`pages.commandCenter.hotels.${k}`);

  const rows: { key: string; render: (o: Offer) => string }[] = [
    { key: "rating", render: (o) => "★".repeat(o.rating) },
    { key: "category", render: (o) => tf(`category.${o.category}`) },
    { key: "distance", render: (o) => o.distanceFromVenue },
    { key: "fromPerNight", render: (o) => `${o.rooms[0]?.pricePerNight.toLocaleString()} ${o.currency}` },
    { key: "amenityCount", render: (o) => String(o.amenities.length) },
    { key: "availabilityLabel", render: (o) => tf(`availability.${o.availability}`) },
  ];

  return (
    <div className="rounded-2xl border overflow-x-auto" style={{ borderColor: C.border, background: C.cardBg }}>
      <table className="w-full text-end text-xs">
        <thead>
          <tr style={{ background: C.sunset + "22" }}>
            <th className="p-3 font-semibold" style={{ color: C.castleHill }}>{tf("search.compareTitle")}</th>
            {offers.map((o) => (
              <th key={o.id} className="p-3 font-semibold text-foreground">{lang === "en" ? o.name : o.nameAr}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.key} className="border-t" style={{ borderColor: C.border }}>
              <td className="p-3 font-medium" style={{ color: C.castleHill }}>{tf(`search.${r.key}`)}</td>
              {offers.map((o) => <td key={o.id} className="p-3 text-muted-foreground">{r.render(o)}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function BookDialog({
  eventId, offer, provider, meta, onClose, onBooked,
}: { eventId: number; offer: Offer; provider: string; meta: SearchMeta; onClose: () => void; onBooked: () => void }) {
  const { t } = useTranslation();
  const { lang, dir } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const tf = (k: string) => t(`pages.commandCenter.hotels.${k}`);

  const { data: guests } = useListEventGuests(eventId);
  const hotelGuests = (guests ?? []).filter((g) => g.requiresHotel);

  const [roomType, setRoomType] = useState<string>(offer.rooms[0]?.type ?? "deluxe");
  const [guestId, setGuestId] = useState<number | null>(null);
  const [guestName, setGuestName] = useState("");
  const [guestNameAr, setGuestNameAr] = useState("");
  const [securityNotes, setSecurityNotes] = useState("");
  const [dietaryNotes, setDietaryNotes] = useState("");
  const [protocolNotes, setProtocolNotes] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");
  const book = useBookHotel();

  const selectedRoom = offer.rooms.find((r) => r.type === roomType) ?? offer.rooms[0];
  const nights = meta.checkIn && meta.checkOut
    ? Math.max(1, Math.round((Date.parse(meta.checkOut) - Date.parse(meta.checkIn)) / 86400000))
    : 1;
  const estimate = (selectedRoom?.pricePerNight ?? 0) * nights * meta.rooms;
  const isVip = meta.vipLevel !== "standard";

  const pickGuest = (g: { id: number; fullName: string; fullNameAr?: string | null } | null) => {
    if (!g) { setGuestId(null); setGuestName(""); setGuestNameAr(""); return; }
    setGuestId(g.id);
    setGuestName(g.fullName);
    setGuestNameAr(g.fullNameAr ?? "");
  };

  const confirm = () => {
    book.mutate(
      {
        data: {
          eventId,
          provider,
          guestId: guestId ?? undefined,
          guestName: guestName.trim(),
          guestNameAr: guestNameAr.trim() || undefined,
          hotelName: offer.name,
          hotelNameAr: offer.nameAr,
          hotelCategory: offer.category,
          rating: offer.rating,
          location: offer.location,
          locationAr: offer.locationAr,
          distanceFromVenue: offer.distanceFromVenue,
          roomType,
          rooms: meta.rooms,
          checkIn: meta.checkIn || undefined,
          checkOut: meta.checkOut || undefined,
          vipLevel: meta.vipLevel,
          amenities: offer.amenities.join(","),
          vipServices: offer.vipServices.join(","),
          pricePerNight: selectedRoom?.pricePerNight,
          securityNotes: securityNotes.trim() || undefined,
          dietaryNotes: dietaryNotes.trim() || undefined,
          protocolNotes: protocolNotes.trim() || undefined,
          specialRequests: specialRequests.trim() || undefined,
        },
      },
      {
        onSuccess: (row: { confirmationNumber?: string | null }) => {
          toast({
            title: tf("booking.success"),
            description: t("pages.commandCenter.hotels.booking.successDesc", { conf: row.confirmationNumber ?? "" }),
          });
          queryClient.invalidateQueries({ queryKey: getListEventHotelBookingsQueryKey(eventId) });
          queryClient.invalidateQueries({ queryKey: getGetEventHotelDashboardQueryKey(eventId) });
          onBooked();
        },
        onError: () => toast({ title: tf("booking.error"), variant: "destructive" }),
      },
    );
  };

  return (
    <Dialog open onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto" dir={dir}>
        <DialogHeader>
          <DialogTitle className={dir === "rtl" ? "text-end" : "text-start"}>{tf("booking.title")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="rounded-xl border p-3 text-end" style={{ borderColor: C.border, background: C.sunset + "1A" }}>
            <div className="flex items-center gap-2 justify-end text-sm font-semibold">
              {lang === "en" ? offer.name : offer.nameAr}
              <span className="flex items-center gap-0.5">
                {Array.from({ length: offer.rating }).map((_, i) => <Star key={i} size={11} strokeWidth={0} fill={C.mediumWood} />)}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">{lang === "en" ? offer.location : offer.locationAr}</p>
          </div>

          <Field label={tf("booking.roomType")}>
            <div className="flex flex-wrap gap-2 justify-end">
              {offer.rooms.map((r) => (
                <button
                  key={r.type}
                  type="button"
                  onClick={() => setRoomType(r.type)}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all text-end"
                  style={roomType === r.type
                    ? { background: C.mangrove, color: "#fff", borderColor: C.mangrove }
                    : { borderColor: C.border, color: C.castleHill }}
                >
                  {tf(`room.${r.type}`)} · {r.pricePerNight.toLocaleString()}
                </button>
              ))}
            </div>
          </Field>

          <div className="rounded-xl border p-3 text-end flex items-center justify-between" style={{ borderColor: C.border }}>
            <div className="flex items-center gap-2">
              <Wallet size={15} style={{ color: C.mangrove }} />
              <span className="text-lg font-bold" style={{ color: C.mangrove, fontFamily: "Georgia, serif" }}>
                {estimate.toLocaleString()} <span className="text-xs font-normal">{offer.currency}</span>
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              {t("pages.commandCenter.hotels.booking.estimateNote", { nights, rooms: meta.rooms })}
            </p>
          </div>

          {hotelGuests.length > 0 && (
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
                {hotelGuests.map((g) => (
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

          <Field label={tf("booking.guestAr")}>
            <Input dir="rtl" value={guestNameAr} onChange={(e) => setGuestNameAr(e.target.value)} />
          </Field>
          <Field label={tf("booking.guestEn")}>
            <Input dir="ltr" value={guestName} onChange={(e) => setGuestName(e.target.value)} />
          </Field>

          <Field label={tf("booking.specialRequests")}>
            <Textarea dir={dir} rows={2} value={specialRequests} onChange={(e) => setSpecialRequests(e.target.value)} />
          </Field>

          {isVip && (
            <div className="rounded-xl border p-3 space-y-3" style={{ borderColor: C.mediumWood + "55", background: C.mediumWood + "0D" }}>
              <p className="text-xs font-semibold flex items-center gap-1.5 justify-end" style={{ color: C.mediumWood }}>
                {tf("booking.protocolSection")} <ShieldCheck size={13} />
              </p>
              <Field label={tf("booking.securityNotes")}>
                <Textarea dir={dir} rows={2} value={securityNotes} onChange={(e) => setSecurityNotes(e.target.value)} />
              </Field>
              <Field label={tf("booking.dietaryNotes")}>
                <Input dir={dir} value={dietaryNotes} onChange={(e) => setDietaryNotes(e.target.value)} />
              </Field>
              <Field label={tf("booking.protocolNotes")}>
                <Textarea dir={dir} rows={2} value={protocolNotes} onChange={(e) => setProtocolNotes(e.target.value)} />
              </Field>
            </div>
          )}

          <div className="flex justify-start gap-3 pt-2 border-t border-border">
            <Button onClick={confirm} disabled={book.isPending || !guestName.trim()} className="rounded-xl px-6">
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

/* ---------------- Reservations ---------------- */

