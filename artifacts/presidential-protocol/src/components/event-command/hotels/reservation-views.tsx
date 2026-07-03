import { Field, ProfileRow, EmptyState } from "@/components/shared/primitives";

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
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { motion } from "framer-motion";
import { BedDouble, Users, ShieldCheck, Trash2, Loader2, Building2, Car, Crown, LogIn, LogOut, CheckCircle2, Coffee, Shield, Plane, Moon, Sparkles, Pencil, XCircle } from "lucide-react";
import { getGetEventHotelDashboardQueryKey, useListEventHotelBookings, getListEventHotelBookingsQueryKey, useUpdateHotelBooking, useDeleteHotelBooking, useListEventGuests, useListEventFleet, type HotelBooking } from "@workspace/api-client-react";

import { C, HOTEL_STATUSES, ROOM_TYPES, statusStyle } from "@/components/event-command/hotels/shared";

/* Extracted from hotels/views.tsx — reservations/edit/guests/protocol views. */
export function ReservationsView({ eventId }: { eventId: number }) {
  const { t } = useTranslation();
  const { lang } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const tf = (k: string) => t(`pages.commandCenter.hotels.${k}`);

  const { data, isLoading } = useListEventHotelBookings(eventId, { query: { queryKey: getListEventHotelBookingsQueryKey(eventId) } });
  const update = useUpdateHotelBooking();
  const del = useDeleteHotelBooking();

  const [editing, setEditing] = useState<HotelBooking | null>(null);
  const [cancelTarget, setCancelTarget] = useState<HotelBooking | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<HotelBooking | null>(null);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: getListEventHotelBookingsQueryKey(eventId) });
    queryClient.invalidateQueries({ queryKey: getGetEventHotelDashboardQueryKey(eventId) });
  };

  const cycleStatus = (r: { id: number; status: string }) => {
    const idx = HOTEL_STATUSES.indexOf(r.status as (typeof HOTEL_STATUSES)[number]);
    const next = HOTEL_STATUSES[(idx + 1) % HOTEL_STATUSES.length];
    update.mutate({ id: r.id, data: { status: next } }, { onSuccess: invalidate });
  };

  const confirmCancel = () => {
    if (!cancelTarget) return;
    update.mutate(
      { id: cancelTarget.id, data: { status: "cancelled" } },
      {
        onSuccess: () => { toast({ title: tf("reservations.cancelled") }); invalidate(); setCancelTarget(null); },
        onError: () => toast({ title: tf("reservations.updateError"), variant: "destructive" }),
      },
    );
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    del.mutate(
      { id: deleteTarget.id },
      {
        onSuccess: () => { toast({ title: tf("reservations.deleted") }); invalidate(); setDeleteTarget(null); },
        onError: () => toast({ title: tf("reservations.updateError"), variant: "destructive" }),
      },
    );
  };

  const records = data ?? [];

  if (isLoading) {
    return <div className="grid grid-cols-1 md:grid-cols-2 gap-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-36 rounded-2xl" />)}</div>;
  }
  if (records.length === 0) return <EmptyState text={tf("reservations.empty")} />;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {records.map((r, idx) => {
        const name = lang === "en" ? (r.guestName || r.guestNameAr) : (r.guestNameAr || r.guestName);
        const hotel = lang === "en" ? (r.hotelName || r.hotelNameAr) : (r.hotelNameAr || r.hotelName);
        const isCancelled = r.status === "cancelled";
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
                  onClick={() => setDeleteTarget(r)}
                  title={tf("reservations.delete")}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-[#DC2626] hover:bg-[#DC262610] transition-colors"
                >
                  <Trash2 size={13} strokeWidth={1.5} />
                </button>
                {!isCancelled && (
                  <button
                    onClick={() => setCancelTarget(r)}
                    title={tf("reservations.cancelAction")}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-[#DC2626] hover:bg-[#DC262610] transition-colors"
                  >
                    <XCircle size={14} strokeWidth={1.5} />
                  </button>
                )}
                <button
                  onClick={() => setEditing(r)}
                  title={tf("reservations.edit")}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-[color:var(--mangrove,#67835C)] transition-colors"
                  style={{ ["--mangrove" as string]: C.mangrove }}
                >
                  <Pencil size={13} strokeWidth={1.5} />
                </button>
                <button
                  onClick={() => cycleStatus(r)}
                  title={tf("reservations.changeStatus")}
                  className="text-xs px-2.5 py-1 rounded-full font-medium transition-all"
                  style={statusStyle(r.status)}
                >
                  {tf(`st.${r.status}`)}
                </button>
              </div>
              <div className="text-end min-w-0 flex-1">
                <div className="flex items-center gap-2 justify-end mb-1.5">
                  {(r.vipLevel && r.vipLevel !== "standard") && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1" style={{ background: C.mediumWood + "1A", color: C.mediumWood }}>
                      <Crown size={10} /> {tf(`vip.${r.vipLevel}`)}
                    </span>
                  )}
                  <p className="text-sm font-semibold text-foreground truncate">{name || "—"}</p>
                  <span className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: C.mangrove + "1A" }}>
                    <BedDouble size={14} strokeWidth={1.5} style={{ color: C.mangrove }} />
                  </span>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 justify-end text-[11px] text-muted-foreground">
                  {hotel && <span className="font-medium text-foreground">{hotel}</span>}
                  {r.roomType && <span><span className="font-medium" style={{ color: C.castleHill }}>{tf("reservations.room")}: </span>{tf(`room.${r.roomType}`)}</span>}
                  {r.confirmationNumber && <span><span className="font-medium" style={{ color: C.castleHill }}>{tf("reservations.conf")}: </span><span className="font-mono" dir="ltr">{r.confirmationNumber}</span></span>}
                  {(r.checkIn || r.checkOut) && <span dir="ltr">{r.checkIn} → {r.checkOut}</span>}
                  {r.nights != null && <span className="flex items-center gap-1"><Moon size={10} /> {t("pages.commandCenter.hotels.reservations.nights", { count: r.nights })}</span>}
                  {r.estimatedCost != null && <span><span className="font-medium" style={{ color: C.castleHill }}>{tf("reservations.cost")}: </span>{r.estimatedCost.toLocaleString()} {r.currency}</span>}
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}

      {editing && (
        <EditReservationDialog
          booking={editing}
          onClose={() => setEditing(null)}
          onSaved={() => { invalidate(); setEditing(null); }}
        />
      )}

      <AlertDialog open={!!cancelTarget} onOpenChange={(open) => { if (!update.isPending && !open) setCancelTarget(null); }}>
        <AlertDialogContent className="text-end">
          <AlertDialogHeader>
            <AlertDialogTitle>{tf("reservations.cancelConfirmTitle")}</AlertDialogTitle>
            <AlertDialogDescription>{tf("reservations.cancelConfirmDesc")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={update.isPending}>{tf("reservations.keep")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => { e.preventDefault(); confirmCancel(); }}
              disabled={update.isPending}
              className="bg-[#DC2626] hover:bg-[#DC2626]/90"
            >
              {update.isPending ? <Loader2 size={14} className="animate-spin" /> : tf("reservations.cancelConfirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!del.isPending && !open) setDeleteTarget(null); }}>
        <AlertDialogContent className="text-end">
          <AlertDialogHeader>
            <AlertDialogTitle>{tf("reservations.deleteConfirmTitle")}</AlertDialogTitle>
            <AlertDialogDescription>{tf("reservations.deleteConfirmDesc")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={del.isPending}>{tf("reservations.keep")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => { e.preventDefault(); confirmDelete(); }}
              disabled={del.isPending}
              className="bg-[#DC2626] hover:bg-[#DC2626]/90"
            >
              {del.isPending ? <Loader2 size={14} className="animate-spin" /> : tf("reservations.deleteConfirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export function EditReservationDialog({
  booking, onClose, onSaved,
}: { booking: HotelBooking; onClose: () => void; onSaved: () => void }) {
  const { t } = useTranslation();
  const { dir } = useLanguage();
  const { toast } = useToast();
  const tf = (k: string) => t(`pages.commandCenter.hotels.${k}`);
  const update = useUpdateHotelBooking();

  const [status, setStatus] = useState<string>(booking.status);
  const [roomType, setRoomType] = useState<string>(booking.roomType ?? "");
  const [checkIn, setCheckIn] = useState<string>((booking.checkIn ?? "").slice(0, 10));
  const [checkOut, setCheckOut] = useState<string>((booking.checkOut ?? "").slice(0, 10));
  const [securityNotes, setSecurityNotes] = useState<string>(booking.securityNotes ?? "");
  const [dietaryNotes, setDietaryNotes] = useState<string>(booking.dietaryNotes ?? "");
  const [protocolNotes, setProtocolNotes] = useState<string>(booking.protocolNotes ?? "");
  const [specialRequests, setSpecialRequests] = useState<string>(booking.specialRequests ?? "");

  const isVip = booking.vipLevel != null && booking.vipLevel !== "standard";

  const save = () => {
    update.mutate(
      {
        id: booking.id,
        data: {
          status,
          roomType: roomType || undefined,
          checkIn: checkIn || undefined,
          checkOut: checkOut || undefined,
          securityNotes: securityNotes.trim() || undefined,
          dietaryNotes: dietaryNotes.trim() || undefined,
          protocolNotes: protocolNotes.trim() || undefined,
          specialRequests: specialRequests.trim() || undefined,
        },
      },
      {
        onSuccess: () => { toast({ title: tf("reservations.updated") }); onSaved(); },
        onError: () => toast({ title: tf("reservations.updateError"), variant: "destructive" }),
      },
    );
  };

  return (
    <Dialog open onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto" dir={dir}>
        <DialogHeader>
          <DialogTitle className={dir === "rtl" ? "text-end" : "text-start"}>{tf("reservations.editTitle")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <Field label={tf("reservations.status")}>
            <div className="flex flex-wrap gap-2 justify-end">
              {HOTEL_STATUSES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatus(s)}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all"
                  style={status === s
                    ? { background: C.mangrove, color: "#fff", borderColor: C.mangrove }
                    : { borderColor: C.border, color: C.castleHill }}
                >
                  {tf(`st.${s}`)}
                </button>
              ))}
            </div>
          </Field>

          <Field label={tf("reservations.roomType")}>
            <div className="flex flex-wrap gap-2 justify-end">
              {ROOM_TYPES.map((rt) => (
                <button
                  key={rt}
                  type="button"
                  onClick={() => setRoomType(rt)}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all"
                  style={roomType === rt
                    ? { background: C.mediumWood, color: "#fff", borderColor: C.mediumWood }
                    : { borderColor: C.border, color: C.castleHill }}
                >
                  {tf(`room.${rt}`)}
                </button>
              ))}
            </div>
          </Field>

          <Field label={tf("reservations.checkIn")} half>
            <Input dir="ltr" type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} />
          </Field>
          <Field label={tf("reservations.checkOut")} half>
            <Input dir="ltr" type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} />
          </Field>

          <div className="rounded-xl border p-3 space-y-3" style={{ borderColor: isVip ? C.mediumWood + "55" : C.border, background: isVip ? C.mediumWood + "0D" : "transparent" }}>
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
            <Field label={tf("booking.specialRequests")}>
              <Textarea dir={dir} rows={2} value={specialRequests} onChange={(e) => setSpecialRequests(e.target.value)} />
            </Field>
          </div>

          <div className="flex justify-start gap-3 pt-2 border-t border-border">
            <Button onClick={save} disabled={update.isPending} className="rounded-xl px-6">
              {update.isPending ? (
                <span className="flex items-center gap-2"><Loader2 size={14} className="animate-spin" /> {tf("reservations.saving")}</span>
              ) : tf("reservations.save")}
            </Button>
            <Button variant="outline" onClick={onClose} className="rounded-xl px-5">{tf("booking.cancel")}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ---------------- Guest Accommodation Profiles ---------------- */

export function GuestsView({ eventId }: { eventId: number }) {
  const { t } = useTranslation();
  const { lang } = useLanguage();
  const tf = (k: string) => t(`pages.commandCenter.hotels.${k}`);

  const { data: guests, isLoading } = useListEventGuests(eventId);
  const { data: hotels } = useListEventHotelBookings(eventId, { query: { queryKey: getListEventHotelBookingsQueryKey(eventId) } });
  const { data: fleet } = useListEventFleet(eventId);

  const norm = (s?: string | null) => (s ?? "").trim().toLowerCase();

  if (isLoading) {
    return <div className="grid grid-cols-1 md:grid-cols-2 gap-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-44 rounded-2xl" />)}</div>;
  }

  const list = guests ?? [];
  if (list.length === 0) return <EmptyState text={tf("guests.empty")} />;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {list.map((g, idx) => {
        const gName = norm(g.fullName);
        const gNameAr = norm(g.fullNameAr);
        const hotel = (hotels ?? []).find((h) =>
          (h.guestId != null && h.guestId === g.id) ||
          norm(h.guestName) === gName ||
          (gNameAr && norm(h.guestNameAr) === gNameAr));
        const vehicle = (fleet ?? []).find((v) => norm(v.assignedTo) === gName || (gNameAr && norm(v.assignedToAr) === gNameAr));
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
              {hotel && (
                <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={statusStyle(hotel.status)}>
                  {tf(`st.${hotel.status}`)}
                </span>
              )}
              {g.vipVerified && (
                <span className="text-[10px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1" style={{ background: C.mediumWood + "1A", color: C.mediumWood }}>
                  <Crown size={10} /> {tf("guests.vip")}
                </span>
              )}
              <p className="text-sm font-semibold text-foreground truncate">{display || "—"}</p>
              <span className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: C.mangrove + "1A" }}>
                <Users size={14} strokeWidth={1.5} style={{ color: C.mangrove }} />
              </span>
            </div>

            <ProfileRow icon={Building2} label={tf("guests.hotel")} value={hotel ? (lang === "en" ? (hotel.hotelName || hotel.hotelNameAr) : (hotel.hotelNameAr || hotel.hotelName)) : null} empty={tf("guests.noHotel")} />
            {hotel && (
              <>
                {hotel.roomType && <ProfileRow icon={BedDouble} label={tf("guests.room")} value={tf(`room.${hotel.roomType}`)} />}
                {hotel.confirmationNumber && <ProfileRow icon={CheckCircle2} label={tf("guests.conf")} value={hotel.confirmationNumber} ltr mono />}
                {hotel.checkIn && <ProfileRow icon={LogIn} label={tf("guests.checkIn")} value={hotel.checkIn} ltr />}
                {hotel.checkOut && <ProfileRow icon={LogOut} label={tf("guests.checkOut")} value={hotel.checkOut} ltr />}
                {hotel.nights != null && <ProfileRow icon={Moon} label={tf("guests.nights")} value={String(hotel.nights)} />}
              </>
            )}
            <ProfileRow icon={Car} label={tf("guests.assignedVehicle")} value={vehicle ? (lang === "en" ? (vehicle.driverName || vehicle.plateNumber) : (vehicle.driverNameAr || vehicle.plateNumber)) : null} empty={tf("guests.noVehicle")} />
            <ProfileRow icon={Plane} label={tf("guests.airportPickup")} value={vehicle ? tf(`pickup.${vehicle.status === "confirmed" || vehicle.status === "assigned" ? "arranged" : "pending"}`) : null} empty={tf("pickup.none")} />
          </motion.div>
        );
      })}
    </div>
  );
}

/* ---------------- VIP Protocol Accommodation Center ---------------- */

export function ProtocolView({ eventId }: { eventId: number }) {
  const { t } = useTranslation();
  const { lang } = useLanguage();
  const tf = (k: string) => t(`pages.commandCenter.hotels.${k}`);

  const { data, isLoading } = useListEventHotelBookings(eventId, { query: { queryKey: getListEventHotelBookingsQueryKey(eventId) } });

  if (isLoading) {
    return <div className="grid grid-cols-1 gap-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-48 rounded-2xl" />)}</div>;
  }

  const vips = (data ?? []).filter((r) => r.vipLevel && r.vipLevel !== "standard");
  if (vips.length === 0) return <EmptyState text={tf("protocol.empty")} />;

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground text-end">{tf("protocol.subtitle")}</p>
      {vips.map((r, idx) => {
        const name = lang === "en" ? (r.guestName || r.guestNameAr) : (r.guestNameAr || r.guestName);
        const hotel = lang === "en" ? (r.hotelName || r.hotelNameAr) : (r.hotelNameAr || r.hotelName);
        return (
          <motion.div
            key={r.id}
            className="rounded-2xl border p-5 text-end"
            style={{ borderColor: C.mediumWood + "44", background: C.cardBg }}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.04 }}
          >
            <div className="flex items-center gap-2 justify-end mb-3 pb-3 border-b" style={{ borderColor: C.border }}>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1" style={{ background: C.mediumWood + "1A", color: C.mediumWood }}>
                <Crown size={10} /> {tf(`vip.${r.vipLevel}`)}
              </span>
              <div>
                <p className="text-base font-bold text-foreground" style={{ fontFamily: "Georgia, serif" }}>{name || "—"}</p>
                <p className="text-[11px] text-muted-foreground">{tf("protocol.headOfDelegation")}</p>
              </div>
              <span className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: C.mediumWood + "1A" }}>
                <ShieldCheck size={17} strokeWidth={1.5} style={{ color: C.mediumWood }} />
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
              <ProfileRow icon={Building2} label={tf("protocol.assignedHotel")} value={hotel} empty="—" />
              <ProfileRow icon={BedDouble} label={tf("protocol.assignedSuite")} value={r.roomType ? tf(`room.${r.roomType}`) : null} empty="—" />
              <ProfileRow icon={Shield} label={tf("protocol.security")} value={r.securityNotes} empty={tf("protocol.none")} />
              <ProfileRow icon={Coffee} label={tf("protocol.dietary")} value={r.dietaryNotes} empty={tf("protocol.none")} />
              <ProfileRow icon={Sparkles} label={tf("protocol.specialRequests")} value={r.specialRequests} empty={tf("protocol.none")} />
              <ProfileRow icon={ShieldCheck} label={tf("protocol.protocolNotes")} value={r.protocolNotes} empty={tf("protocol.none")} />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

/* ---------------- Shared bits ---------------- */





