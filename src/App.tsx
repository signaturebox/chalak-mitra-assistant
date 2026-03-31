import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AppLayout } from "@/components/layout/AppLayout";
import HomePage from "@/pages/HomePage";
import Knowledge from "@/pages/Knowledge";
import SearchPage from "@/pages/SearchPage";
import Tools from "@/pages/Tools";
import Profile from "@/pages/Profile";
import Notifications from "@/pages/Notifications";
import Admin from "@/pages/Admin";
import Troubleshoot from "@/pages/Troubleshoot";
import RuleBooks from "@/pages/RuleBooks";
import DivisionsPage from "@/pages/DivisionsPage";
import VoiceAI from "@/pages/VoiceAI";
import QuizPage from "@/pages/QuizPage";
import GMMessages from "@/pages/GMMessages";
import Auth from "@/pages/Auth";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <LanguageProvider>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/knowledge" element={<Knowledge />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/tools" element={<Tools />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/troubleshoot" element={<Troubleshoot />} />
                <Route path="/rulebooks" element={<RuleBooks />} />
                <Route path="/divisions" element={<DivisionsPage />} />
                <Route path="/voice-ai" element={<VoiceAI />} />
                <Route path="/quiz" element={<QuizPage />} />
                <Route path="/admin" element={<Admin />} />
              </Route>
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
          </LanguageProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
