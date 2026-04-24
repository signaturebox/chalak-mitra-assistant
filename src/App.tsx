import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import AppLayout from "./components/layout/AppLayout";
import HomePage from "./pages/HomePage";
import SearchPage from "./pages/SearchPage";
import QuizPage from "./pages/QuizPage";
import VoiceAI from "./pages/VoiceAI";
import Profile from "./pages/Profile";
import Auth from "./pages/Auth";
import GMMessages from "./pages/GMMessages";
import FilesPage from "./pages/FilesPage";
import AdminUploadCenter from "./pages/AdminUploadCenter";
import AdminBroadcast from "./pages/AdminBroadcast";
import AdminPushLogs from "./pages/AdminPushLogs";
import { supabase } from "./integrations/supabase/client";
import { initPushNotifications, syncUserTagsToOneSignal, logoutPushNotifications } from "./services/pushNotifications";

const queryClient = new QueryClient();

function App() {
  useEffect(() => {
    // Init OneSignal once on app boot (safe even if user not logged in)
    initPushNotifications();

    // Sync tags whenever auth state changes
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user.id) {
        syncUserTagsToOneSignal(data.session.user.id);
      }
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session?.user.id) {
        syncUserTagsToOneSignal(session.user.id);
      } else if (event === "SIGNED_OUT") {
        logoutPushNotifications();
      }
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route element={<AppLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/quiz" element={<QuizPage />} />
            <Route path="/voice-ai" element={<VoiceAI />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/gm-messages" element={<GMMessages />} />
            <Route path="/pcee-messages" element={<GMMessages />} />
            <Route path="/nwr-notices" element={<GMMessages />} />
            <Route path="/files/:category" element={<FilesPage />} />
            <Route path="/admin/uploads" element={<AdminUploadCenter />} />
            <Route path="/admin/broadcast" element={<AdminBroadcast />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toaster position="top-center" richColors />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
