import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Eye, EyeOff, Globe } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

type LoginType = "crew" | "admin";

export default function Auth() {
  const [loginType, setLoginType] = useState<LoginType>("crew");
  const [cmsId, setCmsId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const [fullName, setFullName] = useState("");
  const navigate = useNavigate();
  const { lang, setLang } = useLanguage();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isSignup) {
        const signupEmail = loginType === "crew" ? `${cmsId.toLowerCase()}@crew.nwr` : email;
        const { error } = await supabase.auth.signUp({ email: signupEmail, password, options: { data: { full_name: fullName, cms_id: loginType === "crew" ? cmsId : undefined } } });
        if (error) throw error;
        toast.success(lang === "hi" ? "खाता बनाया गया!" : "Account created!");
        setIsSignup(false);
      } else {
        const loginEmail = loginType === "crew" ? `${cmsId.toLowerCase()}@crew.nwr` : email;
        const { error } = await supabase.auth.signInWithPassword({ email: loginEmail, password });
        if (error) throw error;
        toast.success(lang === "hi" ? "स्वागत है!" : "Welcome back!");
        navigate("/");
      }
    } catch (err: any) { toast.error(err.message || "Authentication failed"); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden p-4">
      {/* Ambient blobs */}
      <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-primary/8 blur-[120px]" />
      <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-accent/8 blur-[120px]" />

      <div className="w-full max-w-sm relative z-10 animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="mx-auto w-20 h-20 rounded-3xl gradient-teal flex items-center justify-center shadow-2xl glow-teal mb-5 animate-float">
            <span className="text-4xl">🚂</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">NWR Chalak Mitra</h1>
          <p className="text-[12px] text-muted-foreground mt-1.5 tracking-wide">
            North Western Railway • {lang === "hi" ? "लोको पायलट साथी" : "Crew Companion"}
          </p>
        </div>

        {/* Login Type Toggle */}
        <div className="glass-strong rounded-2xl p-1.5 flex mb-6">
          {(["crew", "admin"] as const).map((type) => (
            <button key={type} onClick={() => { setLoginType(type); setIsSignup(false); }}
              className={`flex-1 py-3 rounded-xl text-[13px] font-bold transition-all ${loginType === type ? "gradient-teal text-white shadow-md" : "text-muted-foreground"}`}>
              {type === "crew" ? (lang === "hi" ? "👷 क्रू" : "👷 Crew") : (lang === "hi" ? "🔧 एडमिन" : "🔧 Admin")}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          {isSignup && (
            <div>
              <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-2">{lang === "hi" ? "पूरा नाम" : "Full Name"}</label>
              <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder={lang === "hi" ? "अपना नाम" : "Your name"} required className="m3-input" />
            </div>
          )}

          <div>
            <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-2">
              {loginType === "crew" ? "CMS ID" : (lang === "hi" ? "ईमेल" : "Email")}
            </label>
            {loginType === "crew" ? (
              <input type="text" value={cmsId} onChange={(e) => setCmsId(e.target.value.toUpperCase())} placeholder="CMS12345" required className="m3-input font-mono tracking-wider" />
            ) : (
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@example.com" required className="m3-input" />
            )}
          </div>

          <div>
            <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-2">{lang === "hi" ? "पासवर्ड" : "Password"}</label>
            <div className="relative">
              <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" required minLength={6} className="m3-input pr-12" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground p-1">
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="w-full h-14 rounded-2xl gradient-teal text-white text-[15px] font-bold disabled:opacity-50 press-effect shadow-xl glow-teal mt-2">
            {loading ? (lang === "hi" ? "प्रतीक्षा करें..." : "Please wait...") : isSignup ? (lang === "hi" ? "खाता बनाएं" : "Create Account") : "Login"}
          </button>
        </form>

        {/* Toggle signup */}
        <div className="text-center mt-6 space-y-3">
          {!isSignup && <button className="text-[12px] text-primary font-semibold">{lang === "hi" ? "पासवर्ड भूल गए?" : "Forgot password?"}</button>}
          <p className="text-[13px] text-muted-foreground">
            {isSignup ? (lang === "hi" ? "खाता है?" : "Have an account?") : loginType === "crew" ? (lang === "hi" ? "नया क्रू?" : "New Crew?") : ""}
            {" "}
            {(isSignup || loginType === "crew") && (
              <button onClick={() => setIsSignup(!isSignup)} className="text-primary font-bold">
                {isSignup ? (lang === "hi" ? "लॉगिन" : "Login") : (lang === "hi" ? "रजिस्टर" : "Register")}
              </button>
            )}
          </p>
        </div>

        {/* Language */}
        <div className="flex justify-center mt-8">
          <button onClick={() => setLang(lang === "en" ? "hi" : "en")} className="m3-chip m3-chip-outline text-[12px]">
            <Globe className="h-3.5 w-3.5" /> {lang === "en" ? "हिन्दी" : "English"}
          </button>
        </div>
      </div>
    </div>
  );
}
