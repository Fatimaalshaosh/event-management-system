import { palette } from "@/theme";
import { useState } from "react";
import { useRoute } from "wouter";
import {
  useGetRsvp,
  useSubmitRsvp,
  getGetRsvpQueryKey,
  type RsvpMember,
} from "@workspace/api-client-react";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/i18n/language-context";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import {
  CalendarDays, MapPin, CheckCircle2, XCircle, Plus, Trash2,
  ShieldCheck, Users, PartyPopper,
} from "lucide-react";

const T = palette;

type MemberForm = RsvpMember;

function emptyMember(): MemberForm {
  return { fullName: "", nationality: "", passportNumber: "", organization: "", jobTitle: "", mobile: "", requiresFlight: false, requiresHotel: false, requiresTransport: false };
}

export default function PublicRsvp() {
  const [, params] = useRoute("/rsvp/:token");
  const token = params?.token ?? "";
  const { t } = useTranslation();
  const { lang, dir } = useLanguage();

  const { data, isLoading, isError } = useGetRsvp(token, {
    query: { enabled: !!token, queryKey: getGetRsvpQueryKey(token) },
  });
  const submitRsvp = useSubmitRsvp();

  const [response, setResponse] = useState<"accepted" | "declined" | null>(null);
  const [individual, setIndividual] = useState({
    nationality: "", passportNumber: "", emiratesId: "", organization: "", jobTitle: "", mobile: "", email: "",
    requiresFlight: false, requiresHotel: false, requiresTransport: false, accompanyingCount: 0,
  });
  const [members, setMembers] = useState<MemberForm[]>([emptyMember()]);
  const [done, setDone] = useState<"accepted" | "declined" | null>(null);

  const inv = data?.invitation;
  const isDelegation = !!inv?.isDelegation;
  const alreadyResponded = inv?.status === "accepted" || inv?.status === "declined";

  const eventName = lang === "en"
    ? (data?.eventName || data?.eventNameAr)
    : (data?.eventNameAr || data?.eventName);
  const eventLocation = lang === "en"
    ? (data?.eventLocation || data?.eventLocationAr)
    : (data?.eventLocationAr || data?.eventLocation);
  const guestName = lang === "en"
    ? (inv?.guestName || inv?.guestNameAr)
    : (inv?.guestNameAr || inv?.guestName);

  const submit = () => {
    if (!response) return;
    submitRsvp.mutate(
      {
        token,
        data: response === "declined"
          ? { response: "declined" }
          : isDelegation
            ? { response: "accepted", members: members.filter((m) => m.fullName.trim()) }
            : { response: "accepted", ...individual },
      },
      { onSuccess: () => setDone(response) },
    );
  };

  const updateMember = (i: number, patch: Partial<MemberForm>) =>
    setMembers((prev) => prev.map((m, idx) => (idx === i ? { ...m, ...patch } : m)));

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: T.pageBg }} dir={dir}>
        <div className="w-full max-w-lg space-y-4">
          <Skeleton className="h-40 w-full rounded-3xl" />
          <Skeleton className="h-64 w-full rounded-3xl" />
        </div>
      </div>
    );
  }

  if (isError || !data || !inv) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: T.pageBg }} dir={dir}>
        <div className="text-center max-w-sm">
          <XCircle size={48} className="mx-auto mb-4" style={{ color: "#DC2626", opacity: 0.7 }} />
          <p className="text-lg font-semibold" style={{ color: T.textPrimary }}>{t("rsvp.notFound")}</p>
        </div>
      </div>
    );
  }

  const finished = done || alreadyResponded;
  const finishedState = done ?? (inv.status === "accepted" ? "accepted" : "declined");

  return (
    <div className="min-h-screen py-10 px-4 flex justify-center" style={{ background: T.pageBg }} dir={dir}>
      <div className="w-full max-w-lg space-y-6">
        {/* Header card */}
        <motion.div
          className="rounded-3xl border overflow-hidden"
          style={{ borderColor: T.border, background: T.cardBg }}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="px-7 py-6" style={{ background: `linear-gradient(135deg, ${T.mangrove}, ${T.calmTeal})` }}>
            <p className="text-xs font-medium tracking-wide" style={{ color: "#ffffffcc" }}>
              {t("rsvp.eyebrow")}
            </p>
            <p className="text-sm mt-3" style={{ color: "#ffffffdd" }}>{t("rsvp.invitedTo")}</p>
            <h1 className="text-2xl font-bold mt-1" style={{ color: "#fff", fontFamily: "Georgia, serif" }}>
              {eventName}
            </h1>
          </div>
          <div className="px-7 py-5 space-y-2 text-sm" style={{ color: T.castleHill }}>
            <div className="flex items-center gap-2">
              <CalendarDays size={15} strokeWidth={1.5} />
              <span>{data.eventDate ? new Date(data.eventDate).toLocaleDateString(lang === "ar" ? "ar-AE" : "en-GB", { weekday: "long", year: "numeric", month: "long", day: "numeric" }) : "—"}</span>
            </div>
            {eventLocation && (
              <div className="flex items-center gap-2">
                <MapPin size={15} strokeWidth={1.5} />
                <span>{eventLocation}</span>
              </div>
            )}
            <div className="flex items-center gap-2 pt-2 border-t" style={{ borderColor: T.border }}>
              {isDelegation ? <Users size={15} strokeWidth={1.5} /> : <CheckCircle2 size={15} strokeWidth={1.5} />}
              <span className="font-medium" style={{ color: T.textPrimary }}>{guestName}</span>
            </div>
          </div>
        </motion.div>

        {finished ? (
          <motion.div
            className="rounded-3xl border p-8 text-center"
            style={{ borderColor: T.border, background: T.cardBg }}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            {finishedState === "accepted" ? (
              <PartyPopper size={44} className="mx-auto mb-4" style={{ color: T.mangrove }} />
            ) : (
              <CheckCircle2 size={44} className="mx-auto mb-4" style={{ color: T.warmGray }} />
            )}
            <p className="text-base font-semibold" style={{ color: T.textPrimary }}>
              {finishedState === "accepted" ? t("rsvp.thankYouAccepted") : t("rsvp.thankYouDeclined")}
            </p>
          </motion.div>
        ) : (
          <motion.div
            className="rounded-3xl border p-6 space-y-5"
            style={{ borderColor: T.border, background: T.cardBg }}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
          >
            <h2 className="text-base font-semibold text-center" style={{ color: T.textPrimary }}>
              {t("rsvp.willYouAttend")}
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setResponse("accepted")}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-sm font-medium border transition-all"
                style={response === "accepted"
                  ? { background: T.mangrove, color: "#fff", borderColor: T.mangrove }
                  : { borderColor: T.border, color: T.mangrove }}
              >
                <CheckCircle2 size={16} strokeWidth={1.7} /> {t("rsvp.accept")}
              </button>
              <button
                type="button"
                onClick={() => setResponse("declined")}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-sm font-medium border transition-all"
                style={response === "declined"
                  ? { background: "#DC2626", color: "#fff", borderColor: "#DC2626" }
                  : { borderColor: T.border, color: "#DC2626" }}
              >
                <XCircle size={16} strokeWidth={1.7} /> {t("rsvp.decline")}
              </button>
            </div>

            {response === "accepted" && !isDelegation && (
              <div className="space-y-4 pt-1">
                <h3 className="text-sm font-semibold text-end" style={{ color: T.textPrimary }}>{t("rsvp.individualTitle")}</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="block text-sm">{t("rsvp.nationality")}</Label>
                    <Input value={individual.nationality} onChange={(e) => setIndividual({ ...individual, nationality: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="block text-sm">{t("rsvp.passport")}</Label>
                    <Input value={individual.passportNumber} onChange={(e) => setIndividual({ ...individual, passportNumber: e.target.value })} dir="ltr" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="block text-sm">{t("rsvp.emiratesId")}</Label>
                    <Input value={individual.emiratesId} onChange={(e) => setIndividual({ ...individual, emiratesId: e.target.value })} dir="ltr" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="block text-sm">{t("rsvp.mobile")}</Label>
                    <Input value={individual.mobile} onChange={(e) => setIndividual({ ...individual, mobile: e.target.value })} dir="ltr" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="block text-sm">{t("rsvp.organization")}</Label>
                    <Input value={individual.organization} onChange={(e) => setIndividual({ ...individual, organization: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="block text-sm">{t("rsvp.jobTitle")}</Label>
                    <Input value={individual.jobTitle} onChange={(e) => setIndividual({ ...individual, jobTitle: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="block text-sm">{t("rsvp.email")}</Label>
                    <Input type="email" value={individual.email} onChange={(e) => setIndividual({ ...individual, email: e.target.value })} dir="ltr" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="block text-sm">{t("rsvp.accompanyingCount")}</Label>
                    <Input type="number" min={0} value={individual.accompanyingCount} onChange={(e) => setIndividual({ ...individual, accompanyingCount: Number(e.target.value) || 0 })} dir="ltr" />
                  </div>
                </div>
                <RequirementToggles
                  value={individual}
                  onChange={(patch) => setIndividual({ ...individual, ...patch })}
                  t={t}
                />
              </div>
            )}

            {response === "accepted" && isDelegation && (
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setMembers([...members, emptyMember()])}
                    className="flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg border transition-all"
                    style={{ borderColor: T.border, color: T.mangrove }}
                  >
                    <Plus size={13} /> {t("rsvp.addMember")}
                  </button>
                  <h3 className="text-sm font-semibold" style={{ color: T.textPrimary }}>{t("rsvp.delegationTitle")}</h3>
                </div>
                {members.map((m, i) => (
                  <div key={i} className="rounded-2xl border p-4 space-y-3" style={{ borderColor: T.border, background: T.pageBg }}>
                    <div className="flex items-center justify-between">
                      {members.length > 1 && (
                        <button type="button" onClick={() => setMembers(members.filter((_, idx) => idx !== i))} className="text-muted-foreground hover:text-[#DC2626]">
                          <Trash2 size={14} />
                        </button>
                      )}
                      <span className="text-xs font-medium" style={{ color: T.castleHill }}>{t("rsvp.member")} {i + 1}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5 col-span-2">
                        <Label className="block text-sm">{t("rsvp.fullName")}</Label>
                        <Input value={m.fullName} onChange={(e) => updateMember(i, { fullName: e.target.value })} />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="block text-sm">{t("rsvp.nationality")}</Label>
                        <Input value={m.nationality ?? ""} onChange={(e) => updateMember(i, { nationality: e.target.value })} />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="block text-sm">{t("rsvp.passport")}</Label>
                        <Input value={m.passportNumber ?? ""} onChange={(e) => updateMember(i, { passportNumber: e.target.value })} dir="ltr" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="block text-sm">{t("rsvp.emiratesId")}</Label>
                        <Input value={m.emiratesId ?? ""} onChange={(e) => updateMember(i, { emiratesId: e.target.value })} dir="ltr" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="block text-sm">{t("rsvp.mobile")}</Label>
                        <Input value={m.mobile ?? ""} onChange={(e) => updateMember(i, { mobile: e.target.value })} dir="ltr" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="block text-sm">{t("rsvp.organization")}</Label>
                        <Input value={m.organization ?? ""} onChange={(e) => updateMember(i, { organization: e.target.value })} />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="block text-sm">{t("rsvp.jobTitle")}</Label>
                        <Input value={m.jobTitle ?? ""} onChange={(e) => updateMember(i, { jobTitle: e.target.value })} />
                      </div>
                      <div className="space-y-1.5 col-span-2">
                        <Label className="block text-sm">{t("rsvp.email")}</Label>
                        <Input type="email" value={m.email ?? ""} onChange={(e) => updateMember(i, { email: e.target.value })} dir="ltr" />
                      </div>
                    </div>
                    <RequirementToggles
                      value={m}
                      onChange={(patch) => updateMember(i, patch)}
                      t={t}
                    />
                  </div>
                ))}
              </div>
            )}

            {response && (
              <Button
                type="button"
                onClick={submit}
                disabled={submitRsvp.isPending}
                className="w-full rounded-2xl py-6 text-sm"
                style={{ background: T.mangrove }}
              >
                {submitRsvp.isPending ? t("rsvp.submitting") : t("rsvp.submit")}
              </Button>
            )}

            <p className="flex items-center justify-center gap-1.5 text-xs text-center" style={{ color: T.warmGray }}>
              <ShieldCheck size={12} /> {t("rsvp.secureNote")}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function RequirementToggles({
  value,
  onChange,
  t,
}: {
  value: { requiresFlight?: boolean; requiresHotel?: boolean; requiresTransport?: boolean };
  onChange: (patch: { requiresFlight?: boolean; requiresHotel?: boolean; requiresTransport?: boolean }) => void;
  t: (k: string) => string;
}) {
  const items: { key: "requiresFlight" | "requiresHotel" | "requiresTransport" }[] = [
    { key: "requiresFlight" }, { key: "requiresHotel" }, { key: "requiresTransport" },
  ];
  return (
    <div className="flex flex-wrap gap-2">
      {items.map(({ key }) => {
        const active = !!value[key];
        return (
          <button
            key={key}
            type="button"
            onClick={() => onChange({ [key]: !active })}
            className="px-3 py-1.5 rounded-lg text-xs font-medium border transition-all"
            style={active
              ? { background: T.calmTeal, color: "#fff", borderColor: T.calmTeal }
              : { borderColor: T.border, color: T.castleHill }}
          >
            {t(`rsvp.${key}`)}
          </button>
        );
      })}
    </div>
  );
}
