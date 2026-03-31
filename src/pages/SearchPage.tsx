import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Search, ArrowLeft, AlertTriangle, ChevronRight, Zap } from "lucide-react";

type ViewState =
  | { type: "grid" }
  | { type: "faults"; categoryId: string; categoryName: string }
  | { type: "detail"; faultId: string; categoryName: string };

export default function SearchPage() {
  const { lang } = useLanguage();
  const [view, setView] = useState<ViewState>({ type: "grid" });
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="space-y-4 animate-fade-in -mx-4 -mt-4 md:mx-0 md:mt-0">
      {/* Header */}
      <div className="railway-gradient p-5 md:rounded-2xl">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-[10px] text-white/60 uppercase tracking-wider font-semibold">Troubleshooting</p>
            <h1 className="text-base font-bold text-white">NWR CHALAK MITRA</h1>
          </div>
          <div className="ml-auto flex gap-1">
            <button onClick={() => {}} className={`px-3 py-1 rounded-full text-xs font-semibold ${lang === "hi" ? "bg-white text-primary" : "bg-white/20 text-white"}`}>HI</button>
            <button onClick={() => {}} className={`px-3 py-1 rounded-full text-xs font-semibold ${lang === "en" ? "bg-white text-primary" : "bg-white/20 text-white"}`}>EN</button>
          </div>
        </div>
        <p className="text-[10px] text-white/50 flex items-center gap-1 mt-1">
          👤 Design & Developed by: Pradeep Kr Meena (Sr. ALP/HMH)
        </p>
      </div>

      {/* Search Card */}
      <div className="mx-4 md:mx-0 bg-card rounded-2xl p-4 border border-border/50 shadow-sm">
        <h2 className="text-lg font-extrabold text-foreground mb-3">
          Fault Search ({lang === "hi" ? "फॉल्ट कोड खोजें" : "Search Fault Codes"})
        </h2>
        <div className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Example: F0102P1 / VCB / मुख्य पावर"
            className="flex-1 h-11 px-4 rounded-xl border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <button className="h-11 w-11 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shrink-0">
            <Search className="h-5 w-5" />
          </button>
          <button className="h-11 w-11 rounded-xl bg-primary/80 flex items-center justify-center text-primary-foreground shrink-0">
            <Zap className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 md:px-0">
        {view.type === "grid" && (
          <SubSystemGrid
            lang={lang}
            searchQuery={searchQuery}
            onSelect={(id, name) => setView({ type: "faults", categoryId: id, categoryName: name })}
            onSelectFault={(faultId, catName) => setView({ type: "detail", faultId, categoryName: catName })}
          />
        )}
        {view.type === "faults" && (
          <FaultList
            lang={lang}
            categoryId={view.categoryId}
            categoryName={view.categoryName}
            onBack={() => setView({ type: "grid" })}
            onSelect={(id) => setView({ type: "detail", faultId: id, categoryName: view.categoryName })}
          />
        )}
        {view.type === "detail" && (
          <FaultDetail
            lang={lang}
            faultId={view.faultId}
            categoryName={view.categoryName}
            onBack={() => {
              // Go back to fault list for this category
              setView({ type: "grid" });
            }}
          />
        )}
      </div>
    </div>
  );
}

/* ─── Sub-System Grid ─── */
function SubSystemGrid({
  lang, searchQuery, onSelect, onSelectFault,
}: {
  lang: string; searchQuery: string;
  onSelect: (id: string, name: string) => void;
  onSelectFault: (faultId: string, catName: string) => void;
}) {
  const { data: categories } = useQuery({
    queryKey: ["ss-categories"],
    queryFn: async () => {
      const { data } = await supabase.from("system_categories").select("*").order("name");
      return data ?? [];
    },
  });

  const { data: faultCounts } = useQuery({
    queryKey: ["ss-fault-counts"],
    queryFn: async () => {
      const { data } = await supabase.from("faults").select("system_category_id");
      const counts: Record<string, number> = {};
      (data ?? []).forEach((f: any) => {
        if (f.system_category_id) counts[f.system_category_id] = (counts[f.system_category_id] || 0) + 1;
      });
      return counts;
    },
  });

  // Search results
  const { data: searchResults } = useQuery({
    queryKey: ["fault-search", searchQuery],
    queryFn: async () => {
      if (!searchQuery.trim()) return [];
      const { data } = await supabase
        .from("faults")
        .select("*, system_categories(name)")
        .or(`fault_code.ilike.%${searchQuery}%,title.ilike.%${searchQuery}%,title_hi.ilike.%${searchQuery}%`)
        .limit(20);
      return data ?? [];
    },
    enabled: !!searchQuery.trim(),
  });

  if (searchQuery.trim() && searchResults && searchResults.length > 0) {
    return (
      <div className="space-y-3">
        <h3 className="text-base font-bold text-foreground">
          {lang === "hi" ? "खोज परिणाम" : "Search Results"} ({searchResults.length})
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {searchResults.map((fault: any) => (
            <button
              key={fault.id}
              onClick={() => onSelectFault(fault.id, fault.system_categories?.name || "")}
              className="bg-card rounded-2xl p-4 border border-border/50 shadow-sm text-center hover:shadow-md transition-all active:scale-95"
            >
              <p className="text-sm font-bold text-primary">{fault.fault_code}</p>
              <p className="text-[11px] text-foreground mt-1 line-clamp-2">{lang === "hi" ? fault.title_hi || fault.title : fault.title}</p>
              <span className="inline-block mt-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-semibold">Check</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  const ssCode = (name: string) => name.split(" - ")[0] || name;
  const ssName = (name: string) => name.split(" - ").slice(1).join(" - ") || name;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-extrabold text-foreground">
        Sub-Systems (SS Wise Faults)
      </h3>
      <div className="grid grid-cols-2 gap-3">
        {(categories ?? []).map((cat: any) => (
          <button
            key={cat.id}
            onClick={() => onSelect(cat.id, cat.name)}
            className="bg-card rounded-2xl p-4 border border-border/50 shadow-sm text-center hover:shadow-md transition-all active:scale-95"
          >
            <p className="text-base font-extrabold text-foreground">{ssCode(cat.name)}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">{ssName(cat.name)}</p>
            <span className="inline-block mt-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-semibold">Show</span>
            <p className="text-[10px] text-muted-foreground mt-1.5">Total Faults: {faultCounts?.[cat.id] || 0}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─── Fault List ─── */
function FaultList({
  lang, categoryId, categoryName, onBack, onSelect,
}: {
  lang: string; categoryId: string; categoryName: string; onBack: () => void; onSelect: (id: string) => void;
}) {
  const { data: faults } = useQuery({
    queryKey: ["ss-faults", categoryId],
    queryFn: async () => {
      const { data } = await supabase.from("faults").select("*").eq("system_category_id", categoryId).order("fault_code");
      return data ?? [];
    },
  });

  const ssCode = categoryName.split(" - ")[0];
  const ssLabel = categoryName.split(" - ").slice(1).join(" - ");

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="flex items-center gap-2 text-primary text-sm font-semibold">
        <ArrowLeft className="h-4 w-4" /> {lang === "hi" ? "Sub-Systems पर वापस" : "Back to Sub-Systems"}
      </button>
      <h3 className="text-lg font-extrabold text-foreground">{ssCode} – {ssLabel}</h3>
      <div className="grid grid-cols-2 gap-3">
        {(faults ?? []).map((fault: any) => (
          <button
            key={fault.id}
            onClick={() => onSelect(fault.id)}
            className="bg-card rounded-2xl p-4 border border-border/50 shadow-sm text-center hover:shadow-md transition-all active:scale-95"
          >
            <p className="text-sm font-bold text-primary">{fault.fault_code}</p>
            <p className="text-[11px] text-foreground mt-1 line-clamp-2">{lang === "hi" ? fault.title_hi || fault.title : fault.title}</p>
            <span className="inline-block mt-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-semibold">Check</span>
          </button>
        ))}
      </div>
      {(faults ?? []).length === 0 && (
        <div className="bg-card rounded-2xl border border-border/50 p-12 text-center">
          <span className="text-4xl">📭</span>
          <p className="text-sm text-muted-foreground mt-3">{lang === "hi" ? "कोई फॉल्ट नहीं" : "No faults found"}</p>
        </div>
      )}
    </div>
  );
}

/* ─── Fault Detail ─── */
function FaultDetail({
  lang, faultId, categoryName, onBack,
}: {
  lang: string; faultId: string; categoryName: string; onBack: () => void;
}) {
  const { data: fault } = useQuery({
    queryKey: ["fault-detail", faultId],
    queryFn: async () => {
      const { data } = await supabase.from("faults").select("*, system_categories(name)").eq("id", faultId).single();
      return data;
    },
  });

  if (!fault) return <div className="text-center py-12 text-muted-foreground">Loading...</div>;

  const indicators: { name: string; color: string }[] = (() => {
    try { return Array.isArray(fault.indicators) ? fault.indicators as any : JSON.parse(fault.indicators as any || "[]"); } catch { return []; }
  })();

  const steps: string[] = (() => {
    try {
      if (Array.isArray(fault.solution_steps)) return fault.solution_steps as string[];
      return JSON.parse(fault.solution_steps as any || "[]");
    } catch { return []; }
  })();

  const isolationSteps: string[] = fault.isolation_steps ?? [];
  const ssCode = (fault.system_categories as any)?.name?.split(" - ")[0] || "";
  const ssName = (fault.system_categories as any)?.name || categoryName;

  const indicatorColor = (c: string) => {
    switch (c) {
      case "red": return "bg-red-500";
      case "yellow": return "bg-yellow-400";
      case "orange": return "bg-orange-500";
      case "green": return "bg-green-500";
      default: return "bg-muted";
    }
  };

  return (
    <div className="space-y-4">
      {/* Back row */}
      <div className="flex items-center justify-between bg-card rounded-2xl p-3 border border-border/50">
        <button onClick={onBack} className="flex items-center gap-1 text-primary text-sm font-semibold">
          <ArrowLeft className="h-4 w-4" /> {lang === "hi" ? "लिस्ट पर वापस" : "Back to list"}
        </button>
        <span className="flex items-center gap-1 text-xs font-semibold text-red-500">● {fault.fault_code}</span>
      </div>

      {/* Fault Header Card */}
      <div className="bg-gradient-to-br from-red-700 to-red-900 rounded-2xl p-5 text-white">
        <div className="flex items-center justify-between mb-2">
          <span className="px-3 py-1 rounded-full bg-white/20 text-xs font-bold">{fault.fault_code}</span>
          <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-500/90 text-yellow-900 text-[10px] font-bold">
            <AlertTriangle className="h-3 w-3" /> {fault.priority || "PRIORITY1"}
          </span>
        </div>
        <p className="text-[10px] text-white/60 mt-2">{ssCode} : {ssName.split(" - ").slice(1).join(" - ")}</p>
        <p className="text-[10px] text-white/50 uppercase tracking-wider mt-4">Detailed Troubleshooting</p>
        <h2 className="text-lg font-extrabold mt-1">{lang === "hi" ? fault.title_hi || fault.title : fault.title}</h2>
      </div>

      {/* Fault Message & Impact */}
      {(fault.fault_message || fault.impact) && (
        <div className="bg-card rounded-2xl p-4 border border-border/50 space-y-3">
          {fault.fault_message && (
            <div>
              <p className="text-[10px] text-muted-foreground flex items-center gap-1">💬 {lang === "hi" ? "फॉल्ट मैसेज" : "Fault Message"}</p>
              <p className="text-sm font-medium text-foreground mt-0.5">{fault.fault_message}</p>
            </div>
          )}
          {fault.impact && (
            <div className="bg-secondary/50 rounded-xl p-3">
              <p className="text-[10px] text-muted-foreground flex items-center gap-1">⚡ {lang === "hi" ? "प्रभाव" : "Impact"}</p>
              <p className="text-sm text-foreground mt-0.5">{fault.impact}</p>
            </div>
          )}
        </div>
      )}

      {/* Indicator Status */}
      {indicators.length > 0 && (
        <div className="bg-foreground rounded-2xl p-5 text-background">
          <h3 className="text-xs font-bold uppercase tracking-wider mb-3">Indicator Status</h3>
          <div className="space-y-2">
            {indicators.map((ind, i) => (
              <div key={i} className="flex items-center gap-3 bg-white/10 rounded-xl p-3">
                <div className={`w-8 h-8 rounded-full ${indicatorColor(ind.color)} shadow-lg`} />
                <span className="text-sm font-semibold">{ind.name} {lang === "hi" ? "जलेगी" : "will glow"}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Steps */}
      {steps.length > 0 && (
        <div className="bg-card rounded-2xl p-5 border border-border/50">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">⚙️⚙️</span>
            <h3 className="text-base font-extrabold text-foreground">{lang === "hi" ? "कार्यवाही" : "Action Steps"}</h3>
          </div>
          <div className="space-y-2">
            {steps.map((step, i) => (
              <div key={i} className="flex items-start gap-3 bg-secondary/50 rounded-xl p-3">
                <span className="w-7 h-7 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                <p className="text-sm text-foreground pt-0.5">{step}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Isolation Section */}
      {fault.isolation_required && (
        <div className="bg-gradient-to-br from-red-700 to-red-900 rounded-2xl p-5 text-white">
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/20 text-xs font-bold mb-3">
            <AlertTriangle className="h-3 w-3" /> ISOLATION REQUIRED
          </span>
          <p className="text-[10px] text-white/60 uppercase tracking-wider mt-2">Isolation Message</p>
          <h3 className="text-base font-extrabold mt-1">{fault.isolation_message}</h3>
          {isolationSteps.length > 0 && (
            <div className="mt-4 space-y-2">
              <p className="text-[10px] text-white/60 uppercase tracking-wider">Steps to Follow</p>
              {isolationSteps.map((step, i) => (
                <div key={i} className="bg-white/10 rounded-xl p-3 text-sm">• {step}</div>
              ))}
            </div>
          )}
          {fault.lamp_status && (
            <div className="mt-4 bg-white/10 rounded-xl p-3">
              <p className="text-[10px] text-white/60 flex items-center gap-1">💡 Lamp Status</p>
              <p className="text-sm font-semibold mt-1">{fault.lamp_status}</p>
            </div>
          )}
        </div>
      )}

      {/* Non-isolation lamp status */}
      {!fault.isolation_required && fault.lamp_status && (
        <div className="bg-card rounded-2xl p-4 border border-border/50">
          <p className="text-[10px] text-muted-foreground flex items-center gap-1">💡 Lamp Status</p>
          <p className="text-sm font-medium text-foreground mt-1">{fault.lamp_status}</p>
        </div>
      )}
    </div>
  );
}
