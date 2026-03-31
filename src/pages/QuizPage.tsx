import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Trophy, CheckCircle2, XCircle, ArrowRight, RotateCcw } from "lucide-react";

const quizData = [
  { q: "What is the maximum permissible speed for WAP-7 locomotive?", qHi: "WAP-7 लोकोमोटिव की अधिकतम अनुमत गति क्या है?", options: ["110 km/h", "130 km/h", "140 km/h", "160 km/h"], correct: 2 },
  { q: "What does SPAD stand for?", qHi: "SPAD का पूरा नाम क्या है?", options: ["Signal Passed at Danger", "Speed Passed at Distance", "System Protected at Danger", "Signal Protection and Detection"], correct: 0 },
  { q: "What is the voltage of AC traction in Indian Railways?", qHi: "भारतीय रेलवे में AC ट्रैक्शन का वोल्टेज क्या है?", options: ["1500V DC", "3000V DC", "25kV AC", "750V DC"], correct: 2 },
  { q: "Which rule book covers General and Subsidiary Rules?", qHi: "कौन सी नियम पुस्तिका सामान्य और सहायक नियमों को कवर करती है?", options: ["ACTM", "G&SR", "IRCA", "IRTMM"], correct: 1 },
  { q: "What is the minimum rest period for crew after 10+ hours duty?", qHi: "10+ घंटे की ड्यूटी के बाद क्रू के लिए न्यूनतम विश्राम अवधि क्या है?", options: ["6 hours", "8 hours", "10 hours", "16 hours"], correct: 3 },
];

export default function QuizPage() {
  const { lang } = useLanguage();
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [finished, setFinished] = useState(false);

  const handleSelect = (idx: number) => { if (answered) return; setSelected(idx); setAnswered(true); if (idx === quizData[currentQ].correct) setScore(score + 1); };
  const nextQuestion = () => { if (currentQ + 1 >= quizData.length) { setFinished(true); } else { setCurrentQ(currentQ + 1); setSelected(null); setAnswered(false); } };
  const restart = () => { setCurrentQ(0); setSelected(null); setScore(0); setAnswered(false); setFinished(false); };

  if (finished) {
    const pct = Math.round((score / quizData.length) * 100);
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 animate-fade-in">
        <div className="w-28 h-28 rounded-full gradient-amber flex items-center justify-center shadow-2xl glow-amber animate-float">
          <Trophy className="h-14 w-14 text-white" />
        </div>
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gradient">{pct}%</h1>
          <p className="text-lg font-semibold text-foreground mt-1">{score}/{quizData.length} {lang === "hi" ? "सही" : "Correct"}</p>
        </div>
        <p className="text-sm text-muted-foreground text-center max-w-xs">
          {pct >= 80 ? (lang === "hi" ? "बहुत बढ़िया! उत्कृष्ट!" : "Excellent! Outstanding!") : pct >= 50 ? (lang === "hi" ? "अच्छा! और अभ्यास करें।" : "Good! Keep practicing.") : (lang === "hi" ? "और अभ्यास ज़रूरी।" : "Needs more practice.")}
        </p>
        <button onClick={restart} className="flex items-center gap-2 px-8 py-4 rounded-2xl gradient-teal text-white font-bold press-effect shadow-xl glow-teal">
          <RotateCcw className="h-5 w-5" /> {lang === "hi" ? "फिर से" : "Try Again"}
        </button>
      </div>
    );
  }

  const q = quizData[currentQ];
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <p className="text-[11px] text-muted-foreground uppercase tracking-[0.15em] font-bold">CLI Quiz</p>
        <h1 className="text-xl font-bold text-foreground mt-0.5">{lang === "hi" ? "अपना ज्ञान परखें" : "Test Your Knowledge"}</h1>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
          <div className="h-full gradient-teal rounded-full transition-all duration-700 ease-out" style={{ width: `${((currentQ + 1) / quizData.length) * 100}%` }} />
        </div>
        <span className="text-[13px] font-bold text-primary font-mono">{currentQ + 1}/{quizData.length}</span>
      </div>

      {/* Question */}
      <div className="glass-card p-6">
        <p className="text-[15px] font-bold text-foreground leading-relaxed">{lang === "hi" ? q.qHi : q.q}</p>
      </div>

      {/* Options */}
      <div className="space-y-2.5 stagger-in">
        {q.options.map((opt, idx) => {
          let cls = "glass border-transparent text-foreground";
          if (answered) {
            if (idx === q.correct) cls = "bg-emerald-500/10 border-emerald-500/50 text-emerald-700 dark:text-emerald-300";
            else if (idx === selected) cls = "bg-destructive/10 border-destructive/50 text-destructive";
          } else if (idx === selected) cls = "bg-primary/10 border-primary/50 text-primary";

          return (
            <button key={idx} onClick={() => handleSelect(idx)} disabled={answered}
              className={`w-full flex items-center gap-3.5 p-4 rounded-2xl border-[1.5px] ${cls} transition-all press-effect text-left`}>
              <span className="w-8 h-8 rounded-xl bg-secondary/50 flex items-center justify-center text-[12px] font-bold shrink-0 font-mono">{String.fromCharCode(65 + idx)}</span>
              <span className="text-[14px] font-medium flex-1">{opt}</span>
              {answered && idx === q.correct && <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />}
              {answered && idx === selected && idx !== q.correct && <XCircle className="h-5 w-5 text-destructive shrink-0" />}
            </button>
          );
        })}
      </div>

      {answered && (
        <button onClick={nextQuestion} className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl gradient-teal text-white font-bold press-effect shadow-xl glow-teal animate-slide-up">
          {currentQ + 1 >= quizData.length ? (lang === "hi" ? "परिणाम" : "Results") : (lang === "hi" ? "अगला" : "Next")}
          <ArrowRight className="h-5 w-5" />
        </button>
      )}

      <div className="text-center">
        <span className="text-[12px] text-muted-foreground font-medium">{lang === "hi" ? "स्कोर" : "Score"}: {score}/{currentQ + (answered ? 1 : 0)}</span>
      </div>
    </div>
  );
}
