import { Search, FileText, Wrench } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { TranslationKey } from "@/i18n/translations";

const filterKeys: { key: string; labelKey: TranslationKey }[] = [
  { key: "All", labelKey: "search.all" },
  { key: "Faults", labelKey: "search.faults" },
  { key: "Manuals", labelKey: "search.manuals" },
];

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const { t } = useLanguage();

  const { data: faults } = useQuery({
    queryKey: ["search-faults", query],
    queryFn: async () => {
      let q = supabase.from("faults").select("*, loco_types(name), system_categories(name)");
      if (query) q = q.or(`title.ilike.%${query}%,fault_code.ilike.%${query}%,description.ilike.%${query}%`);
      const { data } = await q.limit(10);
      return data ?? [];
    },
  });

  const { data: manuals } = useQuery({
    queryKey: ["search-manuals", query],
    queryFn: async () => {
      let q = supabase.from("manuals").select("*, loco_types(name), system_categories(name)");
      if (query) q = q.or(`title.ilike.%${query}%,description.ilike.%${query}%`);
      const { data } = await q.limit(10);
      return data ?? [];
    },
  });

  const results = [
    ...(activeFilter === "All" || activeFilter === "Faults"
      ? (faults ?? []).map((f) => ({ id: f.id, type: "fault" as const, title: `${f.loco_types?.name || ""} — ${f.title} (Code: ${f.fault_code})`, desc: f.description || "", loco: f.loco_types?.name || "" }))
      : []),
    ...(activeFilter === "All" || activeFilter === "Manuals"
      ? (manuals ?? []).map((m) => ({ id: m.id, type: "manual" as const, title: m.title, desc: m.description || "", loco: m.loco_types?.name || "" }))
      : []),
  ];

  const iconMap: Record<string, typeof FileText> = { manual: FileText, fault: Wrench };
  const colorMap: Record<string, string> = { manual: "bg-primary/10 text-primary", fault: "bg-destructive/10 text-destructive" };

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h2 className="text-lg font-bold text-foreground">{t("search.title")}</h2>
        <p className="text-sm text-muted-foreground mt-0.5">{t("search.subtitle")}</p>
      </div>
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t("search.placeholder")}
          className="w-full h-12 pl-10 pr-4 rounded-xl border border-input bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {filterKeys.map((f) => (
          <button key={f.key} onClick={() => setActiveFilter(f.key)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${activeFilter === f.key ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>
            {t(f.labelKey)}
          </button>
        ))}
      </div>
      <div className="space-y-2">
        {results.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm">
            {query ? t("search.noResults") : t("search.startTyping")}
          </div>
        ) : (
          results.map((result) => {
            const Icon = iconMap[result.type] || FileText;
            return (
              <div key={result.id} className="stat-card flex items-start gap-3 p-3.5 text-left">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${colorMap[result.type]}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground leading-snug">{result.title}</p>
                  <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">{result.desc}</p>
                  {result.loco && <span className="inline-block mt-1.5 px-2 py-0.5 rounded bg-secondary text-[10px] font-medium text-secondary-foreground">{result.loco}</span>}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
