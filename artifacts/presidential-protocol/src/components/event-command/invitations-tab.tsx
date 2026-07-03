import { palette } from "@/theme";
import { CountryFlag } from "@/components/reference/country-flag";
import { useState } from "react";
import {
  useListInvitations,
  useCreateInvitation,
  useUpdateInvitation,
  useListEventGuests,
  useUpdateGuest,
  getListInvitationsQueryKey,
  getListEventGuestsQueryKey,
  type Invitation,
  type Guest,
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
import { QRCodeSVG } from "qrcode.react";
import { motion } from "framer-motion";
import {
  Mail, Plus, Link2, QrCode, Users, CheckCircle2, ShieldCheck,
  ChevronDown, ChevronUp, Send, Eye, MailCheck, Clock, XCircle,
} from "lucide-react";

const T = palette;

const INVITE_TYPES = ["domestic", "international", "vip", "delegation"] as const;
const CHANNELS = ["email", "sms", "whatsapp"] as const;

function publicRsvpUrl(token: string) {
  const base = import.meta.env.BASE_URL.endsWith("/")
    ? import.meta.env.BASE_URL
    : import.meta.env.BASE_URL + "/";
  return `${window.location.origin}${base}rsvp/${token}`;
}

export function InvitationsTab({ eventId }: { eventId: number }) {
  const { t } = useTranslation();
  const { lang, dir } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: invitations, isLoading } = useListInvitations(
    { eventId },
    { query: { queryKey: getListInvitationsQueryKey({ eventId }) } },
  );
  const { data: guests } = useListEventGuests(eventId, {
    query: { queryKey: getListEventGuestsQueryKey(eventId) },
  });

  const createInvitation = useCreateInvitation();
  const updateInvitation = useUpdateInvitation();
  const updateGuest = useUpdateGuest();

  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<"individual" | "delegation">("individual");
  const [inviteType, setInviteType] = useState<string>("domestic");
  const [channel, setChannel] = useState<string>("email");
  const [form, setForm] = useState({
    guestName: "", guestNameAr: "", email: "", mobile: "",
    organization: "", jobTitle: "",
    delegationName: "", delegationNameAr: "",
  });
  const [qrInvite, setQrInvite] = useState<Invitation | null>(null);
  const [expanded, setExpanded] = useState<number | null>(null);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: getListInvitationsQueryKey({ eventId }) });
    queryClient.invalidateQueries({ queryKey: getListEventGuestsQueryKey(eventId) });
  };

  const resetForm = () => {
    setForm({
      guestName: "", guestNameAr: "", email: "", mobile: "",
      organization: "", jobTitle: "", delegationName: "", delegationNameAr: "",
    });
    setMode("individual");
    setInviteType("domestic");
    setChannel("email");
  };

  const onSubmit = () => {
    const isDelegation = mode === "delegation";
    createInvitation.mutate(
      {
        data: {
          eventId,
          guestName: isDelegation ? (form.delegationName || form.guestName || "Delegation") : form.guestName,
          guestNameAr: isDelegation ? form.delegationNameAr : form.guestNameAr,
          email: form.email || undefined,
          mobile: form.mobile || undefined,
          organization: form.organization || undefined,
          jobTitle: form.jobTitle || undefined,
          inviteType: isDelegation ? "delegation" : inviteType,
          channel,
          isDelegation,
          delegationName: isDelegation ? form.delegationName : undefined,
          delegationNameAr: isDelegation ? form.delegationNameAr : undefined,
        },
      },
      {
        onSuccess: () => {
          toast({
            title: t("pages.commandCenter.invitations.sentToast"),
            description: t("pages.commandCenter.invitations.sentDesc"),
          });
          invalidate();
          setIsOpen(false);
          resetForm();
        },
        onError: () => {
          toast({ title: t("common.error"), variant: "destructive" });
        },
      },
    );
  };

  const copyLink = async (token: string) => {
    try {
      await navigator.clipboard.writeText(publicRsvpUrl(token));
      toast({ title: t("pages.commandCenter.invitations.linkCopied") });
    } catch {
      toast({ title: t("common.error"), variant: "destructive" });
    }
  };

  const onMutationError = () => toast({ title: t("common.error"), variant: "destructive" });

  const toggleAttended = (inv: Invitation) => {
    updateInvitation.mutate(
      { id: inv.id, data: { attended: !inv.attended } },
      { onSuccess: invalidate, onError: onMutationError },
    );
  };
  const toggleVip = (inv: Invitation) => {
    updateInvitation.mutate(
      { id: inv.id, data: { vipVerified: !inv.vipVerified } },
      { onSuccess: invalidate, onError: onMutationError },
    );
  };
  const toggleGuestAttended = (g: Guest) => {
    updateGuest.mutate({ id: g.id, data: { attended: !g.attended } }, { onSuccess: invalidate, onError: onMutationError });
  };
  const toggleGuestVip = (g: Guest) => {
    updateGuest.mutate({ id: g.id, data: { vipVerified: !g.vipVerified } }, { onSuccess: invalidate, onError: onMutationError });
  };

  const list = invitations ?? [];
  const funnel = {
    sent: list.length,
    delivered: list.filter((i) => i.deliveredAt).length,
    opened: list.filter((i) => i.openedAt).length,
    accepted: list.filter((i) => i.status === "accepted").length,
    declined: list.filter((i) => i.status === "declined").length,
    pending: list.filter((i) => i.status === "pending").length,
  };

  const funnelCards: { key: keyof typeof funnel; icon: React.ReactNode; color: string }[] = [
    { key: "sent", icon: <Send size={15} strokeWidth={1.5} />, color: T.castleHill },
    { key: "delivered", icon: <MailCheck size={15} strokeWidth={1.5} />, color: T.calmTeal },
    { key: "opened", icon: <Eye size={15} strokeWidth={1.5} />, color: T.mediumWood },
    { key: "accepted", icon: <CheckCircle2 size={15} strokeWidth={1.5} />, color: T.mangrove },
    { key: "declined", icon: <XCircle size={15} strokeWidth={1.5} />, color: "#DC2626" },
    { key: "pending", icon: <Clock size={15} strokeWidth={1.5} />, color: T.warmGray },
  ];

  function statusBadge(status: string) {
    if (status === "accepted") return { color: T.mangrove, text: t("pages.commandCenter.invitations.statusAccepted") };
    if (status === "declined") return { color: "#DC2626", text: t("pages.commandCenter.invitations.statusDeclined") };
    return { color: T.warmGray, text: t("pages.commandCenter.invitations.statusPending") };
  }

  const guestsByInvitation = (invitationId: number) =>
    (guests ?? []).filter((g) => g.invitationId === invitationId);

  return (
    <div className="space-y-6">
      {/* Header + compose */}
      <div className="flex items-start justify-between gap-4">
        <Dialog open={isOpen} onOpenChange={(o) => { setIsOpen(o); if (!o) resetForm(); }}>
          <DialogTrigger asChild>
            <button
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:shadow-sm"
              style={{ background: T.mangrove, color: "#fff" }}
            >
              {t("pages.commandCenter.invitations.newInvite")} <Plus size={15} strokeWidth={2} />
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[560px]" dir={dir}>
            <DialogHeader>
              <DialogTitle className={dir === "rtl" ? "text-end" : "text-start"}>
                {t("pages.commandCenter.invitations.composeTitle")}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              {/* mode toggle */}
              <div>
                <Label className="block text-sm mb-1.5">{t("pages.commandCenter.invitations.mode")}</Label>
                <div className="flex gap-2">
                  {(["individual", "delegation"] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMode(m)}
                      className="flex-1 px-3 py-2 rounded-xl text-sm font-medium border transition-all"
                      style={mode === m
                        ? { background: T.mangrove, color: "#fff", borderColor: T.mangrove }
                        : { borderColor: T.border, color: T.castleHill }}
                    >
                      {m === "individual"
                        ? t("pages.commandCenter.invitations.modeIndividual")
                        : t("pages.commandCenter.invitations.modeDelegation")}
                    </button>
                  ))}
                </div>
              </div>

              {mode === "individual" ? (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="block text-sm">{t("pages.commandCenter.invitations.guestNameAr")}</Label>
                    <Input value={form.guestNameAr} onChange={(e) => setForm({ ...form, guestNameAr: e.target.value })} dir="rtl" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="block text-sm">{t("pages.commandCenter.invitations.guestNameEn")}</Label>
                    <Input value={form.guestName} onChange={(e) => setForm({ ...form, guestName: e.target.value })} dir="ltr" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="block text-sm">{t("pages.commandCenter.invitations.organization")}</Label>
                    <Input value={form.organization} onChange={(e) => setForm({ ...form, organization: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="block text-sm">{t("pages.commandCenter.invitations.jobTitle")}</Label>
                    <Input value={form.jobTitle} onChange={(e) => setForm({ ...form, jobTitle: e.target.value })} />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="block text-sm">{t("pages.commandCenter.invitations.delegationNameAr")}</Label>
                    <Input value={form.delegationNameAr} onChange={(e) => setForm({ ...form, delegationNameAr: e.target.value })} dir="rtl" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="block text-sm">{t("pages.commandCenter.invitations.delegationNameEn")}</Label>
                    <Input value={form.delegationName} onChange={(e) => setForm({ ...form, delegationName: e.target.value })} dir="ltr" />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="block text-sm">{t("pages.commandCenter.invitations.email")}</Label>
                  <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} dir="ltr" />
                </div>
                <div className="space-y-1.5">
                  <Label className="block text-sm">{t("pages.commandCenter.invitations.mobile")}</Label>
                  <Input value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} dir="ltr" />
                </div>
              </div>

              {mode === "individual" && (
                <div className="space-y-1.5">
                  <Label className="block text-sm">{t("pages.commandCenter.invitations.inviteType")}</Label>
                  <div className="flex flex-wrap gap-2">
                    {INVITE_TYPES.filter((tp) => tp !== "delegation").map((tp) => (
                      <button
                        key={tp}
                        type="button"
                        onClick={() => setInviteType(tp)}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium border transition-all"
                        style={inviteType === tp
                          ? { background: T.mediumWood, color: "#fff", borderColor: T.mediumWood }
                          : { borderColor: T.border, color: T.castleHill }}
                      >
                        {t(`pages.commandCenter.invitations.type${tp.charAt(0).toUpperCase() + tp.slice(1)}`)}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <Label className="block text-sm">{t("pages.commandCenter.invitations.channel")}</Label>
                <div className="flex gap-2">
                  {CHANNELS.map((ch) => (
                    <button
                      key={ch}
                      type="button"
                      onClick={() => setChannel(ch)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium border transition-all"
                      style={channel === ch
                        ? { background: T.calmTeal, color: "#fff", borderColor: T.calmTeal }
                        : { borderColor: T.border, color: T.castleHill }}
                    >
                      {t(`pages.commandCenter.invitations.channel${ch.charAt(0).toUpperCase() + ch.slice(1)}`)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-start gap-3 pt-2 border-t border-border">
                <Button
                  type="button"
                  disabled={createInvitation.isPending || (mode === "individual" ? !form.guestName : !form.delegationName)}
                  onClick={onSubmit}
                  className="rounded-xl px-6"
                >
                  {t("pages.commandCenter.invitations.send")}
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
            {t("pages.commandCenter.invitations.title")}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {t("pages.commandCenter.invitations.subtitle")}
          </p>
        </div>
      </div>

      {/* Funnel dashboard */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {funnelCards.map((c) => (
          <div
            key={c.key}
            className="rounded-2xl border p-4 text-end"
            style={{ borderColor: T.border, background: T.cardBg }}
          >
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: c.color + "18", color: c.color }}>
                {c.icon}
              </div>
              <span className="text-2xl font-bold" style={{ color: c.color, fontFamily: "Georgia, serif" }}>
                {funnel[c.key]}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {t(`pages.commandCenter.invitations.funnel.${c.key}`)}
            </p>
          </div>
        ))}
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-px">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
        </div>
      ) : list.length === 0 ? (
        <div className="rounded-2xl border text-center py-16 text-muted-foreground" style={{ borderColor: T.border, background: T.cardBg }}>
          <Mail size={36} className="mx-auto mb-3 opacity-15" />
          <p className="text-sm">{t("pages.commandCenter.invitations.empty")}</p>
        </div>
      ) : (
        <div className="rounded-2xl border overflow-hidden" style={{ borderColor: T.border, background: T.cardBg }}>
          {list.map((inv, idx) => {
            const st = statusBadge(inv.status);
            const memberList = guestsByInvitation(inv.id);
            const isExpanded = expanded === inv.id;
            const displayName = lang === "en"
              ? (inv.guestName || inv.guestNameAr || "")
              : (inv.guestNameAr || inv.guestName || "");
            return (
              <div key={inv.id} style={{ borderBottom: idx < list.length - 1 ? `1px solid ${T.border}` : "none" }}>
                <motion.div
                  className="flex items-center justify-between px-5 py-4 hover:bg-muted/30 transition-colors gap-3"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                >
                  <div className="flex items-center gap-2 shrink-0">
                    {/* check-in actions */}
                    <button
                      onClick={() => toggleAttended(inv)}
                      title={inv.attended ? t("pages.commandCenter.invitations.checkIn.attended") : t("pages.commandCenter.invitations.checkIn.markAttended")}
                      className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                      style={inv.attended
                        ? { background: T.mangrove, color: "#fff" }
                        : { background: T.mangrove + "12", color: T.mangrove }}
                    >
                      <CheckCircle2 size={15} strokeWidth={1.5} />
                    </button>
                    <button
                      onClick={() => toggleVip(inv)}
                      title={inv.vipVerified ? t("pages.commandCenter.invitations.checkIn.vipVerified") : t("pages.commandCenter.invitations.checkIn.vipVerify")}
                      className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                      style={inv.vipVerified
                        ? { background: T.mediumWood, color: "#fff" }
                        : { background: T.mediumWood + "12", color: T.mediumWood }}
                    >
                      <ShieldCheck size={15} strokeWidth={1.5} />
                    </button>
                    <button
                      onClick={() => copyLink(inv.publicToken)}
                      title={t("pages.commandCenter.invitations.copyLink")}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                    >
                      <Link2 size={15} strokeWidth={1.5} />
                    </button>
                    <button
                      onClick={() => setQrInvite(inv)}
                      title={t("pages.commandCenter.invitations.viewQr")}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                    >
                      <QrCode size={15} strokeWidth={1.5} />
                    </button>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: st.color }} />
                      <span className="text-xs font-medium" style={{ color: st.color }}>{st.text}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-1 min-w-0 justify-end">
                    <div className="text-end min-w-0">
                      <div className="flex items-center gap-2 justify-end">
                        {inv.isDelegation && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-md font-medium" style={{ background: T.calmTeal + "22", color: T.calmTeal }}>
                            {t("pages.commandCenter.invitations.typeDelegation")}
                          </span>
                        )}
                        <p className="text-sm font-semibold text-foreground truncate">{displayName}</p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {t(`pages.commandCenter.invitations.channel${inv.channel.charAt(0).toUpperCase() + inv.channel.slice(1)}`)}
                      </p>
                    </div>
                    <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: T.calmTeal + "18", color: T.calmTeal }}>
                      {inv.isDelegation ? <Users size={15} strokeWidth={1.5} /> : <Mail size={15} strokeWidth={1.5} />}
                    </div>
                  </div>
                </motion.div>

                {inv.isDelegation && (
                  <div className="px-5 pb-2">
                    <button
                      onClick={() => setExpanded(isExpanded ? null : inv.id)}
                      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors ms-auto"
                    >
                      {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                      {t("pages.commandCenter.invitations.members")} ({memberList.length})
                    </button>
                    {isExpanded && (
                      <div className="mt-2 space-y-1.5 pb-3">
                        {memberList.length === 0 && (
                          <p className="text-xs text-muted-foreground text-end py-2">
                            {t("pages.commandCenter.invitations.noMembers")}
                          </p>
                        )}
                        {memberList.map((g) => (
                          <div key={g.id} className="flex items-center justify-between rounded-xl px-3 py-2" style={{ background: T.pageBg }}>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => toggleGuestAttended(g)}
                                className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                                style={g.attended ? { background: T.mangrove, color: "#fff" } : { background: T.mangrove + "12", color: T.mangrove }}
                              >
                                <CheckCircle2 size={13} strokeWidth={1.5} />
                              </button>
                              <button
                                onClick={() => toggleGuestVip(g)}
                                className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                                style={g.vipVerified ? { background: T.mediumWood, color: "#fff" } : { background: T.mediumWood + "12", color: T.mediumWood }}
                              >
                                <ShieldCheck size={13} strokeWidth={1.5} />
                              </button>
                            </div>
                            <div className="text-end">
                              <p className="text-sm text-foreground">{lang === "en" ? (g.fullName || g.fullNameAr) : (g.fullNameAr || g.fullName)}</p>
                              {g.nationality && <p className="text-xs text-muted-foreground flex items-center gap-1.5"><CountryFlag value={g.nationality} size={11} /> {g.nationality}</p>}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* QR dialog */}
      <Dialog open={!!qrInvite} onOpenChange={(o) => { if (!o) setQrInvite(null); }}>
        <DialogContent className="sm:max-w-[360px]" dir={dir}>
          <DialogHeader>
            <DialogTitle className="text-center">{t("pages.commandCenter.invitations.qrTitle")}</DialogTitle>
          </DialogHeader>
          {qrInvite && (
            <div className="flex flex-col items-center gap-4 py-2">
              <div className="p-4 rounded-2xl border" style={{ borderColor: T.border, background: "#fff" }}>
                <QRCodeSVG value={publicRsvpUrl(qrInvite.publicToken)} size={196} fgColor={T.textPrimary} level="M" />
              </div>
              <p className="text-xs text-muted-foreground font-mono">{qrInvite.qrCode}</p>
              <Button variant="outline" onClick={() => copyLink(qrInvite.publicToken)} className="rounded-xl w-full">
                <Link2 size={14} className="me-2" /> {t("pages.commandCenter.invitations.copyLink")}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
