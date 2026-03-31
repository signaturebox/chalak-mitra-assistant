import { BookOpen, ChevronRight, Zap, Fuel, FileText } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Knowledge() {
  const [selectedLoco, setSelectedLoco] = useState<string | null>(null);
  const [selectedSystem, setSelectedSystem] = useState<string | null>(null);
  const { t } = useLanguage();

  const { data: locoTypes } = useQuery({
    queryKey: ["loco-types"],
    queryFn: async () => {
      const { data } = await supabase.from("loco_types").select("*").order("name");
      return data ?? [];
    },
  });

  const { data: systemCategories } = useQuery({
    queryKey: ["system-categories"],
    queryFn: async () => {
      const { data } = await supabase.from("system_categories").select("*").order("name");
      return data ?? [];
    },
  });

  const { data: faults } = useQuery({
    queryKey: ["faults-browse", selectedLoco, selectedSystem],
    queryFn: async () => {
      let q = supabase.from("faults").select("*, loco_types(name), system_categories(name)");
      if (selectedLoco) q = q.eq("loco_type_id", selectedLoco);
      if (selectedSystem) q = q.eq("system_category_id", selectedSystem);
      const { data } = await q.order("created_at", { ascending: false }).limit(20);
      return data ?? [];
    },
  });

  const electric = (locoTypes ?? []).filter((l) => l.category === "electric");
  const diesel = (locoTypes ?? []).filter((l) => l.category === "diesel");

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-lg font-bold text-foreground">{t("knowledge.title")}</h2>
        <p className="text-sm text-muted-foreground mt-0.5">{t("knowledge.subtitle")}</p>
      </div>

      <section>
        <h3 className="text-sm font-semibold text-foreground mb-3">{t("knowledge.byLocoType")}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { labelKey: "knowledge.electricLocos" as const, icon: Zap, color: "bg-railway-info/10 text-railway-info", items: electric },
            { labelKey: "knowledge.dieselLocos" as const, icon: Fuel, color: "bg-railway-orange/10 text-railway-orange", items: diesel },
          ].map((cat) => (
            <div key={cat.labelKey} className="stat-card">
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${cat.color}`}>
                  <cat.icon className="h-5 w-5" />
                </div>
                <h4 className="font-semibold text-foreground">{t(cat.labelKey)}</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {cat.items.map((loco) => (
                  <button
                    key={loco.id}
                    onClick={() => { setSelectedLoco(selectedLoco === loco.id ? null : loco.id); setSelectedSystem(null); }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      selectedLoco === loco.id ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    }`}
                  >
                    {loco.name}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 className="text-sm font-semibold text-foreground mb-3">{t("knowledge.bySystem")}</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {(systemCategories ?? []).map((sys) => (
            <button
              key={sys.id}
              onClick={() => { setSelectedSystem(selectedSystem === sys.id ? null : sys.id); setSelectedLoco(null); }}
              className={`stat-card text-left p-3 text-xs font-medium ${selectedSystem === sys.id ? "ring-2 ring-primary bg-primary/5" : ""}`}
            >
              {sys.name}
            </button>
          ))}
        </div>
      </section>

      <section>
        <h3 className="text-sm font-semibold text-foreground mb-3">
          {selectedLoco || selectedSystem ? t("knowledge.matchingFaults") : t("knowledge.allFaults")}
        </h3>
        <div className="space-y-2">
          {(faults ?? []).length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">{t("knowledge.noFaults")}</div>
          ) : (
            (faults ?? []).map((fault) => <FaultCard key={fault.id} fault={fault} />)
          )}
        </div>
      </section>
    </div>
  );
}

function FaultCard({ fault }: { fault: any }) {
  const [expanded, setExpanded] = useState(false);
  const { t } = useLanguage();
  const steps = Array.isArray(fault.solution_steps) ? fault.solution_steps : [];

  return (
    <div className="stat-card overflow-hidden">
      <button onClick={() => setExpanded(!expanded)} className="w-full flex items-center gap-3 p-3.5 text-left">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
          fault.severity === "critical" ? "bg-destructive/10 text-destructive" :
          fault.severity === "high" ? "bg-railway-orange/10 text-railway-orange" :
          "bg-primary/10 text-primary"
        }`}>
          <FileText className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">{fault.title}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">{fault.loco_types?.name} · {fault.fault_code} · {fault.severity}</p>
        </div>
        <ChevronRight className={`h-4 w-4 text-muted-foreground shrink-0 transition-transform ${expanded ? "rotate-90" : ""}`} />
      </button>
      {expanded && (
        <div className="px-3.5 pb-3.5 space-y-3 border-t border-border pt-3">
          {fault.description && <p className="text-xs text-muted-foreground">{fault.description}</p>}
          {steps.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-foreground mb-1">{t("knowledge.solutionSteps")}</p>
              <ol className="text-xs text-muted-foreground space-y-1 list-decimal pl-4">
                {steps.map((step: string, i: number) => <li key={i}>{step}</li>)}
              </ol>
            </div>
          )}
          {fault.safety_precautions?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-destructive mb-1">{t("knowledge.safetyPrecautions")}</p>
              <ul className="text-xs text-muted-foreground space-y-0.5 list-disc pl-4">
                {fault.safety_precautions.map((p: string, i: number) => <li key={i}>{p}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
