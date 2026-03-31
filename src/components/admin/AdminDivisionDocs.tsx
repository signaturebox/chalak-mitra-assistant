import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Trash2, Upload, FileText, ExternalLink } from "lucide-react";

const CATEGORIES = [
  "DRM Instructions",
  "Sr DEE",
  "Sr DME",
  "Lobby Shed Notice",
  "Chalak Patra",
  "Safety Circular",
  "Safety Drive",
  "Operating Instruction",
  "Critical & RHS Signals",
  "Signals on Down Gradient",
  "Station Signal Book",
  "WTT",
  "Yard Diagrams",
];

export default function AdminDivisionDocs() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [divisionId, setDivisionId] = useState("");
  const [category, setCategory] = useState("");
  const [lobbyId, setLobbyId] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [filterDivision, setFilterDivision] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");

  const { data: divisions } = useQuery({
    queryKey: ["admin-divisions-list"],
    queryFn: async () => {
      const { data } = await supabase.from("divisions").select("*").order("name");
      return data ?? [];
    },
  });

  const { data: lobbies } = useQuery({
    queryKey: ["admin-lobbies-for-div", divisionId],
    queryFn: async () => {
      if (!divisionId) return [];
      const { data } = await supabase.from("lobbies").select("*").eq("division_id", divisionId).order("name");
      return data ?? [];
    },
    enabled: !!divisionId,
  });

  const { data: docs, isLoading } = useQuery({
    queryKey: ["admin-div-docs", filterDivision, filterCategory],
    queryFn: async () => {
      let q = supabase.from("division_documents").select("*, divisions(name), lobbies(name, code)").order("created_at", { ascending: false });
      if (filterDivision !== "all") q = q.eq("division_id", filterDivision);
      if (filterCategory !== "all") q = q.eq("category", filterCategory);
      const { data } = await q.limit(100);
      return data ?? [];
    },
  });

  const upload = async () => {
    if (!title || !divisionId || !category || !file) {
      toast.error("Please fill all required fields and select a file");
      return;
    }
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() || "pdf";
      const path = `${divisionId}/${category}/${Date.now()}.${ext}`;
      const { error: uploadErr } = await supabase.storage.from("division-documents").upload(path, file);
      if (uploadErr) throw uploadErr;

      const { data: urlData } = supabase.storage.from("division-documents").getPublicUrl(path);

      const { error: insertErr } = await supabase.from("division_documents").insert({
        title,
        division_id: divisionId,
        category,
        lobby_id: category === "Lobby Shed Notice" && lobbyId ? lobbyId : null,
        file_url: urlData.publicUrl,
        file_type: ext,
      });
      if (insertErr) throw insertErr;

      toast.success("Document uploaded successfully");
      qc.invalidateQueries({ queryKey: ["admin-div-docs"] });
      resetForm();
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("division_documents").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-div-docs"] });
      toast.success("Document deleted");
    },
    onError: () => toast.error("Delete failed"),
  });

  const resetForm = () => {
    setOpen(false);
    setTitle("");
    setDivisionId("");
    setCategory("");
    setLobbyId("");
    setFile(null);
  };

  return (
    <div className="space-y-4">
      {/* Filters + Add button */}
      <div className="flex flex-wrap items-center gap-2">
        <Select value={filterDivision} onValueChange={setFilterDivision}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Filter Division" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Divisions</SelectItem>
            {(divisions ?? []).map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Filter Category" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <div className="flex-1" />
        <Dialog open={open} onOpenChange={(o) => { if (!o) resetForm(); else setOpen(true); }}>
          <DialogTrigger asChild>
            <Button size="sm"><Upload className="h-4 w-4 mr-1" /> Upload Document</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>Upload Division Document</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <Input placeholder="Document title" value={title} onChange={(e) => setTitle(e.target.value)} />
              <Select value={divisionId} onValueChange={setDivisionId}>
                <SelectTrigger><SelectValue placeholder="Select Division" /></SelectTrigger>
                <SelectContent>
                  {(divisions ?? []).map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger><SelectValue placeholder="Select Category" /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
              {category === "Lobby Shed Notice" && (
                <Select value={lobbyId} onValueChange={setLobbyId}>
                  <SelectTrigger><SelectValue placeholder="Select Lobby (optional)" /></SelectTrigger>
                  <SelectContent>
                    {(lobbies ?? []).map((l) => <SelectItem key={l.id} value={l.id}>{l.code} - {l.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              )}
              <div className="border-2 border-dashed border-border rounded-xl p-4 text-center">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="text-sm"
                />
                {file && <p className="text-xs text-muted-foreground mt-1">{file.name} ({(file.size / 1024).toFixed(0)} KB)</p>}
              </div>
              <Button onClick={upload} disabled={!title || !divisionId || !category || !file || uploading} className="w-full">
                {uploading ? "Uploading..." : "Upload"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Documents table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Division</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Lobby</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
            ) : (docs ?? []).length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No documents found</TableCell></TableRow>
            ) : (docs ?? []).map((doc: any) => (
              <TableRow key={doc.id}>
                <TableCell className="font-medium max-w-[200px] truncate">{doc.title}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{doc.divisions?.name ?? "—"}</TableCell>
                <TableCell className="text-xs">{doc.category}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{doc.lobbies ? `${doc.lobbies.code} - ${doc.lobbies.name}` : "—"}</TableCell>
                <TableCell className="text-xs uppercase">{doc.file_type || "—"}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    {doc.file_url && (
                      <Button variant="ghost" size="icon" asChild>
                        <a href={doc.file_url} target="_blank" rel="noopener noreferrer"><ExternalLink className="h-3.5 w-3.5" /></a>
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" onClick={() => remove.mutate(doc.id)}>
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
