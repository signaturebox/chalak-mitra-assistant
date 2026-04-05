import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Train, Eye, EyeOff } from "lucide-react";

export default function Auth() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [showPw, setShowPw] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-blue-700 to-blue-900 flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-sm"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto bg-white/20 rounded-2xl flex items-center justify-center mb-3">
            <Train size={32} className="text-white" />
          </div>
          <h1 className="text-xl font-bold text-white">NWR Chalak Mitra</h1>
          <p className="text-xs text-white/70 mt-1">North Western Railway • चालक मित्र</p>
        </div>

        {/* Form Card */}
        <div className="bg-card rounded-2xl p-6 shadow-xl border border-border">
          <h2 className="text-base font-bold text-foreground mb-4">
            {isLogin ? "Welcome Back" : "Create Account"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-3">
            {!isLogin && (
              <input
                placeholder="Full Name"
                className="w-full px-4 py-3 bg-muted rounded-xl text-sm border border-border outline-none focus:border-primary transition"
              />
            )}
            <input
              placeholder="CMS ID or Email"
              className="w-full px-4 py-3 bg-muted rounded-xl text-sm border border-border outline-none focus:border-primary transition"
            />
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                placeholder="Password"
                className="w-full px-4 py-3 bg-muted rounded-xl text-sm border border-border outline-none focus:border-primary transition pr-10"
              />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <button type="submit" className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-semibold text-sm press-effect">
              {isLogin ? "Login" : "Sign Up"}
            </button>
          </form>

          <p className="text-center text-xs text-muted-foreground mt-4">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button onClick={() => setIsLogin(!isLogin)} className="text-primary font-semibold">
              {isLogin ? "Sign Up" : "Login"}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
