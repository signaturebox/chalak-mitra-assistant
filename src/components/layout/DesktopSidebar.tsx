import { Home, BookOpen, Wrench, User, Search, Bell, Shield, Train, Bot } from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";

const mainNav = [
  { to: "/", icon: Home, label: "Dashboard" },
  { to: "/knowledge", icon: BookOpen, label: "Knowledge" },
  { to: "/troubleshoot", icon: Bot, label: "AI Troubleshoot" },
  { to: "/search", icon: Search, label: "Search" },
  { to: "/tools", icon: Wrench, label: "Crew Tools" },
  { to: "/notifications", icon: Bell, label: "Alerts" },
];

const secondaryNav = [
  { to: "/profile", icon: User, label: "Profile" },
  { to: "/admin", icon: Shield, label: "Admin" },
];

export function DesktopSidebar() {
  return (
    <aside className="hidden md:flex md:flex-col md:w-64 md:fixed md:inset-y-0 railway-gradient text-sidebar-foreground z-40">
      {/* Brand */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-sidebar-border">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-sidebar-primary">
          <Train className="h-5 w-5 text-sidebar-primary-foreground" />
        </div>
        <div>
          <h1 className="text-base font-bold tracking-tight text-sidebar-foreground">NWR Chalak Mitra</h1>
          <p className="text-[11px] text-sidebar-foreground/60">Digital Loco Assistant</p>
        </div>
      </div>

      {/* Main Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="px-3 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/40 mb-2">Main</p>
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
            {item.label}
          </NavLink>
        ))}

        <p className="px-3 pt-6 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/40 mb-2">Account</p>
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
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-sidebar-border">
        <p className="text-[10px] text-sidebar-foreground/40 text-center">NWR Chalak Mitra v1.0</p>
      </div>
    </aside>
  );
}
