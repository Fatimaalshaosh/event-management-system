import { palette } from "@/theme";
import {
  useCreateEvent,
  useUpdateEvent,
  getListEventsQueryKey,
  getGetEventQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMemo } from "react";
import { useLocation, Link } from "wouter";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/i18n/language-context";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { ChevronEnd } from "@/components/dir-icon";
import { CountrySelect } from "@/components/reference/country-select";
import { COUNTRIES, flagEmoji } from "@workspace/reference";

const T = palette;

export type EventFormDefaults = {
  nameAr: string;
  name: string;
  date: string;
  locationAr: string;
  location: string;
  status: string;
  eventType: string;
  priority: string;
  vipLevel: string;
  countryAr: string;
  country: string;
  notes: string;
};

const STATUS_OPTIONS = ["draft", "upcoming", "confirmed", "planned", "completed", "cancelled"];
const EVENT_TYPE_OPTIONS = [
  "visitOfficial",
  "delegationReception",
  "nationalEvent",
  "protocolMeeting",
  "coordinationMeeting",
  "internalEvent",
];
const PRIORITY_OPTIONS = ["urgent", "high", "medium", "low"];
const VIP_OPTIONS = ["headOfState", "minister", "ambassador", "standard"];

/** Convert an API date string to a value the datetime-local input accepts. */
export function toDateTimeLocal(value: string | null | undefined): string {
  if (!value) return "";
  const direct = /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2})/.exec(value);
  if (direct) return direct[1];
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-destructive mt-1">{message}</p>;
}

export function EventForm({
  mode,
  eventId,
  defaults,
}: {
  mode: "create" | "edit";
  eventId?: number;
  defaults: EventFormDefaults;
}) {
  const { t } = useTranslation();
  const { dir, lang } = useLanguage();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const qc = useQueryClient();
  const createEvent = useCreateEvent();
  const updateEvent = useUpdateEvent();

  const align = dir === "rtl" ? "text-end" : "text-start";

  const eventSchema = useMemo(
    () =>
      z.object({
        nameAr: z.string().min(2, t("pages.eventForm.errors.nameAr")),
        name: z.string().min(2, t("pages.eventForm.errors.nameEn")),
        date: z.string().min(1, t("pages.eventForm.errors.date")),
        locationAr: z.string().min(2, t("pages.eventForm.errors.locationAr")),
        location: z.string().min(2, t("pages.eventForm.errors.locationEn")),
        status: z.string(),
        eventType: z.string(),
        priority: z.string(),
        vipLevel: z.string(),
        countryAr: z.string().optional(),
        country: z.string().optional(),
        notes: z.string().optional(),
      }),
    [t],
  );
  type EventFormValues = z.infer<typeof eventSchema>;

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: defaults,
  });

  const isPending = createEvent.isPending || updateEvent.isPending;

  const onSubmit = (data: EventFormValues) => {
    if (mode === "edit" && eventId) {
      updateEvent.mutate(
        { id: eventId, data },
        {
          onSuccess: () => {
            qc.invalidateQueries({ queryKey: getListEventsQueryKey() });
            qc.invalidateQueries({ queryKey: getGetEventQueryKey(eventId) });
            toast({
              title: t("pages.eventForm.updatedTitle"),
              description: t("pages.eventForm.updatedDesc"),
            });
            setLocation(`/events/${eventId}`);
          },
          onError: () => {
            toast({
              title: t("pages.eventForm.errorTitle"),
              description: t("pages.eventForm.updateError"),
              variant: "destructive",
            });
          },
        },
      );
      return;
    }

    createEvent.mutate(
      { data },
      {
        onSuccess: (event) => {
          qc.invalidateQueries({ queryKey: getListEventsQueryKey() });
          toast({
            title: t("pages.eventForm.createdTitle"),
            description: t("pages.eventForm.createdDesc"),
          });
          setLocation(`/events/${event.id}`);
        },
        onError: () => {
          toast({
            title: t("pages.eventForm.errorTitle"),
            description: t("pages.eventForm.createError"),
            variant: "destructive",
          });
        },
      },
    );
  };

  const cancelHref = mode === "edit" && eventId ? `/events/${eventId}` : "/events";

  return (
    <div className="max-w-2xl ms-auto space-y-8 pb-12" dir={dir}>
      {/* Header with back link */}
      <div>
        <Link
          href="/events"
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors mb-4 justify-end"
        >
          <span>{t("pages.eventForm.backToEvents")}</span>
          <ChevronEnd size={13} />
        </Link>
        <div className={align}>
          <h1 className="text-4xl font-bold text-foreground" style={{ fontFamily: "Georgia, serif" }}>
            {t(mode === "edit" ? "pages.eventForm.editTitle" : "pages.eventForm.createTitle")}
          </h1>
          <p className="text-sm text-muted-foreground mt-1.5">
            {t(mode === "edit" ? "pages.eventForm.editSubtitle" : "pages.eventForm.createSubtitle")}
          </p>
        </div>
      </div>

      {/* Form card */}
      <div className="rounded-2xl border p-8 space-y-6" style={{ borderColor: T.border, background: T.cardBg }}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Arabic + English names */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <Label className="block text-sm font-medium text-end">{t("pages.eventForm.nameAr")}</Label>
              <Input {...form.register("nameAr")} className="text-end" dir="rtl" />
              <FieldError message={form.formState.errors.nameAr?.message} />
            </div>
            <div className="space-y-1.5">
              <Label className="block text-sm font-medium text-start" dir="ltr">{t("pages.eventForm.nameEn")}</Label>
              <Input {...form.register("name")} dir="ltr" />
              <FieldError message={form.formState.errors.name?.message} />
            </div>
          </div>

          {/* Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <Label className="block text-sm font-medium text-end">{t("pages.eventForm.locationAr")}</Label>
              <Input {...form.register("locationAr")} className="text-end" dir="rtl" />
              <FieldError message={form.formState.errors.locationAr?.message} />
            </div>
            <div className="space-y-1.5">
              <Label className="block text-sm font-medium text-start" dir="ltr">{t("pages.eventForm.locationEn")}</Label>
              <Input {...form.register("location")} dir="ltr" />
              <FieldError message={form.formState.errors.location?.message} />
            </div>
          </div>

          {/* Date */}
          <div className="space-y-1.5">
            <Label className={`block text-sm font-medium ${align}`}>{t("pages.eventForm.dateTime")}</Label>
            <Input type="datetime-local" {...form.register("date")} dir="ltr" className="text-start" />
            <FieldError message={form.formState.errors.date?.message} />
          </div>

          {/* Status + Event type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <Label className={`block text-sm font-medium ${align}`}>{t("pages.eventForm.statusLabel")}</Label>
              <select
                {...form.register("status")}
                dir={dir}
                className={`w-full rounded-md border bg-background px-3 py-2 text-sm ${align}`}
                style={{ borderColor: T.border, fontFamily: "inherit" }}
              >
                {STATUS_OPTIONS.map((v) => (
                  <option key={v} value={v}>
                    {t(`status.${v}`)}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className={`block text-sm font-medium ${align}`}>{t("pages.eventForm.eventTypeLabel")}</Label>
              <select
                {...form.register("eventType")}
                dir={dir}
                className={`w-full rounded-md border bg-background px-3 py-2 text-sm ${align}`}
                style={{ borderColor: T.border, fontFamily: "inherit" }}
              >
                {EVENT_TYPE_OPTIONS.map((v) => (
                  <option key={v} value={v}>
                    {t(`pages.events.types.${v}`)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Priority + VIP level */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <Label className={`block text-sm font-medium ${align}`}>{t("pages.eventForm.priorityLabel")}</Label>
              <select
                {...form.register("priority")}
                dir={dir}
                className={`w-full rounded-md border bg-background px-3 py-2 text-sm ${align}`}
                style={{ borderColor: T.border, fontFamily: "inherit" }}
              >
                {PRIORITY_OPTIONS.map((v) => (
                  <option key={v} value={v}>
                    {t(`pages.events.priority.${v}`)}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className={`block text-sm font-medium ${align}`}>{t("pages.eventForm.vipLabel")}</Label>
              <select
                {...form.register("vipLevel")}
                dir={dir}
                className={`w-full rounded-md border bg-background px-3 py-2 text-sm ${align}`}
                style={{ borderColor: T.border, fontFamily: "inherit" }}
              >
                {VIP_OPTIONS.map((v) => (
                  <option key={v} value={v}>
                    {t(`pages.events.vip.${v}`)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Country (reference) — fills the fields below; manual entry kept as fallback */}
          {(() => {
            const sel = COUNTRIES.find(
              (c) => c.nameEn === form.watch("country") || c.nameAr === form.watch("countryAr"),
            );
            return (
              <div className="space-y-1.5">
                <Label className={`block text-sm font-medium ${align}`}>{t("reference.country.label")}</Label>
                <CountrySelect
                  value={sel?.code ?? null}
                  onChange={(_code, c) => {
                    form.setValue("country", c?.nameEn ?? "", { shouldDirty: true });
                    form.setValue("countryAr", c?.nameAr ?? "", { shouldDirty: true });
                  }}
                />
                {sel && (
                  <div className={`flex items-center gap-2 pt-1 text-xs text-muted-foreground ${dir === "rtl" ? "justify-end" : ""}`}>
                    <span className="text-sm">{flagEmoji(sel.code)}</span>
                    <span>{t("reference.country.capital")}: {lang === "en" ? sel.capital : sel.capitalAr}</span>
                    <span className="opacity-40">·</span>
                    <span>{sel.region}</span>
                  </div>
                )}
              </div>
            );
          })()}

          {/* Delegation / country (manual fallback) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <Label className="block text-sm font-medium text-end">{t("pages.eventForm.countryAr")}</Label>
              <Input {...form.register("countryAr")} className="text-end" dir="rtl" />
            </div>
            <div className="space-y-1.5">
              <Label className="block text-sm font-medium text-start" dir="ltr">{t("pages.eventForm.countryEn")}</Label>
              <Input {...form.register("country")} dir="ltr" />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label className={`block text-sm font-medium ${align}`}>{t("pages.eventForm.notes")}</Label>
            <Textarea
              {...form.register("notes")}
              className={`min-h-[90px] resize-none ${align}`}
              placeholder={t("pages.eventForm.notesPh")}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-start gap-3 pt-5 border-t" style={{ borderColor: T.border }}>
            <Button
              type="submit"
              disabled={isPending}
              className="rounded-xl px-7 gap-2"
              style={{ background: T.mangrove, color: "#fff" }}
            >
              {isPending && <Loader2 size={14} className="animate-spin" />}
              {t(mode === "edit" ? "pages.eventForm.saveChanges" : "pages.eventForm.save")}
            </Button>
            <Link href={cancelHref}>
              <Button type="button" variant="outline" className="rounded-xl px-5" style={{ borderColor: T.border }}>
                {t("pages.eventForm.cancel")}
              </Button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
