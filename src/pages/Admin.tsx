import { Shield, Users, Building, MapPin, FileText, TrendingUp, Settings } from "lucide-react";

const adminModules = [
  { icon: Users, label: "User Management", desc: "Manage crew, admins & roles", count: "245 users" },
  { icon: Building, label: "Zone Management", desc: "NWR zones & divisions", count: "6 zones" },
  { icon: MapPin, label: "Lobby Management", desc: "Loco sheds & lobbies", count: "28 lobbies" },
  { icon: FileText, label: "Content Management", desc: "Upload manuals & circulars", count: "124 docs" },
  { icon: TrendingUp, label: "Analytics", desc: "Usage stats & fault trends", count: "View" },
  { icon: Settings, label: "System Settings", desc: "Configuration & backup", count: "" },
];

const recentActivity = [
  { action: "New user registered", detail: "ALP Suresh — Ajmer Division", time: "10 min ago" },
  { action: "Manual uploaded", detail: "WAG9H Traction Guide — Zone Admin", time: "2h ago" },
  { action: "Safety circular published", detail: "SC/2024/03 — Fog Working", time: "5h ago" },
];

export default function Admin() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-railway-orange/10 flex items-center justify-center">
          <Shield className="h-5 w-5 text-railway-orange" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-foreground">Admin Panel</h2>
          <p className="text-sm text-muted-foreground">Super Admin Access</p>
        </div>
      </div>

      {/* Admin Modules */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {adminModules.map((mod) => (
          <button key={mod.label} className="stat-card flex items-center gap-3 p-4 text-left group">
            <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
              <mod.icon className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">{mod.label}</p>
              <p className="text-[11px] text-muted-foreground">{mod.desc}</p>
            </div>
            {mod.count && (
              <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-md">{mod.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* Recent Activity */}
      <section>
        <h3 className="text-sm font-semibold text-foreground mb-3">Recent Activity</h3>
        <div className="stat-card divide-y divide-border">
          {recentActivity.map((item, i) => (
            <div key={i} className="px-4 py-3">
              <p className="text-sm font-medium text-foreground">{item.action}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{item.detail}</p>
              <p className="text-[10px] text-muted-foreground mt-1">{item.time}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
