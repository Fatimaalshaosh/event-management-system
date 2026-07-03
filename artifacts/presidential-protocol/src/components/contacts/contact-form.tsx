import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/i18n/language-context";
import { useQueryClient } from "@tanstack/react-query";
import {
  useCreateContact,
  useUpdateContact,
  getListContactsQueryKey,
  getGetContactQueryKey,
  type Contact,
  type ContactInput,
} from "@workspace/api-client-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CountrySelect } from "@/components/reference/country-select";
import { useToast } from "@/hooks/use-toast";
import { C, CONTACT_TYPES, VIP_LEVELS } from "./contact-shared";

type FormState = Record<string, string | boolean | undefined>;

const STATUSES = ["active", "inactive", "pending", "vip", "confidential"];

function Sec({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h4 className="text-xs font-semibold uppercase tracking-wide" style={{ color: C.castleHill }}>{title}</h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{children}</div>
    </div>
  );
}

export function ContactForm({ open, editing, onClose }: {
  open: boolean;
  editing: Contact | null;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const { dir } = useLanguage();
  const { toast } = useToast();
  const qc = useQueryClient();
  const create = useCreateContact();
  const update = useUpdateContact();

  const [f, setF] = useState<FormState>(() =>
    editing
      ? { ...(editing as unknown as FormState) }
      : { type: "external", status: "active", preferredLanguage: "ar" },
  );
  const set = (k: string, v: string | boolean | undefined) => setF((p) => ({ ...p, [k]: v }));

  const type = (f.type as string) ?? "external";
  const isInternal = type === "internal";
  const isVip = type === "vip";
  const showProtocol = ["vip", "external", "delegation", "government"].includes(type);
  const showPassport = ["external", "vip"].includes(type);

  const T = (k: string) => t(`contacts.profile.${k}`);
  const align = dir === "rtl" ? "text-end" : "text-start";

  // Inline render-functions (called, not mounted as components) so inputs keep focus across keystrokes.
  const text = (k: string, label: string, ltr?: boolean) => (
    <div className="space-y-1.5" key={k}>
      <Label className={`block text-xs ${align}`}>{label}</Label>
      <Input value={(f[k] as string) ?? ""} onChange={(e) => set(k, e.target.value)} dir={ltr ? "ltr" : dir} />
    </div>
  );

  const select = (k: string, label: string, options: string[], tns: string) => (
    <div className="space-y-1.5" key={k}>
      <Label className={`block text-xs ${align}`}>{label}</Label>
      <select
        value={(f[k] as string) ?? ""}
        onChange={(e) => set(k, e.target.value)}
        className="w-full h-10 rounded-md border bg-background px-3 text-sm outline-none focus:ring-1 focus:ring-primary/30"
        style={{ borderColor: C.border }}
        dir={dir}
      >
        {options.map((o) => <option key={o} value={o}>{t(`${tns}.${o}`)}</option>)}
      </select>
    </div>
  );

  const save = () => {
    const nameEn = (f.nameEn as string)?.trim();
    if (!nameEn) {
      toast({ title: t("contacts.form.required"), variant: "destructive" });
      return;
    }
    const data = Object.fromEntries(
      Object.entries(f).filter(([k, v]) => !["id", "createdAt", "notes", "eventLinks", "documents"].includes(k) && v !== "" && v != null),
    ) as unknown as ContactInput;

    const opts = (id?: number) => ({
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getListContactsQueryKey() });
        if (id) qc.invalidateQueries({ queryKey: getGetContactQueryKey(id) });
        toast({ title: t("contacts.form.saved") });
        onClose();
      },
      onError: () => toast({ title: t("contacts.form.required"), variant: "destructive" as const }),
    });

    if (editing) update.mutate({ id: editing.id, data }, opts(editing.id));
    else create.mutate({ data }, opts());
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="w-[calc(100%-1.5rem)] sm:max-w-2xl max-h-[85vh] p-0 gap-0 flex flex-col overflow-hidden" dir={dir}>
        <DialogHeader className="shrink-0 px-6 pt-6 pb-4 border-b" style={{ borderColor: C.border }}>
          <DialogTitle style={{ fontFamily: "Georgia, serif" }} className={align}>
            {editing ? t("contacts.form.editTitle") : t("contacts.form.addTitle")}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          <Sec title={t("contacts.form.basic")}>
            {select("type", t("contacts.filters.type"), CONTACT_TYPES, "contacts.types")}
            {select("status", t("contacts.filters.status"), STATUSES, "contacts.status")}
            {text("nameEn", T("nameEn"), true)}
            {text("nameAr", T("nameAr"))}
            {text("gender", T("gender"))}
            {text("preferredLanguage", T("preferredLanguage"))}
          </Sec>

          <Sec title={t("contacts.form.organizationSection")}>
            {text("organization", T("organization"), true)}
            {text("organizationAr", `${T("organization")} (ع)`)}
            {text("department", T("department"))}
            {text("jobTitle", T("jobTitle"), true)}
            {text("jobTitleAr", `${T("jobTitle")} (ع)`)}
            {text("roleInProtocol", T("roleInProtocol"))}
            {isInternal && text("reportingLine", T("reportingLine"))}
            {isInternal && text("emiratesId", T("emiratesId"), true)}
          </Sec>

          <Sec title={t("contacts.form.countrySection")}>
            <div className="space-y-1.5 sm:col-span-2">
              <Label className={`block text-xs ${align}`}>{T("nationality")}</Label>
              <CountrySelect
                value={(f.countryCode as string) ?? null}
                onChange={(code, c) => { set("countryCode", code ?? ""); set("nationality", c?.nameEn ?? ""); }}
              />
            </div>
          </Sec>

          <Sec title={t("contacts.form.contactSection")}>
            {text("email", T("email"), true)}
            {text("mobile", T("mobile"), true)}
            {text("officeNumber", T("office"), true)}
            {text("whatsapp", T("whatsapp"), true)}
            {text("assistantContact", T("assistant"), true)}
            {showPassport && text("passportNumber", T("passport"), true)}
          </Sec>

          {showProtocol && (
            <Sec title={t("contacts.form.protocolSection")}>
              {text("protocolTitle", T("protocolTitle"), true)}
              {text("protocolTitleAr", `${T("protocolTitle")} (ع)`)}
              {text("salutation", T("salutation"), true)}
              {isVip && select("vipLevel", T("vipLevel"), VIP_LEVELS, "contacts.vipLevels")}
              {text("securityClearance", T("securityClearance"))}
              {text("seatingPreference", T("seating"))}
              {text("giftPreference", T("gift"))}
              {text("dietaryRequirements", T("dietary"))}
              <div className="sm:col-span-2 space-y-1.5">
                <Label className={`block text-xs ${align}`}>{T("cultural")}</Label>
                <Textarea value={(f.culturalNotes as string) ?? ""} onChange={(e) => set("culturalNotes", e.target.value)} className="min-h-[64px]" dir={dir} />
              </div>
            </Sec>
          )}
        </div>

        <div className="shrink-0 flex justify-start gap-3 px-6 py-4 border-t" style={{ borderColor: C.border }}>
          <button onClick={save} disabled={create.isPending || update.isPending} className="px-5 py-2 rounded-xl text-sm font-medium text-white disabled:opacity-50" style={{ background: C.mangrove }}>
            {t("common.save")}
          </button>
          <button onClick={onClose} className="px-5 py-2 rounded-xl text-sm font-medium border" style={{ borderColor: C.border }}>
            {t("common.cancel")}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
