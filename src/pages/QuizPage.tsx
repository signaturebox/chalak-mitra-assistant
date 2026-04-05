import { useState } from "react";
import { ArrowLeft, Trophy, CheckCircle, XCircle } from "lucide-react";
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

  if (done) {
    return (
      <div className="animate-fade-in flex flex-col items-center justify-center min-h-[60vh] px-6">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-6xl mb-4">
          <Trophy className="text-accent w-16 h-16" />
        </motion.div>
        <h2 className="text-xl font-bold text-foreground mb-2">Quiz Complete!</h2>
        <p className="text-muted-foreground mb-6">Score: {score}/{sampleQuestions.length}</p>
        <button
          onClick={() => { setCurrent(0); setSelected(null); setScore(0); setDone(false); }}
          className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-semibold press-effect"
        >
          Retry Quiz
        </button>
      </div>
    );
  }

  const question = sampleQuestions[current];

  return (
    <div className="animate-fade-in">
      <div className="bg-card sticky top-0 z-10 border-b border-border px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="press-effect"><ArrowLeft size={22} /></button>
        <h1 className="text-base font-bold">CLI Quiz</h1>
      </div>

      {/* Progress */}
      <div className="px-4 pt-4">
        <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
          <span>Question {current + 1}/{sampleQuestions.length}</span>
          <span>Score: {score}</span>
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary rounded-full"
            animate={{ width: `${((current + 1) / sampleQuestions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="p-5">
        <h2 className="text-base font-bold text-foreground mb-5">{question.q}</h2>
        <div className="space-y-3">
          {question.options.map((opt, idx) => {
            const isCorrect = idx === question.answer;
            const isSelected = idx === selected;
            let style = "bg-card border-border";
            if (selected !== null) {
              if (isCorrect) style = "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-500";
              else if (isSelected) style = "bg-red-50 dark:bg-red-950/30 border-red-500";
            }

            return (
              <motion.button
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.06 }}
                onClick={() => handleSelect(idx)}
                className={`w-full text-left p-4 rounded-xl border ${style} flex items-center gap-3 press-effect transition-colors`}
              >
                <div className="w-7 h-7 rounded-full border-2 border-current flex items-center justify-center text-xs font-bold text-muted-foreground">
                  {String.fromCharCode(65 + idx)}
                </div>
                <span className="text-sm font-medium text-foreground flex-1">{opt}</span>
                {selected !== null && isCorrect && <CheckCircle size={18} className="text-emerald-500" />}
                {selected !== null && isSelected && !isCorrect && <XCircle size={18} className="text-red-500" />}
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
