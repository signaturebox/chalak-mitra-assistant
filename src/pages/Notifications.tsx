import { Bell, AlertTriangle, FileText, Shield, ChevronRight } from "lucide-react";
import { useState } from "react";

const notifications = [
  { id: 1, type: "urgent", title: "Speed Restriction: Jaipur-Ajmer Section", desc: "Temporary speed restriction of 30 kmph between km 120-125 due to track maintenance.", time: "3h ago", read: false },
  { id: 2, type: "safety", title: "Safety Circular: Fog Working Instructions", desc: "All LPs to follow fog working instructions as per latest circular.", time: "5h ago", read: false },
  { id: 3, type: "notice", title: "Updated ACTM Chapter 7 — Brake System", desc: "New revision uploaded. All crew to read and acknowledge.", time: "1d ago", read: true },
  { id: 4, type: "info", title: "New Manual: WAP7 Pantograph Guide", desc: "Complete pantograph maintenance and troubleshooting guide added.", time: "2d ago", read: true },
  { id: 5, type: "safety", title: "Alert: Check Brake Continuity", desc: "Ensure brake continuity test as per latest safety directive.", time: "3d ago", read: true },
];

const typeConfig: Record<string, { icon: typeof Bell; color: string; label: string }> = {
  urgent: { icon: AlertTriangle, color: "bg-destructive/10 text-destructive", label: "Urgent" },
  safety: { icon: Shield, color: "bg-railway-orange/10 text-railway-orange", label: "Safety" },
  notice: { icon: FileText, color: "bg-railway-info/10 text-railway-info", label: "Notice" },
  info: { icon: Bell, color: "bg-primary/10 text-primary", label: "Info" },
};

export default function Notifications() {
  const [filter, setFilter] = useState("all");

  const filtered = filter === "all" ? notifications : notifications.filter((n) => n.type === filter);

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h2 className="text-lg font-bold text-foreground">Alerts & Notifications</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Stay updated with safety circulars and notices</p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {["all", "urgent", "safety", "notice", "info"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap capitalize transition-colors ${
              filter === f ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
            }`}
          >
            {f === "all" ? "All" : f}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {filtered.map((n) => {
          const config = typeConfig[n.type];
          const Icon = config.icon;
          return (
            <div key={n.id} className={`stat-card flex items-start gap-3 p-3.5 ${!n.read ? "border-l-2 border-l-primary" : ""}`}>
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${config.color}`}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${config.color}`}>{config.label}</span>
                  {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
                </div>
                <p className="text-sm font-medium text-foreground leading-snug mt-1">{n.title}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">{n.desc}</p>
                <p className="text-[10px] text-muted-foreground mt-1.5">{n.time}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
