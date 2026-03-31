import { BookOpen, ChevronRight, Zap, Fuel, Train, FileText } from "lucide-react";
import { useState } from "react";

const locoCategories = [
  {
    id: "electric",
    label: "Electric Locos",
    icon: Zap,
    color: "bg-railway-info/10 text-railway-info",
    locos: ["WAP7", "WAP5", "WAG9", "WAG9H"],
  },
  {
    id: "diesel",
    label: "Diesel Locos",
    icon: Fuel,
    color: "bg-railway-orange/10 text-railway-orange",
    locos: ["WDG4", "WDP4", "WDG4G", "WDP4D"],
  },
];

const systemCategories = [
  "Traction Motor", "Braking System", "Compressor", "Transformer",
  "Control Electronics", "Bogie & Suspension", "Pantograph", "Battery & Charging",
];

const recentManuals = [
  { id: 1, title: "WAP7 Traction Motor Maintenance", loco: "WAP7", pages: 45, category: "Traction Motor" },
  { id: 2, title: "WDG4 Brake System Troubleshooting", loco: "WDG4", pages: 32, category: "Braking System" },
  { id: 3, title: "WAG9 Compressor Fault Guide", loco: "WAG9", pages: 28, category: "Compressor" },
  { id: 4, title: "WDP4 Control Electronics Manual", loco: "WDP4", pages: 56, category: "Control Electronics" },
  { id: 5, title: "WAP7 Pantograph Procedures", loco: "WAP7", pages: 18, category: "Pantograph" },
];

export default function Knowledge() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-lg font-bold text-foreground">Loco Knowledge Base</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Browse manuals, troubleshooting guides & technical documents</p>
      </div>

      {/* Loco Categories */}
      <section>
        <h3 className="text-sm font-semibold text-foreground mb-3">By Locomotive Type</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {locoCategories.map((cat) => (
            <div key={cat.id} className="stat-card">
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${cat.color}`}>
                  <cat.icon className="h-5 w-5" />
                </div>
                <h4 className="font-semibold text-foreground">{cat.label}</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {cat.locos.map((loco) => (
                  <button
                    key={loco}
                    onClick={() => setSelectedCategory(loco)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      selectedCategory === loco
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    }`}
                  >
                    {loco}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* System Categories */}
      <section>
        <h3 className="text-sm font-semibold text-foreground mb-3">By System</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {systemCategories.map((sys) => (
            <button
              key={sys}
              onClick={() => setSelectedCategory(sys)}
              className={`stat-card text-left p-3 text-xs font-medium ${
                selectedCategory === sys
                  ? "ring-2 ring-primary bg-primary/5"
                  : ""
              }`}
            >
              {sys}
            </button>
          ))}
        </div>
      </section>

      {/* Manuals List */}
      <section>
        <h3 className="text-sm font-semibold text-foreground mb-3">
          {selectedCategory ? `Results: ${selectedCategory}` : "Recent Manuals"}
        </h3>
        <div className="space-y-2">
          {recentManuals
            .filter((m) => !selectedCategory || m.loco === selectedCategory || m.category === selectedCategory)
            .map((manual) => (
              <button
                key={manual.id}
                className="stat-card w-full flex items-center gap-3 p-3.5 text-left group"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <FileText className="h-4.5 w-4.5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{manual.title}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {manual.loco} · {manual.category} · {manual.pages} pages
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
              </button>
            ))}
        </div>
      </section>
    </div>
  );
}
