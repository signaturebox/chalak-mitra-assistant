import { useEffect, useState } from "react";
import { Bell, X, AlertTriangle, FileText, BookOpen, Megaphone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";

interface Notif {
  id: string;
  title: string;
  description: string | null;
  type: string;
  urgency: string | null;
  created_at: string;
}

const ICONS: Record<string, typeof Bell> = {
  safety_alert: AlertTriangle,
  circular: Megaphone,
  manual: BookOpen,
};

const ACCENT: Record<string, string> = {
  safety_alert: "text-destructive bg-destructive/10",
  circular: "text-amber-600 bg-amber-500/10",
  manual: "text-blue-600 bg-blue-500/10",
};

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notif[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("notifications")
      .select("id, title, description, type, urgency, created_at")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(30);
    setItems((data ?? []) as Notif[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // realtime updates
    const ch = supabase
      .channel("notifications-bell")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications" },
        () => load(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, []);

  const urgentCount = items.filter((i) => i.urgency === "urgent").length;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="relative w-9 h-9 rounded-xl bg-muted flex items-center justify-center press-effect"
        aria-label="Notifications"
      >
        <Bell size={18} className="text-foreground" />
        {urgentCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-destructive text-white text-[10px] font-extrabold flex items-center justify-center">
            {urgentCount > 9 ? "9+" : urgentCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          >
            <motion.div
              className="bg-background w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl max-h-[85vh] overflow-y-auto"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 z-10 bg-background/95 backdrop-blur px-5 py-3 flex items-center justify-between border-b border-border">
                <h2 className="text-base font-extrabold text-foreground">Notifications</h2>
                <button
                  onClick={() => setOpen(false)}
                  className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center press-effect"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="p-4 space-y-2">
                {loading && items.length === 0 && (
                  <p className="text-center text-sm text-muted-foreground py-8">Loading…</p>
                )}
                {!loading && items.length === 0 && (
                  <p className="text-center text-sm text-muted-foreground py-8">No notifications yet.</p>
                )}
                {items.map((n) => {
                  const Icon = ICONS[n.type] ?? FileText;
                  const accent = ACCENT[n.type] ?? "text-primary bg-primary/10";
                  return (
                    <div
                      key={n.id}
                      className={`rounded-2xl border p-3 flex items-start gap-3 ${
                        n.urgency === "urgent"
                          ? "border-destructive/30 bg-destructive/5"
                          : "border-border bg-card"
                      }`}
                    >
                      <div className={`shrink-0 w-9 h-9 rounded-lg flex items-center justify-center ${accent}`}>
                        <Icon size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="text-[13px] font-bold text-foreground leading-tight">{n.title}</h3>
                          {n.urgency === "urgent" && (
                            <span className="shrink-0 text-[9px] font-extrabold uppercase tracking-wider text-destructive bg-destructive/10 px-1.5 py-0.5 rounded">
                              Urgent
                            </span>
                          )}
                        </div>
                        {n.description && (
                          <p className="text-[12px] text-muted-foreground mt-1 line-clamp-3">{n.description}</p>
                        )}
                        <p className="text-[10px] text-muted-foreground mt-1.5">
                          {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
