// Admin → Broadcast composer.
// Inserts a row into `notifications` with target_role / target_division / target_zone.
// The DB trigger fires the `send-push` edge function which delivers the
// targeted push via OneSignal.

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, Send, Loader2, Megaphone, AlertTriangle } from "lucide-react";

type AppRole = "super_admin" | "zone_admin" | "division_admin" | "lobby_admin" | "crew_user";

interface Zone { id: string; name: string; code: string }
interface Division { id: string; name: string; code: string; zone_id: string }

const TYPES = [
  { value: "broadcast",    label: "📢 General Broadcast" },
  { value: "circular",     label: "📋 Circular" },
  { value: "manual",       label: "📚 Manual / Rule" },
  { value: "safety_alert", label: "🚨 Safety Alert" },
];

const ROLES: { value: AppRole | ""; label: string }[] = [
  { value: "",                label: "All roles" },
  { value: "crew_user",       label: "Crew (LP/ALP)" },
  { value: "lobby_admin",     label: "Lobby Admin" },
  { value: "division_admin",  label: "Division Admin" },
  { value: "zone_admin",      label: "Zone Admin" },
];

export default function AdminBroadcast() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [sending, setSending] = useState(false);

  const [zones, setZones] = useState<Zone[]>([]);
  const [divisions, setDivisions] = useState<Division[]>([]);

  const [form, setForm] = useState({
    title: "",
    description: "",
    type: "broadcast",
    urgency: "normal" as "normal" | "urgent",
    target_role: "" as AppRole | "",
    target_zone_id: "",
    target_division_id: "",
  });

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
      setIsAdmin((roles ?? []).some((r) => adminRoles.includes(r.role)));

      const [{ data: z }, { data: d }] = await Promise.all([
        supabase.from("zones").select("id,name,code").order("name"),
        supabase.from("divisions").select("id,name,code,zone_id").order("name"),
      ]);
      setZones((z ?? []) as Zone[]);
      setDivisions((d ?? []) as Division[]);
      setLoading(false);
    };
    init();
  }, [navigate]);

  const filteredDivisions = form.target_zone_id
    ? divisions.filter((d) => d.zone_id === form.target_zone_id)
    : divisions;

  const handleSend = async () => {
    if (!form.title.trim()) {
      toast.error("Title is required");
      return;
    }
    setSending(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const { error } = await supabase.from("notifications").insert({
        title: form.title.trim(),
        description: form.description.trim() || null,
        type: form.type,
        urgency: form.urgency,
        target_role: (form.target_role || null) as AppRole | null,
        target_zone_id: form.target_zone_id || null,
        target_division_id: form.target_division_id || null,
        is_active: true,
        created_by: session?.user.id ?? null,
      });
      if (error) throw error;
      toast.success("Notification queued — push fanout in progress.");
      setForm({
        title: "", description: "", type: "broadcast", urgency: "normal",
        target_role: "", target_zone_id: "", target_division_id: "",
      });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to send";
      toast.error(msg);
    } finally {
      setSending(false);
    }
  };

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
      <div className="bg-card sticky top-0 z-20 border-b border-border px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="press-effect">
          <ArrowLeft size={22} />
        </button>
        <div className="flex-1">
          <h1 className="text-base font-bold text-foreground flex items-center gap-2">
            <Megaphone size={16} /> Broadcast
          </h1>
          <p className="text-xs text-muted-foreground">Targeted push to crew & admins</p>
        </div>
        <button
          onClick={() => navigate("/admin/push-logs")}
          className="text-[11px] font-bold px-2.5 py-1.5 rounded-lg bg-muted text-foreground press-effect border border-border"
        >
          Logs
        </button>

      <div className="p-5 space-y-4">
        {/* Type */}
        <div>
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Type</label>
          <select
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
            className="w-full mt-1 px-3 py-2.5 rounded-xl bg-muted border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
          >
            {TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>

        {/* Urgency */}
        <div>
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Urgency</label>
          <div className="grid grid-cols-2 gap-2 mt-1">
            {(["normal", "urgent"] as const).map((u) => (
              <button
                key={u}
                type="button"
                onClick={() => setForm({ ...form, urgency: u })}
                className={`press-effect py-2.5 rounded-xl text-xs font-semibold capitalize border flex items-center justify-center gap-1.5 ${
                  form.urgency === u
                    ? u === "urgent"
                      ? "bg-destructive text-destructive-foreground border-destructive"
                      : "bg-primary text-primary-foreground border-primary"
                    : "bg-muted border-border text-foreground"
                }`}
              >
                {u === "urgent" && <AlertTriangle size={13} />}
                {u}
              </button>
            ))}
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Title *</label>
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full mt-1 px-3 py-2.5 rounded-xl bg-muted border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            placeholder="e.g. Speed Restriction at JP-RE Section"
          />
        </div>

        {/* Description */}
        <div>
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Message</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={4}
            className="w-full mt-1 px-3 py-2.5 rounded-xl bg-muted border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
            placeholder="Details to push…"
          />
        </div>

        {/* Targeting */}
        <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
          <p className="text-[11px] font-extrabold uppercase tracking-wider text-foreground">Targeting</p>
          <div>
            <label className="text-[10px] font-bold text-muted-foreground">Role</label>
            <select
              value={form.target_role}
              onChange={(e) => setForm({ ...form, target_role: e.target.value as AppRole | "" })}
              className="w-full mt-1 px-3 py-2.5 rounded-xl bg-muted border border-border text-sm"
            >
              {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-bold text-muted-foreground">Zone</label>
            <select
              value={form.target_zone_id}
              onChange={(e) => setForm({ ...form, target_zone_id: e.target.value, target_division_id: "" })}
              className="w-full mt-1 px-3 py-2.5 rounded-xl bg-muted border border-border text-sm"
            >
              <option value="">All zones</option>
              {zones.map((z) => <option key={z.id} value={z.id}>{z.name} ({z.code})</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-bold text-muted-foreground">Division</label>
            <select
              value={form.target_division_id}
              onChange={(e) => setForm({ ...form, target_division_id: e.target.value })}
              className="w-full mt-1 px-3 py-2.5 rounded-xl bg-muted border border-border text-sm"
            >
              <option value="">All divisions{form.target_zone_id ? " in zone" : ""}</option>
              {filteredDivisions.map((d) => <option key={d.id} value={d.id}>{d.name} ({d.code})</option>)}
            </select>
          </div>
          <p className="text-[10px] text-muted-foreground leading-snug">
            Leave fields blank to widen the audience. Filters combine with AND.
          </p>
        </div>

        <button
          onClick={handleSend}
          disabled={sending || !form.title.trim()}
          className="w-full bg-primary text-primary-foreground py-3.5 rounded-xl font-bold text-sm press-effect flex items-center justify-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-60"
        >
          {sending ? <Loader2 className="animate-spin" size={18} /> : <Send size={16} />}
          {sending ? "Sending…" : "Send Push"}
        </button>
      </div>
    </div>
  );
}
