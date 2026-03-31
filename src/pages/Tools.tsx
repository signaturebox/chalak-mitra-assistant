import { useState } from "react";
import { Clock, Moon, Route, CalendarDays, ShieldCheck, Calculator } from "lucide-react";

type Tool = "duty" | "night" | "mileage" | "rest" | null;

export default function Tools() {
  const [activeTool, setActiveTool] = useState<Tool>(null);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-lg font-bold text-foreground">Crew Utility Tools</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Calculators and planners for daily crew operations</p>
      </div>

      {/* Tool Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {[
          { id: "duty" as Tool, icon: Clock, label: "Duty Hours", desc: "Calculate total duty time", color: "bg-primary/10 text-primary" },
          { id: "night" as Tool, icon: Moon, label: "Night Allowance", desc: "NDA calculation", color: "bg-railway-info/10 text-railway-info" },
          { id: "mileage" as Tool, icon: Route, label: "Mileage", desc: "Km-based calculation", color: "bg-railway-success/10 text-railway-success" },
          { id: "rest" as Tool, icon: ShieldCheck, label: "Rest Checker", desc: "14-hour compliance", color: "bg-railway-orange/10 text-railway-orange" },
        ].map((tool) => (
          <button
            key={tool.id}
            onClick={() => setActiveTool(activeTool === tool.id ? null : tool.id)}
            className={`stat-card flex flex-col items-center gap-2 py-5 text-center transition-all ${
              activeTool === tool.id ? "ring-2 ring-primary" : ""
            }`}
          >
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${tool.color}`}>
              <tool.icon className="h-5 w-5" />
            </div>
            <span className="text-xs font-semibold text-foreground">{tool.label}</span>
            <span className="text-[10px] text-muted-foreground">{tool.desc}</span>
          </button>
        ))}
      </div>

      {/* Tool Panel */}
      {activeTool === "duty" && <DutyCalculator />}
      {activeTool === "night" && <NightAllowanceCalc />}
      {activeTool === "mileage" && <MileageCalc />}
      {activeTool === "rest" && <RestChecker />}
    </div>
  );
}

function DutyCalculator() {
  const [signOn, setSignOn] = useState("");
  const [signOff, setSignOff] = useState("");
  const [result, setResult] = useState<string | null>(null);

  const calculate = () => {
    if (!signOn || !signOff) return;
    const on = new Date(`2024-01-01T${signOn}`);
    let off = new Date(`2024-01-01T${signOff}`);
    if (off <= on) off.setDate(off.getDate() + 1);
    const diffMs = off.getTime() - on.getTime();
    const hours = Math.floor(diffMs / 3600000);
    const minutes = Math.floor((diffMs % 3600000) / 60000);
    setResult(`${hours}h ${minutes}m`);
  };

  return (
    <div className="stat-card p-4 space-y-4">
      <h4 className="font-semibold text-foreground flex items-center gap-2">
        <Calculator className="h-4 w-4" /> Duty Hours Calculator
      </h4>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-muted-foreground block mb-1">Sign On</label>
          <input type="time" value={signOn} onChange={(e) => setSignOn(e.target.value)}
            className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground block mb-1">Sign Off</label>
          <input type="time" value={signOff} onChange={(e) => setSignOff(e.target.value)}
            className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm" />
        </div>
      </div>
      <button onClick={calculate} className="w-full h-10 rounded-lg bg-primary text-primary-foreground text-sm font-medium">
        Calculate
      </button>
      {result && (
        <div className="text-center py-3 bg-secondary rounded-lg">
          <p className="text-xs text-muted-foreground">Total Duty Duration</p>
          <p className="text-2xl font-bold text-foreground">{result}</p>
        </div>
      )}
    </div>
  );
}

function NightAllowanceCalc() {
  const [nightHours, setNightHours] = useState("");
  const rate = 70; // ₹ per hour approx

  const total = nightHours ? parseFloat(nightHours) * rate : 0;

  return (
    <div className="stat-card p-4 space-y-4">
      <h4 className="font-semibold text-foreground flex items-center gap-2">
        <Moon className="h-4 w-4" /> Night Duty Allowance
      </h4>
      <div>
        <label className="text-xs text-muted-foreground block mb-1">Night Hours (22:00 - 06:00)</label>
        <input type="number" value={nightHours} onChange={(e) => setNightHours(e.target.value)}
          placeholder="Enter hours" min="0" max="8"
          className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm" />
      </div>
      <div className="text-center py-3 bg-secondary rounded-lg">
        <p className="text-xs text-muted-foreground">Estimated NDA (@ ₹{rate}/hr)</p>
        <p className="text-2xl font-bold text-foreground">₹{total.toFixed(0)}</p>
      </div>
    </div>
  );
}

function MileageCalc() {
  const [km, setKm] = useState("");
  const ratePerKm = 1.2;

  return (
    <div className="stat-card p-4 space-y-4">
      <h4 className="font-semibold text-foreground flex items-center gap-2">
        <Route className="h-4 w-4" /> Mileage Calculator
      </h4>
      <div>
        <label className="text-xs text-muted-foreground block mb-1">Distance (km)</label>
        <input type="number" value={km} onChange={(e) => setKm(e.target.value)}
          placeholder="Enter km" min="0"
          className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm" />
      </div>
      <div className="text-center py-3 bg-secondary rounded-lg">
        <p className="text-xs text-muted-foreground">Mileage Allowance (@ ₹{ratePerKm}/km)</p>
        <p className="text-2xl font-bold text-foreground">₹{km ? (parseFloat(km) * ratePerKm).toFixed(0) : "0"}</p>
      </div>
    </div>
  );
}

function RestChecker() {
  const [lastSignOff, setLastSignOff] = useState("");
  const [nextSignOn, setNextSignOn] = useState("");

  let restHours = 0;
  let compliant = false;
  if (lastSignOff && nextSignOn) {
    const off = new Date(lastSignOff);
    const on = new Date(nextSignOn);
    restHours = (on.getTime() - off.getTime()) / 3600000;
    compliant = restHours >= 14;
  }

  return (
    <div className="stat-card p-4 space-y-4">
      <h4 className="font-semibold text-foreground flex items-center gap-2">
        <ShieldCheck className="h-4 w-4" /> Rest Compliance (14-Hour Rule)
      </h4>
      <div className="grid grid-cols-1 gap-3">
        <div>
          <label className="text-xs text-muted-foreground block mb-1">Last Sign Off</label>
          <input type="datetime-local" value={lastSignOff} onChange={(e) => setLastSignOff(e.target.value)}
            className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground block mb-1">Next Sign On</label>
          <input type="datetime-local" value={nextSignOn} onChange={(e) => setNextSignOn(e.target.value)}
            className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm" />
        </div>
      </div>
      {lastSignOff && nextSignOn && (
        <div className={`text-center py-3 rounded-lg ${compliant ? "bg-railway-success/10" : "bg-destructive/10"}`}>
          <p className="text-xs text-muted-foreground">Rest Duration</p>
          <p className={`text-2xl font-bold ${compliant ? "text-railway-success" : "text-destructive"}`}>
            {restHours.toFixed(1)}h
          </p>
          <p className={`text-xs font-medium mt-1 ${compliant ? "text-railway-success" : "text-destructive"}`}>
            {compliant ? "✅ Compliant" : "❌ Insufficient Rest"}
          </p>
        </div>
      )}
    </div>
  );
}
