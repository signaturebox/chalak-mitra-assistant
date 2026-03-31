import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Trophy, CheckCircle2, XCircle, ArrowRight, RotateCcw } from "lucide-react";

const quizData = [
  {
    q: "What is the maximum permissible speed for WAP-7 locomotive?",
    qHi: "WAP-7 लोकोमोटिव की अधिकतम अनुमत गति क्या है?",
    options: ["110 km/h", "130 km/h", "140 km/h", "160 km/h"],
    correct: 2,
  },
  {
    q: "What does SPAD stand for?",
    qHi: "SPAD का पूरा नाम क्या है?",
    options: [
      "Signal Passed at Danger",
      "Speed Passed at Distance",
      "System Protected at Danger",
      "Signal Protection and Detection",
    ],
    correct: 0,
  },
  {
    q: "What is the voltage of AC traction in Indian Railways?",
    qHi: "भारतीय रेलवे में AC ट्रैक्शन का वोल्टेज क्या है?",
    options: ["1500V DC", "3000V DC", "25kV AC", "750V DC"],
    correct: 2,
  },
  {
    q: "Which rule book covers General and Subsidiary Rules?",
    qHi: "कौन सी नियम पुस्तिका सामान्य और सहायक नियमों को कवर करती है?",
    options: ["ACTM", "G&SR", "IRCA", "IRTMM"],
    correct: 1,
  },
  {
    q: "What is the minimum rest period for crew after 10+ hours duty?",
    qHi: "10+ घंटे की ड्यूटी के बाद क्रू के लिए न्यूनतम विश्राम अवधि क्या है?",
    options: ["6 hours", "8 hours", "10 hours", "16 hours"],
    correct: 3,
  },
];

export default function QuizPage() {
  const { lang } = useLanguage();
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [finished, setFinished] = useState(false);

  const handleSelect = (idx: number) => {
    if (answered) return;
    setSelected(idx);
    setAnswered(true);
    if (idx === quizData[currentQ].correct) {
      setScore(score + 1);
    }
  };

  const nextQuestion = () => {
    if (currentQ + 1 >= quizData.length) {
      setFinished(true);
    } else {
      setCurrentQ(currentQ + 1);
      setSelected(null);
      setAnswered(false);
    }
  };

  const restart = () => {
    setCurrentQ(0);
    setSelected(null);
    setScore(0);
    setAnswered(false);
    setFinished(false);
  };

  if (finished) {
    const percentage = Math.round((score / quizData.length) * 100);
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 animate-fade-in">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-xl">
          <Trophy className="h-12 w-12 text-white" />
        </div>
        <h1 className="text-3xl font-extrabold text-foreground">{percentage}%</h1>
        <p className="text-lg font-semibold text-foreground">
          {score}/{quizData.length} {lang === "hi" ? "सही उत्तर" : "Correct Answers"}
        </p>
        <p className="text-sm text-muted-foreground text-center max-w-xs">
          {percentage >= 80
            ? (lang === "hi" ? "बहुत बढ़िया! उत्कृष्ट प्रदर्शन!" : "Excellent! Outstanding performance!")
            : percentage >= 50
            ? (lang === "hi" ? "अच्छा प्रयास! और अभ्यास करें।" : "Good effort! Keep practicing.")
            : (lang === "hi" ? "और अभ्यास की ज़रूरत है।" : "Needs more practice.")}
        </p>
        <button
          onClick={restart}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-primary text-primary-foreground font-semibold active:scale-95 transition-transform"
        >
          <RotateCcw className="h-4 w-4" />
          {lang === "hi" ? "फिर से शुरू करें" : "Try Again"}
        </button>
      </div>
    );
  }

  const q = quizData[currentQ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center">
        <h1 className="text-xl font-extrabold text-foreground">
          {lang === "hi" ? "CLI क्विज़" : "CLI Quiz"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {lang === "hi" ? "अपना ज्ञान परखें" : "Test Your Knowledge"}
        </p>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2 px-1">
        <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${((currentQ + 1) / quizData.length) * 100}%` }}
          />
        </div>
        <span className="text-xs font-semibold text-muted-foreground">
          {currentQ + 1}/{quizData.length}
        </span>
      </div>

      {/* Question */}
      <div className="bg-card rounded-2xl p-5 border border-border/50 shadow-sm">
        <p className="text-base font-bold text-foreground leading-relaxed">
          {lang === "hi" ? q.qHi : q.q}
        </p>
      </div>

      {/* Options */}
      <div className="space-y-3">
        {q.options.map((opt, idx) => {
          let style = "bg-card border-border/50 text-foreground";
          if (answered) {
            if (idx === q.correct) style = "bg-green-50 border-green-400 text-green-800 dark:bg-green-900/30 dark:text-green-300";
            else if (idx === selected && idx !== q.correct) style = "bg-red-50 border-red-400 text-red-800 dark:bg-red-900/30 dark:text-red-300";
          } else if (idx === selected) {
            style = "bg-primary/10 border-primary text-primary";
          }

          return (
            <button
              key={idx}
              onClick={() => handleSelect(idx)}
              disabled={answered}
              className={`w-full flex items-center gap-3 p-4 rounded-2xl border-2 ${style} transition-all active:scale-[0.98] text-left`}
            >
              <span className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-bold shrink-0">
                {String.fromCharCode(65 + idx)}
              </span>
              <span className="text-sm font-medium flex-1">{opt}</span>
              {answered && idx === q.correct && <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />}
              {answered && idx === selected && idx !== q.correct && <XCircle className="h-5 w-5 text-red-500 shrink-0" />}
            </button>
          );
        })}
      </div>

      {/* Next Button */}
      {answered && (
        <button
          onClick={nextQuestion}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-primary text-primary-foreground font-semibold active:scale-95 transition-transform"
        >
          {currentQ + 1 >= quizData.length
            ? (lang === "hi" ? "परिणाम देखें" : "See Results")
            : (lang === "hi" ? "अगला प्रश्न" : "Next Question")}
          <ArrowRight className="h-4 w-4" />
        </button>
      )}

      {/* Score */}
      <div className="text-center">
        <span className="text-xs text-muted-foreground">
          {lang === "hi" ? "स्कोर" : "Score"}: {score}/{currentQ + (answered ? 1 : 0)}
        </span>
      </div>
    </div>
  );
}
