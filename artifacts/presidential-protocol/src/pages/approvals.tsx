import { palette } from "@/theme";
import { Layout } from "@/components/layout";
import { useListApprovals, useUpdateApproval } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckSquare, Check, X, Clock, Search, ListFilter } from "lucide-react";
import { ExecutiveAvatar } from "@/components/identity";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/i18n/language-context";
import { useUrlSearchState } from "@/lib/url-search";
import { useState } from "react";

const T = palette;

type StatusFilter = "all" | "pending" | "approved" | "rejected";

export default function Approvals() {
  const { t } = useTranslation();
  const { lang } = useLanguage();
  const [search, setSearch] = useUrlSearchState("/approvals");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const { data: approvals, isLoading } = useListApprovals();
  const updateApproval = useUpdateApproval();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const locale = lang === "en" ? "en-AE" : "ar-AE";

  const handleAction = (id: number, status: "approved" | "rejected") => {
    updateApproval.mutate(
      { id, data: { status } },
      {
        onSuccess: () => {
          toast({
            title: t("dashboard.toasts.updated"),
            description: status === "approved" ? t("dashboard.toasts.approvedDesc") : t("dashboard.toasts.rejectedDesc"),
          });
          queryClient.invalidateQueries({ queryKey: ["/api/approvals"] });
        },
        onError: () => {
          toast({ title: t("common.error"), description: t("pages.approvals.updateError"), variant: "destructive" });
        },
      }
    );
  };

  const q = search.trim().toLowerCase();
  const matchesSearch = (a: NonNullable<typeof approvals>[number]) => {
    if (!q) return true;
    return (
      a.title?.toLowerCase().includes(q) ||
      a.titleAr?.toLowerCase().includes(q) ||
      a.requestedBy?.toLowerCase().includes(q)
    );
  };
  const matchesStatus = (a: NonNullable<typeof approvals>[number]) =>
    statusFilter === "all" ? true : a.status === statusFilter;

  const isFiltering = q.length > 0 || statusFilter !== "all";
  const visible = approvals?.filter((a) => matchesSearch(a) && matchesStatus(a)) ?? [];
  const pending = visible.filter((a) => a.status === "pending");
  const decided = visible.filter((a) => a.status !== "pending");

  const showPending = statusFilter === "all" || statusFilter === "pending";
  const showDecided = statusFilter === "all" || statusFilter === "approved" || statusFilter === "rejected";
  const decidedToShow = isFiltering ? decided : decided.slice(0, 6);

  const filterOptions: { value: StatusFilter; label: string }[] = [
    { value: "all", label: t("pages.approvals.filterAll") },
    { value: "pending", label: t("pages.approvals.filterPending") },
    { value: "approved", label: t("pages.approvals.filterApproved") },
    { value: "rejected", label: t("pages.approvals.filterRejected") },
  ];

  return (
    <Layout>
      <div className="space-y-8 pb-12">

        <div className="text-end">
          <h1 className="text-4xl font-bold text-foreground" style={{ fontFamily: "Georgia, serif" }}>
            {t("pages.approvals.title")}
          </h1>
          <p className="text-sm text-muted-foreground mt-1.5">
            {t("pages.approvals.subtitle")}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute end-4 top-1/2 -translate-y-1/2 text-muted-foreground/50" size={16} strokeWidth={1.5} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("pages.approvals.searchPh")}
              className="w-full h-11 rounded-2xl border border-border bg-card pe-12 ps-5 text-sm placeholder:text-muted-foreground/40 outline-none focus:ring-1 focus:ring-primary/30 transition-all"
            />
          </div>
          <div className="relative sm:w-56">
            <ListFilter className="absolute end-4 top-1/2 -translate-y-1/2 text-muted-foreground/50 pointer-events-none" size={16} strokeWidth={1.5} />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="w-full h-11 rounded-2xl border border-border bg-card pe-12 ps-5 text-sm text-foreground outline-none focus:ring-1 focus:ring-primary/30 transition-all appearance-none cursor-pointer"
            >
              {filterOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-2xl" />
            ))}
          </div>
        ) : visible.length === 0 ? (
          <div
            className="rounded-2xl border border-dashed py-14 text-center"
            style={{ borderColor: T.border }}
          >
            <CheckSquare size={32} className="mx-auto mb-3 opacity-15 text-foreground" />
            <p className="text-sm text-muted-foreground">
              {isFiltering ? t("pages.approvals.empty") : t("pages.approvals.noPending")}
            </p>
          </div>
        ) : (
          <>
            {showPending && (
              <section className="space-y-4">
                <div className="flex items-center gap-2 justify-end">
                  <h2 className="text-base font-semibold text-foreground">{t("pages.approvals.awaitingReview")}</h2>
                  <span
                    className="text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center"
                    style={{ background: T.mediumWood + "22", color: T.mediumWood }}
                  >
                    {pending.length}
                  </span>
                </div>

                {pending.length === 0 ? (
                  <div
                    className="rounded-2xl border border-dashed py-14 text-center"
                    style={{ borderColor: T.border }}
                  >
                    <CheckSquare size={32} className="mx-auto mb-3 opacity-15 text-foreground" />
                    <p className="text-sm text-muted-foreground">
                      {isFiltering ? t("pages.approvals.empty") : t("pages.approvals.noPending")}
                    </p>
                  </div>
                ) : (
                  <motion.div
                    className="rounded-2xl border overflow-hidden"
                    style={{ borderColor: T.border, background: T.cardBg }}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {pending.map((approval, idx) => (
                      <motion.div
                        key={approval.id}
                        className="flex items-center gap-5 px-6 py-5"
                        style={{ borderBottom: idx < pending.length - 1 ? `1px solid ${T.border}` : "none" }}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                      >
                        <div className="flex flex-col gap-1.5 shrink-0">
                          <button
                            onClick={() => handleAction(approval.id, "approved")}
                            disabled={updateApproval.isPending}
                            className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-105 disabled:opacity-40"
                            style={{ background: T.mangrove, color: "#fff" }}
                            title={t("pages.approvals.approve")}
                          >
                            <Check size={14} />
                          </button>
                          <button
                            onClick={() => handleAction(approval.id, "rejected")}
                            disabled={updateApproval.isPending}
                            className="w-8 h-8 rounded-full flex items-center justify-center border transition-all hover:scale-105 disabled:opacity-40"
                            style={{ borderColor: T.border, color: T.warmGray }}
                            title={t("pages.approvals.reject")}
                          >
                            <X size={14} />
                          </button>
                        </div>

                        <div className="flex-1 text-end min-w-0">
                          <p className="text-sm font-semibold text-foreground leading-snug">
                            {lang === "en" ? (approval.title || approval.titleAr) : (approval.titleAr || approval.title)}
                          </p>
                          <div className="flex items-center justify-end gap-2 mt-1 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock size={11} />
                              {new Date(approval.createdAt).toLocaleDateString(locale)}
                            </span>
                            <span className="opacity-40">·</span>
                            <span className="flex items-center gap-1.5"><ExecutiveAvatar identity={{ name: approval.requestedBy || "—" }} size="xs" hover={false} />{approval.requestedBy}</span>
                          </div>
                          {approval.notes && (
                            <p className="text-xs text-muted-foreground mt-1.5 line-clamp-1 bg-muted/30 rounded-lg px-2 py-1 text-end">
                              {approval.notes}
                            </p>
                          )}
                        </div>

                        <div className="w-2 h-2 rounded-full shrink-0" style={{ background: T.mediumWood }} />
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </section>
            )}

            {showDecided && decidedToShow.length > 0 && (
              <section className="space-y-3 pt-2 border-t border-border">
                <h2 className="text-sm font-semibold text-muted-foreground text-end pt-4">{t("pages.approvals.latestDecisions")}</h2>
                <div
                  className="rounded-2xl border overflow-hidden"
                  style={{ borderColor: T.border, background: T.cardBg }}
                >
                  {decidedToShow.map((approval, idx) => (
                    <div
                      key={approval.id}
                      className="flex items-center justify-between px-6 py-4 opacity-75 hover:opacity-100 transition-opacity"
                      style={{ borderBottom: idx < decidedToShow.length - 1 ? `1px solid ${T.border}` : "none" }}
                    >
                      <div className="flex items-center gap-3 shrink-0">
                        <span
                          className="text-xs px-2.5 py-1 rounded-full font-medium"
                          style={
                            approval.status === "approved"
                              ? { background: T.mangrove + "1A", color: T.mangrove }
                              : { background: "#DC262618", color: "#DC2626" }
                          }
                        >
                          {approval.status === "approved" ? t("pages.approvals.approved") : t("pages.approvals.rejected")}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 flex-1 justify-end text-end">
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {lang === "en" ? (approval.title || approval.titleAr) : (approval.titleAr || approval.title)}
                          </p>
                          <p className="text-xs text-muted-foreground">{approval.requestedBy}</p>
                        </div>
                        <ExecutiveAvatar identity={{ name: approval.requestedBy || "—" }} size="sm" hover={false} />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}
