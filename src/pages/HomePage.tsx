import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Search, BookOpen, Mic, MessageSquare, Zap, FileText,
  Train, Fuel, Shield, BookMarked, Wrench, Cable,
  RailSymbol, AlertTriangle, Info, ChevronRight
} from "lucide-react";

const quickActions = [
  { icon: Search, label: "Fault Search", path: "/search", color: "bg-blue-500" },
  { icon: Mic, label: "Chalak Mitra AI", path: "/voice-ai", color: "bg-violet-500" },
  { icon: BookOpen, label: "CLI Quiz", path: "/quiz", color: "bg-emerald-500" },
];

const sections = [
  { icon: MessageSquare, label: "GM Message", path: "/gm-messages", color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-950/30" },
  { icon: Zap, label: "PCEE Message", path: "/pcee-messages", color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-950/30" },
  { icon: FileText, label: "NWR Notices", path: "/nwr-notices", color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-950/30" },
  { icon: Train, label: "Electric Loco", path: "/files/electricLoco", color: "text-pink-500", bg: "bg-pink-50 dark:bg-pink-950/30" },
  { icon: Fuel, label: "Diesel Loco", path: "/files/dieselLoco", color: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-950/30" },
  { icon: Train, label: "Vande Bharat", path: "/files/vandeBharat", color: "text-indigo-500", bg: "bg-indigo-50 dark:bg-indigo-950/30" },
  { icon: Train, label: "MEMU", path: "/files/memu", color: "text-cyan-500", bg: "bg-cyan-50 dark:bg-cyan-950/30" },
  { icon: Shield, label: "Kavach", path: "/files/kavach", color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-950/30" },
  { icon: AlertTriangle, label: "Traffic", path: "/files/traffic", color: "text-red-500", bg: "bg-red-50 dark:bg-red-950/30" },
  { icon: AlertTriangle, label: "SPAD Prevention", path: "/files/spad", color: "text-rose-500", bg: "bg-rose-50 dark:bg-rose-950/30" },
  { icon: BookMarked, label: "Rule Books", path: "/files/ruleBooks", color: "text-green-500", bg: "bg-green-50 dark:bg-green-950/30" },
  { icon: Wrench, label: "C & W", path: "/files/cw", color: "text-yellow-600", bg: "bg-yellow-50 dark:bg-yellow-950/30" },
  { icon: Cable, label: "OHE", path: "/files/ohe", color: "text-teal-500", bg: "bg-teal-50 dark:bg-teal-950/30" },
  { icon: RailSymbol, label: "P-Way", path: "/files/pway", color: "text-slate-500", bg: "bg-slate-50 dark:bg-slate-950/30" },
  { icon: Info, label: "About NWR", path: "/files/about", color: "text-sky-500", bg: "bg-sky-50 dark:bg-sky-950/30" },
];

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="animate-fade-in">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-primary via-primary to-blue-700 text-primary-foreground px-5 pt-6 pb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <Train size={22} />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">NWR Chalak Mitra</h1>
            <p className="text-[11px] opacity-80">North Western Railway • चालक मित्र</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-4 -mt-5">
        <div className="flex gap-3">
          {quickActions.map((action, i) => (
            <motion.button
              key={action.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              onClick={() => navigate(action.path)}
              className={`flex-1 ${action.color} text-white rounded-2xl p-4 flex flex-col items-center gap-2 shadow-lg press-effect`}
            >
              <action.icon size={24} />
              <span className="text-xs font-semibold">{action.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Section Header */}
      <div className="px-5 mt-6 mb-3">
        <h2 className="text-sm font-bold text-foreground tracking-wide uppercase opacity-60">Modules</h2>
      </div>

      {/* Module Grid */}
      <div className="px-4 grid grid-cols-3 gap-3 pb-6">
        {sections.map((section, i) => (
          <motion.button
            key={section.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.05 + i * 0.03 }}
            onClick={() => navigate(section.path)}
            className={`${section.bg} rounded-2xl p-3.5 flex flex-col items-center gap-2 press-effect border border-border/50`}
          >
            <section.icon size={24} className={section.color} />
            <span className="text-[11px] font-semibold text-foreground text-center leading-tight">{section.label}</span>
          </motion.button>
        ))}
      </div>

      {/* Footer */}
      <div className="text-center py-4 text-[10px] text-muted-foreground">
        NWR Chalak Mitra v2.0 — North Western Railway
      </div>
    </div>
  );
}
