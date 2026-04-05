import { ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

const categoryNames: Record<string, string> = {
  electricLoco: "Electric Loco",
  dieselLoco: "Diesel Loco",
  vandeBharat: "Vande Bharat",
  memu: "MEMU",
  kavach: "Kavach",
  traffic: "Traffic",
  spad: "SPAD Prevention",
  ruleBooks: "Rule Books",
  cw: "C & W",
  ohe: "OHE",
  pway: "P-Way",
  about: "About NWR",
};

export default function FilesPage() {
  const navigate = useNavigate();
  const { category } = useParams();
  const title = categoryNames[category || ""] || category || "Files";

  return (
    <div className="animate-fade-in">
      <div className="bg-card sticky top-0 z-10 border-b border-border px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="press-effect"><ArrowLeft size={22} /></button>
        <h1 className="text-base font-bold text-foreground">{title}</h1>
      </div>
      <div className="p-6 text-center text-muted-foreground text-sm">
        <p>No files available in this section yet.</p>
        <p className="text-xs mt-1">Content will be added by the admin.</p>
      </div>
    </div>
  );
}
