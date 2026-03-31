import { Outlet } from "react-router-dom";
import { BottomNav } from "./BottomNav";
import { DesktopSidebar } from "./DesktopSidebar";
import { Train } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export function AppLayout() {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen bg-background">
      <DesktopSidebar />
      <header className="sticky top-0 z-40 flex items-center gap-3 px-4 h-14 border-b border-border bg-card/95 backdrop-blur-md md:hidden">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary">
          <Train className="h-4 w-4 text-primary-foreground" />
        </div>
        <h1 className="text-sm font-bold text-foreground">{t("app.name")}</h1>
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
