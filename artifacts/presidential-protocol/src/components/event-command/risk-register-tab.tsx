import { palette } from "@/theme";
import { useState } from "react";
import {
  useListEventRisks,
  useCreateRisk,
  useUpdateRisk,
  useDeleteRisk,
  getListEventRisksQueryKey,
  type Risk,
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
import { Plus, ShieldAlert, Trash2, Shield, Activity, User } from "lucide-react";

const T = palette;

const SEVERITIES = ["critical", "high", "medium", "low"] as const;
const LIKELIHOODS = ["rare", "unlikely", "possible", "likely", "almostCertain"] as const;
const CATEGORIES = ["operational", "security", "protocol", "logistics", "reputational", "medical", "weather"] as const;
const STATUSES = ["open", "monitoring", "mitigated", "closed", "accepted"] as const;

function severityStyle(s: string) {
  if (s === "critical") return { background: "#DC262615", color: "#DC2626" };
  if (s === "high") return { background: T.mediumWood + "22", color: T.mediumWood };
  if (s === "medium") return { background: T.calmTeal + "22", color: T.calmTeal };
  return { background: T.warmGray + "1A", color: T.warmGray };
}

function statusStyle(s: string) {
  if (s === "open") return { background: "#DC262610", color: "#DC2626" };
  if (s === "monitoring") return { background: T.sunset + "55", color: T.mediumWood };
  if (s === "mitigated") return { background: T.mangrove + "1A", color: T.mangrove };
  if (s === "accepted") return { background: T.calmTeal + "1A", color: T.calmTeal };
  return { background: T.warmGray + "1A", color: T.warmGray };
}

export function RiskRegisterTab({ eventId }: { eventId: number }) {
  const { t } = useTranslation();
  const { lang, dir } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: risks, isLoading } = useListEventRisks(eventId, {
    query: { queryKey: getListEventRisksQueryKey(eventId) },
  });
  const createRisk = useCreateRisk();
  const updateRisk = useUpdateRisk();
  const deleteRisk = useDeleteRisk();

  const [isOpen, setIsOpen] = useState(false);
  const [severity, setSeverity] = useState<(typeof SEVERITIES)[number]>("medium");
  const [likelihood, setLikelihood] = useState<(typeof LIKELIHOODS)[number]>("possible");
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("operational");
  const [form, setForm] = useState({
    title: "", titleAr: "", description: "", descriptionAr: "", impact: "", mitigation: "", owner: "",
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: getListEventRisksQueryKey(eventId) });

  const resetForm = () => {
    setForm({ title: "", titleAr: "", description: "", descriptionAr: "", impact: "", mitigation: "", owner: "" });
    setSeverity("medium");
    setLikelihood("possible");
    setCategory("operational");
  };

  const onMutationError = () => toast({ title: t("common.error"), variant: "destructive" });

  const onSubmit = () => {
    createRisk.mutate(
      {
        data: {
          eventId,
          title: form.title,
          titleAr: form.titleAr || undefined,
          description: form.description || undefined,
          descriptionAr: form.descriptionAr || undefined,
          category,
          severity,
          likelihood,
          impact: form.impact || undefined,
          mitigation: form.mitigation || undefined,
          owner: form.owner || undefined,
          status: "open",
        },
      },
      {
        onSuccess: () => {
          toast({ title: t("pages.commandCenter.risks.addedToast") });
          invalidate();
          setIsOpen(false);
          resetForm();
        },
        onError: onMutationError,
      },
    );
  };

  const cycleStatus = (r: Risk) => {
    const idx = STATUSES.indexOf(r.status as (typeof STATUSES)[number]);
    const next = STATUSES[(idx + 1) % STATUSES.length];
    updateRisk.mutate({ id: r.id, data: { status: next } }, { onSuccess: invalidate, onError: onMutationError });
  };

  const remove = (r: Risk) => {
    deleteRisk.mutate({ id: r.id }, {
      onSuccess: () => { toast({ title: t("pages.commandCenter.risks.removed") }); invalidate(); },
      onError: onMutationError,
    });
  };

  const list = risks ?? [];
  const counts = SEVERITIES.map((s) => ({ s, n: list.filter((r) => r.severity === s).length }));
  const openCount = list.filter((r) => r.status === "open" || r.status === "monitoring").length;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <Dialog open={isOpen} onOpenChange={(o) => { setIsOpen(o); if (!o) resetForm(); }}>
          <DialogTrigger asChild>
            <button
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:shadow-sm"
              style={{ background: T.mangrove, color: "#fff" }}
            >
              {t("pages.commandCenter.risks.add")} <Plus size={15} strokeWidth={2} />
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[560px]" dir={dir}>
            <DialogHeader>
              <DialogTitle className={dir === "rtl" ? "text-end" : "text-start"}>
                {t("pages.commandCenter.risks.addTitle")}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div>
                <Label className="block text-sm mb-1.5">{t("pages.commandCenter.risks.severity")}</Label>
                <div className="flex flex-wrap gap-2">
                  {SEVERITIES.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSeverity(s)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium border transition-all"
                      style={severity === s
                        ? { ...severityStyle(s), borderColor: "transparent" }
                        : { borderColor: T.border, color: T.castleHill }}
                    >
                      {t(`pages.commandCenter.risks.sev.${s}`)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label className="block text-sm mb-1.5">{t("pages.commandCenter.risks.likelihood")}</Label>
                <div className="flex flex-wrap gap-2">
                  {LIKELIHOODS.map((l) => (
                    <button
                      key={l}
                      type="button"
                      onClick={() => setLikelihood(l)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium border transition-all"
                      style={likelihood === l
                        ? { background: T.mediumWood, color: "#fff", borderColor: T.mediumWood }
                        : { borderColor: T.border, color: T.castleHill }}
                    >
                      {t(`pages.commandCenter.risks.like.${l}`)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label className="block text-sm mb-1.5">{t("pages.commandCenter.risks.category")}</Label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCategory(c)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium border transition-all"
                      style={category === c
                        ? { background: T.castleHill, color: "#fff", borderColor: T.castleHill }
                        : { borderColor: T.border, color: T.castleHill }}
                    >
                      {t(`pages.commandCenter.risks.cat.${c}`)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="block text-sm">{t("pages.commandCenter.risks.titleAr")}</Label>
                  <Input value={form.titleAr} onChange={(e) => setForm({ ...form, titleAr: e.target.value })} dir="rtl" />
                </div>
                <div className="space-y-1.5">
                  <Label className="block text-sm">{t("pages.commandCenter.risks.titleEn")}</Label>
                  <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} dir="ltr" />
                </div>
                <div className="space-y-1.5">
                  <Label className="block text-sm">{t("pages.commandCenter.risks.owner")}</Label>
                  <Input value={form.owner} onChange={(e) => setForm({ ...form, owner: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label className="block text-sm">{t("pages.commandCenter.risks.impact")}</Label>
                  <Input value={form.impact} onChange={(e) => setForm({ ...form, impact: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="block text-sm">{t("pages.commandCenter.risks.descriptionAr")}</Label>
                  <Input value={form.descriptionAr} onChange={(e) => setForm({ ...form, descriptionAr: e.target.value })} dir="rtl" />
                </div>
                <div className="space-y-1.5">
                  <Label className="block text-sm">{t("pages.commandCenter.risks.descriptionEn")}</Label>
                  <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} dir="ltr" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="block text-sm">{t("pages.commandCenter.risks.mitigation")}</Label>
                <Input value={form.mitigation} onChange={(e) => setForm({ ...form, mitigation: e.target.value })} />
              </div>

              <div className="flex justify-start gap-3 pt-2 border-t border-border">
                <Button type="button" disabled={createRisk.isPending || !form.title} onClick={onSubmit} className="rounded-xl px-6">
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
            {t("pages.commandCenter.risks.title")}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">{t("pages.commandCenter.risks.subtitle")}</p>
        </div>
      </div>

      {/* Severity summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {counts.map(({ s, n }) => (
          <div key={s} className="rounded-2xl border p-4" style={{ borderColor: T.border, background: T.cardBg }}>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold" style={{ fontFamily: "Georgia, serif", color: severityStyle(s).color }}>{n}</span>
              <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={severityStyle(s)}>
                {t(`pages.commandCenter.risks.sev.${s}`)}
              </span>
            </div>
          </div>
        ))}
        <div className="rounded-2xl border p-4" style={{ borderColor: T.border, background: T.cardBg }}>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold" style={{ fontFamily: "Georgia, serif", color: T.castleHill }}>{openCount}</span>
            <span className="flex items-center gap-1 text-xs font-medium" style={{ color: T.castleHill }}>
              {t("pages.commandCenter.risks.openRisks")} <Shield size={12} strokeWidth={1.5} />
            </span>
          </div>
        </div>
      </div>

      {/* Risk cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-36 w-full rounded-2xl" />)}
        </div>
      ) : list.length === 0 ? (
        <div className="rounded-2xl border text-center py-16 text-muted-foreground" style={{ borderColor: T.border, background: T.cardBg }}>
          <ShieldAlert size={36} className="mx-auto mb-3 opacity-15" />
          <p className="text-sm">{t("pages.commandCenter.risks.empty")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {list.map((r, idx) => (
            <motion.div
              key={r.id}
              className="rounded-2xl border p-4"
              style={{ borderColor: T.border, background: T.cardBg }}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.03 }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => remove(r)}
                    title={t("common.delete")}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-[#DC2626] hover:bg-[#DC262610] transition-colors"
                  >
                    <Trash2 size={13} strokeWidth={1.5} />
                  </button>
                  <button
                    onClick={() => cycleStatus(r)}
                    title={t("pages.commandCenter.risks.changeStatus")}
                    className="text-xs px-2.5 py-1 rounded-full font-medium transition-all"
                    style={statusStyle(r.status)}
                  >
                    {t(`pages.commandCenter.risks.st.${r.status}`)}
                  </button>
                </div>
                <div className="text-end min-w-0 flex-1">
                  <div className="flex items-center gap-2 justify-end mb-1">
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={severityStyle(r.severity)}>
                      {t(`pages.commandCenter.risks.sev.${r.severity}`)}
                    </span>
                    <p className="text-sm font-semibold text-foreground truncate">
                      {lang === "en" ? (r.title || r.titleAr) : (r.titleAr || r.title)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 justify-end text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      {t(`pages.commandCenter.risks.like.${r.likelihood}`)}
                      <Activity size={10} strokeWidth={1.5} />
                    </span>
                    <span className="opacity-40">·</span>
                    <span>{t(`pages.commandCenter.risks.cat.${r.category}`)}</span>
                  </div>
                  {(r.description || r.descriptionAr) && (
                    <p className="text-xs mt-2 text-foreground/80">
                      {lang === "en" ? (r.description || r.descriptionAr) : (r.descriptionAr || r.description)}
                    </p>
                  )}
                  {r.impact && (
                    <p className="text-xs mt-2 text-foreground">
                      <span className="font-medium" style={{ color: T.castleHill }}>{t("pages.commandCenter.risks.impact")}: </span>
                      {r.impact}
                    </p>
                  )}
                  {r.mitigation && (
                    <p className="text-xs mt-1 text-muted-foreground">
                      <span className="font-medium" style={{ color: T.mangrove }}>{t("pages.commandCenter.risks.mitigation")}: </span>
                      {r.mitigation}
                    </p>
                  )}
                  {r.owner && (
                    <div className="flex items-center justify-end gap-1 mt-2 text-[11px] text-muted-foreground">
                      <span>{r.owner}</span>
                      <User size={11} strokeWidth={1.5} />
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
