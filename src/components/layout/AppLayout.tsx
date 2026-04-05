import { Outlet } from "react-router-dom";
import BottomNav from "./BottomNav";

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-background flex flex-col max-w-lg mx-auto relative">
      {/* Status bar simulation */}
      <div className="h-[env(safe-area-inset-top)] bg-primary" />

      {/* Main scrollable content */}
      <main className="flex-1 pb-[4.5rem] overflow-y-auto no-scrollbar">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
