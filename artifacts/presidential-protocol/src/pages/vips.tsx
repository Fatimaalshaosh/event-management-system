import { palette } from "@/theme";
import { Layout } from "@/components/layout";
import { useListVips, useCreateVip } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Crown, Search, Plus, Flag, Shield } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/i18n/language-context";
import { useUrlSearchState } from "@/lib/url-search";

const T = palette;

const vipSchema = z.object({
  nameAr: z.string().min(2),
  name: z.string().min(2),
  titleAr: z.string().min(2),
  title: z.string().min(2),
  countryAr: z.string().min(2),
  country: z.string().min(2),
  clearanceLevel: z.string(),
});
type VipFormValues = z.infer<typeof vipSchema>;

export default function Vips() {
  const [search, setSearch] = useUrlSearchState("/vips");
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();
  const { lang, dir } = useLanguage();
  const { data: vips, isLoading } = useListVips();
  const createVip = useCreateVip();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  function clearanceBadge(level: string) {
    const map: Record<string, { text: string; color: string }> = {
      high: { text: t("pages.vips.clearanceHigh"), color: "#DC2626" },
      standard: { text: t("pages.vips.clearanceStandard"), color: T.warmGray },
      vip: { text: t("pages.vips.clearanceVip"), color: T.mediumWood },
    };
    return map[level.toLowerCase()] ?? { text: level, color: T.warmGray };
  }

  const form = useForm<VipFormValues>({
    resolver: zodResolver(vipSchema),
    defaultValues: { nameAr: "", name: "", titleAr: "", title: "", countryAr: "", country: "", clearanceLevel: "standard" },
  });

  const onSubmit = (data: VipFormValues) => {
    createVip.mutate(
      { data },
      {
        onSuccess: () => {
          toast({ title: t("pages.vips.addedToast"), description: t("pages.vips.addedDesc") });
          queryClient.invalidateQueries({ queryKey: ["/api/vips"] });
          setIsOpen(false);
          form.reset();
        },
        onError: () => {
          toast({ title: t("common.error"), description: t("pages.vips.addError"), variant: "destructive" });
        },
      }
    );
  };

  const filtered = vips?.filter(
    (v) =>
      v.name.toLowerCase().includes(search.toLowerCase()) ||
      v.nameAr?.includes(search) ||
      v.title.toLowerCase().includes(search.toLowerCase()) ||
      v.titleAr?.includes(search)
  );

  return (
    <Layout>
      <div className="space-y-8 pb-12">

        <div className="flex items-start justify-between">
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <button
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:shadow-sm mt-1"
                style={{ background: T.mangrove, color: "#fff" }}
              >
                {t("pages.vips.addVip")} <Plus size={15} strokeWidth={2} />
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[560px]" dir={dir}>
              <DialogHeader>
                <DialogTitle className={dir === "rtl" ? "text-end" : "text-start"}>{t("pages.vips.addDialogTitle")}</DialogTitle>
                <DialogDescription className={dir === "rtl" ? "text-end" : "text-start"}>
                  {t("pages.vips.addDialogDesc")}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="block text-sm">{t("pages.vips.nameAr")}</Label>
                    <Input {...form.register("nameAr")} dir="rtl" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="block text-sm">{t("pages.vips.nameEn")}</Label>
                    <Input {...form.register("name")} dir="ltr" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="block text-sm">{t("pages.vips.titleAr")}</Label>
                    <Input {...form.register("titleAr")} dir="rtl" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="block text-sm">{t("pages.vips.titleEn")}</Label>
                    <Input {...form.register("title")} dir="ltr" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="block text-sm">{t("pages.vips.countryAr")}</Label>
                    <Input {...form.register("countryAr")} dir="rtl" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="block text-sm">{t("pages.vips.countryEn")}</Label>
                    <Input {...form.register("country")} dir="ltr" />
                  </div>
                </div>
                <div className="flex justify-start gap-3 pt-2 border-t border-border">
                  <Button type="submit" disabled={createVip.isPending} className="rounded-xl px-6">
                    {t("common.save")}
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
              {t("pages.vips.title")}
            </h1>
            <p className="text-sm text-muted-foreground mt-1.5">
              {t("pages.vips.subtitle")}
            </p>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute end-4 top-1/2 -translate-y-1/2 text-muted-foreground/50" size={16} strokeWidth={1.5} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("pages.vips.searchPh")}
            className="w-full h-11 rounded-2xl border border-border bg-card pe-12 ps-5 text-sm placeholder:text-muted-foreground/40 outline-none focus:ring-1 focus:ring-primary/30 transition-all"
          />
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-36 w-full rounded-2xl" />
            ))}
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.35 }}
          >
            {filtered?.length === 0 && (
              <div className="col-span-full text-center py-16 text-muted-foreground">
                <Crown size={36} className="mx-auto mb-3 opacity-15" />
                <p className="text-sm">{t("pages.vips.empty")}</p>
              </div>
            )}

            {filtered?.map((vip, idx) => {
              const cl = clearanceBadge(vip.clearanceLevel);
              const displayName = (lang === "en" ? (vip.name || vip.nameAr) : (vip.nameAr || vip.name)) ?? "";
              const displayTitle = lang === "en" ? (vip.title || vip.titleAr) : (vip.titleAr || vip.title);
              const displayCountry = lang === "en" ? (vip.country || vip.countryAr) : (vip.countryAr || vip.country);
              const initials = displayName.slice(0, 2);
              return (
                <motion.div
                  key={vip.id}
                  className="rounded-2xl border p-5 cursor-pointer transition-all hover:shadow-sm"
                  style={{ borderColor: T.border, background: T.cardBg }}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04 }}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                      style={{ background: T.mangrove + "18", color: T.mangrove }}
                    >
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0 text-end">
                      <p className="font-semibold text-foreground truncate">{displayName}</p>
                      <p className="text-xs mt-0.5 font-medium" style={{ color: T.mangrove }}>
                        {displayTitle}
                      </p>
                      <div className="mt-3 space-y-1.5 text-xs text-muted-foreground">
                        <div className="flex items-center justify-end gap-1.5">
                          <span>{displayCountry}</span>
                          <Flag size={11} strokeWidth={1.5} />
                        </div>
                        <div className="flex items-center justify-end gap-1.5">
                          <span style={{ color: cl.color }} className="font-medium">{cl.text}</span>
                          <Shield size={11} strokeWidth={1.5} />
                        </div>
                      </div>
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
