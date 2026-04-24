import { useMemo, useState } from "react";
import { ArrowLeft, Search as SearchIcon, AlertTriangle, ChevronRight, Zap, Cog, Activity, Plug, Cpu, Battery, Wind, MonitorSmartphone, Flame, Gauge, Settings2, Network, X, Lamp, ShieldAlert, ListChecks, Info, Languages } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { SUBSYSTEMS, ALL_FAULTS, searchFaults, SUBSYSTEM_META, TOTAL_FAULT_COUNT, type Fault } from "@/data/faultsHelper";

const ICONS: Record<string, any> = { Zap, Cog, Activity, Plug, Cpu, Battery, Wind, MonitorSmartphone, Flame, Gauge, Settings2, Network };

const container = { hidden: {}, show: { transition: { staggerChildren: 0.03 } } };
const item = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } };

export default function SearchPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [activeSubsystem, setActiveSubsystem] = useState<string | null>(null);
  const [openFault, setOpenFault] = useState<Fault | null>(null);
  const [lang, setLang] = useState<"EN" | "HI">("EN");

  // When user is searching, show fault results across all (or within current subsystem).
  // Otherwise show subsystem grid.
  const isSearching = query.trim().length > 0;
  const searchResults = useMemo(
    () => (isSearching ? searchFaults(query, activeSubsystem ?? undefined).slice(0, 50) : []),
    [query, activeSubsystem, isSearching],
  );
  const subsystemFaults = useMemo(
    () => (activeSubsystem && !isSearching ? SUBSYSTEMS.find((s) => s.subsystemCode === activeSubsystem)?.faults ?? [] : []),
    [activeSubsystem, isSearching],
  );

  const heading = activeSubsystem
    ? SUBSYSTEMS.find((s) => s.subsystemCode === activeSubsystem)?.subsystemNameEN
    : "Fault Search";

  return (
    <div className="animate-fade-in pb-24">
      {/* Header */}
      <div className="bg-card sticky top-0 z-20 border-b border-border">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={() => (activeSubsystem ? setActiveSubsystem(null) : navigate(-1))}
            className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center press-effect"
          >
            <ArrowLeft size={18} className="text-foreground" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-[15px] font-extrabold text-foreground truncate">{heading}</h1>
            <p className="text-[10px] text-muted-foreground font-medium">
              {activeSubsystem
                ? `${subsystemFaults.length || searchResults.length} fault codes`
                : `${TOTAL_FAULT_COUNT} fault codes • ${SUBSYSTEMS.length} subsystems`}
            </p>
          </div>
          <button
            onClick={() => setLang(lang === "EN" ? "HI" : "EN")}
            className="px-2.5 h-8 rounded-lg bg-muted text-[11px] font-bold text-foreground flex items-center gap-1 press-effect"
            aria-label="Toggle language"
          >
            <Languages size={12} /> {lang}
          </button>
        </div>

        <div className="px-4 pb-3">
          <div className="relative">
            <SearchIcon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Code (F0101P1), title, lamp (LSDJ)…"
              className="w-full pl-10 pr-9 py-2.5 bg-muted rounded-xl text-[13px] font-medium border border-border focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all text-foreground placeholder:text-muted-foreground"
            />
            {query && (
              <button onClick={() => setQuery("")} className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-md bg-card flex items-center justify-center press-effect" aria-label="Clear">
                <X size={12} className="text-muted-foreground" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* === MAIN CONTENT === */}
      {/* 1. Search results (highest priority) */}
      {isSearching && (
        <motion.div variants={container} initial="hidden" animate="show" className="p-4 space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-1">
            {searchResults.length} result{searchResults.length === 1 ? "" : "s"} for "{query}"
          </p>
          {searchResults.map((f) => (
            <FaultRow key={f.faultCode} fault={f} lang={lang} onClick={() => setOpenFault(f)} />
          ))}
          {searchResults.length === 0 && (
            <div className="text-center py-12">
              <AlertTriangle size={32} className="text-muted-foreground mx-auto mb-3" />
              <p className="text-sm font-bold text-foreground">No matching fault</p>
              <p className="text-xs text-muted-foreground mt-1">Try a fault code, lamp name, or symptom</p>
            </div>
          )}
        </motion.div>
      )}

      {/* 2. Single subsystem fault list */}
      {!isSearching && activeSubsystem && (
        <motion.div variants={container} initial="hidden" animate="show" className="p-4 space-y-2">
          {subsystemFaults.map((f) => (
            <FaultRow key={f.faultCode} fault={f} lang={lang} onClick={() => setOpenFault(f)} hideSubsystem />
          ))}
        </motion.div>
      )}

      {/* 3. Subsystem grid (default) */}
      {!isSearching && !activeSubsystem && (
        <motion.div variants={container} initial="hidden" animate="show" className="p-4 grid grid-cols-2 gap-3">
          {SUBSYSTEMS.map((sys) => {
            const meta = SUBSYSTEM_META[sys.subsystemCode] ?? { icon: "Settings2", gradient: "from-slate-500 to-slate-700" };
            const Icon = ICONS[meta.icon] ?? Settings2;
            return (
              <motion.button
                key={sys.subsystemCode}
                variants={item}
                onClick={() => setActiveSubsystem(sys.subsystemCode)}
                className="text-left bg-card rounded-2xl border border-border/50 p-3 press-effect card-elevated overflow-hidden"
              >
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${meta.gradient} flex items-center justify-center text-white mb-2.5`}>
                  <Icon size={18} />
                </div>
                <p className="text-[10px] font-bold text-primary tracking-wider">{sys.subsystemCode}</p>
                <p className="text-[12px] font-bold text-foreground leading-tight mt-0.5 line-clamp-2">
                  {lang === "EN" ? sys.subsystemNameEN : sys.subsystemNameHI}
                </p>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
                  <span className="text-[10px] text-muted-foreground font-medium">{sys.faults.length} faults</span>
                  <ChevronRight size={12} className="text-muted-foreground" />
                </div>
              </motion.button>
            );
          })}
        </motion.div>
      )}

      {/* === FAULT DETAIL SHEET === */}
      <AnimatePresence>
        {openFault && <FaultDetail fault={openFault} lang={lang} onClose={() => setOpenFault(null)} onLangToggle={() => setLang(lang === "EN" ? "HI" : "EN")} />}
      </AnimatePresence>
    </div>
  );
}

// ---------- Sub-components ----------

function FaultRow({ fault, lang, onClick, hideSubsystem }: { fault: Fault; lang: "EN" | "HI"; onClick: () => void; hideSubsystem?: boolean }) {
  const title = lang === "EN" ? fault.titleEN : fault.titleHI;
  return (
    <motion.button
      variants={item}
      onClick={onClick}
      className="w-full text-left bg-card rounded-xl border border-border/50 p-3 press-effect card-elevated flex items-start gap-3"
    >
      <div className="shrink-0 w-12 h-12 rounded-lg bg-destructive/10 flex flex-col items-center justify-center">
        <AlertTriangle size={14} className="text-destructive" />
        <span className="text-[8px] font-extrabold text-destructive mt-0.5">{fault.subsystemCode}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-extrabold text-primary tracking-wider">{fault.faultCode}</p>
        <p className="text-[12px] font-bold text-foreground leading-tight mt-0.5 line-clamp-2">{title}</p>
        {!hideSubsystem && (
          <p className="text-[10px] text-muted-foreground mt-1 truncate">
            {lang === "EN" ? fault.subsystemNameEN : fault.subsystemNameHI}
          </p>
        )}
        {fault.isolation?.required && (
          <span className="inline-flex items-center gap-1 mt-1.5 px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 text-[9px] font-bold">
            <ShieldAlert size={9} /> ISOLATION
          </span>
        )}
      </div>
      <ChevronRight size={16} className="text-muted-foreground shrink-0 mt-3" />
    </motion.button>
  );
}

function FaultDetail({ fault, lang, onClose, onLangToggle }: { fault: Fault; lang: "EN" | "HI"; onClose: () => void; onLangToggle: () => void }) {
  const t = (en?: string, hi?: string) => (lang === "EN" ? en : hi) ?? "";
  const arr = (en?: string[], hi?: string[]) => (lang === "EN" ? en : hi) ?? [];

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-background w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[92vh] overflow-y-auto"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div className="sticky top-0 z-10 bg-background pt-2 pb-1 flex justify-center">
          <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
        </div>

        {/* Hero */}
        <div className="px-5 pb-5 pt-2">
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="flex-1">
              <span className="inline-block text-[10px] font-extrabold text-primary tracking-wider bg-primary/10 px-2 py-0.5 rounded">
                {fault.faultCode}
              </span>
              <h2 className="text-base font-extrabold text-foreground leading-tight mt-2">
                {t(fault.titleEN, fault.titleHI)}
              </h2>
              <p className="text-[11px] text-muted-foreground mt-1">
                {t(fault.subsystemNameEN, fault.subsystemNameHI)} · {fault.subsystemCode}
              </p>
            </div>
            <div className="flex flex-col gap-1.5">
              <button onClick={onLangToggle} className="px-2 h-7 rounded-md bg-muted text-[10px] font-bold text-foreground flex items-center gap-1 press-effect">
                <Languages size={11} /> {lang}
              </button>
              <button onClick={onClose} className="w-7 h-7 rounded-md bg-muted flex items-center justify-center press-effect" aria-label="Close">
                <X size={14} className="text-foreground" />
              </button>
            </div>
          </div>

          {/* Effect / Message banner */}
          {(fault.messageEN || fault.messageHI) && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-3 flex items-start gap-2">
              <Info size={14} className="text-destructive shrink-0 mt-0.5" />
              <div className="text-[12px] text-foreground font-medium leading-snug">
                {t(fault.messageEN, fault.messageHI)}
              </div>
            </div>
          )}

          {/* Lamps */}
          {fault.lamps && fault.lamps.length > 0 && (
            <Section icon={Lamp} title={lang === "EN" ? "Indicator Lamps" : "इंडिकेटर लैम्प्स"}>
              <div className="flex flex-wrap gap-1.5">
                {fault.lamps.map((l, i) => (
                  <span key={i} className="px-2 py-1 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-400 text-[11px] font-bold border border-amber-500/20">
                    💡 {l}
                  </span>
                ))}
              </div>
            </Section>
          )}

          {/* Effect */}
          {(fault.effectEN || fault.effectHI) && (
            <Section icon={AlertTriangle} title={lang === "EN" ? "Effect on Loco" : "लोको पर प्रभाव"}>
              <p className="text-[12px] text-foreground leading-relaxed">{t(fault.effectEN, fault.effectHI)}</p>
            </Section>
          )}

          {/* Action steps */}
          {(fault.actionEN?.length || fault.actionHI?.length) ? (
            <Section icon={ListChecks} title={lang === "EN" ? "Action Steps" : "कार्यवाही"}>
              <ol className="space-y-2">
                {arr(fault.actionEN, fault.actionHI).map((step, i) => (
                  <li key={i} className="flex gap-2.5 items-start">
                    <span className="shrink-0 w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-extrabold flex items-center justify-center mt-0.5">
                      {i + 1}
                    </span>
                    <p className="text-[12px] text-foreground leading-relaxed flex-1">{step}</p>
                  </li>
                ))}
              </ol>
            </Section>
          ) : null}

          {/* Isolation */}
          {fault.isolation?.required && (
            <Section icon={ShieldAlert} title={lang === "EN" ? "Isolation Required" : "आइसोलेशन आवश्यक"} variant="warning">
              {(fault.isolation.titleEN || fault.isolation.titleHI) && (
                <p className="text-[12px] font-bold text-foreground mb-2">
                  {t(fault.isolation.titleEN, fault.isolation.titleHI)}
                </p>
              )}
              {(fault.isolation.effectEN || fault.isolation.effectHI) && (
                <p className="text-[11px] text-muted-foreground mb-2.5">
                  {t(fault.isolation.effectEN, fault.isolation.effectHI)}
                </p>
              )}
              {(fault.isolation.stepsEN?.length || fault.isolation.stepsHI?.length) ? (
                <ol className="space-y-1.5">
                  {arr(fault.isolation.stepsEN, fault.isolation.stepsHI).map((step, i) => (
                    <li key={i} className="flex gap-2 items-start">
                      <span className="shrink-0 w-4 h-4 rounded bg-amber-500 text-white text-[9px] font-extrabold flex items-center justify-center mt-0.5">
                        {i + 1}
                      </span>
                      <p className="text-[11px] text-foreground leading-relaxed flex-1">{step}</p>
                    </li>
                  ))}
                </ol>
              ) : null}
            </Section>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

function Section({ icon: Icon, title, children, variant }: { icon: any; title: string; children: React.ReactNode; variant?: "warning" }) {
  const styles = variant === "warning"
    ? "bg-amber-500/5 border-amber-500/20"
    : "bg-card border-border/50";
  return (
    <div className={`mt-4 rounded-xl border ${styles} p-3`}>
      <div className="flex items-center gap-2 mb-2.5">
        <Icon size={14} className={variant === "warning" ? "text-amber-600" : "text-primary"} />
        <h3 className="text-[11px] font-extrabold uppercase tracking-wider text-foreground">{title}</h3>
      </div>
      {children}
    </div>
  );
}
