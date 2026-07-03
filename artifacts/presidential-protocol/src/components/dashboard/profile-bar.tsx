import { useState } from "react";
import { motion } from "framer-motion";
import {
  Crown,
  Landmark,
  Activity,
  Radar,
  LayoutGrid,
  Truck,
  Siren,
  Settings2,
  Plus,
  Copy,
  Trash2,
  RotateCcw,
  Check,
  Pencil,
  Loader2,
  Lock,
  Unlock,
  type LucideIcon,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import type { DashboardProfile } from "@workspace/api-client-react";
import { C } from "./primitives";

const ICON_MAP: Record<string, LucideIcon> = {
  Crown,
  Landmark,
  Activity,
  Radar,
  LayoutGrid,
  Truck,
  Siren,
};

function profileIcon(icon: string | null | undefined): LucideIcon {
  return (icon && ICON_MAP[icon]) || LayoutGrid;
}

export function ProfileBar({
  profiles,
  activeId,
  onSwitch,
  editMode,
  onToggleEdit,
  dir,
  lang,
  dirty,
  saving,
  locked,
  onToggleLock,
  onNew,
  onDuplicate,
  onRename,
  onDelete,
  onReset,
  onSave,
}: {
  profiles: DashboardProfile[];
  activeId: number | null;
  onSwitch: (id: number) => void;
  editMode: boolean;
  onToggleEdit: () => void;
  dir: "rtl" | "ltr";
  lang: "en" | "ar";
  dirty: boolean;
  saving: boolean;
  locked: boolean;
  onToggleLock: () => void;
  onNew: (name: string) => void;
  onDuplicate: () => void;
  onRename: (name: string) => void;
  onDelete: () => void;
  onReset: () => void;
  onSave: () => void;
}) {
  const { t } = useTranslation();
  const [renaming, setRenaming] = useState(false);
  const [draftName, setDraftName] = useState("");

  const active = profiles.find((p) => p.id === activeId);

  const startRename = () => {
    setDraftName(active?.name ?? "");
    setRenaming(true);
  };
  const commitRename = () => {
    const name = draftName.trim();
    if (name && name !== active?.name) onRename(name);
    setRenaming(false);
  };
  const addProfile = () => {
    const name = lang === "ar" ? "لوحة جديدة" : "New Dashboard";
    onNew(name);
  };

  return (
    <div
      className="rounded-2xl border"
      style={{ background: C.cardBg, borderColor: C.border, boxShadow: C.shadow }}
      dir={dir}
    >
      <div className="flex items-center justify-between gap-3 flex-wrap p-3">
        {/* Profile chips */}
        <div className="flex items-center gap-2 flex-wrap">
          {profiles.map((p) => {
            const Icon = profileIcon(p.icon);
            const isActive = p.id === activeId;
            return (
              <motion.button
                key={p.id}
                whileTap={{ scale: 0.97 }}
                onClick={() => onSwitch(p.id)}
                className="flex items-center gap-2 transition-all"
                style={{
                  padding: "7px 14px",
                  borderRadius: 999,
                  fontSize: 12.5,
                  fontWeight: 700,
                  fontFamily: "inherit",
                  cursor: "pointer",
                  background: isActive ? C.mediumWood : "transparent",
                  color: isActive ? "#fff" : C.castleHill,
                  border: `1px solid ${isActive ? C.mediumWood : C.border}`,
                }}
              >
                <Icon size={14} strokeWidth={1.8} />
                {p.name}
              </motion.button>
            );
          })}
          <button
            onClick={addProfile}
            title={t("dashboard.profiles.new")}
            className="flex items-center justify-center transition-all hover:opacity-80"
            style={{
              width: 32, height: 32, borderRadius: 999,
              background: "transparent", color: C.mangrove,
              border: `1px dashed ${C.borderStrong}`, cursor: "pointer",
            }}
          >
            <Plus size={15} strokeWidth={2} />
          </button>
        </div>

        {/* Lock + Customize toggles */}
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleLock}
            title={locked ? t("dashboard.customize.unlock") : t("dashboard.customize.lock")}
            className="flex items-center gap-2 transition-all"
            style={{
              padding: "8px 14px",
              borderRadius: 999,
              fontSize: 12.5,
              fontWeight: 700,
              fontFamily: "inherit",
              cursor: "pointer",
              background: locked ? `${C.castleHill}1A` : "transparent",
              color: locked ? C.castleHill : C.warmGray,
              border: `1px solid ${locked ? `${C.castleHill}40` : C.border}`,
            }}
          >
            {locked ? <Lock size={14} strokeWidth={2} /> : <Unlock size={14} strokeWidth={1.8} />}
            {locked ? t("dashboard.customize.locked") : t("dashboard.customize.lock")}
          </button>
          <button
            onClick={onToggleEdit}
            disabled={locked}
            title={locked ? t("dashboard.customize.lockedHint") : undefined}
            className="flex items-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              padding: "8px 16px",
              borderRadius: 999,
              fontSize: 12.5,
              fontWeight: 700,
              fontFamily: "inherit",
              cursor: locked ? "not-allowed" : "pointer",
              background: editMode ? C.mangrove : `${C.mediumWood}14`,
              color: editMode ? "#fff" : C.mediumWood,
              border: `1px solid ${editMode ? C.mangrove : `${C.mediumWood}33`}`,
            }}
          >
            {editMode ? <Check size={15} strokeWidth={2.2} /> : <Settings2 size={15} strokeWidth={1.9} />}
            {editMode ? t("dashboard.customize.done") : t("dashboard.customize.title")}
          </button>
        </div>
      </div>

      {/* Edit toolbar */}
      {editMode && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          className="overflow-hidden border-t"
          style={{ borderColor: C.border }}
        >
          <div className="flex items-center justify-between gap-3 flex-wrap px-3 py-2.5">
            <div className="flex items-center gap-2 flex-wrap">
              {renaming ? (
                <div className="flex items-center gap-1.5">
                  <input
                    autoFocus
                    value={draftName}
                    onChange={(e) => setDraftName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") commitRename();
                      if (e.key === "Escape") setRenaming(false);
                    }}
                    style={{
                      fontSize: 12.5, fontFamily: "inherit", color: C.textPrimary,
                      padding: "6px 12px", borderRadius: 10,
                      border: `1px solid ${C.borderStrong}`, background: C.pageBg, outline: "none",
                      textAlign: dir === "rtl" ? "right" : "left",
                    }}
                  />
                  <button onClick={commitRename}
                    className="flex items-center justify-center"
                    style={{ width: 30, height: 30, borderRadius: 8, border: "none", background: C.mangrove, color: "#fff", cursor: "pointer" }}>
                    <Check size={14} />
                  </button>
                </div>
              ) : (
                <ToolBtn icon={Pencil} label={t("dashboard.profiles.rename")} onClick={startRename} />
              )}
              <ToolBtn icon={Copy} label={t("dashboard.profiles.duplicate")} onClick={onDuplicate} />
              <ToolBtn icon={RotateCcw} label={t("dashboard.profiles.reset")} onClick={onReset} />
              <ToolBtn
                icon={Trash2}
                label={t("dashboard.profiles.delete")}
                onClick={onDelete}
                disabled={profiles.length <= 1}
                danger
              />
            </div>
            <div className="flex items-center gap-2">
              <span style={{ fontSize: 11, color: C.warmGray, fontWeight: 600 }}>
                {saving ? (
                  <span className="flex items-center gap-1">
                    <Loader2 size={12} className="animate-spin" /> {t("dashboard.customize.saving")}
                  </span>
                ) : dirty ? (
                  t("dashboard.customize.unsaved")
                ) : (
                  <span className="flex items-center gap-1" style={{ color: C.mangrove }}>
                    <Check size={12} /> {t("dashboard.customize.saved")}
                  </span>
                )}
              </span>
              <button
                onClick={onSave}
                className="flex items-center gap-1.5"
                style={{
                  padding: "7px 14px", borderRadius: 999, fontSize: 12, fontWeight: 700,
                  fontFamily: "inherit", cursor: "pointer",
                  background: C.mediumWood, color: "#fff", border: "none",
                }}
              >
                {t("dashboard.customize.save")}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

function ToolBtn({
  icon: Icon,
  label,
  onClick,
  disabled,
  danger,
}: {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex items-center gap-1.5 transition-all hover:opacity-80 disabled:opacity-35"
      style={{
        padding: "6px 12px", borderRadius: 999, fontSize: 11.5, fontWeight: 700,
        fontFamily: "inherit", cursor: disabled ? "default" : "pointer",
        background: C.pageBg,
        color: danger ? "#B0432F" : C.castleHill,
        border: `1px solid ${danger ? "rgba(176,67,47,0.25)" : C.border}`,
      }}
    >
      <Icon size={13} strokeWidth={1.9} />
      {label}
    </button>
  );
}
