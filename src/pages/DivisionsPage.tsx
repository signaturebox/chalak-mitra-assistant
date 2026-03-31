import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { ArrowLeft, ChevronDown, ChevronUp, FileText, ExternalLink } from "lucide-react";

const topCategories = [
  { key: "DRM Instructions", icon: "📁", color: "border-blue-400" },
  { key: "Sr DEE", icon: "⚡", color: "border-cyan-400" },
  { key: "Sr DME", icon: "🔧", color: "border-purple-400" },
];

const bottomCategories = [
  { key: "Chalak Patra", icon: "📂", color: "border-orange-400" },
  { key: "Safety Circular", icon: "🛡️", color: "border-pink-400" },
  { key: "Safety Drive", icon: "🛡️", color: "border-teal-400" },
  { key: "Operating Instruction", icon: "🔴", color: "border-red-400" },
  { key: "Critical & RHS Signals", icon: "📁", color: "border-indigo-400" },
  { key: "Signals on Down Gradient", icon: "📁", color: "border-green-400" },
  { key: "Station Signal Book", icon: "📁", color: "border-purple-300" },
  { key: "WTT", icon: "📂", color: "border-yellow-400" },
  { key: "Yard Diagrams", icon: "📁", color: "border-blue-400" },
];

type ViewState =
  | { type: "list" }
  | { type: "division"; divisionId: string; divisionName: string }
  | { type: "category"; divisionId: string; divisionName: string; category: string; lobbyId?: string; lobbyName?: string };

export default function DivisionsPage() {
  const { lang } = useLanguage();
  const [view, setView] = useState<ViewState>({ type: "list" });

  return (
    <div className="space-y-4 animate-fade-in">
      {view.type === "list" && (
        <DivisionList lang={lang} onSelect={(id, name) => setView({ type: "division", divisionId: id, divisionName: name })} />
      )}
      {view.type === "division" && (
        <DivisionDetail
          lang={lang}
          divisionId={view.divisionId}
          divisionName={view.divisionName}
          onBack={() => setView({ type: "list" })}
          onSelectCategory={(cat: string, lobbyId?: string, lobbyName?: string) =>
            setView({ type: "category", divisionId: view.divisionId, divisionName: view.divisionName, category: cat, lobbyId, lobbyName })
          }
        />
      )}
      {view.type === "category" && (
        <CategoryFiles
          lang={lang}
          divisionId={view.divisionId}
          divisionName={view.divisionName}
          category={view.category}
          lobbyId={view.lobbyId}
          lobbyName={view.lobbyName}
          onBack={() => setView({ type: "division", divisionId: view.divisionId, divisionName: view.divisionName })}
        />
      )}
    </div>
  );
}

/* ─── Division List ─── */
function DivisionList({ lang, onSelect }: { lang: string; onSelect: (id: string, name: string) => void }) {
  const { data: divisions, isLoading } = useQuery({
    queryKey: ["divisions-list"],
    queryFn: async () => {
      const { data } = await supabase.from("divisions").select("*, zones(name, code)").order("name");
      return data ?? [];
    },
  });

  const zoneName = (divisions as any)?.[0]?.zones?.name || "North Western Railway";
  const colors = ["border-teal-400", "border-blue-400", "border-green-400", "border-orange-400", "border-purple-400", "border-pink-400"];
  const icons = ["🚂", "🚃", "🚄", "🚈", "🚆", "🚇"];

  return (
    <>
      <div className="text-center pt-2">
        <h1 className="text-2xl font-extrabold text-primary">{zoneName}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {lang === "hi" ? "डिवीजनों की जानकारी और संसाधन" : "Divisions Information & Resources"}
        </p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-32 rounded-2xl bg-muted animate-pulse" />)
          : (divisions ?? []).map((div: any, idx: number) => (
              <button
                key={div.id}
                onClick={() => onSelect(div.id, div.name)}
                className={`flex flex-col items-center gap-3 p-5 rounded-2xl bg-card border-t-4 ${colors[idx % colors.length]} shadow-sm hover:shadow-md transition-all active:scale-95`}
              >
                <span className="text-3xl">{icons[idx % icons.length]}</span>
                <span className="text-sm font-bold text-foreground text-center leading-tight">{div.name} Division</span>
              </button>
            ))}
      </div>
    </>
  );
}

/* ─── Division Detail (Categories) ─── */
function DivisionDetail({
  lang, divisionId, divisionName, onBack, onSelectCategory,
}: {
  lang: string; divisionId: string; divisionName: string; onBack: () => void;
  onSelectCategory: (cat: string, lobbyId?: string, lobbyName?: string) => void;
}) {
  const [lobbyExpanded, setLobbyExpanded] = useState(false);

  const { data: docCounts } = useQuery({
    queryKey: ["div-doc-counts", divisionId],
    queryFn: async () => {
      const { data } = await supabase
        .from("division_documents")
        .select("category, lobby_id")
        .eq("division_id", divisionId);
      const catCounts: Record<string, number> = {};
      const lobbyCounts: Record<string, number> = {};
      (data ?? []).forEach((d: any) => {
        catCounts[d.category] = (catCounts[d.category] || 0) + 1;
        if (d.lobby_id) lobbyCounts[d.lobby_id] = (lobbyCounts[d.lobby_id] || 0) + 1;
      });
      return { catCounts, lobbyCounts };
    },
  });

  const { data: lobbies } = useQuery({
    queryKey: ["div-lobbies", divisionId],
    queryFn: async () => {
      const { data } = await supabase.from("lobbies").select("*").eq("division_id", divisionId).order("name");
      return data ?? [];
    },
  });

  const cc = docCounts?.catCounts ?? {};
  const lc = docCounts?.lobbyCounts ?? {};

  const renderCatButton = (cat: { key: string; icon: string; color: string }) => (
    <button
      key={cat.key}
      onClick={() => onSelectCategory(cat.key)}
      className={`flex flex-col items-center gap-2 bg-card rounded-2xl p-4 border-t-4 ${cat.color} shadow-sm hover:shadow-md transition-all active:scale-95`}
    >
      <span className="text-2xl">{cat.icon}</span>
      <span className="text-[11px] font-bold text-foreground text-center leading-tight">{cat.key}</span>
      <span className="text-[10px] text-muted-foreground">{cc[cat.key] || 0} files</span>
    </button>
  );

  const lobbyColors = ["border-blue-400", "border-teal-400", "border-purple-400", "border-orange-400", "border-pink-400", "border-green-400"];

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-extrabold text-foreground">{divisionName} Division</h1>
        <button onClick={onBack} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-secondary text-sm font-medium text-secondary-foreground">
          <ArrowLeft className="h-4 w-4" /> {lang === "hi" ? "वापस" : "Back"}
        </button>
      </div>

      {/* Top categories */}
      <div className="grid grid-cols-3 gap-3">
        {topCategories.map(renderCatButton)}
      </div>

      {/* Lobby Shed Notice */}
      <div>
        <button
          onClick={() => setLobbyExpanded(!lobbyExpanded)}
          className="w-full flex flex-col items-center gap-2 bg-card rounded-2xl p-4 border-t-4 border-blue-300 shadow-sm hover:shadow-md transition-all active:scale-95"
        >
          <span className="text-2xl">📝</span>
          <span className="text-[11px] font-bold text-foreground">Lobby Shed Notice</span>
          <span className="text-[10px] text-muted-foreground">{lobbies?.length ?? 0} lobbies</span>
          {lobbyExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
        </button>

        {lobbyExpanded && lobbies && lobbies.length > 0 && (
          <div className="mt-3 grid grid-cols-3 gap-3">
            {lobbies.map((lobby: any, idx: number) => (
              <button
                key={lobby.id}
                onClick={() => onSelectCategory("Lobby Shed Notice", lobby.id, `${lobby.code} - ${lobby.name}`)}
                className={`flex flex-col items-center gap-2 bg-card rounded-2xl p-3 border-t-4 ${lobbyColors[idx % lobbyColors.length]} shadow-sm hover:shadow-md transition-all active:scale-95`}
              >
                <span className="text-xl">🚪</span>
                <span className="text-[10px] font-bold text-foreground text-center leading-tight">
                  {lobby.code} - {lobby.name}
                </span>
                <span className="text-[9px] text-muted-foreground">{lc[lobby.id] || 0} files</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Bottom categories */}
      <div className="grid grid-cols-3 gap-3">
        {bottomCategories.map(renderCatButton)}
      </div>
    </>
  );
}

/* ─── Category Files ─── */
function CategoryFiles({
  lang, divisionId, divisionName, category, lobbyId, lobbyName, onBack,
}: {
  lang: string; divisionId: string; divisionName: string; category: string;
  lobbyId?: string; lobbyName?: string; onBack: () => void;
}) {
  const { data: documents, isLoading } = useQuery({
    queryKey: ["div-docs", divisionId, category, lobbyId],
    queryFn: async () => {
      let query = supabase
        .from("division_documents")
        .select("*")
        .eq("division_id", divisionId)
        .eq("category", category)
        .order("created_at", { ascending: false });
      if (lobbyId) {
        query = query.eq("lobby_id", lobbyId);
      } else {
        query = query.is("lobby_id", null);
      }
      const { data } = await query;
      return data ?? [];
    },
  });

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-extrabold text-foreground">{lobbyName || category}</h1>
          <p className="text-xs text-muted-foreground">{divisionName} Division</p>
        </div>
        <button onClick={onBack} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-secondary text-sm font-medium text-secondary-foreground">
          <ArrowLeft className="h-4 w-4" /> {lang === "hi" ? "वापस" : "Back"}
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-16 rounded-2xl bg-muted animate-pulse" />)}
        </div>
      ) : documents && documents.length > 0 ? (
        <div className="space-y-3">
          {documents.map((doc: any) => (
            <div key={doc.id} className="flex items-center gap-3 bg-card rounded-2xl p-4 border border-border/50 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{doc.title}</p>
                <p className="text-[10px] text-muted-foreground uppercase">{doc.file_type || "PDF"}</p>
              </div>
              {doc.file_url && (
                <a href={doc.file_url} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <ExternalLink className="h-4 w-4 text-primary" />
                </a>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-card rounded-2xl border border-border/50 p-12 text-center">
          <span className="text-4xl">📭</span>
          <p className="text-sm text-muted-foreground mt-3">
            {lang === "hi" ? "कोई दस्तावेज़ नहीं मिले" : "No documents found"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {lang === "hi" ? "एडमिन द्वारा दस्तावेज़ जोड़े जाएंगे" : "Documents will be added by admin"}
          </p>
        </div>
      )}
    </>
  );
}
