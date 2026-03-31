import { User, MapPin, Building, Bell, Moon, Sun, LogOut, ChevronRight, Bookmark, Clock, FileText } from "lucide-react";
import { useState } from "react";

export default function Profile() {
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);

  const toggleDark = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Profile Card */}
      <div className="stat-card p-5 flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
          <User className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-foreground">Rajesh Kumar</h2>
          <p className="text-sm text-muted-foreground">Loco Pilot (Mail/Express)</p>
          <p className="text-xs text-muted-foreground mt-0.5">CMS ID: NWR/JP/LP/1234</p>
        </div>
      </div>

      {/* Info */}
      <div className="stat-card divide-y divide-border">
        {[
          { icon: Building, label: "Division", value: "Jaipur" },
          { icon: MapPin, label: "Lobby", value: "Jaipur Loco Shed" },
          { icon: FileText, label: "Designation", value: "LP (M/E)" },
          { icon: Clock, label: "Experience", value: "12 Years" },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-3 px-4 py-3">
            <item.icon className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground flex-1">{item.label}</span>
            <span className="text-sm font-medium text-foreground">{item.value}</span>
          </div>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="stat-card text-center py-4">
          <Bookmark className="h-5 w-5 mx-auto text-primary mb-1" />
          <p className="text-lg font-bold text-foreground">12</p>
          <p className="text-[10px] text-muted-foreground">Bookmarks</p>
        </div>
        <div className="stat-card text-center py-4">
          <FileText className="h-5 w-5 mx-auto text-railway-info mb-1" />
          <p className="text-lg font-bold text-foreground">45</p>
          <p className="text-[10px] text-muted-foreground">Downloads</p>
        </div>
        <div className="stat-card text-center py-4">
          <Clock className="h-5 w-5 mx-auto text-railway-success mb-1" />
          <p className="text-lg font-bold text-foreground">8h</p>
          <p className="text-[10px] text-muted-foreground">Last Duty</p>
        </div>
      </div>

      {/* Settings */}
      <section>
        <h3 className="text-sm font-semibold text-foreground mb-3">Settings</h3>
        <div className="stat-card divide-y divide-border">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              {darkMode ? <Moon className="h-4 w-4 text-muted-foreground" /> : <Sun className="h-4 w-4 text-muted-foreground" />}
              <span className="text-sm text-foreground">Dark Mode</span>
            </div>
            <button
              onClick={toggleDark}
              className={`w-11 h-6 rounded-full transition-colors relative ${darkMode ? "bg-primary" : "bg-muted"}`}
            >
              <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-card shadow transition-transform ${darkMode ? "left-[22px]" : "left-0.5"}`} />
            </button>
          </div>
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <Bell className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-foreground">Notifications</span>
            </div>
            <button
              onClick={() => setNotifications(!notifications)}
              className={`w-11 h-6 rounded-full transition-colors relative ${notifications ? "bg-primary" : "bg-muted"}`}
            >
              <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-card shadow transition-transform ${notifications ? "left-[22px]" : "left-0.5"}`} />
            </button>
          </div>
          <button className="flex items-center gap-3 px-4 py-3 w-full text-destructive">
            <LogOut className="h-4 w-4" />
            <span className="text-sm font-medium">Sign Out</span>
          </button>
        </div>
      </section>
    </div>
  );
}
