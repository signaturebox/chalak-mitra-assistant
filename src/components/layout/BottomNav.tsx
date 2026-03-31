import { Home, BookOpen, Wrench, User, Search } from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", icon: Home, label: "Home" },
  { to: "/knowledge", icon: BookOpen, label: "Knowledge" },
  { to: "/search", icon: Search, label: "Search" },
  { to: "/tools", icon: Wrench, label: "Tools" },
  { to: "/profile", icon: User, label: "Profile" },
];

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-md md:hidden safe-area-pb">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors text-xs",
                isActive
                  ? "text-primary font-semibold"
                  : "text-muted-foreground"
              )
            }
          >
            <item.icon className="h-5 w-5" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
