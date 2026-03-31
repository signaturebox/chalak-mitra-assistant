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

      {/* Mobile Header — iOS native style */}
      <header className="sticky top-0 z-40 md:hidden safe-area-pt">
        <div className="flex items-center justify-between px-4 h-12 bg-card/80 backdrop-blur-xl border-b border-border/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg railway-gradient flex items-center justify-center">
              <span className="text-sm">🚂</span>
            </div>
            <div>
              <h1 className="text-[13px] font-bold text-foreground leading-tight tracking-tight">{t("app.name")}</h1>
              <p className="text-[9px] text-muted-foreground leading-tight">{t("app.tagline")}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {user && (
              <>
                <Link to="/notifications" className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted transition-colors">
                  <Bell className="h-[18px] w-[18px] text-foreground" />
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted transition-colors"
                  title="Logout"
                >
                  <LogOut className="h-[18px] w-[18px] text-destructive" />
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Desktop Header */}
      <header className="hidden md:flex md:ml-64 items-center justify-between px-6 h-14 bg-card/80 backdrop-blur-xl border-b border-border/40">
        <div />
        <div className="flex items-center gap-3">
          <Link to="/notifications" className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center hover:bg-accent/10 transition-colors">
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

      <main className="md:ml-64 pb-24 md:pb-6">
        <div className="max-w-lg mx-auto px-4 py-3 md:max-w-5xl md:py-6">
          <Outlet />
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
