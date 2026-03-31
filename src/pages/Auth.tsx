import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Train, Mail, Phone, Eye, EyeOff, Globe, Key, Smartphone, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

type LoginType = "crew" | "admin";
type AuthMethod = "password" | "otp";

export default function Auth() {
  const [loginType, setLoginType] = useState<LoginType>("crew");
  const [authMethod, setAuthMethod] = useState<AuthMethod>("password");
  const [cmsId, setCmsId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const [fullName, setFullName] = useState("");
  const navigate = useNavigate();
  const { t, lang, setLang } = useLanguage();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isSignup) {
        const signupEmail = loginType === "crew" ? `${cmsId.toLowerCase()}@crew.nwr` : email;
        const { error } = await supabase.auth.signUp({
          email: signupEmail,
          password,
          options: { data: { full_name: fullName, cms_id: loginType === "crew" ? cmsId : undefined } },
        });
        if (error) throw error;
        toast.success(lang === "hi" ? "खाता बनाया गया!" : "Account created!");
        setIsSignup(false);
      } else {
        const loginEmail = loginType === "crew" ? `${cmsId.toLowerCase()}@crew.nwr` : email;
        const { error } = await supabase.auth.signInWithPassword({ email: loginEmail, password });
        if (error) throw error;
        toast.success(lang === "hi" ? "वापस स्वागत है!" : "Welcome back!");
        navigate("/");
      }
    } catch (err: any) {
      toast.error(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-secondary/30 p-4">
      <div className="w-full max-w-sm">
        {/* Header Illustration */}
        <div className="text-center mb-6">
          <div className="mx-auto w-28 h-28 mb-4 flex items-center justify-center">
            <span className="text-7xl">👨‍💻</span>
          </div>
          <h1 className="text-2xl font-extrabold text-foreground flex items-center justify-center gap-2">
            🚂 NWR Chalak Mitra
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            North Western Railway • {lang === "hi" ? "लोको पायलट साथी" : "Loco Pilot Companion"}
          </p>
        </div>

        {/* Login Type Tabs */}
        <div className="flex bg-secondary rounded-2xl p-1 mb-4">
          <button
            onClick={() => { setLoginType("crew"); setIsSignup(false); }}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
              loginType === "crew" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
            }`}
          >
            👷 {lang === "hi" ? "क्रू" : "Crew"}
          </button>
          <button
            onClick={() => { setLoginType("admin"); setIsSignup(false); }}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
              loginType === "admin" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
            }`}
          >
            🔧 {lang === "hi" ? "एडमिन" : "Admin"}
          </button>
        </div>

        {/* Auth Method Tabs */}
        <div className="flex bg-secondary rounded-2xl p-1 mb-5">
          <button
            onClick={() => setAuthMethod("password")}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
              authMethod === "password" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
            }`}
          >
            🔑 {lang === "hi" ? "पासवर्ड" : "Password"}
          </button>
          <button
            onClick={() => setAuthMethod("otp")}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
              authMethod === "otp" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
            }`}
          >
            📱 OTP
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          {isSignup && (
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1.5">
                {lang === "hi" ? "पूरा नाम" : "Full Name"} *
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={lang === "hi" ? "अपना नाम दर्ज करें" : "Enter your name"}
                required
                className="w-full h-12 px-4 rounded-2xl border border-input bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          )}

          {loginType === "crew" ? (
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1.5">CMS ID *</label>
              <input
                type="text"
                value={cmsId}
                onChange={(e) => setCmsId(e.target.value.toUpperCase())}
                placeholder="CMS12345"
                required
                className="w-full h-12 px-4 rounded-2xl border border-input bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono tracking-wider"
              />
            </div>
          ) : (
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1.5">
                {lang === "hi" ? "ईमेल / यूज़रनेम" : "Email / Username"} *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                required
                className="w-full h-12 px-4 rounded-2xl border border-input bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-1.5">
              {lang === "hi" ? "पासवर्ड" : "Password"} *
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={lang === "hi" ? "पासवर्ड दर्ज करें" : "Enter password"}
                required
                minLength={6}
                className="w-full h-12 px-4 pr-12 rounded-2xl border border-input bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {loginType === "admin" && !isSignup && (
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1.5">
                {lang === "hi" ? "भूमिका" : "Role"} *
              </label>
              <select className="w-full h-12 px-4 rounded-2xl border border-input bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none">
                <option>Super Admin</option>
                <option>Zone Admin</option>
                <option>Division Admin</option>
                <option>Lobby Admin</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-500 text-white text-sm font-bold disabled:opacity-50 transition-all active:scale-[0.98] shadow-lg shadow-blue-500/30"
          >
            {loading ? (lang === "hi" ? "कृपया प्रतीक्षा करें..." : "Please wait...") : isSignup ? (lang === "hi" ? "खाता बनाएं" : "Create Account") : "Login"}
          </button>
        </form>

        {/* Links */}
        <div className="text-center mt-4 space-y-2">
          {!isSignup && (
            <button className="text-xs text-primary font-semibold">
              {lang === "hi" ? "पासवर्ड भूल गए?" : "Forgot password?"}
            </button>
          )}
          <p className="text-sm text-muted-foreground">
            {isSignup ? (lang === "hi" ? "पहले से खाता है?" : "Already have an account?") : (loginType === "crew" ? (lang === "hi" ? "नया क्रू?" : "New Crew?") : "")}
            {" "}
            {(isSignup || loginType === "crew") && (
              <button onClick={() => setIsSignup(!isSignup)} className="text-primary font-semibold">
                {isSignup ? (lang === "hi" ? "लॉगिन करें" : "Login") : (lang === "hi" ? "यहाँ रजिस्टर करें" : "Register here")}
              </button>
            )}
          </p>
        </div>

        {/* Language Toggle */}
        <div className="flex justify-center mt-6">
          <button
            onClick={() => setLang(lang === "en" ? "hi" : "en")}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-secondary text-secondary-foreground text-xs font-medium"
          >
            <Globe className="h-3.5 w-3.5" />
            {lang === "en" ? "हिन्दी" : "English"}
          </button>
        </div>
      </div>
    </div>
  );
}
