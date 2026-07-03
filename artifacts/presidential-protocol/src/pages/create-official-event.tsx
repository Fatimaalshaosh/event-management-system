import { palette } from "@/theme";
import { Layout } from "@/components/layout";
import { EventIntelligencePanel } from "@/components/events/event-intelligence-panel";
import { EventTypeSelection, type EventTypeDef } from "@/components/events/event-type-selection";
import { useCreateEvent } from "@workspace/api-client-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useLocation, Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import { ChevronEnd } from "@/components/dir-icon";
import { Loader2, Flag, Crown, Shield, Car, Utensils, Globe2 } from "lucide-react";

const T = palette;

const COUNTRIES = [
  "saudi_arabia", "egypt", "jordan",
  "kuwait", "bahrain", "oman", "qatar",
  "france", "usa", "uk",
  "germany", "india", "japan",
  "china", "korea", "turkey",
  "russia", "canada", "australia", "other",
];

const VISIT_TYPES = ["state", "official", "working", "courtesy", "transit"];

const VIP_LEVELS = ["head_of_state", "head_of_govt", "minister", "ambassador", "senior_official"];

const PROTOCOL_LEVELS = ["critical", "high", "standard"];

const SECURITY_LEVELS = ["critical", "high", "standard"];

const makeSchema = (t: TFunction) =>
  z.object({
    nameAr:            z.string().min(2, t("pages.createOfficialEvent.errors.nameRequired")),
    name:              z.string().min(2, t("pages.createOfficialEvent.errors.nameEnRequired")),
    delegationCountry: z.string().min(2, t("pages.createOfficialEvent.errors.delegationCountryRequired")),
    visitType:         z.string().min(1, t("pages.createOfficialEvent.errors.visitTypeRequired")),
    vipLevel:          z.string().min(1, t("pages.createOfficialEvent.errors.vipLevelRequired")),
    delegateName:      z.string().min(2, t("pages.createOfficialEvent.errors.delegateNameRequired")),
    delegateTitle:     z.string().min(2, t("pages.createOfficialEvent.errors.delegateTitleRequired")),
    delegateCount:     z.string().min(1, t("pages.createOfficialEvent.errors.delegateCountRequired")),
    date:              z.string().min(1, t("pages.createOfficialEvent.errors.dateRequired")),
    durationDays:      z.string().min(1, t("pages.createOfficialEvent.errors.durationRequired")),
    locationAr:        z.string().min(2, t("pages.createOfficialEvent.errors.locationRequired")),
    location:          z.string().min(2, t("pages.createOfficialEvent.errors.locationEnRequired")),
    hostName:          z.string().min(2, t("pages.createOfficialEvent.errors.hostNameRequired")),
    protocolLevel:     z.string().min(1, t("pages.createOfficialEvent.errors.protocolLevelRequired")),
    securityLevel:     z.string().min(1, t("pages.createOfficialEvent.errors.securityLevelRequired")),
    transportNeeds:    z.string().optional(),
    hospitalityNotes:  z.string().optional(),
    agenda:            z.string().optional(),
    notes:             z.string().optional(),
  });
type FormValues = z.infer<ReturnType<typeof makeSchema>>;

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs mt-1 text-end" style={{ color: "#C84B38" }}>{message}</p>;
}

function SectionHeader({ icon: Icon, title, subtitle }: { icon: React.ElementType; title: string; subtitle: string }) {
  return (
    <div className="flex items-center justify-end gap-3 pb-4 mb-5 border-b" style={{ borderColor: T.border }}>
      <div className="text-end">
        <h3 className="text-base font-bold" style={{ color: T.textPrimary, fontFamily: "Georgia, serif" }}>{title}</h3>
        <p className="text-xs mt-0.5" style={{ color: T.warmGray }}>{subtitle}</p>
      </div>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: `${T.sunset}55`, color: T.mediumWood }}>
        <Icon size={17} strokeWidth={1.5} />
      </div>
    </div>
  );
}

export default function CreateOfficialEvent() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language?.startsWith("ar") ? "ar" : "en";
  const [, setLocation] = useLocation();
  // Phase 1: no event type is assumed — the form appears only after selection.
  const [picked, setPicked] = useState<EventTypeDef | null>(null);
  const { toast } = useToast();
  const createEvent = useCreateEvent();

  const schema = useMemo(() => makeSchema(t), [t]);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      nameAr: "", name: "", delegationCountry: "", visitType: "state",
      vipLevel: "head_of_state", delegateName: "", delegateTitle: "",
      delegateCount: "", date: "", durationDays: "1",
      locationAr: t("pages.createOfficialEvent.defaultLocationAr"), location: t("pages.createOfficialEvent.defaultLocation"),
      hostName: "", protocolLevel: "high", securityLevel: "high",
      transportNeeds: "", hospitalityNotes: "", agenda: "", notes: "",
    },
  });

  const onSubmit = (data: FormValues) => {
    const countryLabel    = t(`countries.${data.delegationCountry}`);
    const visitTypeLabel  = t(`pages.createOfficialEvent.visitTypes.${data.visitType}`);
    const vipLevelLabel   = t(`pages.createOfficialEvent.vipLevels.${data.vipLevel}`);
    const protocolLabel   = t(`pages.createOfficialEvent.protocolLevels.${data.protocolLevel}`);
    const securityLabel   = t(`pages.createOfficialEvent.securityLevels.${data.securityLevel}`);

    const compiledNotes = [
      `— ${t("pages.createOfficialEvent.compiledNotes.header")} —`,
      `${t("pages.createOfficialEvent.compiledNotes.country")}: ${countryLabel}`,
      `${t("pages.createOfficialEvent.compiledNotes.visitType")}: ${visitTypeLabel}`,
      `${t("pages.createOfficialEvent.compiledNotes.vipLevel")}: ${vipLevelLabel}`,
      `${t("pages.createOfficialEvent.compiledNotes.delegationHead")}: ${data.delegateTitle} ${data.delegateName}`,
      `${t("pages.createOfficialEvent.compiledNotes.delegateCount")}: ${data.delegateCount}`,
      `${t("pages.createOfficialEvent.compiledNotes.duration")}: ${data.durationDays} ${t("pages.createOfficialEvent.compiledNotes.daysUnit")}`,
      `${t("pages.createOfficialEvent.compiledNotes.host")}: ${data.hostName}`,
      `${t("pages.createOfficialEvent.compiledNotes.protocolLevel")}: ${protocolLabel}`,
      `${t("pages.createOfficialEvent.compiledNotes.securityLevel")}: ${securityLabel}`,
      data.transportNeeds   ? `\n${t("pages.createOfficialEvent.compiledNotes.transportNeeds")}:\n${data.transportNeeds}`     : "",
      data.hospitalityNotes ? `\n${t("pages.createOfficialEvent.compiledNotes.hospitalityNotes")}:\n${data.hospitalityNotes}` : "",
      data.agenda           ? `\n${t("pages.createOfficialEvent.compiledNotes.agenda")}:\n${data.agenda}`              : "",
      data.notes            ? `\n${t("pages.createOfficialEvent.compiledNotes.additionalNotes")}:\n${data.notes}`             : "",
    ].filter(Boolean).join("\n");

    createEvent.mutate(
      {
        data: {
          nameAr:     data.nameAr,
          name:       data.name,
          date:       data.date,
          locationAr: data.locationAr,
          location:   data.location,
          status:     "confirmed",
          notes:      compiledNotes,
        },
      },
      {
        onSuccess: (event) => {
          toast({ title: t("pages.createOfficialEvent.toast.successTitle"), description: t("pages.createOfficialEvent.toast.successDescription", { country: countryLabel }) });
          setLocation(`/events/${event.id}`);
        },
        onError: () => {
          toast({ title: t("pages.createOfficialEvent.toast.errorTitle"), description: t("pages.createOfficialEvent.toast.errorDescription"), variant: "destructive" });
        },
      }
    );
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-8 pb-14">

        {!picked ? (
          <EventTypeSelection onSelect={(et) => { setPicked(et); form.setValue("visitType", et.visitType); }} />
        ) : (
        <>
        {/* Header */}
        <div>
          <Link href="/"
            className="flex items-center gap-1 text-xs hover:opacity-70 transition-opacity mb-4"
            style={{ color: T.warmGray }}>
            <span>{t("pages.createOfficialEvent.breadcrumbDashboard")}</span>
            <ChevronEnd size={13} />
          </Link>

          <button type="button" onClick={() => setPicked(null)}
            className="inline-flex items-center gap-2 mb-3 text-[11px] font-medium px-2.5 py-1 rounded-full border hover:bg-muted transition-colors"
            style={{ borderColor: T.border, color: T.mediumWood }}>
            <picked.icon size={12} /> {lang === "ar" ? picked.ar : picked.en} · {lang === "ar" ? "تغيير النوع" : "Change type"}
          </button>

          <div className="flex items-start gap-4">
            <div className="text-start flex-1">
              <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.36em", color: T.castleHill, marginBottom: 8 }}>
                {t("pages.createOfficialEvent.eyebrow")}
              </p>
              <h1 className="text-3xl font-bold" style={{ color: T.textPrimary, fontFamily: "Georgia, serif", lineHeight: 1.15 }}>
                {t("pages.createOfficialEvent.title")}
              </h1>
              <p className="text-sm mt-2" style={{ color: T.warmGray, lineHeight: 1.7 }}>
                {t("pages.createOfficialEvent.subtitle")}
              </p>
            </div>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-lg"
              style={{ background: `linear-gradient(135deg, ${T.mediumWood}, ${T.sunset})`, color: "#fff" }}>
              <Flag size={24} strokeWidth={1.5} />
            </div>
          </div>
        </div>

        {/* Form */}
        {/* Single natural layout — dir="rtl" mirrors it: form on the right + AI
            panel on the left in Arabic; form left + panel right in English. */}
        <div className="grid grid-cols-1 gap-6 items-start lg:grid-cols-[minmax(0,1fr)_336px]">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

          {/* SECTION 1 — Identity */}
          <div className="rounded-2xl border p-7" style={{ borderColor: T.border, background: T.cardBg }}>
            <SectionHeader icon={Globe2} title={t("pages.createOfficialEvent.sections.identity.title")} subtitle={t("pages.createOfficialEvent.sections.identity.subtitle")} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <Label className="text-end block text-sm font-medium">{t("pages.createOfficialEvent.fields.nameAr")}</Label>
                <Input {...form.register("nameAr")} className="text-end" placeholder={t("pages.createOfficialEvent.placeholders.nameAr")} />
                <FieldError message={form.formState.errors.nameAr?.message} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-start block text-sm font-medium" dir="ltr">{t("pages.createOfficialEvent.fields.name")}</Label>
                <Input {...form.register("name")} dir="ltr" placeholder={t("pages.createOfficialEvent.placeholders.name")} />
                <FieldError message={form.formState.errors.name?.message} />
              </div>

              <div className="space-y-1.5">
                <Label className="text-end block text-sm font-medium">{t("pages.createOfficialEvent.fields.delegationCountry")}</Label>
                <select {...form.register("delegationCountry")}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm text-end"
                  style={{ borderColor: T.border, fontFamily: "inherit" }}>
                  <option value="">{t("pages.createOfficialEvent.selectCountry")}</option>
                  {COUNTRIES.map((c) => <option key={c} value={c}>{t(`countries.${c}`)}</option>)}
                </select>
                <FieldError message={form.formState.errors.delegationCountry?.message} />
              </div>

              <div className="space-y-1.5">
                <Label className="text-end block text-sm font-medium">{t("pages.createOfficialEvent.fields.visitType")}</Label>
                <select {...form.register("visitType")}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm text-end"
                  style={{ borderColor: T.border, fontFamily: "inherit" }}>
                  {VISIT_TYPES.map((v) => <option key={v} value={v}>{t(`pages.createOfficialEvent.visitTypes.${v}`)}</option>)}
                </select>
                <FieldError message={form.formState.errors.visitType?.message} />
              </div>
            </div>
          </div>

          {/* SECTION 2 — Delegation Head */}
          <div className="rounded-2xl border p-7" style={{ borderColor: T.border, background: T.cardBg }}>
            <SectionHeader icon={Crown} title={t("pages.createOfficialEvent.sections.delegationHead.title")} subtitle={t("pages.createOfficialEvent.sections.delegationHead.subtitle")} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <Label className="text-end block text-sm font-medium">{t("pages.createOfficialEvent.fields.vipLevel")}</Label>
                <select {...form.register("vipLevel")}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm text-end"
                  style={{ borderColor: T.border, fontFamily: "inherit" }}>
                  {VIP_LEVELS.map((v) => <option key={v} value={v}>{t(`pages.createOfficialEvent.vipLevels.${v}`)}</option>)}
                </select>
                <FieldError message={form.formState.errors.vipLevel?.message} />
              </div>

              <div className="space-y-1.5">
                <Label className="text-end block text-sm font-medium">{t("pages.createOfficialEvent.fields.delegateTitle")}</Label>
                <Input {...form.register("delegateTitle")} className="text-end" placeholder={t("pages.createOfficialEvent.placeholders.delegateTitle")} />
                <FieldError message={form.formState.errors.delegateTitle?.message} />
              </div>

              <div className="space-y-1.5">
                <Label className="text-end block text-sm font-medium">{t("pages.createOfficialEvent.fields.delegateName")}</Label>
                <Input {...form.register("delegateName")} className="text-end" />
                <FieldError message={form.formState.errors.delegateName?.message} />
              </div>

              <div className="space-y-1.5">
                <Label className="text-end block text-sm font-medium">{t("pages.createOfficialEvent.fields.delegateCount")}</Label>
                <Input type="number" min="0" {...form.register("delegateCount")} className="text-end" dir="ltr" />
                <FieldError message={form.formState.errors.delegateCount?.message} />
              </div>
            </div>
          </div>

          {/* SECTION 3 — Logistics */}
          <div className="rounded-2xl border p-7" style={{ borderColor: T.border, background: T.cardBg }}>
            <SectionHeader icon={Car} title={t("pages.createOfficialEvent.sections.logistics.title")} subtitle={t("pages.createOfficialEvent.sections.logistics.subtitle")} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <Label className="text-end block text-sm font-medium">{t("pages.createOfficialEvent.fields.date")}</Label>
                <Input type="datetime-local" {...form.register("date")} dir="ltr" className="text-start" />
                <FieldError message={form.formState.errors.date?.message} />
              </div>

              <div className="space-y-1.5">
                <Label className="text-end block text-sm font-medium">{t("pages.createOfficialEvent.fields.durationDays")}</Label>
                <Input type="number" min="1" {...form.register("durationDays")} dir="ltr" className="text-start" />
                <FieldError message={form.formState.errors.durationDays?.message} />
              </div>

              <div className="space-y-1.5">
                <Label className="text-end block text-sm font-medium">{t("pages.createOfficialEvent.fields.locationAr")}</Label>
                <Input {...form.register("locationAr")} className="text-end" />
                <FieldError message={form.formState.errors.locationAr?.message} />
              </div>

              <div className="space-y-1.5">
                <Label className="text-start block text-sm font-medium" dir="ltr">{t("pages.createOfficialEvent.fields.location")}</Label>
                <Input {...form.register("location")} dir="ltr" />
                <FieldError message={form.formState.errors.location?.message} />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <Label className="text-end block text-sm font-medium">{t("pages.createOfficialEvent.fields.hostName")}</Label>
                <Input {...form.register("hostName")} className="text-end" placeholder={t("pages.createOfficialEvent.placeholders.hostName")} />
                <FieldError message={form.formState.errors.hostName?.message} />
              </div>
            </div>
          </div>

          {/* SECTION 4 — Protocol & Security */}
          <div className="rounded-2xl border p-7" style={{ borderColor: T.border, background: T.cardBg }}>
            <SectionHeader icon={Shield} title={t("pages.createOfficialEvent.sections.protocol.title")} subtitle={t("pages.createOfficialEvent.sections.protocol.subtitle")} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <Label className="text-end block text-sm font-medium">{t("pages.createOfficialEvent.fields.protocolLevel")}</Label>
                <select {...form.register("protocolLevel")}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm text-end"
                  style={{ borderColor: T.border, fontFamily: "inherit" }}>
                  {PROTOCOL_LEVELS.map((v) => <option key={v} value={v}>{t(`pages.createOfficialEvent.protocolLevels.${v}`)}</option>)}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-end block text-sm font-medium">{t("pages.createOfficialEvent.fields.securityLevel")}</Label>
                <select {...form.register("securityLevel")}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm text-end"
                  style={{ borderColor: T.border, fontFamily: "inherit" }}>
                  {SECURITY_LEVELS.map((v) => <option key={v} value={v}>{t(`pages.createOfficialEvent.securityLevels.${v}`)}</option>)}
                </select>
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <Label className="text-end block text-sm font-medium">{t("pages.createOfficialEvent.fields.transportNeeds")}</Label>
                <Textarea {...form.register("transportNeeds")}
                  className="min-h-[70px] text-end resize-none"
                  placeholder={t("pages.createOfficialEvent.placeholders.transportNeeds")} />
              </div>
            </div>
          </div>

          {/* SECTION 5 — Hospitality & Agenda */}
          <div className="rounded-2xl border p-7" style={{ borderColor: T.border, background: T.cardBg }}>
            <SectionHeader icon={Utensils} title={t("pages.createOfficialEvent.sections.hospitality.title")} subtitle={t("pages.createOfficialEvent.sections.hospitality.subtitle")} />

            <div className="space-y-5">
              <div className="space-y-1.5">
                <Label className="text-end block text-sm font-medium">{t("pages.createOfficialEvent.fields.hospitalityNotes")}</Label>
                <Textarea {...form.register("hospitalityNotes")}
                  className="min-h-[70px] text-end resize-none"
                  placeholder={t("pages.createOfficialEvent.placeholders.hospitalityNotes")} />
              </div>

              <div className="space-y-1.5">
                <Label className="text-end block text-sm font-medium">{t("pages.createOfficialEvent.fields.agenda")}</Label>
                <Textarea {...form.register("agenda")}
                  className="min-h-[90px] text-end resize-none"
                  placeholder={t("pages.createOfficialEvent.placeholders.agenda")} />
              </div>

              <div className="space-y-1.5">
                <Label className="text-end block text-sm font-medium">{t("pages.createOfficialEvent.fields.notes")}</Label>
                <Textarea {...form.register("notes")}
                  className="min-h-[60px] text-end resize-none"
                  placeholder={t("pages.createOfficialEvent.placeholders.notes")} />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-start gap-3 pt-2">
            <Button type="submit" disabled={createEvent.isPending}
              className="rounded-xl px-8 py-6 gap-2 text-sm font-semibold"
              style={{ background: T.mediumWood, color: "#fff" }}>
              {createEvent.isPending && <Loader2 size={14} className="animate-spin" />}
              {t("pages.createOfficialEvent.submit")}
            </Button>
            <Link href="/">
              <Button type="button" variant="outline"
                className="rounded-xl px-6 py-6 text-sm"
                style={{ borderColor: T.border, color: T.castleHill }}>
                {t("pages.createOfficialEvent.cancel")}
              </Button>
            </Link>
          </div>
        </form>
        <EventIntelligencePanel values={form.watch()} eventType={picked.key} />
        </div>
        </>
        )}
      </div>
    </Layout>
  );
}
