import { Outlet } from "react-router-dom";
import { BottomNav } from "./BottomNav";
import { DesktopSidebar } from "./DesktopSidebar";
import { Bell, LogOut } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";

export function AppLayout() {
  const { t } = useLanguage();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-background">
      <DesktopSidebar />

      {/* Mobile Header */}
      <header className="sticky top-0 z-40 flex items-center justify-between px-3 h-14 bg-sidebar-background md:hidden">
        <div className="flex items-center gap-2">
          <img
            src="https://upload.wikimedia.org/wikipedia/en/thumb/8/83/Indian_Railways.svg/200px-Indian_Railways.svg.png"
            alt="Indian Railways"
            className="h-9 w-9 object-contain rounded-md bg-white/10 p-0.5"
          />
          <div>
            <h1 className="text-sm font-bold text-white tracking-tight leading-tight">{t("app.name")}</h1>
            <p className="text-[9px] text-white/50 leading-tight">{t("app.tagline")}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {user && (
            <>
              <Link to="/notifications" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center">
                <Bell className="h-4 w-4 text-white" />
              </Link>
              <button
                onClick={handleLogout}
                className="w-9 h-9 rounded-full bg-red-500/20 flex items-center justify-center"
                title="Logout"
              >
                <LogOut className="h-4 w-4 text-red-300" />
              </button>
            </>
          )}
        </div>
      </header>

      {/* Desktop Header */}
      <header className="hidden md:flex md:ml-64 items-center justify-between px-6 h-14 bg-card border-b border-border">
        <div />
        <div className="flex items-center gap-3">
          <Link to="/notifications" className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center hover:bg-accent transition-colors">
            <Bell className="h-4 w-4 text-foreground" />
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-destructive/10 text-destructive text-xs font-semibold hover:bg-destructive/20 transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
            Logout
          </button>
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
