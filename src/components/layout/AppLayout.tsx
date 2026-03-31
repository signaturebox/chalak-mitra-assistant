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

      {/* Mobile Status Bar + Header */}
      <header className="sticky top-0 z-40 md:hidden safe-area-pt">
        <div className="railway-gradient">
          <div className="flex items-center justify-between px-4 h-14">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center">
                <span className="text-base">🚂</span>
              </div>
              <div>
                <h1 className="text-[14px] font-bold text-white leading-tight tracking-tight">{t("app.name")}</h1>
                <p className="text-[10px] text-white/50 leading-tight">{t("app.tagline")}</p>
              </div>
            </div>
            <div className="flex items-center gap-0.5">
              {user && (
                <>
                  <Link to="/notifications" className="w-10 h-10 rounded-full flex items-center justify-center active:bg-white/10 transition-colors">
                    <Bell className="h-[20px] w-[20px] text-white/90" />
                  </Link>
                  <button onClick={handleLogout} className="w-10 h-10 rounded-full flex items-center justify-center active:bg-white/10 transition-colors" title="Logout">
                    <LogOut className="h-[18px] w-[18px] text-white/70" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Desktop Header */}
      <header className="hidden md:flex md:ml-64 items-center justify-between px-6 h-16 bg-card border-b border-border/50">
        <div />
        <div className="flex items-center gap-3">
          <Link to="/notifications" className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors">
            <Bell className="h-4 w-4 text-foreground" />
          </Link>
          <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-destructive/10 text-destructive text-xs font-semibold hover:bg-destructive/15 transition-colors">
            <LogOut className="h-3.5 w-3.5" />
            Logout
          </button>
        </div>
      </header>

      <main className="md:ml-64 pb-24 md:pb-8">
        <div className="max-w-lg mx-auto px-4 pt-5 pb-4 md:max-w-5xl md:pt-6">
          <Outlet />
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
