import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Plus, Trash2, Pencil } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function AdminLobbies() {
  const { t } = useLanguage();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [divisionId, setDivisionId] = useState("");

  const { data: divisions } = useQuery({
    queryKey: ["admin-divisions"],
    queryFn: async () => { const { data } = await supabase.from("divisions").select("*").order("name"); return data ?? []; },
  });

  const { data: lobbies, isLoading } = useQuery({
    queryKey: ["admin-lobbies"],
    queryFn: async () => {
      const { data } = await supabase.from("lobbies").select("*, divisions(name)").order("name");
      return data ?? [];
    },
  });

  const save = useMutation({
    mutationFn: async () => {
      if (editId) {
        const { error } = await supabase.from("lobbies").update({ name, code, division_id: divisionId }).eq("id", editId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("lobbies").insert({ name, code, division_id: divisionId });
        if (error) throw error;
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-lobbies"] }); toast.success(editId ? t("admin.updated") : t("admin.created")); resetForm(); },
    onError: () => toast.error("Failed"),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("lobbies").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-lobbies"] }); toast.success(t("admin.deleted")); },
  });

  const resetForm = () => { setOpen(false); setEditId(null); setName(""); setCode(""); setDivisionId(""); };

  const startEdit = (l: any) => {
    setEditId(l.id); setName(l.name); setCode(l.code); setDivisionId(l.division_id); setOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={(o) => { if (!o) resetForm(); else setOpen(true); }}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="h-4 w-4 mr-1" />{t("admin.addLobby")}</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editId ? t("admin.editLobby") : t("admin.addLobby")}</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <Input placeholder={t("admin.lobbyName")} value={name} onChange={(e) => setName(e.target.value)} />
              <Input placeholder={t("admin.lobbyCode")} value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} maxLength={10} />
              <Select value={divisionId} onValueChange={setDivisionId}>
                <SelectTrigger><SelectValue placeholder={t("admin.selectDivision")} /></SelectTrigger>
                <SelectContent>
                  {(divisions ?? []).map((d) => <SelectItem key={d.id} value={d.id}>{d.name} ({d.code})</SelectItem>)}
                </SelectContent>
              </Select>
              <Button onClick={() => save.mutate()} disabled={!name || !code || !divisionId || save.isPending} className="w-full">{t("admin.save")}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="stat-card overflow-hidden p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("admin.lobbyName")}</TableHead>
              <TableHead>{t("admin.lobbyCode")}</TableHead>
              <TableHead>{t("admin.division")}</TableHead>
              <TableHead>{t("admin.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">{t("auth.pleaseWait")}</TableCell></TableRow>
            ) : (lobbies ?? []).length === 0 ? (
              <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">{t("admin.noData")}</TableCell></TableRow>
            ) : (lobbies ?? []).map((l: any) => (
              <TableRow key={l.id}>
                <TableCell className="font-medium">{l.name}</TableCell>
                <TableCell className="text-muted-foreground">{l.code}</TableCell>
                <TableCell className="text-muted-foreground text-xs">{l.divisions?.name ?? "—"}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => startEdit(l)}><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => remove.mutate(l.id)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
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
