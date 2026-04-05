import { ArrowLeft, User as UserIcon, Settings, ChevronRight, LogOut, Bell, Moon, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";

const menuItems = [
  { icon: Bell, label: "Notifications", subtitle: "Manage alerts" },
  { icon: Moon, label: "Dark Mode", subtitle: "Toggle theme", toggle: true },
  { icon: Shield, label: "Privacy", subtitle: "Account security" },
  { icon: Settings, label: "Settings", subtitle: "App preferences" },
];

export default function Profile() {
  const navigate = useNavigate();

  return (
    <div className="animate-fade-in">
      {/* Profile Header */}
      <div className="bg-gradient-to-br from-primary to-blue-700 text-primary-foreground px-5 pt-6 pb-10">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="press-effect"><ArrowLeft size={22} /></button>
          <h1 className="text-base font-bold">Profile</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center">
            <UserIcon size={28} />
          </div>
          <div>
            <h2 className="text-lg font-bold">Crew Member</h2>
            <p className="text-xs opacity-80">CMS ID: —</p>
            <p className="text-xs opacity-70">LP • NWR</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="px-4 -mt-5">
        <div className="bg-card rounded-2xl border border-border p-4 flex justify-around shadow-sm">
          <div className="text-center">
            <p className="text-lg font-bold text-foreground">0</p>
            <p className="text-[10px] text-muted-foreground">Quizzes</p>
          </div>
          <div className="w-px bg-border" />
          <div className="text-center">
            <p className="text-lg font-bold text-foreground">0</p>
            <p className="text-[10px] text-muted-foreground">Certificates</p>
          </div>
          <div className="w-px bg-border" />
          <div className="text-center">
            <p className="text-lg font-bold text-foreground">0</p>
            <p className="text-[10px] text-muted-foreground">Bookmarks</p>
          </div>
        </div>
      </div>

      {/* Menu */}
      <div className="px-4 mt-5 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.label}
            className="w-full flex items-center justify-between p-4 bg-card rounded-xl border border-border press-effect"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
                <item.icon size={18} className="text-foreground" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-foreground">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.subtitle}</p>
              </div>
            </div>
            <ChevronRight size={18} className="text-muted-foreground" />
          </button>
        ))}
      </div>

      {/* Logout */}
      <div className="px-4 mt-6 pb-6">
        <button
          onClick={() => navigate("/auth")}
          className="w-full flex items-center justify-center gap-2 p-3.5 bg-destructive/10 rounded-xl text-destructive font-semibold text-sm press-effect"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </div>
  );
}
