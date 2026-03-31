import { useState } from "react";
import { BookOpen, Search, ChevronRight, Shield, Wrench, Gavel, AlertTriangle, Star } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";

type Category = "all" | "gsr" | "actm" | "subsidiary" | "safety";

const categoryConfig: Record<string, { icon: typeof BookOpen; color: string; labelEn: string; labelHi: string }> = {
  gsr: { icon: Gavel, color: "bg-primary/10 text-primary", labelEn: "G&SR", labelHi: "G&SR" },
  actm: { icon: Wrench, color: "bg-railway-info/10 text-railway-info", labelEn: "ACTM", labelHi: "ACTM" },
  subsidiary: { icon: BookOpen, color: "bg-railway-orange/10 text-railway-orange", labelEn: "Subsidiary Rules", labelHi: "सहायक नियम" },
  safety: { icon: Shield, color: "bg-railway-success/10 text-railway-success", labelEn: "Safety Circulars", labelHi: "सुरक्षा परिपत्र" },
};

export default function RuleBooks() {
  const [activeCategory, setActiveCategory] = useState<Category>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { t, lang } = useLanguage();

  const { data: ruleBooks } = useQuery({
    queryKey: ["rule-books", activeCategory, searchQuery],
    queryFn: async () => {
      let q = supabase.from("rule_books").select("*");
      if (activeCategory !== "all") q = q.eq("category", activeCategory);
      if (searchQuery) {
        q = q.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%,chapter_number.ilike.%${searchQuery}%,tags.cs.{${searchQuery}}`);
      }
      const { data } = await q.order("is_important", { ascending: false }).order("chapter_number").limit(50);
      return data ?? [];
    },
  });

  const categories: { key: Category; labelKey: string }[] = [
    { key: "all", labelKey: "rulebooks.all" },
    { key: "gsr", labelKey: "rulebooks.gsr" },
    { key: "actm", labelKey: "rulebooks.actm" },
    { key: "subsidiary", labelKey: "rulebooks.subsidiary" },
    { key: "safety", labelKey: "rulebooks.safety" },
  ];

  const getTitle = (item: any) => lang === "hi" && item.title_hi ? item.title_hi : item.title;
  const getDesc = (item: any) => lang === "hi" && item.description_hi ? item.description_hi : item.description;
  const getContent = (item: any) => lang === "hi" && item.content_hi ? item.content_hi : item.content;

  // Category stats
  const catCounts: Record<string, number> = {};
  (ruleBooks ?? []).forEach((r) => { catCounts[r.category] = (catCounts[r.category] || 0) + 1; });

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h2 className="text-lg font-bold text-foreground">{t("rulebooks.title")}</h2>
        <p className="text-sm text-muted-foreground mt-0.5">{t("rulebooks.subtitle")}</p>
      </div>

      {/* Category Cards */}
      {activeCategory === "all" && !searchQuery && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.entries(categoryConfig).map(([key, config]) => {
            const Icon = config.icon;
            return (
              <button
                key={key}
                onClick={() => setActiveCategory(key as Category)}
                className="stat-card flex flex-col items-center gap-2 py-5 text-center group"
              >
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${config.color} transition-transform group-hover:scale-110`}>
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-xs font-semibold text-foreground">
                  {lang === "hi" ? config.labelHi : config.labelEn}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t("rulebooks.searchPlaceholder")}
          className="w-full h-11 pl-10 pr-4 rounded-xl border border-input bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {/* Filter Chips */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setActiveCategory(cat.key)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              activeCategory === cat.key ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
            }`}
          >
            {t(cat.labelKey as any)}
          </button>
        ))}
      </div>

      {/* Results */}
      <div className="space-y-2">
        {(ruleBooks ?? []).length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm">
            {searchQuery ? t("rulebooks.noResults") : t("rulebooks.browseCategories")}
          </div>
        ) : (
          (ruleBooks ?? []).map((rule) => {
            const config = categoryConfig[rule.category] || categoryConfig.gsr;
            const Icon = config.icon;
            const isExpanded = expandedId === rule.id;

            return (
              <div key={rule.id} className="stat-card overflow-hidden">
                <button
                  onClick={() => setExpandedId(isExpanded ? null : rule.id)}
                  className="w-full flex items-center gap-3 p-3.5 text-left"
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${config.color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      {rule.is_important && <Star className="h-3 w-3 text-railway-orange fill-railway-orange shrink-0" />}
                      <p className="text-sm font-medium text-foreground truncate">{getTitle(rule)}</p>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {lang === "hi" ? config.labelHi : config.labelEn}
                      {rule.chapter_number ? ` · ${rule.chapter_number}` : ""}
                      {rule.section ? ` · ${rule.section}` : ""}
                    </p>
                  </div>
                  <ChevronRight className={`h-4 w-4 text-muted-foreground shrink-0 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                </button>

                {isExpanded && (
                  <div className="px-3.5 pb-3.5 space-y-3 border-t border-border pt-3">
                    {getDesc(rule) && (
                      <p className="text-xs text-muted-foreground italic">{getDesc(rule)}</p>
                    )}
                    {getContent(rule) && (
                      <div className="bg-secondary/50 rounded-lg p-3">
                        <p className="text-xs text-foreground leading-relaxed whitespace-pre-line">{getContent(rule)}</p>
                      </div>
                    )}
                    {rule.tags && rule.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {rule.tags.map((tag: string) => (
                          <span key={tag} className="px-2 py-0.5 rounded bg-secondary text-[10px] font-medium text-secondary-foreground">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
