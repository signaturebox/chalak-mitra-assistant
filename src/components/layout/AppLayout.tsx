import { Outlet } from "react-router-dom";
import { BottomNav } from "./BottomNav";
import { DesktopSidebar } from "./DesktopSidebar";
import { Train, Bell, LogOut } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";

export function AppLayout() {
  const { t } = useLanguage();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <DesktopSidebar />

      {/* Mobile Header */}
      <header className="sticky top-0 z-40 flex items-center justify-between px-4 h-14 bg-sidebar-background md:hidden">
        <div className="flex items-center gap-2">
          <span className="text-lg">🚂</span>
          <h1 className="text-sm font-bold text-white tracking-tight">{t("app.name")}</h1>
        </div>
        <div className="flex items-center gap-2">
          {user && (
            <Link to="/notifications" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center">
              <Bell className="h-4 w-4 text-white" />
            </Link>
          )}
        </div>
      </header>

      <main className="md:ml-64 pb-20 md:pb-6">
        <div className="container max-w-5xl py-4 md:py-6">
          <Outlet />
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
