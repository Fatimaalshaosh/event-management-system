import { Link, useLocation } from "wouter";
import {
  Home,
  CalendarDays,
  Flag,
  CheckSquare,
  Crown,
  Mail,
  Calendar,
  FileText,
  Settings,
  FolderOpen,
  Star,
  LogOut,
  Network,
  Car,
  BookUser,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { ExecutiveAvatar } from "@/components/identity";
import { CURRENT_USER } from "@/lib/identity";
import { signOut } from "@/lib/storage";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/i18n/language-context";

type Item = { href: string; icon: React.ElementType; labelKey: string; soon?: boolean };

const mainNav: Item[] = [
  { href: "/",            icon: Home,         labelKey: "nav.home" },
  { href: "/events",      icon: CalendarDays, labelKey: "nav.events" },
  { href: "/visits",      icon: Flag,         labelKey: "nav.visits" },
  { href: "/approvals",   icon: CheckSquare,  labelKey: "nav.approvals" },
  { href: "/vips",        icon: Crown,        labelKey: "nav.vips" },
  { href: "/contacts",    icon: BookUser,     labelKey: "nav.contacts" },
  { href: "/family-tree", icon: Network,      labelKey: "nav.familyTree" },
  { href: "/invitations", icon: Mail,         labelKey: "nav.invitations" },
  { href: "/calendar",    icon: Calendar,     labelKey: "nav.calendar" },
  { href: "/reports",     icon: FileText,     labelKey: "nav.reports" },
  { href: "/fleet",       icon: Car,          labelKey: "nav.fleet" },
];

const secondaryNav: Item[] = [
  { href: "/documents", icon: FolderOpen, labelKey: "nav.documents", soon: true },
];

function NavItem({
  href, icon: Icon, label, active, soon, tooltipSide,
}: {
  href: string; icon: React.ElementType; label: string;
  active: boolean; soon?: boolean; tooltipSide: "left" | "right";
}) {
  const { t } = useTranslation();
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link href={href} className="w-full flex justify-center">
          <div
            className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 cursor-pointer",
              active
                ? "bg-primary/90 text-primary-foreground shadow-sm"
                : soon
                ? "text-muted-foreground/40 cursor-not-allowed"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
            )}
          >
            <Icon size={19} strokeWidth={1.5} />
          </div>
        </Link>
      </TooltipTrigger>
      <TooltipContent
        side={tooltipSide}
        className="bg-popover text-popover-foreground border border-border shadow-md text-xs"
      >
        <p className="font-medium">
          {label}
          {soon && <span className="text-muted-foreground ms-1.5">· {t("common.soon")}</span>}
        </p>
      </TooltipContent>
    </Tooltip>
  );
}

export function Sidebar() {
  const [location] = useLocation();
  const { t } = useTranslation();
  const { dir } = useLanguage();
  const tooltipSide = dir === "rtl" ? "left" : "right";

  const isActive = (href: string) =>
    href === "/" ? location === "/" : location.startsWith(href);

  return (
    <aside className="fixed start-0 top-0 bottom-0 w-16 bg-sidebar border-e border-border flex flex-col items-center py-6 z-50">
      {/* Logo mark */}
      <Link href="/" className="mb-8 flex items-center justify-center">
        <div className="w-9 h-9 rounded-xl bg-primary/90 flex items-center justify-center text-primary-foreground">
          <Star size={16} strokeWidth={1.5} fill="currentColor" />
        </div>
      </Link>

      {/* Primary nav */}
      <nav className="flex flex-col gap-1.5 flex-1 w-full items-center">
        {mainNav.map((item) => (
          <NavItem
            key={item.href}
            href={item.href}
            icon={item.icon}
            label={t(item.labelKey)}
            active={isActive(item.href)}
            tooltipSide={tooltipSide}
          />
        ))}

        {/* Divider */}
        <div className="w-6 h-px bg-border my-2" />

        {/* Secondary nav — coming soon */}
        {secondaryNav.map((item) => (
          <NavItem
            key={item.href}
            href={item.href}
            icon={item.icon}
            label={t(item.labelKey)}
            active={false}
            soon
            tooltipSide={tooltipSide}
          />
        ))}
      </nav>

      {/* Settings + Logout at bottom */}
      <div className="mt-auto flex flex-col gap-1.5 items-center">
        {/* Signed-in executive identity */}
        <div className="mb-1.5">
          <ExecutiveAvatar identity={CURRENT_USER} size="sm" ring />
        </div>
        <NavItem
          href="/settings"
          icon={Settings}
          label={t("nav.settings")}
          active={isActive("/settings")}
          tooltipSide={tooltipSide}
        />
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => {
                signOut();
                window.location.href = "/login";
              }}
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 cursor-pointer text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            >
              <LogOut size={18} strokeWidth={1.5} />
            </button>
          </TooltipTrigger>
          <TooltipContent
            side={tooltipSide}
            className="bg-popover text-popover-foreground border border-border shadow-md text-xs"
          >
            <p className="font-medium">{t("nav.logout")}</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </aside>
  );
}
