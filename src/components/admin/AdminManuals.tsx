import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Trash2, Upload, FileText } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function AdminManuals() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [locoTypeId, setLocoTypeId] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const { data: locoTypes } = useQuery({
    queryKey: ["loco-types"],
    queryFn: async () => { const { data } = await supabase.from("loco_types").select("*").order("name"); return data ?? []; },
  });

  const { data: manuals, isLoading } = useQuery({
    queryKey: ["admin-manuals"],
    queryFn: async () => {
      const { data } = await supabase.from("manuals").select("*, loco_types(name)").order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const uploadManual = async () => {
    if (!title || !file || !user) return;
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${Date.now()}_${file.name}`;
      const { error: uploadErr } = await supabase.storage.from("manuals").upload(path, file);
      if (uploadErr) throw uploadErr;

      const { data: { publicUrl } } = supabase.storage.from("manuals").getPublicUrl(path);

      const { error } = await supabase.from("manuals").insert({
        title,
        description: description || null,
        file_url: publicUrl,
        file_type: ext || "pdf",
        loco_type_id: locoTypeId || null,
        uploaded_by: user.id,
      });
      if (error) throw error;

      qc.invalidateQueries({ queryKey: ["admin-manuals"] });
      toast.success(t("admin.manualUploaded"));
      resetForm();
    } catch (err) {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("manuals").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-manuals"] }); toast.success(t("admin.deleted")); },
  });

  const resetForm = () => { setOpen(false); setTitle(""); setDescription(""); setLocoTypeId(""); setFile(null); };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={(o) => { if (!o) resetForm(); else setOpen(true); }}>
          <DialogTrigger asChild>
            <Button size="sm"><Upload className="h-4 w-4 mr-1" />{t("admin.uploadManual")}</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{t("admin.uploadManual")}</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <Input placeholder={t("admin.manualTitle")} value={title} onChange={(e) => setTitle(e.target.value)} />
              <Textarea placeholder={t("admin.manualDesc")} value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
              <Select value={locoTypeId} onValueChange={setLocoTypeId}>
                <SelectTrigger><SelectValue placeholder={t("admin.selectLocoType")} /></SelectTrigger>
                <SelectContent>
                  {(locoTypes ?? []).map((lt) => <SelectItem key={lt.id} value={lt.id}>{lt.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <div>
                <input ref={fileRef} type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                <Button variant="outline" className="w-full" onClick={() => fileRef.current?.click()}>
                  <FileText className="h-4 w-4 mr-2" />{file ? file.name : t("admin.selectFile")}
                </Button>
              </div>
              <Button onClick={uploadManual} disabled={!title || !file || uploading} className="w-full">
                {uploading ? t("auth.pleaseWait") : t("admin.upload")}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="stat-card overflow-hidden p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("admin.manualTitle")}</TableHead>
              <TableHead>{t("admin.locoType")}</TableHead>
              <TableHead>{t("admin.fileType")}</TableHead>
              <TableHead>{t("admin.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">{t("auth.pleaseWait")}</TableCell></TableRow>
            ) : (manuals ?? []).length === 0 ? (
              <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">{t("admin.noData")}</TableCell></TableRow>
            ) : (manuals ?? []).map((m: any) => (
              <TableRow key={m.id}>
                <TableCell className="font-medium">
                  <div>
                    <p>{m.title}</p>
                    {m.description && <p className="text-[11px] text-muted-foreground">{m.description}</p>}
                  </div>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">{m.loco_types?.name ?? "—"}</TableCell>
                <TableCell><Badge variant="outline" className="text-[10px]">{m.file_type ?? "pdf"}</Badge></TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" onClick={() => remove.mutate(m.id)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
