import { BookOpen, Wrench, Search, Bell, Clock, FileText, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const quickTools = [
  { to: "/knowledge", icon: BookOpen, label: "Loco Manuals", color: "bg-primary text-primary-foreground" },
  { to: "/search", icon: Search, label: "Fault Search", color: "bg-railway-info text-accent-foreground" },
  { to: "/tools", icon: Wrench, label: "Crew Tools", color: "bg-railway-success text-accent-foreground" },
  { to: "/tools", icon: Clock, label: "Duty Calculator", color: "bg-railway-orange text-accent-foreground" },
];

export default function Dashboard() {
  const { profile, user } = useAuth();

  const { data: notifications } = useQuery({
    queryKey: ["notifications-recent"],
    queryFn: async () => {
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(3);
      return data ?? [];
    },
  });

  const { data: faultCount } = useQuery({
    queryKey: ["fault-count"],
    queryFn: async () => {
      const { count } = await supabase.from("faults").select("*", { count: "exact", head: true });
      return count ?? 0;
    },
  });

  const { data: manualCount } = useQuery({
    queryKey: ["manual-count"],
    queryFn: async () => {
      const { count } = await supabase.from("manuals").select("*", { count: "exact", head: true });
      return count ?? 0;
    },
  });

  const { data: bookmarkCount } = useQuery({
    queryKey: ["bookmark-count"],
    queryFn: async () => {
      if (!user) return 0;
      const { count } = await supabase.from("bookmarks").select("*", { count: "exact", head: true }).eq("user_id", user.id);
      return count ?? 0;
    },
    enabled: !!user,
  });

  const stats = [
    { label: "Manuals", value: String(manualCount ?? 0), icon: FileText },
    { label: "Fault Solutions", value: String(faultCount ?? 0), icon: TrendingUp },
    { label: "Active Alerts", value: String(notifications?.length ?? 0), icon: Bell },
    { label: "Bookmarks", value: String(bookmarkCount ?? 0), icon: BookOpen },
  ];

  const typeIcon: Record<string, string> = {
    urgent: "bg-destructive/10 text-destructive",
    safety: "bg-railway-orange/10 text-railway-orange",
    notice: "bg-railway-info/10 text-railway-info",
    info: "bg-primary/10 text-primary",
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="railway-gradient rounded-2xl p-5 md:p-8">
        <h2 className="text-lg md:text-2xl font-bold text-primary-foreground">
          Welcome{profile?.full_name ? `, ${profile.full_name}` : ""} 👋
        </h2>
        <p className="text-primary-foreground/70 text-sm mt-1">
          Your digital assistant for safe & efficient railway operations
        </p>
      </div>

      <section>
        <h3 className="text-sm font-semibold text-foreground mb-3">Quick Access</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {quickTools.map((tool) => (
            <Link key={tool.label} to={tool.to} className="stat-card flex flex-col items-center gap-2 py-5 text-center group">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${tool.color} transition-transform group-hover:scale-110`}>
                <tool.icon className="h-5 w-5" />
              </div>
              <span className="text-xs font-medium text-foreground">{tool.label}</span>
            </Link>
          ))}
        </div>
      </section>

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

      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-foreground">Recent Alerts</h3>
          <Link to="/notifications" className="text-xs text-primary font-medium">View All</Link>
        </div>
        <div className="space-y-2">
          {(notifications ?? []).map((alert) => (
            <div key={alert.id} className="stat-card flex items-start gap-3 p-3.5">
              <div className={`mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${typeIcon[alert.type] || typeIcon.info}`}>
                <Bell className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground leading-snug">{alert.title}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {new Date(alert.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
