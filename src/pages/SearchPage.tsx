import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Search, ArrowLeft, AlertTriangle, Zap } from "lucide-react";

type ViewState =
  | { type: "grid" }
  | { type: "faults"; categoryId: string; categoryName: string }
  | { type: "detail"; faultId: string; categoryName: string };

export default function SearchPage() {
  const { lang } = useLanguage();
  const [view, setView] = useState<ViewState>({ type: "grid" });
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Search Bar */}
      <div className="native-card p-4">
        <h2 className="text-base font-bold text-foreground mb-3">
          {lang === "hi" ? "फॉल्ट कोड खोजें" : "Fault Search"}
        </h2>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="F0102P1 / VCB / मुख्य पावर"
              className="w-full h-10 pl-9 pr-4 rounded-xl bg-muted text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>
      </div>

      {view.type === "grid" && (
        <SubSystemGrid lang={lang} searchQuery={searchQuery}
          onSelect={(id, name) => setView({ type: "faults", categoryId: id, categoryName: name })}
          onSelectFault={(faultId, catName) => setView({ type: "detail", faultId, categoryName: catName })}
        />
      )}
      {view.type === "faults" && (
        <FaultList lang={lang} categoryId={view.categoryId} categoryName={view.categoryName}
          onBack={() => setView({ type: "grid" })}
          onSelect={(id) => setView({ type: "detail", faultId: id, categoryName: view.categoryName })}
        />
      )}
      {view.type === "detail" && (
        <FaultDetail lang={lang} faultId={view.faultId} categoryName={view.categoryName}
          onBack={() => setView({ type: "grid" })}
        />
      )}
    </div>
  );
}

function SubSystemGrid({ lang, searchQuery, onSelect, onSelectFault }: {
  lang: string; searchQuery: string;
  onSelect: (id: string, name: string) => void;
  onSelectFault: (faultId: string, catName: string) => void;
}) {
  const { data: categories } = useQuery({
    queryKey: ["ss-categories"],
    queryFn: async () => { const { data } = await supabase.from("system_categories").select("*").order("name"); return data ?? []; },
  });
  const { data: faultCounts } = useQuery({
    queryKey: ["ss-fault-counts"],
    queryFn: async () => {
      const { data } = await supabase.from("faults").select("system_category_id");
      const counts: Record<string, number> = {};
      (data ?? []).forEach((f: any) => { if (f.system_category_id) counts[f.system_category_id] = (counts[f.system_category_id] || 0) + 1; });
      return counts;
    },
  });
  const { data: searchResults } = useQuery({
    queryKey: ["fault-search", searchQuery],
    queryFn: async () => {
      if (!searchQuery.trim()) return [];
      const { data } = await supabase.from("faults").select("*, system_categories(name)")
        .or(`fault_code.ilike.%${searchQuery}%,title.ilike.%${searchQuery}%,title_hi.ilike.%${searchQuery}%`).limit(20);
      return data ?? [];
    },
    enabled: !!searchQuery.trim(),
  });

  if (searchQuery.trim() && searchResults && searchResults.length > 0) {
    return (
      <div className="space-y-3">
        <p className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wider">
          {lang === "hi" ? "खोज परिणाम" : "Results"} ({searchResults.length})
        </p>
        <div className="native-section">
          {searchResults.map((fault: any) => (
            <button key={fault.id} onClick={() => onSelectFault(fault.id, fault.system_categories?.name || "")} className="native-row w-full text-left">
              <div className="w-9 h-9 rounded-xl bg-destructive/10 flex items-center justify-center">
                <Zap className="h-4 w-4 text-destructive" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-primary">{fault.fault_code}</p>
                <p className="text-[12px] text-foreground truncate">{lang === "hi" ? fault.title_hi || fault.title : fault.title}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  const ssCode = (name: string) => name.split(" - ")[0] || name;
  const ssName = (name: string) => name.split(" - ").slice(1).join(" - ") || name;

  return (
    <div className="space-y-3">
      <p className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wider">Sub-Systems</p>
      <div className="grid grid-cols-2 gap-2.5">
        {(categories ?? []).map((cat: any) => (
          <button key={cat.id} onClick={() => onSelect(cat.id, cat.name)}
            className="native-card p-3.5 text-left active:scale-95 transition-transform">
            <p className="text-[15px] font-extrabold text-foreground">{ssCode(cat.name)}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">{ssName(cat.name)}</p>
            <div className="flex items-center justify-between mt-2.5">
              <span className="text-[10px] text-muted-foreground">{faultCounts?.[cat.id] || 0} faults</span>
              <span className="pill-btn pill-btn-active text-[10px] py-1 px-2.5">Show</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function FaultList({ lang, categoryId, categoryName, onBack, onSelect }: {
  lang: string; categoryId: string; categoryName: string; onBack: () => void; onSelect: (id: string) => void;
}) {
  const { data: faults } = useQuery({
    queryKey: ["ss-faults", categoryId],
    queryFn: async () => { const { data } = await supabase.from("faults").select("*").eq("system_category_id", categoryId).order("fault_code"); return data ?? []; },
  });

  return (
    <div className="space-y-3">
      <button onClick={onBack} className="flex items-center gap-1.5 text-primary text-[13px] font-semibold">
        <ArrowLeft className="h-4 w-4" /> {lang === "hi" ? "वापस" : "Back"}
      </button>
      <p className="text-base font-bold text-foreground">{categoryName}</p>
      {(faults ?? []).length === 0 ? (
        <div className="native-card p-12 text-center">
          <p className="text-sm text-muted-foreground">{lang === "hi" ? "कोई फॉल्ट नहीं" : "No faults found"}</p>
        </div>
      ) : (
        <div className="native-section">
          {(faults ?? []).map((fault: any) => (
            <button key={fault.id} onClick={() => onSelect(fault.id)} className="native-row w-full text-left">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                <Zap className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-primary">{fault.fault_code}</p>
                <p className="text-[12px] text-foreground truncate">{lang === "hi" ? fault.title_hi || fault.title : fault.title}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function FaultDetail({ lang, faultId, categoryName, onBack }: {
  lang: string; faultId: string; categoryName: string; onBack: () => void;
}) {
  const { data: fault } = useQuery({
    queryKey: ["fault-detail", faultId],
    queryFn: async () => { const { data } = await supabase.from("faults").select("*, system_categories(name)").eq("id", faultId).single(); return data; },
  });

  if (!fault) return <div className="text-center py-12 text-muted-foreground text-sm">Loading...</div>;

  const indicators: { name: string; color: string }[] = (() => {
    try { return Array.isArray(fault.indicators) ? fault.indicators as any : JSON.parse(fault.indicators as any || "[]"); } catch { return []; }
  })();
  const steps: string[] = (() => {
    try { if (Array.isArray(fault.solution_steps)) return fault.solution_steps as string[]; return JSON.parse(fault.solution_steps as any || "[]"); } catch { return []; }
  })();
  const isolationSteps: string[] = fault.isolation_steps ?? [];
  const ssName = (fault.system_categories as any)?.name || categoryName;

  const indicatorColor = (c: string) => {
    switch (c) { case "red": return "bg-red-500"; case "yellow": return "bg-yellow-400"; case "orange": return "bg-orange-500"; case "green": return "bg-green-500"; default: return "bg-muted"; }
  };

  return (
    <div className="space-y-3">
      <button onClick={onBack} className="flex items-center gap-1.5 text-primary text-[13px] font-semibold">
        <ArrowLeft className="h-4 w-4" /> {lang === "hi" ? "वापस" : "Back"}
      </button>

      <div className="rounded-2xl overflow-hidden">
        <div className="bg-gradient-to-br from-red-600 to-red-800 p-5 text-white">
          <div className="flex items-center gap-2 mb-3">
            <span className="px-2.5 py-1 rounded-lg bg-white/20 text-[11px] font-bold">{fault.fault_code}</span>
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-yellow-500/90 text-yellow-900 text-[10px] font-bold">
              <AlertTriangle className="h-3 w-3" /> {fault.priority || "PRIORITY1"}
            </span>
          </div>
          <p className="text-[11px] text-white/50">{ssName}</p>
          <h2 className="text-lg font-bold mt-1">{lang === "hi" ? fault.title_hi || fault.title : fault.title}</h2>
        </div>
      </div>

      {(fault.fault_message || fault.impact) && (
        <div className="native-section">
          {fault.fault_message && (
            <div className="px-4 py-3">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">{lang === "hi" ? "फॉल्ट मैसेज" : "Fault Message"}</p>
              <p className="text-[13px] font-medium text-foreground">{fault.fault_message}</p>
            </div>
          )}
          {fault.impact && (
            <div className="px-4 py-3">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">{lang === "hi" ? "प्रभाव" : "Impact"}</p>
              <p className="text-[13px] text-foreground">{fault.impact}</p>
            </div>
          )}
        </div>
      )}

      {indicators.length > 0 && (
        <div className="native-card p-4 bg-foreground text-background">
          <p className="text-[11px] font-bold uppercase tracking-wider mb-3 text-background/60">Indicator Status</p>
          <div className="space-y-2">
            {indicators.map((ind, i) => (
              <div key={i} className="flex items-center gap-3 bg-background/10 rounded-xl p-3">
                <div className={`w-7 h-7 rounded-full ${indicatorColor(ind.color)} shadow-lg`} />
                <span className="text-[13px] font-semibold">{ind.name} {lang === "hi" ? "जलेगी" : "will glow"}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {steps.length > 0 && (
        <div className="native-card p-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-3">
            {lang === "hi" ? "कार्यवाही" : "Action Steps"}
          </p>
          <div className="space-y-2">
            {steps.map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                <p className="text-[13px] text-foreground">{step}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {fault.isolation_required && (
        <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-red-600 to-red-800 p-4 text-white">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/20 text-[10px] font-bold mb-3">
            <AlertTriangle className="h-3 w-3" /> ISOLATION REQUIRED
          </span>
          <p className="text-[13px] font-bold mt-2">{fault.isolation_message}</p>
          {isolationSteps.length > 0 && (
            <div className="mt-3 space-y-1.5">
              {isolationSteps.map((step, i) => (
                <div key={i} className="bg-white/10 rounded-xl p-2.5 text-[12px]">• {step}</div>
              ))}
            </div>
          )}
          {fault.lamp_status && (
            <div className="mt-3 bg-white/10 rounded-xl p-2.5">
              <p className="text-[10px] text-white/60">💡 Lamp Status</p>
              <p className="text-[12px] font-semibold mt-0.5">{fault.lamp_status}</p>
            </div>
          )}
        </div>
      )}

      {!fault.isolation_required && fault.lamp_status && (
        <div className="native-card p-4">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">💡 Lamp Status</p>
          <p className="text-[13px] font-medium text-foreground">{fault.lamp_status}</p>
        </div>
      )}
    </div>
  );
}
