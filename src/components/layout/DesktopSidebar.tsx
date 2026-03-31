import { Home, BookOpen, Wrench, User, Search, Bell, Shield, Train, Bot } from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import { TranslationKey } from "@/i18n/translations";

type NavItem = { to: string; icon: typeof Home; labelKey: TranslationKey };

const mainNav: NavItem[] = [
  { to: "/", icon: Home, labelKey: "nav.dashboard" },
  { to: "/knowledge", icon: BookOpen, labelKey: "nav.knowledge" },
  { to: "/troubleshoot", icon: Bot, labelKey: "nav.aiTroubleshoot" },
  { to: "/search", icon: Search, labelKey: "nav.search" },
  { to: "/tools", icon: Wrench, labelKey: "nav.crewTools" },
  { to: "/notifications", icon: Bell, labelKey: "nav.alerts" },
];

const secondaryNav: NavItem[] = [
  { to: "/profile", icon: User, labelKey: "nav.profile" },
  { to: "/admin", icon: Shield, labelKey: "nav.admin" },
];

export function DesktopSidebar() {
  const { t } = useLanguage();
  return (
    <aside className="hidden md:flex md:flex-col md:w-64 md:fixed md:inset-y-0 railway-gradient text-sidebar-foreground z-40">
      <div className="flex items-center gap-3 px-6 py-5 border-b border-sidebar-border">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-sidebar-primary">
          <Train className="h-5 w-5 text-sidebar-primary-foreground" />
        </div>
        <div>
          <h1 className="text-base font-bold tracking-tight text-sidebar-foreground">{t("app.name")}</h1>
          <p className="text-[11px] text-sidebar-foreground/60">{t("app.tagline")}</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="px-3 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/40 mb-2">{t("nav.main")}</p>
        {mainNav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all",
                isActive
                  ? "bg-sidebar-accent text-sidebar-primary font-semibold"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )
            }
          >
            <item.icon className="h-4.5 w-4.5" />
            {t(item.labelKey)}
          </NavLink>
        ))}

        <p className="px-3 pt-6 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/40 mb-2">{t("nav.account")}</p>
        {secondaryNav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all",
                isActive
                  ? "bg-sidebar-accent text-sidebar-primary font-semibold"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )
            }
          >
            <item.icon className="h-4.5 w-4.5" />
            {t(item.labelKey)}
          </NavLink>
        ))}
      </nav>

      <div className="px-4 py-3 border-t border-sidebar-border">
        <p className="text-[10px] text-sidebar-foreground/40 text-center">{t("app.version")}</p>
      </div>
    </aside>
  );
}
