import { Outlet } from "react-router-dom";
import { BottomNav } from "./BottomNav";
import { DesktopSidebar } from "./DesktopSidebar";
import { Train } from "lucide-react";

export function AppLayout() {
  return (
    <div className="min-h-screen bg-background">
      <DesktopSidebar />

      {/* Mobile Header */}
      <header className="sticky top-0 z-40 flex items-center gap-3 px-4 h-14 border-b border-border bg-card/95 backdrop-blur-md md:hidden">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary">
          <Train className="h-4 w-4 text-primary-foreground" />
        </div>
        <h1 className="text-sm font-bold text-foreground">NWR Chalak Mitra</h1>
      </header>

      {/* Main Content */}
      <main className="md:ml-64 pb-20 md:pb-6">
        <div className="container max-w-5xl py-4 md:py-6">
          <Outlet />
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
