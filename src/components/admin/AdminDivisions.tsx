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

export default function AdminDivisions() {
  const { t } = useLanguage();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [zoneId, setZoneId] = useState("");

  const { data: zones } = useQuery({
    queryKey: ["admin-zones"],
    queryFn: async () => { const { data } = await supabase.from("zones").select("*").order("name"); return data ?? []; },
  });

  const { data: divisions, isLoading } = useQuery({
    queryKey: ["admin-divisions"],
    queryFn: async () => {
      const { data } = await supabase.from("divisions").select("*, zones(name)").order("name");
      return data ?? [];
    },
  });

  const save = useMutation({
    mutationFn: async () => {
      if (editId) {
        const { error } = await supabase.from("divisions").update({ name, code, zone_id: zoneId }).eq("id", editId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("divisions").insert({ name, code, zone_id: zoneId });
        if (error) throw error;
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-divisions"] }); toast.success(editId ? t("admin.updated") : t("admin.created")); resetForm(); },
    onError: () => toast.error("Failed"),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("divisions").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-divisions"] }); toast.success(t("admin.deleted")); },
  });

  const resetForm = () => { setOpen(false); setEditId(null); setName(""); setCode(""); setZoneId(""); };

  const startEdit = (d: any) => {
    setEditId(d.id); setName(d.name); setCode(d.code); setZoneId(d.zone_id); setOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={(o) => { if (!o) resetForm(); else setOpen(true); }}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="h-4 w-4 mr-1" />{t("admin.addDivision")}</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editId ? t("admin.editDivision") : t("admin.addDivision")}</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <Input placeholder={t("admin.divisionName")} value={name} onChange={(e) => setName(e.target.value)} />
              <Input placeholder={t("admin.divisionCode")} value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} maxLength={6} />
              <Select value={zoneId} onValueChange={setZoneId}>
                <SelectTrigger><SelectValue placeholder={t("admin.selectZone")} /></SelectTrigger>
                <SelectContent>
                  {(zones ?? []).map((z) => <SelectItem key={z.id} value={z.id}>{z.name} ({z.code})</SelectItem>)}
                </SelectContent>
              </Select>
              <Button onClick={() => save.mutate()} disabled={!name || !code || !zoneId || save.isPending} className="w-full">{t("admin.save")}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="stat-card overflow-hidden p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("admin.divisionName")}</TableHead>
              <TableHead>{t("admin.divisionCode")}</TableHead>
              <TableHead>{t("admin.zone")}</TableHead>
              <TableHead>{t("admin.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">{t("auth.pleaseWait")}</TableCell></TableRow>
            ) : (divisions ?? []).length === 0 ? (
              <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">{t("admin.noData")}</TableCell></TableRow>
            ) : (divisions ?? []).map((d: any) => (
              <TableRow key={d.id}>
                <TableCell className="font-medium">{d.name}</TableCell>
                <TableCell className="text-muted-foreground">{d.code}</TableCell>
                <TableCell className="text-muted-foreground text-xs">{d.zones?.name ?? "—"}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => startEdit(d)}><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => remove.mutate(d.id)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
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
