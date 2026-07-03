import { palette } from "@/theme";
import { Layout } from "@/components/layout";
import { useListInvitations, useCreateInvitation } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Mail, QrCode, Search, Send, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/i18n/language-context";
import { useUrlSearchState } from "@/lib/url-search";

const T = palette;

const invitationSchema = z.object({
  guestNameAr: z.string().min(2),
  guestName: z.string().min(2),
  email: z.string().email(),
  eventId: z.number().min(1),
});
type InvitationFormValues = z.infer<typeof invitationSchema>;

export default function Invitations() {
  const [search, setSearch] = useUrlSearchState("/invitations");
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();
  const { lang, dir } = useLanguage();
  const { data: invitations, isLoading } = useListInvitations();
  const createInvitation = useCreateInvitation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  function statusDot(status: string) {
    if (status === "confirmed") return { color: T.mangrove, text: t("status.confirmed") };
    if (status === "sent") return { color: T.calmTeal, text: t("status.sent") };
    return { color: T.warmGray, text: status };
  }

  const form = useForm<InvitationFormValues>({
    resolver: zodResolver(invitationSchema),
    defaultValues: { guestNameAr: "", guestName: "", email: "", eventId: 1 },
  });

  const onSubmit = (data: InvitationFormValues) => {
    createInvitation.mutate(
      { data },
      {
        onSuccess: () => {
          toast({ title: t("pages.invitations.sentToast"), description: t("pages.invitations.sentDesc") });
          queryClient.invalidateQueries({ queryKey: ["/api/invitations"] });
          setIsOpen(false);
          form.reset();
        },
      }
    );
  };

  const filtered = invitations?.filter(
    (i) => i.guestNameAr?.includes(search) || i.guestName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout>
      <div className="space-y-8 pb-12">

        <div className="flex items-start justify-between">
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <button
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium mt-1 hover:shadow-sm transition-all"
                style={{ background: T.mangrove, color: "#fff" }}
              >
                {t("pages.invitations.newInvite")} <Plus size={15} strokeWidth={2} />
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[420px]" dir={dir}>
              <DialogHeader>
                <DialogTitle className={dir === "rtl" ? "text-end" : "text-start"}>{t("pages.invitations.sendDialogTitle")}</DialogTitle>
              </DialogHeader>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <Label className="block text-sm">{t("pages.invitations.guestNameAr")}</Label>
                  <Input {...form.register("guestNameAr")} dir="rtl" />
                </div>
                <div className="space-y-1.5">
                  <Label className="block text-sm">{t("pages.invitations.guestNameEn")}</Label>
                  <Input {...form.register("guestName")} dir="ltr" />
                </div>
                <div className="space-y-1.5">
                  <Label className="block text-sm">{t("pages.invitations.email")}</Label>
                  <Input type="email" {...form.register("email")} dir="ltr" />
                </div>
                <div className="flex justify-start gap-3 pt-2 border-t border-border">
                  <Button type="submit" disabled={createInvitation.isPending} className="rounded-xl px-6">
                    {t("pages.invitations.sendInvite")}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setIsOpen(false)} className="rounded-xl px-5">
                    {t("common.cancel")}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          <div className="text-end">
            <h1 className="text-4xl font-bold text-foreground" style={{ fontFamily: "Georgia, serif" }}>
              {t("pages.invitations.title")}
            </h1>
            <p className="text-sm text-muted-foreground mt-1.5">
              {t("pages.invitations.subtitle")}
            </p>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute end-4 top-1/2 -translate-y-1/2 text-muted-foreground/50" size={16} strokeWidth={1.5} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("pages.invitations.searchPh")}
            className="w-full h-11 rounded-2xl border border-border bg-card pe-12 ps-5 text-sm placeholder:text-muted-foreground/40 outline-none focus:ring-1 focus:ring-primary/30 transition-all"
          />
        </div>

        {isLoading ? (
          <div className="space-y-px">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : (
          <motion.div
            className="rounded-2xl border overflow-hidden"
            style={{ borderColor: T.border, background: T.cardBg }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {filtered?.length === 0 && (
              <div className="text-center py-16 text-muted-foreground">
                <Mail size={36} className="mx-auto mb-3 opacity-15" />
                <p className="text-sm">{t("pages.invitations.empty")}</p>
              </div>
            )}

            {filtered?.map((inv, idx) => {
              const st = statusDot(inv.status);
              return (
                <motion.div
                  key={inv.id}
                  className="flex items-center justify-between px-6 py-4 hover:bg-muted/30 transition-colors"
                  style={{ borderBottom: idx < (filtered.length - 1) ? `1px solid ${T.border}` : "none" }}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                      style={{ background: T.calmTeal + "20", color: T.calmTeal }}
                    >
                      <Mail size={15} strokeWidth={1.5} />
                    </div>
                    <div className="text-end min-w-0">
                      <p className="text-sm font-semibold text-foreground">
                        {lang === "en" ? (inv.guestName || inv.guestNameAr) : (inv.guestNameAr || inv.guestName)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5" dir="ltr">
                        {inv.email || "—"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: st.color }} />
                      <span className="text-xs font-medium" style={{ color: st.color }}>{st.text}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {inv.qrCode && (
                        <button
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                          title={t("pages.invitations.qrTitle")}
                        >
                          <QrCode size={14} strokeWidth={1.5} />
                        </button>
                      )}
                      <button
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                        title={t("pages.invitations.resendTitle")}
                      >
                        <Send size={14} strokeWidth={1.5} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </Layout>
  );
}
