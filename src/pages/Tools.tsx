import { useState } from "react";
import { Clock, Moon, Route, ShieldCheck, Calculator } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { TranslationKey } from "@/i18n/translations";

type Tool = "duty" | "night" | "mileage" | "rest" | null;

export default function Tools() {
  const [activeTool, setActiveTool] = useState<Tool>(null);
  const { t } = useLanguage();

  const tools: { id: Tool; icon: typeof Clock; labelKey: TranslationKey; descKey: TranslationKey; color: string }[] = [
    { id: "duty", icon: Clock, labelKey: "tools.dutyHours", descKey: "tools.dutyHoursDesc", color: "bg-primary/10 text-primary" },
    { id: "night", icon: Moon, labelKey: "tools.nightAllowance", descKey: "tools.nightAllowanceDesc", color: "bg-railway-info/10 text-railway-info" },
    { id: "mileage", icon: Route, labelKey: "tools.mileage", descKey: "tools.mileageDesc", color: "bg-railway-success/10 text-railway-success" },
    { id: "rest", icon: ShieldCheck, labelKey: "tools.restChecker", descKey: "tools.restCheckerDesc", color: "bg-railway-orange/10 text-railway-orange" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-lg font-bold text-foreground">{t("tools.title")}</h2>
        <p className="text-sm text-muted-foreground mt-0.5">{t("tools.subtitle")}</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {tools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => setActiveTool(activeTool === tool.id ? null : tool.id)}
            className={`stat-card flex flex-col items-center gap-2 py-5 text-center transition-all ${activeTool === tool.id ? "ring-2 ring-primary" : ""}`}
          >
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${tool.color}`}>
              <tool.icon className="h-5 w-5" />
            </div>
            <span className="text-xs font-semibold text-foreground">{t(tool.labelKey)}</span>
            <span className="text-[10px] text-muted-foreground">{t(tool.descKey)}</span>
          </button>
        ))}
      </div>
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
  const { t } = useLanguage();

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
        <Calculator className="h-4 w-4" /> {t("tools.dutyCalcTitle")}
      </h4>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-muted-foreground block mb-1">{t("tools.signOn")}</label>
          <input type="time" value={signOn} onChange={(e) => setSignOn(e.target.value)} className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground block mb-1">{t("tools.signOff")}</label>
          <input type="time" value={signOff} onChange={(e) => setSignOff(e.target.value)} className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm" />
        </div>
      </div>
      <button onClick={calculate} className="w-full h-10 rounded-lg bg-primary text-primary-foreground text-sm font-medium">{t("tools.calculate")}</button>
      {result && (
        <div className="text-center py-3 bg-secondary rounded-lg">
          <p className="text-xs text-muted-foreground">{t("tools.totalDuty")}</p>
          <p className="text-2xl font-bold text-foreground">{result}</p>
        </div>
      )}
    </div>
  );
}

function NightAllowanceCalc() {
  const [nightHours, setNightHours] = useState("");
  const { t } = useLanguage();
  const rate = 70;
  const total = nightHours ? parseFloat(nightHours) * rate : 0;

  return (
    <div className="stat-card p-4 space-y-4">
      <h4 className="font-semibold text-foreground flex items-center gap-2">
        <Moon className="h-4 w-4" /> {t("tools.ndaTitle")}
      </h4>
      <div>
        <label className="text-xs text-muted-foreground block mb-1">{t("tools.nightHoursLabel")}</label>
        <input type="number" value={nightHours} onChange={(e) => setNightHours(e.target.value)} placeholder={t("tools.enterHours")} min="0" max="8" className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm" />
      </div>
      <div className="text-center py-3 bg-secondary rounded-lg">
        <p className="text-xs text-muted-foreground">{t("tools.estimatedNDA")} (@ ₹{rate}/hr)</p>
        <p className="text-2xl font-bold text-foreground">₹{total.toFixed(0)}</p>
      </div>
    </div>
  );
}

function MileageCalc() {
  const [km, setKm] = useState("");
  const { t } = useLanguage();
  const ratePerKm = 1.2;

  return (
    <div className="stat-card p-4 space-y-4">
      <h4 className="font-semibold text-foreground flex items-center gap-2">
        <Route className="h-4 w-4" /> {t("tools.mileageTitle")}
      </h4>
      <div>
        <label className="text-xs text-muted-foreground block mb-1">{t("tools.distanceKm")}</label>
        <input type="number" value={km} onChange={(e) => setKm(e.target.value)} placeholder={t("tools.enterKm")} min="0" className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm" />
      </div>
      <div className="text-center py-3 bg-secondary rounded-lg">
        <p className="text-xs text-muted-foreground">{t("tools.mileageAllowance")} (@ ₹{ratePerKm}/km)</p>
        <p className="text-2xl font-bold text-foreground">₹{km ? (parseFloat(km) * ratePerKm).toFixed(0) : "0"}</p>
      </div>
    </div>
  );
}

function RestChecker() {
  const [lastSignOff, setLastSignOff] = useState("");
  const [nextSignOn, setNextSignOn] = useState("");
  const { t } = useLanguage();

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
        <ShieldCheck className="h-4 w-4" /> {t("tools.restTitle")}
      </h4>
      <div className="grid grid-cols-1 gap-3">
        <div>
          <label className="text-xs text-muted-foreground block mb-1">{t("tools.lastSignOff")}</label>
          <input type="datetime-local" value={lastSignOff} onChange={(e) => setLastSignOff(e.target.value)} className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground block mb-1">{t("tools.nextSignOn")}</label>
          <input type="datetime-local" value={nextSignOn} onChange={(e) => setNextSignOn(e.target.value)} className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm" />
        </div>
      </div>
      {lastSignOff && nextSignOn && (
        <div className={`text-center py-3 rounded-lg ${compliant ? "bg-railway-success/10" : "bg-destructive/10"}`}>
          <p className="text-xs text-muted-foreground">{t("tools.restDuration")}</p>
          <p className={`text-2xl font-bold ${compliant ? "text-railway-success" : "text-destructive"}`}>{restHours.toFixed(1)}h</p>
          <p className={`text-xs font-medium mt-1 ${compliant ? "text-railway-success" : "text-destructive"}`}>
            {compliant ? t("tools.compliant") : t("tools.insufficientRest")}
          </p>
        </div>
      )}
    </div>
  );
}
