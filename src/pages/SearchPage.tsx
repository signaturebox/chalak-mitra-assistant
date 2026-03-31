import { Search, Filter, FileText, Wrench, BookOpen, AlertTriangle } from "lucide-react";
import { useState } from "react";

const resultTypes = ["All", "Manuals", "Faults", "Rules", "Circulars"] as const;

const sampleResults = [
  { id: 1, type: "fault", title: "WAP7 — Traction Motor Overheating (Code: TM-07)", desc: "Check cooling fan operation. Inspect motor bearings. Verify load conditions.", loco: "WAP7" },
  { id: 2, type: "manual", title: "WAG9 Compressor Maintenance Manual", desc: "Complete guide for CP maintenance, troubleshooting and periodic inspection.", loco: "WAG9" },
  { id: 3, type: "rule", title: "G&SR Rule 4.03 — Defective Loco Procedure", desc: "Procedure when loco becomes defective in mid-section. Action by LP and Controller.", loco: "" },
  { id: 4, type: "circular", title: "Safety Circular 2024/03 — Fog Working", desc: "Instructions for working during foggy weather. Speed restrictions and precautions.", loco: "" },
  { id: 5, type: "fault", title: "WDG4 — Engine Oil Pressure Low (Code: EOP-12)", desc: "Check oil level. Inspect oil pump. Verify pressure relief valve.", loco: "WDG4" },
];

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("All");

  const filtered = sampleResults.filter((r) => {
    if (activeFilter !== "All") {
      const typeMap: Record<string, string> = { Manuals: "manual", Faults: "fault", Rules: "rule", Circulars: "circular" };
      if (r.type !== typeMap[activeFilter]) return false;
    }
    if (query) {
      const q = query.toLowerCase();
      return r.title.toLowerCase().includes(q) || r.desc.toLowerCase().includes(q);
    }
    return true;
  });

  const iconMap: Record<string, typeof FileText> = {
    manual: FileText,
    fault: Wrench,
    rule: BookOpen,
    circular: AlertTriangle,
  };

  const colorMap: Record<string, string> = {
    manual: "bg-primary/10 text-primary",
    fault: "bg-destructive/10 text-destructive",
    rule: "bg-railway-info/10 text-railway-info",
    circular: "bg-railway-orange/10 text-railway-orange",
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h2 className="text-lg font-bold text-foreground">Global Search</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Search across manuals, faults, rules & circulars</p>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search fault code, keyword, loco type..."
          className="w-full h-12 pl-10 pr-4 rounded-xl border border-input bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {resultTypes.map((type) => (
          <button
            key={type}
            onClick={() => setActiveFilter(type)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              activeFilter === type
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground"
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Results */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm">
            No results found. Try a different search term.
          </div>
        ) : (
          filtered.map((result) => {
            const Icon = iconMap[result.type] || FileText;
            return (
              <button key={result.id} className="stat-card w-full flex items-start gap-3 p-3.5 text-left">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${colorMap[result.type]}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground leading-snug">{result.title}</p>
                  <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">{result.desc}</p>
                  {result.loco && (
                    <span className="inline-block mt-1.5 px-2 py-0.5 rounded bg-secondary text-[10px] font-medium text-secondary-foreground">
                      {result.loco}
                    </span>
                  )}
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
