import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Train, Eye, EyeOff, ArrowRight } from "lucide-react";

export default function Auth() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [showPw, setShowPw] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary to-blue-800 flex flex-col relative overflow-hidden">
      {/* Decorative shapes */}
      <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-white/5 -translate-y-1/3 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-56 h-56 rounded-full bg-white/5 translate-y-1/3 -translate-x-1/3" />
      <div className="absolute top-1/3 left-1/4 w-20 h-20 rounded-full bg-white/[0.03]" />

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-sm"
        >
          {/* Logo */}
          <div className="text-center mb-10">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-18 h-18 mx-auto bg-white/15 backdrop-blur-xl rounded-3xl flex items-center justify-center mb-4 border border-white/20"
              style={{ width: 72, height: 72 }}
            >
              <Train size={34} className="text-white" />
            </motion.div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">NWR Chalak Mitra</h1>
            <p className="text-[11px] text-white/60 mt-1 font-medium tracking-wide">NORTH WESTERN RAILWAY • चालक मित्र</p>
          </div>

          {/* Form Card */}
          <div className="bg-card rounded-3xl p-6 card-elevated border border-border/50">
            <h2 className="text-[16px] font-extrabold text-foreground mb-1">
              {isLogin ? "Welcome Back" : "Create Account"}
            </h2>
            <p className="text-[11px] text-muted-foreground mb-5">
              {isLogin ? "Sign in to continue your journey" : "Join NWR Chalak Mitra crew"}
            </p>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {!isLogin && (
                <div>
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block">Full Name</label>
                  <input
                    placeholder="Enter your full name"
                    className="w-full px-4 py-3 bg-muted rounded-xl text-[13px] font-medium border border-border outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all text-foreground placeholder:text-muted-foreground"
                  />
                </div>
              )}
              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                  {isLogin ? "CMS ID or Email" : "CMS ID"}
                </label>
                <input
                  placeholder={isLogin ? "Enter CMS ID or email" : "Enter your CMS ID"}
                  className="w-full px-4 py-3 bg-muted rounded-xl text-[13px] font-medium border border-border outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block">Password</label>
                <div className="relative">
                  <input
                    type={showPw ? "text" : "password"}
                    placeholder="Enter password"
                    className="w-full px-4 py-3 bg-muted rounded-xl text-[13px] font-medium border border-border outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all pr-11 text-foreground placeholder:text-muted-foreground"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground press-effect"
                  >
                    {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {isLogin && (
                <div className="text-right">
                  <button type="button" className="text-[11px] text-primary font-semibold">Forgot Password?</button>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-primary text-primary-foreground py-3.5 rounded-xl font-bold text-[13px] press-effect flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
              >
                {isLogin ? "Sign In" : "Create Account"}
                <ArrowRight size={16} />
              </button>
            </form>

            <p className="text-center text-[11px] text-muted-foreground mt-5">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
              <button onClick={() => setIsLogin(!isLogin)} className="text-primary font-bold">
                {isLogin ? "Sign Up" : "Sign In"}
              </button>
            </p>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <div className="text-center pb-6 relative z-10">
        <p className="text-[9px] text-white/40 font-medium tracking-wider">POWERED BY IT CELL, NWR JAIPUR</p>
      </div>
    </div>
  );
}
