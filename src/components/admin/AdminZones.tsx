import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Plus, Trash2, Pencil } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function AdminZones() {
  const { t } = useLanguage();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");

  const { data: zones, isLoading } = useQuery({
    queryKey: ["admin-zones"],
    queryFn: async () => {
      const { data } = await supabase.from("zones").select("*").order("name");
      return data ?? [];
    },
  });

  const save = useMutation({
    mutationFn: async () => {
      if (editId) {
        const { error } = await supabase.from("zones").update({ name, code }).eq("id", editId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("zones").insert({ name, code });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-zones"] });
      toast.success(editId ? t("admin.updated") : t("admin.created"));
      resetForm();
    },
    onError: () => toast.error("Failed"),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("zones").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-zones"] });
      toast.success(t("admin.deleted"));
    },
  });

  const resetForm = () => { setOpen(false); setEditId(null); setName(""); setCode(""); };

  const startEdit = (z: { id: string; name: string; code: string }) => {
    setEditId(z.id); setName(z.name); setCode(z.code); setOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={(o) => { if (!o) resetForm(); else setOpen(true); }}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="h-4 w-4 mr-1" />{t("admin.addZone")}</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editId ? t("admin.editZone") : t("admin.addZone")}</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <Input placeholder={t("admin.zoneName")} value={name} onChange={(e) => setName(e.target.value)} />
              <Input placeholder={t("admin.zoneCode")} value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} maxLength={6} />
              <Button onClick={() => save.mutate()} disabled={!name || !code || save.isPending} className="w-full">{t("admin.save")}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="stat-card overflow-hidden p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("admin.zoneName")}</TableHead>
              <TableHead>{t("admin.zoneCode")}</TableHead>
              <TableHead>{t("admin.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={3} className="text-center py-8 text-muted-foreground">{t("auth.pleaseWait")}</TableCell></TableRow>
            ) : (zones ?? []).length === 0 ? (
              <TableRow><TableCell colSpan={3} className="text-center py-8 text-muted-foreground">{t("admin.noData")}</TableCell></TableRow>
            ) : (zones ?? []).map((z) => (
              <TableRow key={z.id}>
                <TableCell className="font-medium">{z.name}</TableCell>
                <TableCell className="text-muted-foreground">{z.code}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => startEdit(z)}><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => remove.mutate(z.id)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
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
