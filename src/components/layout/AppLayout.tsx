import { Outlet, useLocation } from "react-router-dom";
import BottomNav from "./BottomNav";

export default function AppLayout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Status bar spacer for mobile */}
      <div className="h-[env(safe-area-inset-top)] bg-primary" />
      
      {/* Main content */}
      <main className="flex-1 pb-20 overflow-y-auto scroll-smooth">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
