import { ArrowLeft } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

export default function GMMessages() {
  const navigate = useNavigate();
  const location = useLocation();

  const titleMap: Record<string, string> = {
    "/gm-messages": "GM Message",
    "/pcee-messages": "PCEE Message",
    "/nwr-notices": "NWR Notices",
  };

  const title = titleMap[location.pathname] || "Messages";

  return (
    <div className="animate-fade-in">
      <div className="bg-card sticky top-0 z-10 border-b border-border px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="press-effect"><ArrowLeft size={22} /></button>
        <h1 className="text-base font-bold text-foreground">{title}</h1>
      </div>
      <div className="p-6 text-center text-muted-foreground text-sm">
        <p>No messages available yet.</p>
        <p className="text-xs mt-1">Content will appear when published by admin.</p>
      </div>
    </div>
  );
}
