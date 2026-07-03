import { palette } from "@/theme";
import { useState } from "react";
import { useQueryClient, type QueryKey } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/i18n/language-context";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { motion } from "framer-motion";
import { Plus, Trash2, Inbox, ExternalLink, Download, Paperclip, Loader2, Pencil, X, type LucideIcon } from "lucide-react";
import { useUpload } from "@/lib/use-upload";

/* eslint-disable @typescript-eslint/no-explicit-any */

const T = palette;

export interface FieldDef {
  key: string;
  labelKey: string;
  type: "text" | "number" | "select" | "file";
  options?: readonly string[];
  optKey?: string;
  dir?: "rtl" | "ltr";
  required?: boolean;
  half?: boolean;
  /** For file fields: the companion form/db key that stores the original file name. */
  nameKey?: string;
}

export interface DisplayField {
  key: string;
  arKey?: string;
  labelKey: string;
  optKey?: string;
  suffixKey?: string;
  isLink?: boolean;
  /** Render as a download link to a stored object (key holds the object path). */
  isFile?: boolean;
  /** For file display: the key that holds the original file name (used as link text). */
  nameKey?: string;
}

export interface SectionConfig {
  base: string;
  icon: LucideIcon;
  color: string;
  statuses: readonly string[];
  defaultStatus: string;
  statusOptKey: string;
  primaryKey: string;
  primaryArKey?: string;
  fields: FieldDef[];
  display: DisplayField[];
  useList: (eventId: number, opts: any) => { data?: any[]; isLoading: boolean };
  listKey: (eventId: number) => QueryKey;
  useCreate: () => { mutate: (vars: any, opts?: any) => void; isPending: boolean };
  useUpdate: () => { mutate: (vars: any, opts?: any) => void; isPending?: boolean };
  useDelete: () => { mutate: (vars: any, opts?: any) => void };
}

function statusStyle(status: string, color: string) {
  if (status === "cancelled") return { background: "#DC262610", color: "#DC2626" };
  if (status === "delivered" || status === "completed" || status === "paid" || status === "signed" || status === "arrived")
    return { background: T.mangrove + "1A", color: T.mangrove };
  return { background: color + "1A", color };
}

type Mode = "add" | "edit";

export function LogisticsSection({ eventId, config }: { eventId: number; config: SectionConfig }) {
  const { t } = useTranslation();
  const { lang, dir } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading } = config.useList(eventId, { query: { queryKey: config.listKey(eventId) } });
  const create = config.useCreate();
  const update = config.useUpdate();
  const del = config.useDelete();

  const buildInitial = () => {
    const init: Record<string, string> = {};
    for (const f of config.fields) {
      init[f.key] = f.type === "select" && f.options ? f.options[0] : "";
      if (f.type === "file" && f.nameKey) init[f.nameKey] = "";
    }
    return init;
  };

  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("add");
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<Record<string, string>>(buildInitial);
  const { uploadFile, isUploading } = useUpload();

  const invalidate = () => queryClient.invalidateQueries({ queryKey: config.listKey(eventId) });
  const onError = () => toast({ title: t("common.error"), variant: "destructive" });
  const resetForm = () => setForm(buildInitial());

  const tb = (suffix: string) => t(`${config.base}.${suffix}`);
  const tc = (suffix: string) => t(`pages.commandCenter.logistics.common.${suffix}`);

  const openAdd = () => {
    setMode("add");
    setEditId(null);
    resetForm();
    setIsOpen(true);
  };

  const openEdit = (record: any) => {
    setMode("edit");
    setEditId(record.id);
    const next: Record<string, string> = {};
    for (const f of config.fields) {
      const v = record[f.key];
      next[f.key] = v == null ? (f.type === "select" && f.options ? f.options[0] : "") : String(v);
      if (f.type === "file" && f.nameKey) {
        const n = record[f.nameKey];
        next[f.nameKey] = n == null ? "" : String(n);
      }
    }
    setForm(next);
    setIsOpen(true);
  };

  const onFilePick = async (f: FieldDef, file: File) => {
    const res = await uploadFile(file);
    if (!res) {
      onError();
      return;
    }
    setForm((prev) => ({
      ...prev,
      [f.key]: res.objectPath,
      ...(f.nameKey ? { [f.nameKey]: res.fileName } : {}),
    }));
  };

  const clearFile = (f: FieldDef) => {
    setForm((prev) => ({
      ...prev,
      [f.key]: "",
      ...(f.nameKey ? { [f.nameKey]: "" } : {}),
    }));
  };

  const requiredMissing = config.fields.some((f) => f.required && !form[f.key]?.trim());
  const isSaving = create.isPending || !!update.isPending || isUploading;

  const onSubmit = () => {
    const payload: Record<string, unknown> = mode === "add" ? { eventId } : {};
    for (const f of config.fields) {
      const raw = form[f.key];
      if (f.type === "file") {
        // File columns are nullable: on edit we send explicit values so a
        // cleared file is persisted as null; on add we only send when present.
        if (mode === "edit") {
          payload[f.key] = raw && raw !== "" ? raw : null;
          if (f.nameKey) {
            const n = form[f.nameKey];
            payload[f.nameKey] = n && n !== "" ? n : null;
          }
        } else if (raw && raw !== "") {
          payload[f.key] = raw;
          if (f.nameKey && form[f.nameKey]) payload[f.nameKey] = form[f.nameKey];
        }
        continue;
      }
      if (raw == null || raw === "") continue;
      payload[f.key] = f.type === "number" ? Number(raw) : raw;
    }

    if (mode === "edit" && editId != null) {
      update.mutate(
        { id: editId, data: payload },
        {
          onSuccess: () => {
            toast({ title: tc("updatedToast") });
            invalidate();
            setIsOpen(false);
          },
          onError,
        },
      );
      return;
    }

    create.mutate(
      { data: payload },
      {
        onSuccess: () => {
          toast({ title: tc("addedToast") });
          invalidate();
          setIsOpen(false);
          resetForm();
        },
        onError,
      },
    );
  };

  const cycleStatus = (record: any) => {
    const list = config.statuses;
    const idx = list.indexOf(record.status);
    const next = list[(idx + 1) % list.length];
    update.mutate({ id: record.id, data: { status: next } }, { onSuccess: invalidate, onError });
  };

  const remove = (record: any) => {
    del.mutate(
      { id: record.id },
      {
        onSuccess: () => {
          toast({ title: tc("removed") });
          invalidate();
        },
        onError,
      },
    );
  };

  const records = data ?? [];

  const titleOf = (r: any): string => {
    const en = r[config.primaryKey];
    const ar = config.primaryArKey ? r[config.primaryArKey] : undefined;
    return (lang === "en" ? en || ar : ar || en) || "—";
  };

  const valueOf = (r: any, f: DisplayField): string | null => {
    const en = r[f.key];
    const ar = f.arKey ? r[f.arKey] : undefined;
    const v = f.arKey ? (lang === "en" ? en || ar : ar || en) : en;
    if (v == null || v === "") return null;
    if (f.optKey) return t(`${config.base}.${f.optKey}.${v}`);
    let out = String(v);
    if (f.suffixKey) out += " " + (r[f.suffixKey] ?? "");
    return out;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:shadow-sm"
          style={{ background: config.color, color: "#fff" }}
        >
          {tb("add")} <Plus size={15} strokeWidth={2} />
        </button>

        <div className="text-end">
          <h2 className="text-2xl font-bold text-foreground" style={{ fontFamily: "Georgia, serif" }}>{tb("title")}</h2>
          <p className="text-sm text-muted-foreground mt-1">{tb("subtitle")}</p>
        </div>
      </div>

      <Dialog open={isOpen} onOpenChange={(o) => { setIsOpen(o); if (!o) resetForm(); }}>
        <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto" dir={dir}>
          <DialogHeader>
            <DialogTitle className={dir === "rtl" ? "text-end" : "text-start"}>
              {mode === "edit" ? tc("editTitle") : tb("addTitle")}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-4">
              {config.fields.map((f) => (
                <div key={f.key} className={`space-y-1.5 ${f.half ? "" : "col-span-2"} ${f.type === "select" ? "col-span-2" : ""}`}>
                  <Label className="block text-sm">{tb(f.labelKey)}</Label>
                  {f.type === "select" && f.options ? (
                    <div className="flex flex-wrap gap-2">
                      {f.options.map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setForm({ ...form, [f.key]: opt })}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium border transition-all"
                          style={form[f.key] === opt
                            ? { background: config.color, color: "#fff", borderColor: config.color }
                            : { borderColor: T.border, color: T.castleHill }}
                        >
                          {t(`${config.base}.${f.optKey}.${opt}`)}
                        </button>
                      ))}
                    </div>
                  ) : f.type === "file" ? (
                    <div className="space-y-2">
                      <label
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border cursor-pointer transition-all hover:shadow-sm w-fit"
                        style={{ borderColor: T.border, color: T.castleHill }}
                      >
                        {isUploading ? (
                          <Loader2 size={14} strokeWidth={1.5} className="animate-spin" />
                        ) : (
                          <Paperclip size={14} strokeWidth={1.5} />
                        )}
                        {isUploading
                          ? t("pages.commandCenter.logistics.documents.uploading")
                          : form[f.key]
                          ? tc("replaceFile")
                          : t("pages.commandCenter.logistics.documents.chooseFile")}
                        <input
                          type="file"
                          className="hidden"
                          disabled={isUploading}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) onFilePick(f, file);
                            e.target.value = "";
                          }}
                        />
                      </label>
                      {form[f.key] && (
                        <div className="flex items-center gap-2">
                          <p className="text-xs flex items-center gap-1.5" style={{ color: config.color }} dir="ltr">
                            <Paperclip size={11} strokeWidth={1.5} />
                            {(f.nameKey && form[f.nameKey]) || form[f.key]}
                          </p>
                          <button
                            type="button"
                            onClick={() => clearFile(f)}
                            title={tc("removeFile")}
                            className="w-5 h-5 rounded-md flex items-center justify-center text-muted-foreground hover:text-[#DC2626] hover:bg-[#DC262610] transition-colors"
                          >
                            <X size={12} strokeWidth={2} />
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <Input
                      type={f.type === "number" ? "number" : "text"}
                      value={form[f.key]}
                      dir={f.dir}
                      onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-start gap-3 pt-2 border-t border-border">
              <Button type="button" disabled={isSaving || requiredMissing} onClick={onSubmit} className="rounded-xl px-6">
                {isSaving && <Loader2 size={14} strokeWidth={1.5} className="animate-spin me-1.5" />}
                {mode === "edit" ? tc("save") : tc("add")}
              </Button>
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)} className="rounded-xl px-5">
                {tc("cancel")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32 w-full rounded-2xl" />)}
        </div>
      ) : records.length === 0 ? (
        <div className="rounded-2xl border text-center py-16 text-muted-foreground" style={{ borderColor: T.border, background: T.cardBg }}>
          <Inbox size={36} className="mx-auto mb-3 opacity-15" />
          <p className="text-sm">{tb("empty")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {records.map((r, idx) => (
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
                    onClick={() => openEdit(r)}
                    title={tc("edit")}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-black/[0.04] transition-colors"
                  >
                    <Pencil size={13} strokeWidth={1.5} />
                  </button>
                  <button
                    onClick={() => cycleStatus(r)}
                    title={tc("changeStatus")}
                    className="text-xs px-2.5 py-1 rounded-full font-medium transition-all"
                    style={statusStyle(r.status, config.color)}
                  >
                    {t(`${config.base}.${config.statusOptKey}.${r.status}`)}
                  </button>
                </div>
                <div className="text-end min-w-0 flex-1">
                  <div className="flex items-center gap-2 justify-end mb-1.5">
                    <span className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: config.color + "1A" }}>
                      <config.icon size={14} strokeWidth={1.5} style={{ color: config.color }} />
                    </span>
                    <p className="text-sm font-semibold text-foreground truncate">{titleOf(r)}</p>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 justify-end text-[11px] text-muted-foreground">
                    {config.display.map((f) => {
                      const v = valueOf(r, f);
                      if (v == null) return null;
                      if (f.isFile) {
                        const label = (f.nameKey && r[f.nameKey]) || t(`pages.commandCenter.logistics.documents.download`);
                        return (
                          <a key={f.key} href={`/api/events/${eventId}/documents/${r.id}/file`} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:underline" style={{ color: config.color }} dir="ltr">
                            <Download size={10} strokeWidth={1.5} /> {label}
                          </a>
                        );
                      }
                      if (f.isLink) {
                        return (
                          <a key={f.key} href={v} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:underline" style={{ color: config.color }}>
                            {t(`pages.commandCenter.logistics.documents.open`)} <ExternalLink size={10} strokeWidth={1.5} />
                          </a>
                        );
                      }
                      return (
                        <span key={f.key}>
                          <span className="font-medium" style={{ color: T.castleHill }}>{tb(f.labelKey)}: </span>
                          {v}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
