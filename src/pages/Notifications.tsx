import { Bell, AlertTriangle, FileText, Shield } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { TranslationKey } from "@/i18n/translations";

const typeConfig: Record<string, { icon: typeof Bell; color: string; labelKey: TranslationKey }> = {
  urgent: { icon: AlertTriangle, color: "bg-destructive/10 text-destructive", labelKey: "notifications.urgent" },
  safety: { icon: Shield, color: "bg-railway-orange/10 text-railway-orange", labelKey: "notifications.safety" },
  notice: { icon: FileText, color: "bg-railway-info/10 text-railway-info", labelKey: "notifications.notice" },
  info: { icon: Bell, color: "bg-primary/10 text-primary", labelKey: "notifications.info" },
};

const filterKeys: { key: string; labelKey: TranslationKey }[] = [
  { key: "all", labelKey: "notifications.all" },
  { key: "urgent", labelKey: "notifications.urgent" },
  { key: "safety", labelKey: "notifications.safety" },
  { key: "notice", labelKey: "notifications.notice" },
  { key: "info", labelKey: "notifications.info" },
];

export default function Notifications() {
  const [filter, setFilter] = useState("all");
  const { t } = useLanguage();

  const { data: notifications } = useQuery({
    queryKey: ["notifications-all"],
    queryFn: async () => {
      const { data } = await supabase.from("notifications").select("*").eq("is_active", true).order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const filtered = filter === "all" ? (notifications ?? []) : (notifications ?? []).filter((n) => n.type === filter);

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h2 className="text-lg font-bold text-foreground">{t("notifications.title")}</h2>
        <p className="text-sm text-muted-foreground mt-0.5">{t("notifications.subtitle")}</p>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {filterKeys.map((f) => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap capitalize transition-colors ${filter === f.key ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>
            {t(f.labelKey)}
          </button>
        ))}
      </div>
      <div className="space-y-2">
        {filtered.map((n) => {
          const config = typeConfig[n.type] || typeConfig.info;
          const Icon = config.icon;
          return (
            <div key={n.id} className="stat-card flex items-start gap-3 p-3.5">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${config.color}`}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${config.color}`}>{t(config.labelKey)}</span>
                </div>
                <p className="text-sm font-medium text-foreground leading-snug mt-1">{n.title}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">{n.description}</p>
                <p className="text-[10px] text-muted-foreground mt-1.5">{new Date(n.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
