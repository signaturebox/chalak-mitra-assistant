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
    <div className="min-h-screen bg-background relative">
      {/* Ambient gradient blobs for dark mode */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-primary/5 blur-[100px]" />
        <div className="absolute top-1/2 -left-40 w-72 h-72 rounded-full bg-accent/5 blur-[100px]" />
      </div>

      <DesktopSidebar />

      {/* Mobile Header — Minimal floating bar */}
      <header className="sticky top-0 z-40 md:hidden safe-area-pt">
        <div className="px-4 pt-2 pb-2">
          <div className="glass-strong rounded-2xl px-4 h-[52px] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl gradient-teal flex items-center justify-center shadow-sm">
                <span className="text-sm">🚂</span>
              </div>
              <div>
                <h1 className="text-[13px] font-bold text-foreground leading-none tracking-tight">{t("app.name")}</h1>
                <p className="text-[9px] text-muted-foreground leading-none mt-0.5">{t("app.tagline")}</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {user && (
                <>
                  <Link to="/notifications" className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-secondary/50 transition-colors">
                    <Bell className="h-[17px] w-[17px] text-muted-foreground" />
                  </Link>
                  <button onClick={handleLogout} className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-destructive/10 transition-colors">
                    <LogOut className="h-[15px] w-[15px] text-muted-foreground" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Desktop Header */}
      <header className="hidden md:flex md:ml-64 items-center justify-between px-6 h-16 bg-card/50 backdrop-blur-xl border-b border-border/30">
        <div />
        <div className="flex items-center gap-3">
          <Link to="/notifications" className="w-10 h-10 rounded-xl glass flex items-center justify-center hover:bg-secondary/50 transition-colors">
            <Bell className="h-4 w-4 text-foreground" />
          </Link>
          <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-destructive/10 text-destructive text-xs font-semibold hover:bg-destructive/15 transition-colors">
            <LogOut className="h-3.5 w-3.5" />
            Logout
          </button>
        </div>
      </header>

      <main className="relative z-10 md:ml-64 pb-28 md:pb-8">
        <div className="max-w-lg mx-auto px-4 pt-3 pb-4 md:max-w-5xl md:pt-6">
          <Outlet />
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
