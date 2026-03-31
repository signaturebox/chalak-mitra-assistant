import { Shield, Users, Building, MapPin, FileText, TrendingUp, Settings } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { TranslationKey } from "@/i18n/translations";

export default function Admin() {
  const { t } = useLanguage();

  const adminModules: { icon: typeof Users; labelKey: TranslationKey; descKey: TranslationKey; count: string }[] = [
    { icon: Users, labelKey: "admin.userMgmt", descKey: "admin.userMgmtDesc", count: "245 users" },
    { icon: Building, labelKey: "admin.zoneMgmt", descKey: "admin.zoneMgmtDesc", count: "6 zones" },
    { icon: MapPin, labelKey: "admin.lobbyMgmt", descKey: "admin.lobbyMgmtDesc", count: "28 lobbies" },
    { icon: FileText, labelKey: "admin.contentMgmt", descKey: "admin.contentMgmtDesc", count: "124 docs" },
    { icon: TrendingUp, labelKey: "admin.analytics", descKey: "admin.analyticsDesc", count: "View" },
    { icon: Settings, labelKey: "admin.systemSettings", descKey: "admin.systemSettingsDesc", count: "" },
  ];

  const recentActivity = [
    { action: "New user registered", detail: "ALP Suresh — Ajmer Division", time: "10 min ago" },
    { action: "Manual uploaded", detail: "WAG9H Traction Guide — Zone Admin", time: "2h ago" },
    { action: "Safety circular published", detail: "SC/2024/03 — Fog Working", time: "5h ago" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-railway-orange/10 flex items-center justify-center">
          <Shield className="h-5 w-5 text-railway-orange" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-foreground">{t("admin.title")}</h2>
          <p className="text-sm text-muted-foreground">{t("admin.subtitle")}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {adminModules.map((mod) => (
          <button key={mod.labelKey} className="stat-card flex items-center gap-3 p-4 text-left group">
            <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
              <mod.icon className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">{t(mod.labelKey)}</p>
              <p className="text-[11px] text-muted-foreground">{t(mod.descKey)}</p>
            </div>
            {mod.count && <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-md">{mod.count}</span>}
          </button>
        ))}
      </div>

      <section>
        <h3 className="text-sm font-semibold text-foreground mb-3">{t("admin.recentActivity")}</h3>
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
