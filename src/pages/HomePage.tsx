import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Search, BookOpen, Mic, MessageSquare, Zap, FileText,
  Train, Fuel, Shield, BookMarked, Wrench, Cable,
  RailSymbol, AlertTriangle, Info, ChevronRight
} from "lucide-react";
import NotificationBell from "@/components/NotificationBell";

const quickActions = [
  { icon: Search, label: "Fault Search", desc: "Find & fix faults", path: "/search", gradient: "from-blue-500 to-blue-600" },
  { icon: Mic, label: "Chalak Mitra", desc: "AI Assistant", path: "/voice-ai", gradient: "from-violet-500 to-purple-600" },
  { icon: BookOpen, label: "CLI Quiz", desc: "Test knowledge", path: "/quiz", gradient: "from-emerald-500 to-teal-600" },
];

const sections = [
  { icon: MessageSquare, label: "GM Message", path: "/gm-messages", iconBg: "bg-blue-100 dark:bg-blue-900/30", iconColor: "text-blue-600 dark:text-blue-400" },
  { icon: Zap, label: "PCEE Message", path: "/pcee-messages", iconBg: "bg-emerald-100 dark:bg-emerald-900/30", iconColor: "text-emerald-600 dark:text-emerald-400" },
  { icon: FileText, label: "NWR Notices", path: "/nwr-notices", iconBg: "bg-amber-100 dark:bg-amber-900/30", iconColor: "text-amber-600 dark:text-amber-400" },
  { icon: Train, label: "Electric Loco", path: "/files/electricLoco", iconBg: "bg-pink-100 dark:bg-pink-900/30", iconColor: "text-pink-600 dark:text-pink-400" },
  { icon: Fuel, label: "Diesel Loco", path: "/files/dieselLoco", iconBg: "bg-orange-100 dark:bg-orange-900/30", iconColor: "text-orange-600 dark:text-orange-400" },
  { icon: Train, label: "Vande Bharat", path: "/files/vandeBharat", iconBg: "bg-indigo-100 dark:bg-indigo-900/30", iconColor: "text-indigo-600 dark:text-indigo-400" },
  { icon: Train, label: "MEMU", path: "/files/memu", iconBg: "bg-cyan-100 dark:bg-cyan-900/30", iconColor: "text-cyan-600 dark:text-cyan-400" },
  { icon: Shield, label: "Kavach", path: "/files/kavach", iconBg: "bg-purple-100 dark:bg-purple-900/30", iconColor: "text-purple-600 dark:text-purple-400" },
  { icon: AlertTriangle, label: "Traffic", path: "/files/traffic", iconBg: "bg-red-100 dark:bg-red-900/30", iconColor: "text-red-600 dark:text-red-400" },
  { icon: AlertTriangle, label: "SPAD", path: "/files/spad", iconBg: "bg-rose-100 dark:bg-rose-900/30", iconColor: "text-rose-600 dark:text-rose-400" },
  { icon: BookMarked, label: "Rule Books", path: "/files/ruleBooks", iconBg: "bg-green-100 dark:bg-green-900/30", iconColor: "text-green-600 dark:text-green-400" },
  { icon: Wrench, label: "C & W", path: "/files/cw", iconBg: "bg-yellow-100 dark:bg-yellow-900/30", iconColor: "text-yellow-600 dark:text-yellow-400" },
  { icon: Cable, label: "OHE", path: "/files/ohe", iconBg: "bg-teal-100 dark:bg-teal-900/30", iconColor: "text-teal-600 dark:text-teal-400" },
  { icon: RailSymbol, label: "P-Way", path: "/files/pway", iconBg: "bg-slate-100 dark:bg-slate-800/40", iconColor: "text-slate-600 dark:text-slate-400" },
  { icon: Info, label: "About NWR", path: "/files/about", iconBg: "bg-sky-100 dark:bg-sky-900/30", iconColor: "text-sky-600 dark:text-sky-400" },
];

const container = { hidden: {}, show: { transition: { staggerChildren: 0.04 } } };
const item = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } };

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="animate-fade-in">
      {/* ===== HERO HEADER ===== */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary via-primary to-blue-700 text-primary-foreground px-5 pt-5 pb-16">
        {/* Decorative circles */}
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/5" />
        <div className="absolute top-20 -left-8 w-24 h-24 rounded-full bg-white/5" />

        {/* Top row */}
        <div className="relative z-10 flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/20">
              <Train size={22} />
            </div>
            <div>
              <h1 className="text-[17px] font-extrabold tracking-tight leading-tight">NWR Chalak Mitra</h1>
              <p className="text-[10px] font-medium opacity-70 tracking-wide">North Western Railway • चालक मित्र</p>
            </div>
          </div>
          <NotificationBell />
        </div>

        {/* Greeting */}
        <div className="relative z-10">
          <p className="text-sm font-medium opacity-90">Welcome back 👋</p>
          <p className="text-[11px] opacity-60 mt-0.5">Ready for a safe journey today</p>
        </div>
      </div>

      {/* ===== QUICK ACTIONS ===== */}
      <div className="px-4 -mt-10 relative z-20">
        <div className="grid grid-cols-3 gap-2.5">
          {quickActions.map((action, i) => (
            <motion.button
              key={action.label}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: i * 0.1, type: "spring", stiffness: 300 }}
              onClick={() => navigate(action.path)}
              className={`bg-gradient-to-br ${action.gradient} text-white rounded-2xl p-4 flex flex-col items-center gap-2 card-elevated press-effect`}
            >
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <action.icon size={20} />
              </div>
              <span className="text-[11px] font-bold leading-tight">{action.label}</span>
              <span className="text-[8px] opacity-70 font-medium">{action.desc}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* ===== MODULES SECTION ===== */}
      <div className="px-5 mt-7 mb-3 flex items-center justify-between">
        <h2 className="text-[13px] font-extrabold text-foreground uppercase tracking-wider">Modules</h2>
        <span className="text-[10px] text-muted-foreground font-medium">{sections.length} items</span>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="px-4 grid grid-cols-4 gap-2 pb-8"
      >
        {sections.map((section) => (
          <motion.button
            key={section.label}
            variants={item}
            onClick={() => navigate(section.path)}
            className="bg-card rounded-2xl p-3 flex flex-col items-center gap-1.5 press-effect border border-border/50 card-elevated"
          >
            <div className={`w-10 h-10 rounded-xl ${section.iconBg} flex items-center justify-center`}>
              <section.icon size={18} className={section.iconColor} />
            </div>
            <span className="text-[10px] font-bold text-foreground text-center leading-tight line-clamp-2">{section.label}</span>
          </motion.button>
        ))}
      </motion.div>

      {/* Footer */}
      <div className="text-center py-5 border-t border-border/50">
        <p className="text-[9px] text-muted-foreground font-medium tracking-wide">NWR CHALAK MITRA v2.0 — NORTH WESTERN RAILWAY</p>
        <p className="text-[8px] text-muted-foreground/60 mt-0.5">Powered by IT Cell, NWR Jaipur</p>
      </div>
    </div>
  );
}
