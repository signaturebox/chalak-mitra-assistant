// Admin → Push Logs verification page.
// Lists every OneSignal call made by the send-push edge function:
// status, recipients, filters, errors, and the raw response payload.

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, RefreshCw, CheckCircle2, AlertTriangle, XCircle,
  ChevronDown, Loader2, Inbox,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface PushLog {
  id: string;
  notification_id: string | null;
  onesignal_id: string | null;
  recipients: number | null;
  http_status: number | null;
  filters: unknown;
  error: string | null;
  raw_response: unknown;
  created_at: string;
}

interface NotifMini {
  id: string;
  title: string;
  type: string;
  urgency: string | null;
}

type Status = "success" | "no_recipients" | "failed";

function classify(log: PushLog): Status {
  if (log.error || (log.http_status !== null && log.http_status >= 400)) return "failed";
  if ((log.recipients ?? 0) === 0) return "no_recipients";
  return "success";
}

const STATUS_META: Record<
  Status,
  { label: string; tone: string; Icon: typeof CheckCircle2 }
> = {
  success:       { label: "Delivered",      tone: "text-emerald-600 bg-emerald-500/10 border-emerald-500/20", Icon: CheckCircle2 },
  no_recipients: { label: "No recipients",  tone: "text-amber-600 bg-amber-500/10 border-amber-500/20",       Icon: AlertTriangle },
  failed:        { label: "Failed",         tone: "text-destructive bg-destructive/10 border-destructive/20", Icon: XCircle },
};

export default function AdminPushLogs() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [logs, setLogs] = useState<PushLog[]>([]);
  const [notifs, setNotifs] = useState<Record<string, NotifMini>>({});
  const [filter, setFilter] = useState<"all" | Status>("all");
  const [openId, setOpenId] = useState<string | null>(null);

  const loadLogs = async () => {
    const { data: rows } = await supabase
      .from("push_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    const list = (rows ?? []) as PushLog[];
    setLogs(list);

    const ids = Array.from(
      new Set(list.map((l) => l.notification_id).filter(Boolean) as string[]),
    );
    if (ids.length > 0) {
      const { data: nrows } = await supabase
        .from("notifications")
        .select("id, title, type, urgency")
        .in("id", ids);
      const map: Record<string, NotifMini> = {};
      (nrows ?? []).forEach((n) => {
        map[(n as NotifMini).id] = n as NotifMini;
      });
      setNotifs(map);
    } else {
      setNotifs({});
    }
  };

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id);
      const adminRoles = ["super_admin", "zone_admin", "division_admin", "lobby_admin"];
      const ok = (roles ?? []).some((r) => adminRoles.includes(r.role));
      setIsAdmin(ok);
      if (ok) await loadLogs();
      setLoading(false);
    };
    init();

    // realtime
    const ch = supabase
      .channel("push-logs-admin")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "push_logs" },
        () => loadLogs(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [navigate]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadLogs();
    setRefreshing(false);
  };

  const counts = {
    all: logs.length,
    success: logs.filter((l) => classify(l) === "success").length,
    no_recipients: logs.filter((l) => classify(l) === "no_recipients").length,
    failed: logs.filter((l) => classify(l) === "failed").length,
  };

  const visible = filter === "all" ? logs : logs.filter((l) => classify(l) === filter);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="p-6 text-center">
        <p className="text-sm text-muted-foreground">Admins only.</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in pb-24">
      {/* Header */}
      <div className="bg-card sticky top-0 z-20 border-b border-border px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="press-effect" aria-label="Back">
          <ArrowLeft size={22} />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-base font-bold text-foreground">Push Delivery Logs</h1>
          <p className="text-xs text-muted-foreground">OneSignal responses for every notification</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center press-effect disabled:opacity-50"
          aria-label="Refresh"
        >
          <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Summary */}
      <div className="px-4 pt-4 grid grid-cols-3 gap-2">
        <SummaryCard
          label="Delivered"
          value={counts.success}
          tone="text-emerald-600 bg-emerald-500/10"
          Icon={CheckCircle2}
        />
        <SummaryCard
          label="No recipients"
          value={counts.no_recipients}
          tone="text-amber-600 bg-amber-500/10"
          Icon={AlertTriangle}
        />
        <SummaryCard
          label="Failed"
          value={counts.failed}
          tone="text-destructive bg-destructive/10"
          Icon={XCircle}
        />
      </div>

      {/* Filters */}
      <div className="px-4 mt-4 flex gap-2 overflow-x-auto no-scrollbar">
        {(["all", "success", "no_recipients", "failed"] as const).map((f) => {
          const active = filter === f;
          const label =
            f === "all" ? `All (${counts.all})`
            : f === "success" ? `Delivered (${counts.success})`
            : f === "no_recipients" ? `No recipients (${counts.no_recipients})`
            : `Failed (${counts.failed})`;
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`shrink-0 press-effect px-3 py-1.5 rounded-full text-[11px] font-bold border ${
                active
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-muted text-foreground border-border"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Logs */}
      <div className="px-4 mt-4 space-y-2">
        {visible.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Inbox className="mx-auto mb-2 opacity-50" size={32} />
            <p className="text-sm">No push log entries yet.</p>
          </div>
        )}

        {visible.map((log) => {
          const status = classify(log);
          const meta = STATUS_META[status];
          const notif = log.notification_id ? notifs[log.notification_id] : null;
          const isOpen = openId === log.id;

          return (
            <div key={log.id} className={`rounded-2xl border bg-card overflow-hidden`}>
              <button
                onClick={() => setOpenId(isOpen ? null : log.id)}
                className="w-full px-3 py-3 flex items-start gap-3 text-left press-effect"
              >
                <div className={`shrink-0 w-9 h-9 rounded-lg flex items-center justify-center ${meta.tone}`}>
                  <meta.Icon size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-[13px] font-bold text-foreground truncate">
                      {notif?.title ?? "(notification deleted)"}
                    </h3>
                    <span className={`shrink-0 text-[9px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded border ${meta.tone}`}>
                      {meta.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground">
                    <span>HTTP {log.http_status ?? "—"}</span>
                    <span>·</span>
                    <span>{log.recipients ?? 0} recipients</span>
                    <span>·</span>
                    <span>{formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}</span>
                  </div>
                  {log.error && (
                    <p className="text-[11px] text-destructive mt-1.5 line-clamp-2">{log.error}</p>
                  )}
                </div>
                <ChevronDown
                  size={16}
                  className={`shrink-0 mt-2 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`}
                />
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    className="overflow-hidden border-t border-border bg-muted/30"
                  >
                    <div className="p-3 space-y-2 text-[11px]">
                      <Field label="OneSignal ID" value={log.onesignal_id ?? "—"} mono />
                      <Field label="Notification ID" value={log.notification_id ?? "—"} mono />
                      {notif && (
                        <Field
                          label="Type / Urgency"
                          value={`${notif.type} · ${notif.urgency ?? "normal"}`}
                        />
                      )}
                      <CodeBlock label="Filters" json={log.filters} />
                      <CodeBlock label="OneSignal Response" json={log.raw_response} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SummaryCard({
  label, value, tone, Icon,
}: { label: string; value: number; tone: string; Icon: typeof CheckCircle2 }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-3">
      <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${tone}`}>
        <Icon size={14} />
      </div>
      <p className="text-lg font-extrabold text-foreground mt-2 leading-none">{value}</p>
      <p className="text-[10px] text-muted-foreground mt-1">{label}</p>
    </div>
  );
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-start gap-2">
      <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-muted-foreground w-28">
        {label}
      </span>
      <span className={`text-foreground break-all ${mono ? "font-mono" : ""}`}>{value}</span>
    </div>
  );
}

function CodeBlock({ label, json }: { label: string; json: unknown }) {
  const text = json == null ? "—" : JSON.stringify(json, null, 2);
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
        {label}
      </p>
      <pre className="bg-background border border-border rounded-lg p-2 text-[10px] font-mono text-foreground overflow-x-auto whitespace-pre-wrap break-all">
        {text}
      </pre>
    </div>
  );
}
