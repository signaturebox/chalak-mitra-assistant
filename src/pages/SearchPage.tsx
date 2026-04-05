import { useState } from "react";
import { ArrowLeft, Search as SearchIcon, AlertTriangle, ChevronRight, Zap, Cpu, Wind, Settings2, Radio, Thermometer, Gauge, Box } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const subSystems = [
  { name: "Traction Motor", count: 12, icon: Zap, color: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" },
  { name: "Transformer", count: 8, icon: Box, color: "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400" },
  { name: "Auxiliary", count: 15, icon: Settings2, color: "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400" },
  { name: "Braking System", count: 10, icon: Gauge, color: "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400" },
  { name: "Pantograph", count: 6, icon: Radio, color: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400" },
  { name: "Control Electronics", count: 18, icon: Cpu, color: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400" },
  { name: "Cooling System", count: 7, icon: Thermometer, color: "bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400" },
  { name: "Air System", count: 9, icon: Wind, color: "bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400" },
];

const container = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, x: -12 }, show: { opacity: 1, x: 0 } };

export default function SearchPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const filtered = subSystems.filter(s =>
    s.name.toLowerCase().includes(query.toLowerCase())
  );

  const totalFaults = filtered.reduce((a, b) => a + b.count, 0);

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="bg-card sticky top-0 z-10 border-b border-border">
        <div className="flex items-center gap-3 px-4 py-3">
          <button onClick={() => navigate(-1)} className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center press-effect">
            <ArrowLeft size={16} className="text-foreground" />
          </button>
          <div className="flex-1">
            <h1 className="text-[15px] font-extrabold text-foreground">Fault Search</h1>
            <p className="text-[10px] text-muted-foreground font-medium">{totalFaults} fault codes in {filtered.length} systems</p>
          </div>
        </div>

        <div className="px-4 pb-3">
          <div className="relative">
            <SearchIcon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search fault codes, symptoms..."
              className="w-full pl-10 pr-4 py-2.5 bg-muted rounded-xl text-[13px] font-medium border border-border focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all text-foreground placeholder:text-muted-foreground"
            />
          </div>
        </div>
      </div>

      {/* System List */}
      <motion.div variants={container} initial="hidden" animate="show" className="p-4 space-y-2">
        {filtered.map((sys) => {
          const Icon = sys.icon;
          return (
            <motion.button
              key={sys.name}
              variants={item}
              className="w-full flex items-center justify-between p-4 bg-card rounded-2xl border border-border/50 press-effect card-elevated"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${sys.color} flex items-center justify-center`}>
                  <Icon size={18} />
                </div>
                <div className="text-left">
                  <p className="text-[13px] font-bold text-foreground">{sys.name}</p>
                  <p className="text-[10px] text-muted-foreground font-medium">{sys.count} fault codes</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-destructive/10 text-destructive text-[9px] font-bold">{sys.count}</span>
                <ChevronRight size={16} className="text-muted-foreground" />
              </div>
            </motion.button>
          );
        })}

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <AlertTriangle size={32} className="text-muted-foreground mx-auto mb-3" />
            <p className="text-sm font-bold text-foreground">No results found</p>
            <p className="text-xs text-muted-foreground mt-1">Try different keywords</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
