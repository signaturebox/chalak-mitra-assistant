import { BookOpen, Wrench, Search, Bell, AlertTriangle, Clock, FileText, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";

const quickTools = [
  { to: "/knowledge", icon: BookOpen, label: "Loco Manuals", color: "bg-primary text-primary-foreground" },
  { to: "/search", icon: Search, label: "Fault Search", color: "bg-railway-info text-accent-foreground" },
  { to: "/tools", icon: Wrench, label: "Crew Tools", color: "bg-railway-success text-accent-foreground" },
  { to: "/tools#duty", icon: Clock, label: "Duty Calculator", color: "bg-railway-orange text-accent-foreground" },
];

const recentAlerts = [
  { id: 1, type: "safety", title: "Safety Circular: Fog Working Instructions", time: "2 hours ago" },
  { id: 2, type: "notice", title: "Updated ACTM Chapter 7 — Brake System", time: "1 day ago" },
  { id: 3, type: "urgent", title: "Speed Restriction: Jaipur-Ajmer Section", time: "3 days ago" },
];

const stats = [
  { label: "Manuals Available", value: "124", icon: FileText },
  { label: "Fault Solutions", value: "856", icon: TrendingUp },
  { label: "Active Alerts", value: "3", icon: Bell },
  { label: "Your Bookmarks", value: "12", icon: BookOpen },
];

export default function Dashboard() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Banner */}
      <div className="railway-gradient rounded-2xl p-5 md:p-8">
        <h2 className="text-lg md:text-2xl font-bold text-primary-foreground">
          Welcome, Loco Pilot 👋
        </h2>
        <p className="text-primary-foreground/70 text-sm mt-1">
          Your digital assistant for safe & efficient railway operations
        </p>
      </div>

      {/* Quick Tools */}
      <section>
        <h3 className="text-sm font-semibold text-foreground mb-3">Quick Access</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {quickTools.map((tool) => (
            <Link
              key={tool.to}
              to={tool.to}
              className="stat-card flex flex-col items-center gap-2 py-5 text-center group"
            >
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${tool.color} transition-transform group-hover:scale-110`}>
                <tool.icon className="h-5 w-5" />
              </div>
              <span className="text-xs font-medium text-foreground">{tool.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section>
        <h3 className="text-sm font-semibold text-foreground mb-3">Overview</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {stats.map((stat) => (
            <div key={stat.label} className="stat-card">
              <div className="flex items-center gap-2 mb-2">
                <stat.icon className="h-4 w-4 text-muted-foreground" />
                <span className="text-[11px] text-muted-foreground">{stat.label}</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Alerts */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-foreground">Recent Alerts</h3>
          <Link to="/notifications" className="text-xs text-primary font-medium">View All</Link>
        </div>
        <div className="space-y-2">
          {recentAlerts.map((alert) => (
            <div key={alert.id} className="stat-card flex items-start gap-3 p-3.5">
              <div className={`mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                alert.type === "urgent" ? "bg-destructive/10 text-destructive" :
                alert.type === "safety" ? "bg-railway-orange/10 text-railway-orange" :
                "bg-railway-info/10 text-railway-info"
              }`}>
                {alert.type === "urgent" ? <AlertTriangle className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground leading-snug">{alert.title}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{alert.time}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
