import { Search, Sun } from "lucide-react";
import { ExecutiveAvatar } from "@/components/identity";
import { CURRENT_USER } from "@/lib/identity";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/i18n/language-context";
import { LanguageSwitcher } from "./language-switcher";
import { NotificationsBell } from "./notifications-bell";

export function Topbar() {
  const { t } = useTranslation();
  const { lang } = useLanguage();
  const today = new Date().toLocaleDateString(lang === "ar" ? "ar-AE" : "en-GB", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <header className="h-16 bg-background/80 backdrop-blur-md border-b border-border flex items-center justify-between px-6 sticky top-0 z-40 pe-20">

      {/* Search — leading side */}
      <div className="relative w-72">
        <Search
          className="absolute end-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60 pointer-events-none"
          size={16}
          strokeWidth={1.5}
        />
        <input
          placeholder={t("topbar.searchPlaceholder")}
          className="w-full h-9 rounded-full border border-border bg-card pe-10 ps-4 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:ring-1 focus:ring-primary/30 transition-all"
        />
      </div>

      {/* Trailing controls */}
      <div className="flex items-center gap-5">
        {/* Language switcher */}
        <LanguageSwitcher variant="topbar" />

        {/* Date */}
        <span className="hidden lg:block text-xs text-muted-foreground font-medium">
          {today}
        </span>

        {/* Weather pill */}
        <div className="hidden md:flex items-center gap-1.5 text-xs font-medium text-medium-wood bg-sunset/30 px-3 py-1.5 rounded-full border border-sunset/40">
          <Sun size={13} strokeWidth={1.5} />
          <span>{t("topbar.weatherCity")} 28°</span>
        </div>

        {/* Notifications */}
        <NotificationsBell />

        {/* Profile */}
        <div className="flex items-center gap-3 ps-5 border-s border-border">
          <div className="text-end hidden sm:block">
            <p className="text-sm font-semibold text-foreground leading-tight">
              {lang === "ar" ? CURRENT_USER.nameAr : CURRENT_USER.name}
            </p>
            <p className="text-[11px] text-muted-foreground">
              {lang === "ar" ? CURRENT_USER.roleAr : CURRENT_USER.role}
            </p>
          </div>
          <ExecutiveAvatar identity={CURRENT_USER} size="md" ring />
        </div>
      </div>
    </header>
  );
}
