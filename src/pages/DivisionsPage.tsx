import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Train } from "lucide-react";

const divisionColors = [
  "from-blue-50 to-blue-100 border-blue-200",
  "from-green-50 to-green-100 border-green-200",
  "from-orange-50 to-orange-100 border-orange-200",
  "from-cyan-50 to-cyan-100 border-cyan-200",
  "from-purple-50 to-purple-100 border-purple-200",
  "from-pink-50 to-pink-100 border-pink-200",
];

const divisionIcons = ["🚂", "🚃", "🚄", "🚈", "🚆", "🚇"];

export default function DivisionsPage() {
  const { lang } = useLanguage();

  const { data: divisions, isLoading } = useQuery({
    queryKey: ["divisions-page"],
    queryFn: async () => {
      const { data } = await supabase.from("divisions").select("*, zones(name)").order("name");
      return data ?? [];
    },
  });

  const zoneName = divisions?.[0]?.zones?.name || "North Western Railway";

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center pt-2">
        <h1 className="text-2xl font-extrabold text-foreground">{zoneName}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {lang === "hi" ? "डिवीजनों की जानकारी और संसाधन" : "Divisions Information & Resources"}
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 rounded-2xl bg-muted animate-pulse" />
          ))
        ) : (
          (divisions ?? []).map((div: any, idx: number) => (
            <button
              key={div.id}
              className={`flex flex-col items-center gap-3 p-5 rounded-2xl bg-gradient-to-b ${divisionColors[idx % divisionColors.length]} border shadow-sm hover:shadow-md transition-all active:scale-95`}
            >
              <span className="text-3xl">{divisionIcons[idx % divisionIcons.length]}</span>
              <span className="text-sm font-bold text-foreground text-center leading-tight">
                {div.name} Division
              </span>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
