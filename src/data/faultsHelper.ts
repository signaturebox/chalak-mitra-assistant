import faultsRaw from "./faults.json";

export interface IsolationDetail {
  required: boolean;
  titleHI?: string;
  titleEN?: string;
  effectHI?: string;
  effectEN?: string;
  stepsHI?: string[];
  stepsEN?: string[];
}

export interface Fault {
  faultCode: string;
  titleHI: string;
  titleEN: string;
  messageHI?: string;
  messageEN?: string;
  lamps?: string[];
  effectHI?: string;
  effectEN?: string;
  actionHI?: string[];
  actionEN?: string[];
  isolation?: IsolationDetail;
  // Composed
  subsystemCode: string;
  subsystemNameEN: string;
  subsystemNameHI: string;
}

export interface Subsystem {
  subsystemCode: string;
  subsystemNameEN: string;
  subsystemNameHI: string;
  faults: Fault[];
}

// Normalize: dedupe duplicate subsystem codes (raw has SS09 listed twice, missing SS10 — they're the same system in source data)
const seen = new Map<string, Subsystem>();
for (const s of faultsRaw as any[]) {
  const code = s.subsystemCode;
  const existing = seen.get(code);
  const faults: Fault[] = (s.faults ?? []).map((f: any) => ({
    ...f,
    subsystemCode: code,
    subsystemNameEN: s.subsystemNameEN,
    subsystemNameHI: s.subsystemNameHI,
  }));
  if (existing) {
    // merge unique fault codes
    const codes = new Set(existing.faults.map((f) => f.faultCode));
    for (const f of faults) if (!codes.has(f.faultCode)) existing.faults.push(f);
  } else {
    seen.set(code, {
      subsystemCode: code,
      subsystemNameEN: s.subsystemNameEN,
      subsystemNameHI: s.subsystemNameHI,
      faults,
    });
  }
}

export const SUBSYSTEMS: Subsystem[] = Array.from(seen.values()).sort((a, b) =>
  a.subsystemCode.localeCompare(b.subsystemCode),
);

export const ALL_FAULTS: Fault[] = SUBSYSTEMS.flatMap((s) => s.faults);

export const TOTAL_FAULT_COUNT = ALL_FAULTS.length;

export function searchFaults(query: string, subsystemCode?: string): Fault[] {
  const q = query.trim().toLowerCase();
  let pool = subsystemCode
    ? SUBSYSTEMS.find((s) => s.subsystemCode === subsystemCode)?.faults ?? []
    : ALL_FAULTS;

  if (!q) return pool;

  return pool.filter((f) => {
    if (f.faultCode.toLowerCase().includes(q)) return true;
    if (f.titleEN?.toLowerCase().includes(q)) return true;
    if (f.titleHI?.includes(query)) return true;
    if (f.messageEN?.toLowerCase().includes(q)) return true;
    if (f.messageHI?.includes(query)) return true;
    if (f.subsystemNameEN.toLowerCase().includes(q)) return true;
    if (f.lamps?.some((l) => l.toLowerCase().includes(q) || l.includes(query))) return true;
    return false;
  });
}

export function getFaultByCode(code: string): Fault | undefined {
  return ALL_FAULTS.find((f) => f.faultCode === code);
}

// Icon hint map per subsystem (used by UI to pick a Lucide icon and color)
export const SUBSYSTEM_META: Record<string, { icon: string; gradient: string }> = {
  SS01: { icon: "Zap", gradient: "from-blue-500 to-blue-700" },
  SS02: { icon: "Cog", gradient: "from-orange-500 to-red-600" },
  SS03: { icon: "Cog", gradient: "from-orange-600 to-red-700" },
  SS04: { icon: "Activity", gradient: "from-purple-500 to-purple-700" },
  SS05: { icon: "Plug", gradient: "from-teal-500 to-teal-700" },
  SS06: { icon: "Cpu", gradient: "from-indigo-500 to-indigo-700" },
  SS07: { icon: "Cpu", gradient: "from-indigo-600 to-indigo-800" },
  SS08: { icon: "Cpu", gradient: "from-indigo-700 to-indigo-900" },
  SS09: { icon: "Battery", gradient: "from-green-500 to-emerald-700" },
  SS11: { icon: "Wind", gradient: "from-cyan-500 to-cyan-700" },
  SS12: { icon: "Wind", gradient: "from-cyan-600 to-cyan-800" },
  SS13: { icon: "MonitorSmartphone", gradient: "from-slate-500 to-slate-700" },
  SS14: { icon: "MonitorSmartphone", gradient: "from-slate-600 to-slate-800" },
  SS15: { icon: "Flame", gradient: "from-red-500 to-red-700" },
  SS16: { icon: "Gauge", gradient: "from-amber-500 to-amber-700" },
  SS17: { icon: "Settings2", gradient: "from-rose-500 to-rose-700" },
  SS18: { icon: "Settings2", gradient: "from-rose-600 to-rose-800" },
  SS19: { icon: "Network", gradient: "from-fuchsia-500 to-fuchsia-700" },
};
