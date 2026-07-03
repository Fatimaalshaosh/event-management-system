import { palette } from "@/theme";
import { useState } from "react";
import {
  useListEventParticipants,
  useCreateParticipant,
  useUpdateParticipant,
  useDeleteParticipant,
  getListEventParticipantsQueryKey,
  type Participant,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/i18n/language-context";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { motion } from "framer-motion";
import { Plus, Users, Trash2, Building2, Phone } from "lucide-react";

const T = palette;

const SUBTYPES: Record<string, string[]> = {
  internal: ["protocol", "logistics", "planning", "media", "security"],
  external: ["delegation", "vip", "speaker", "vendor", "government"],
};
const ATTENDANCE = ["expected", "present", "absent"] as const;

function attendanceStyle(status: string) {
  if (status === "present") return { background: T.mangrove + "1A", color: T.mangrove };
  if (status === "absent") return { background: "#DC262615", color: "#DC2626" };
  return { background: T.warmGray + "1A", color: T.warmGray };
}

export function ParticipantsTab({ eventId }: { eventId: number }) {
  const { t } = useTranslation();
  const { lang, dir } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: participants, isLoading } = useListEventParticipants(eventId, {
    query: { queryKey: getListEventParticipantsQueryKey(eventId) },
  });
  const createParticipant = useCreateParticipant();
  const updateParticipant = useUpdateParticipant();
  const deleteParticipant = useDeleteParticipant();

  const [isOpen, setIsOpen] = useState(false);
  const [category, setCategory] = useState<"internal" | "external">("internal");
  const [subType, setSubType] = useState("protocol");
  const [form, setForm] = useState({ name: "", nameAr: "", role: "", organization: "", phone: "", email: "" });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: getListEventParticipantsQueryKey(eventId) });

  const resetForm = () => {
    setForm({ name: "", nameAr: "", role: "", organization: "", phone: "", email: "" });
    setCategory("internal");
    setSubType("protocol");
  };

  const onSubmit = () => {
    createParticipant.mutate(
      {
        data: {
          eventId,
          name: form.name,
          nameAr: form.nameAr || undefined,
          category,
          subType,
          role: form.role || undefined,
          organization: form.organization || undefined,
          phone: form.phone || undefined,
          email: form.email || undefined,
          attendanceStatus: "expected",
        },
      },
      {
        onSuccess: () => {
          toast({ title: t("pages.commandCenter.participants.addedToast") });
          invalidate();
          setIsOpen(false);
          resetForm();
        },
        onError: () => toast({ title: t("common.error"), variant: "destructive" }),
      },
    );
  };

  const onMutationError = () => toast({ title: t("common.error"), variant: "destructive" });

  const cycleAttendance = (p: Participant) => {
    const idx = ATTENDANCE.indexOf(p.attendanceStatus as (typeof ATTENDANCE)[number]);
    const next = ATTENDANCE[(idx + 1) % ATTENDANCE.length];
    updateParticipant.mutate({ id: p.id, data: { attendanceStatus: next } }, { onSuccess: invalidate, onError: onMutationError });
  };

  const remove = (p: Participant) => {
    deleteParticipant.mutate({ id: p.id }, {
      onSuccess: () => { toast({ title: t("pages.commandCenter.participants.removed") }); invalidate(); },
      onError: onMutationError,
    });
  };

  const list = participants ?? [];
  const internal = list.filter((p) => p.category === "internal");
  const external = list.filter((p) => p.category === "external");

  const renderGroup = (title: string, items: Participant[], color: string) => (
    <div className="space-y-3">
      <div className="flex items-center justify-end gap-2">
        <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: color + "1A", color }}>
          {items.length}
        </span>
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      </div>
      {items.length === 0 ? (
        <div className="rounded-2xl border text-center py-8 text-muted-foreground text-xs" style={{ borderColor: T.border, background: T.cardBg }}>
          {t("pages.commandCenter.participants.empty")}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {items.map((p, idx) => (
            <motion.div
              key={p.id}
              className="rounded-2xl border p-4"
              style={{ borderColor: T.border, background: T.cardBg }}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.03 }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => remove(p)}
                    title={t("common.delete")}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-[#DC2626] hover:bg-[#DC262610] transition-colors"
                  >
                    <Trash2 size={13} strokeWidth={1.5} />
                  </button>
                  <button
                    onClick={() => cycleAttendance(p)}
                    className="text-xs px-2.5 py-1 rounded-full font-medium transition-all"
                    style={attendanceStyle(p.attendanceStatus)}
                  >
                    {t(`pages.commandCenter.participants.attendance${p.attendanceStatus.charAt(0).toUpperCase() + p.attendanceStatus.slice(1)}`)}
                  </button>
                </div>
                <div className="text-end min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {lang === "en" ? (p.name || p.nameAr) : (p.nameAr || p.name)}
                  </p>
                  <p className="text-xs mt-0.5 font-medium" style={{ color }}>
                    {t(`pages.commandCenter.participants.sub.${p.subType}`)}
                    {p.role ? ` · ${p.role}` : ""}
                  </p>
                  <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                    {p.organization && (
                      <div className="flex items-center justify-end gap-1.5">
                        <span>{p.organization}</span>
                        <Building2 size={11} strokeWidth={1.5} />
                      </div>
                    )}
                    {p.phone && (
                      <div className="flex items-center justify-end gap-1.5" dir="ltr">
                        <span>{p.phone}</span>
                        <Phone size={11} strokeWidth={1.5} />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <Dialog open={isOpen} onOpenChange={(o) => { setIsOpen(o); if (!o) resetForm(); }}>
          <DialogTrigger asChild>
            <button
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:shadow-sm"
              style={{ background: T.mangrove, color: "#fff" }}
            >
              {t("pages.commandCenter.participants.add")} <Plus size={15} strokeWidth={2} />
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[560px]" dir={dir}>
            <DialogHeader>
              <DialogTitle className={dir === "rtl" ? "text-end" : "text-start"}>
                {t("pages.commandCenter.participants.addTitle")}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div>
                <Label className="block text-sm mb-1.5">{t("pages.commandCenter.participants.category")}</Label>
                <div className="flex gap-2">
                  {(["internal", "external"] as const).map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => { setCategory(c); setSubType(SUBTYPES[c][0]); }}
                      className="flex-1 px-3 py-2 rounded-xl text-sm font-medium border transition-all"
                      style={category === c
                        ? { background: T.mangrove, color: "#fff", borderColor: T.mangrove }
                        : { borderColor: T.border, color: T.castleHill }}
                    >
                      {t(`pages.commandCenter.participants.${c}`)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="block text-sm">{t("pages.commandCenter.participants.subType")}</Label>
                <div className="flex flex-wrap gap-2">
                  {SUBTYPES[category].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSubType(s)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium border transition-all"
                      style={subType === s
                        ? { background: T.mediumWood, color: "#fff", borderColor: T.mediumWood }
                        : { borderColor: T.border, color: T.castleHill }}
                    >
                      {t(`pages.commandCenter.participants.sub.${s}`)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="block text-sm">{t("pages.commandCenter.participants.nameAr")}</Label>
                  <Input value={form.nameAr} onChange={(e) => setForm({ ...form, nameAr: e.target.value })} dir="rtl" />
                </div>
                <div className="space-y-1.5">
                  <Label className="block text-sm">{t("pages.commandCenter.participants.nameEn")}</Label>
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} dir="ltr" />
                </div>
                <div className="space-y-1.5">
                  <Label className="block text-sm">{t("pages.commandCenter.participants.role")}</Label>
                  <Input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label className="block text-sm">{t("pages.commandCenter.participants.org")}</Label>
                  <Input value={form.organization} onChange={(e) => setForm({ ...form, organization: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label className="block text-sm">{t("pages.commandCenter.participants.contact")}</Label>
                  <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} dir="ltr" />
                </div>
                <div className="space-y-1.5">
                  <Label className="block text-sm">{t("pages.commandCenter.invitations.email")}</Label>
                  <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} dir="ltr" />
                </div>
              </div>

              <div className="flex justify-start gap-3 pt-2 border-t border-border">
                <Button type="button" disabled={createParticipant.isPending || !form.name} onClick={onSubmit} className="rounded-xl px-6">
                  {t("common.add")}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)} className="rounded-xl px-5">
                  {t("common.cancel")}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <div className="text-end">
          <h2 className="text-2xl font-bold text-foreground" style={{ fontFamily: "Georgia, serif" }}>
            {t("pages.commandCenter.participants.title")}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {t("pages.commandCenter.participants.subtitle")}
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-2xl" />)}
        </div>
      ) : list.length === 0 ? (
        <div className="rounded-2xl border text-center py-16 text-muted-foreground" style={{ borderColor: T.border, background: T.cardBg }}>
          <Users size={36} className="mx-auto mb-3 opacity-15" />
          <p className="text-sm">{t("pages.commandCenter.participants.empty")}</p>
        </div>
      ) : (
        <div className="space-y-8">
          {renderGroup(t("pages.commandCenter.participants.internal"), internal, T.mangrove)}
          {renderGroup(t("pages.commandCenter.participants.external"), external, T.mediumWood)}
        </div>
      )}
    </div>
  );
}
