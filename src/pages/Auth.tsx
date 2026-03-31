import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Train, Mail, Phone, Eye, EyeOff, Globe } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

type Mode = "login" | "signup";
type AuthMethod = "email" | "phone";

export default function Auth() {
  const [mode, setMode] = useState<Mode>("login");
  const [method, setMethod] = useState<AuthMethod>("email");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const navigate = useNavigate();
  const { t, lang, setLang } = useLanguage();

  const handleEmailAuth = async () => {
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: fullName }, emailRedirectTo: window.location.origin } });
        if (error) throw error;
        toast.success(t("auth.accountCreated"));
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success(t("auth.welcomeBack"));
        navigate("/");
      }
    } catch (err: any) { toast.error(err.message || "Authentication failed"); }
    finally { setLoading(false); }
  };

  const handlePhoneAuth = async () => {
    setLoading(true);
    try {
      if (!otpSent) {
        const phoneNumber = phone.startsWith("+") ? phone : `+91${phone}`;
        if (mode === "signup") {
          const { error } = await supabase.auth.signUp({ phone: phoneNumber, password, options: { data: { full_name: fullName } } });
          if (error) throw error;
        } else {
          const { error } = await supabase.auth.signInWithOtp({ phone: phoneNumber });
          if (error) throw error;
        }
        setOtpSent(true);
        toast.success(t("auth.otpSent"));
      } else {
        const phoneNumber = phone.startsWith("+") ? phone : `+91${phone}`;
        const { error } = await supabase.auth.verifyOtp({ phone: phoneNumber, token: otp, type: "sms" });
        if (error) throw error;
        toast.success(t("auth.verified"));
        navigate("/");
      }
    } catch (err: any) { toast.error(err.message || "Phone auth failed"); }
    finally { setLoading(false); }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (method === "email") handleEmailAuth();
    else handlePhoneAuth();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mb-4">
            <Train className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-bold text-foreground">{t("app.name")}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t("app.tagline")}</p>
        </div>

        {/* Language Toggle */}
        <div className="flex justify-center">
          <button onClick={() => setLang(lang === "en" ? "hi" : "en")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground text-xs font-medium">
            <Globe className="h-3.5 w-3.5" />
            {lang === "en" ? "हिन्दी" : "English"}
          </button>
        </div>

        <div className="flex bg-secondary rounded-xl p-1">
          <button onClick={() => { setMethod("email"); setOtpSent(false); }}
            className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1.5 ${method === "email" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}>
            <Mail className="h-3.5 w-3.5" /> {t("auth.email")}
          </button>
          <button onClick={() => { setMethod("phone"); setOtpSent(false); }}
            className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1.5 ${method === "phone" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}>
            <Phone className="h-3.5 w-3.5" /> {t("auth.phone")}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === "signup" && (
            <div>
              <label className="text-xs text-muted-foreground block mb-1">{t("auth.fullName")}</label>
              <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder={t("auth.enterFullName")} required
                className="w-full h-11 px-3 rounded-xl border border-input bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
          )}
          {method === "email" ? (
            <div>
              <label className="text-xs text-muted-foreground block mb-1">{t("auth.email")}</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" required
                className="w-full h-11 px-3 rounded-xl border border-input bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
          ) : (
            <div>
              <label className="text-xs text-muted-foreground block mb-1">{t("auth.phoneNumber")}</label>
              <div className="flex gap-2">
                <span className="h-11 px-3 flex items-center rounded-xl border border-input bg-secondary text-sm text-muted-foreground">+91</span>
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="9876543210" required
                  className="flex-1 h-11 px-3 rounded-xl border border-input bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
            </div>
          )}
          {(method === "email" || (method === "phone" && mode === "signup" && !otpSent)) && (
            <div>
              <label className="text-xs text-muted-foreground block mb-1">{t("auth.password")}</label>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t("auth.enterPassword")} required minLength={6}
                  className="w-full h-11 px-3 pr-10 rounded-xl border border-input bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          )}
          {otpSent && method === "phone" && (
            <div>
              <label className="text-xs text-muted-foreground block mb-1">{t("auth.enterOTP")}</label>
              <input type="text" value={otp} onChange={(e) => setOtp(e.target.value)} placeholder={t("auth.enter6DigitOTP")} required maxLength={6}
                className="w-full h-11 px-3 rounded-xl border border-input bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-center tracking-widest" />
            </div>
          )}
          <button type="submit" disabled={loading} className="w-full h-11 rounded-xl bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-50 transition-colors">
            {loading ? t("auth.pleaseWait") : otpSent ? t("auth.verifyOTP") : mode === "login" ? t("auth.signIn") : t("auth.createAccount")}
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          {mode === "login" ? t("auth.noAccount") : t("auth.haveAccount")}{" "}
          <button onClick={() => { setMode(mode === "login" ? "signup" : "login"); setOtpSent(false); }} className="text-primary font-semibold">
            {mode === "login" ? t("auth.signUp") : t("auth.signIn")}
          </button>
        </p>
      </div>
    </div>
  );
}
