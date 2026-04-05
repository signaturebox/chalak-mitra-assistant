import { useState } from "react";
import { ArrowLeft, Trophy, CheckCircle, XCircle, RotateCcw, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const sampleQuestions = [
  {
    q: "What is the maximum speed of WAP-7 locomotive?",
    options: ["140 kmph", "160 kmph", "110 kmph", "130 kmph"],
    answer: 1,
  },
  {
    q: "GR 3.67 deals with?",
    options: ["Signal passing", "Obstruction danger", "Speed restriction", "Guard duties"],
    answer: 1,
  },
  {
    q: "SPAD stands for?",
    options: ["Signal Passed At Danger", "Speed Parameter Auto Detection", "System Power Auto Disconnect", "Safety Protocol Alert Device"],
    answer: 0,
  },
];

export default function QuizPage() {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const handleSelect = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    if (idx === sampleQuestions[current].answer) setScore(s => s + 1);

    setTimeout(() => {
      if (current < sampleQuestions.length - 1) {
        setCurrent(c => c + 1);
        setSelected(null);
      } else {
        setDone(true);
      }
    }, 1000);
  };

  const reset = () => { setCurrent(0); setSelected(null); setScore(0); setDone(false); };
  const pct = Math.round((score / sampleQuestions.length) * 100);

  if (done) {
    return (
      <div className="animate-fade-in flex flex-col items-center justify-center min-h-[70vh] px-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="w-24 h-24 rounded-3xl bg-accent/10 flex items-center justify-center mb-5"
        >
          <Trophy className="text-accent w-12 h-12" />
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-xl font-extrabold text-foreground mb-1"
        >
          Quiz Complete! 🎉
        </motion.h2>
        <p className="text-muted-foreground text-sm font-medium mb-4">Great effort, keep learning!</p>

        {/* Score circle */}
        <div className="relative w-28 h-28 mb-6">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="42" strokeWidth="8" fill="none" className="stroke-muted" />
            <motion.circle
              cx="50" cy="50" r="42" strokeWidth="8" fill="none"
              strokeLinecap="round"
              className="stroke-primary"
              initial={{ strokeDasharray: "0 264" }}
              animate={{ strokeDasharray: `${pct * 2.64} 264` }}
              transition={{ delay: 0.4, duration: 1 }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-extrabold text-foreground">{score}/{sampleQuestions.length}</span>
            <span className="text-[9px] font-bold text-muted-foreground uppercase">{pct}% Score</span>
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={reset} className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-bold text-[13px] press-effect shadow-lg shadow-primary/20">
            <RotateCcw size={16} />
            Retry Quiz
          </button>
          <button onClick={() => navigate("/")} className="flex items-center gap-2 bg-muted text-foreground px-6 py-3 rounded-xl font-bold text-[13px] press-effect">
            Home
          </button>
        </div>
      </div>
    );
  }

  const question = sampleQuestions[current];
  const progress = ((current + 1) / sampleQuestions.length) * 100;

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="bg-card sticky top-0 z-10 border-b border-border">
        <div className="px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center press-effect">
            <ArrowLeft size={16} />
          </button>
          <div className="flex-1">
            <h1 className="text-[15px] font-extrabold text-foreground">CLI Quiz</h1>
            <p className="text-[10px] text-muted-foreground font-medium">Test your railway knowledge</p>
          </div>
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-accent/10">
            <Star size={12} className="text-accent" />
            <span className="text-[11px] font-bold text-accent">{score}</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="px-4 pb-3">
          <div className="flex justify-between text-[10px] text-muted-foreground font-semibold mb-1">
            <span>Question {current + 1} of {sampleQuestions.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary rounded-full"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
        </div>
      </div>

      {/* Question */}
      <div className="p-5">
        <motion.div
          key={current}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-card rounded-2xl p-5 border border-border/50 card-elevated mb-5"
        >
          <p className="text-[9px] font-bold text-primary uppercase tracking-wider mb-2">Question {current + 1}</p>
          <h2 className="text-[15px] font-extrabold text-foreground leading-snug">{question.q}</h2>
        </motion.div>

        <div className="space-y-2.5">
          {question.options.map((opt, idx) => {
            const isCorrect = idx === question.answer;
            const isSelected = idx === selected;
            let borderColor = "border-border/50";
            let bgColor = "bg-card";
            if (selected !== null) {
              if (isCorrect) { borderColor = "border-emerald-500"; bgColor = "bg-emerald-50 dark:bg-emerald-950/20"; }
              else if (isSelected) { borderColor = "border-destructive"; bgColor = "bg-red-50 dark:bg-red-950/20"; }
            }

            return (
              <motion.button
                key={idx}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.06 }}
                onClick={() => handleSelect(idx)}
                className={`w-full text-left p-4 rounded-2xl border ${borderColor} ${bgColor} flex items-center gap-3 press-effect transition-all duration-200 card-elevated`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[12px] font-extrabold transition-colors duration-200 ${
                  selected !== null && isCorrect
                    ? "bg-emerald-500 text-white"
                    : selected !== null && isSelected && !isCorrect
                      ? "bg-destructive text-white"
                      : "bg-muted text-muted-foreground"
                }`}>
                  {String.fromCharCode(65 + idx)}
                </div>
                <span className="text-[13px] font-semibold text-foreground flex-1">{opt}</span>
                {selected !== null && isCorrect && <CheckCircle size={18} className="text-emerald-500" />}
                {selected !== null && isSelected && !isCorrect && <XCircle size={18} className="text-destructive" />}
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
