import { useState } from "react";
import { ArrowLeft, Search as SearchIcon, AlertTriangle, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const subSystems = [
  { name: "Traction Motor", count: 12 },
  { name: "Transformer", count: 8 },
  { name: "Auxiliary", count: 15 },
  { name: "Braking System", count: 10 },
  { name: "Pantograph", count: 6 },
  { name: "Control Electronics", count: 18 },
  { name: "Cooling System", count: 7 },
  { name: "Air System", count: 9 },
];

export default function SearchPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const filtered = subSystems.filter(s =>
    s.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="animate-fade-in">
      <div className="bg-card sticky top-0 z-10 border-b border-border">
        <div className="flex items-center gap-3 px-4 py-3">
          <button onClick={() => navigate(-1)} className="press-effect">
            <ArrowLeft size={22} className="text-foreground" />
          </button>
          <h1 className="text-base font-bold text-foreground">Fault Search</h1>
        </div>

        <div className="px-4 pb-3">
          <div className="relative">
            <SearchIcon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search fault codes, symptoms..."
              className="w-full pl-10 pr-4 py-2.5 bg-muted rounded-xl text-sm border border-border focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none transition"
            />
          </div>
        </div>
      </div>

      <div className="p-4 space-y-2">
        {filtered.map((sys, i) => (
          <motion.button
            key={sys.name}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04 }}
            className="w-full flex items-center justify-between p-4 bg-card rounded-xl border border-border press-effect"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-destructive/10 flex items-center justify-center">
                <AlertTriangle size={18} className="text-destructive" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-foreground">{sys.name}</p>
                <p className="text-xs text-muted-foreground">{sys.count} fault codes</p>
              </div>
            </div>
            <ChevronRight size={18} className="text-muted-foreground" />
          </motion.button>
        ))}
      </div>
    </div>
  );
}
