import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Plus, Trash2, Pencil, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const SEVERITIES = ["critical", "high", "medium", "low"];
const PRIORITIES = ["PRIORITY1", "PRIORITY2", "PRIORITY3"];

interface FaultForm {
  fault_code: string;
  title: string;
  title_hi: string;
  description: string;
  description_hi: string;
  fault_message: string;
  impact: string;
  severity: string;
  priority: string;
  loco_type_id: string;
  system_category_id: string;
  solution_steps: string;
  indicators: string;
  isolation_required: boolean;
  isolation_message: string;
  isolation_steps: string;
  lamp_status: string;
  safety_precautions: string;
  symptoms: string;
  causes: string;
}

const emptyForm: FaultForm = {
  fault_code: "", title: "", title_hi: "", description: "", description_hi: "",
  fault_message: "", impact: "", severity: "high", priority: "PRIORITY1",
  loco_type_id: "", system_category_id: "", solution_steps: "", indicators: "",
  isolation_required: false, isolation_message: "", isolation_steps: "",
  lamp_status: "", safety_precautions: "", symptoms: "", causes: "",
};

export default function AdminFaults() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<FaultForm>(emptyForm);

  const { data: locoTypes } = useQuery({
    queryKey: ["loco-types"],
    queryFn: async () => { const { data } = await supabase.from("loco_types").select("*").order("name"); return data ?? []; },
  });
  const { data: categories } = useQuery({
    queryKey: ["system-categories"],
    queryFn: async () => { const { data } = await supabase.from("system_categories").select("*").order("name"); return data ?? []; },
  });
  const { data: faults, isLoading } = useQuery({
    queryKey: ["admin-faults"],
    queryFn: async () => {
      const { data } = await supabase.from("faults").select("*, loco_types(name), system_categories(name)").order("fault_code");
      return data ?? [];
    },
  });

  const set = (key: keyof FaultForm, val: any) => setForm(f => ({ ...f, [key]: val }));

  const parseJsonArray = (str: string): string[] => str.split("\n").map(s => s.trim()).filter(Boolean);
  const parseIndicators = (str: string): { name: string; color: string }[] => {
    return str.split("\n").map(s => s.trim()).filter(Boolean).map(line => {
      const [name, color] = line.split("|").map(s => s.trim());
      return { name: name || line, color: color || "red" };
    });
  };

  const saveFault = useMutation({
    mutationFn: async () => {
      const payload = {
        fault_code: form.fault_code.trim(),
        title: form.title.trim(),
        title_hi: form.title_hi.trim() || null,
        description: form.description.trim() || null,
        description_hi: form.description_hi.trim() || null,
        fault_message: form.fault_message.trim() || null,
        impact: form.impact.trim() || null,
        severity: form.severity || null,
        priority: form.priority || null,
        loco_type_id: form.loco_type_id || null,
        system_category_id: form.system_category_id || null,
        solution_steps: parseJsonArray(form.solution_steps),
        indicators: parseIndicators(form.indicators),
        isolation_required: form.isolation_required,
        isolation_message: form.isolation_message.trim() || null,
        isolation_steps: parseJsonArray(form.isolation_steps),
        lamp_status: form.lamp_status.trim() || null,
        safety_precautions: parseJsonArray(form.safety_precautions),
        symptoms: parseJsonArray(form.symptoms),
        causes: parseJsonArray(form.causes),
      };
      if (!payload.fault_code || !payload.title) throw new Error("Fault code and title required");

      if (editId) {
        const { error } = await supabase.from("faults").update(payload).eq("id", editId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("faults").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-faults"] });
      toast.success(editId ? "Fault updated" : "Fault created");
      resetForm();
    },
    onError: (e: any) => toast.error(e.message || "Save failed"),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("faults").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-faults"] }); toast.success("Fault deleted"); },
  });

  const openEdit = (fault: any) => {
    const stepsArr: string[] = Array.isArray(fault.solution_steps) ? fault.solution_steps : [];
    const indArr: any[] = Array.isArray(fault.indicators) ? fault.indicators : [];
    setEditId(fault.id);
    setForm({
      fault_code: fault.fault_code || "",
      title: fault.title || "",
      title_hi: fault.title_hi || "",
      description: fault.description || "",
      description_hi: fault.description_hi || "",
      fault_message: fault.fault_message || "",
      impact: fault.impact || "",
      severity: fault.severity || "high",
      priority: fault.priority || "PRIORITY1",
      loco_type_id: fault.loco_type_id || "",
      system_category_id: fault.system_category_id || "",
      solution_steps: stepsArr.join("\n"),
      indicators: indArr.map((i: any) => `${i.name}|${i.color}`).join("\n"),
      isolation_required: fault.isolation_required || false,
      isolation_message: fault.isolation_message || "",
      isolation_steps: (fault.isolation_steps || []).join("\n"),
      lamp_status: fault.lamp_status || "",
      safety_precautions: (fault.safety_precautions || []).join("\n"),
      symptoms: (fault.symptoms || []).join("\n"),
      causes: (fault.causes || []).join("\n"),
    });
    setOpen(true);
  };

  const resetForm = () => { setOpen(false); setEditId(null); setForm(emptyForm); };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={(o) => { if (!o) resetForm(); else setOpen(true); }}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="h-4 w-4 mr-1" />Add Fault</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editId ? "Edit Fault" : "Add Fault"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              {/* Row 1: Code + Severity + Priority */}
              <div className="grid grid-cols-3 gap-2">
                <Input placeholder="Fault Code *" value={form.fault_code} onChange={e => set("fault_code", e.target.value)} />
                <Select value={form.severity} onValueChange={v => set("severity", v)}>
                  <SelectTrigger><SelectValue placeholder="Severity" /></SelectTrigger>
                  <SelectContent>{SEVERITIES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
                <Select value={form.priority} onValueChange={v => set("priority", v)}>
                  <SelectTrigger><SelectValue placeholder="Priority" /></SelectTrigger>
                  <SelectContent>{PRIORITIES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                </Select>
              </div>

              {/* Title EN + HI */}
              <Input placeholder="Title (English) *" value={form.title} onChange={e => set("title", e.target.value)} />
              <Input placeholder="शीर्षक (हिन्दी)" value={form.title_hi} onChange={e => set("title_hi", e.target.value)} />

              {/* Loco + System */}
              <div className="grid grid-cols-2 gap-2">
                <Select value={form.loco_type_id} onValueChange={v => set("loco_type_id", v)}>
                  <SelectTrigger><SelectValue placeholder="Loco Type" /></SelectTrigger>
                  <SelectContent>{(locoTypes ?? []).map(lt => <SelectItem key={lt.id} value={lt.id}>{lt.name}</SelectItem>)}</SelectContent>
                </Select>
                <Select value={form.system_category_id} onValueChange={v => set("system_category_id", v)}>
                  <SelectTrigger><SelectValue placeholder="Sub-System" /></SelectTrigger>
                  <SelectContent>{(categories ?? []).map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>

              {/* Description */}
              <Textarea placeholder="Description (English)" value={form.description} onChange={e => set("description", e.target.value)} rows={2} />
              <Textarea placeholder="विवरण (हिन्दी)" value={form.description_hi} onChange={e => set("description_hi", e.target.value)} rows={2} />

              {/* Fault Message + Impact */}
              <Input placeholder="Fault Message (Hindi display text)" value={form.fault_message} onChange={e => set("fault_message", e.target.value)} />
              <Input placeholder="Impact" value={form.impact} onChange={e => set("impact", e.target.value)} />

              {/* Solution Steps */}
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground uppercase">Solution Steps (one per line)</label>
                <Textarea placeholder={"Step 1\nStep 2\nStep 3"} value={form.solution_steps} onChange={e => set("solution_steps", e.target.value)} rows={4} />
              </div>

              {/* Indicators */}
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground uppercase">Indicators (name|color per line)</label>
                <Textarea placeholder={"LSDJ|red\nBPFA|orange\nLSFI|yellow"} value={form.indicators} onChange={e => set("indicators", e.target.value)} rows={3} />
              </div>

              {/* Isolation */}
              <div className="flex items-center gap-3 py-1">
                <Switch checked={form.isolation_required} onCheckedChange={v => set("isolation_required", v)} />
                <span className="text-sm font-medium">Isolation Required</span>
              </div>
              {form.isolation_required && (
                <>
                  <Input placeholder="Isolation Message" value={form.isolation_message} onChange={e => set("isolation_message", e.target.value)} />
                  <div>
                    <label className="text-[11px] font-semibold text-muted-foreground uppercase">Isolation Steps (one per line)</label>
                    <Textarea placeholder={"Step 1\nStep 2"} value={form.isolation_steps} onChange={e => set("isolation_steps", e.target.value)} rows={3} />
                  </div>
                </>
              )}

              {/* Lamp Status */}
              <Input placeholder="Lamp Status" value={form.lamp_status} onChange={e => set("lamp_status", e.target.value)} />

              {/* Safety / Symptoms / Causes */}
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground uppercase">Safety Precautions (one per line)</label>
                <Textarea value={form.safety_precautions} onChange={e => set("safety_precautions", e.target.value)} rows={2} />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground uppercase">Symptoms (one per line)</label>
                <Textarea value={form.symptoms} onChange={e => set("symptoms", e.target.value)} rows={2} />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground uppercase">Causes (one per line)</label>
                <Textarea value={form.causes} onChange={e => set("causes", e.target.value)} rows={2} />
              </div>

              <Button onClick={() => saveFault.mutate()} disabled={!form.fault_code.trim() || !form.title.trim() || saveFault.isPending} className="w-full">
                {saveFault.isPending ? "Saving..." : editId ? "Update Fault" : "Create Fault"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="stat-card overflow-hidden p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Sub-System</TableHead>
              <TableHead>Severity</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
            ) : (faults ?? []).length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No faults</TableCell></TableRow>
            ) : (faults ?? []).map((f: any) => (
              <TableRow key={f.id}>
                <TableCell className="font-mono text-xs font-bold text-primary">{f.fault_code}</TableCell>
                <TableCell>
                  <p className="text-sm font-medium">{f.title}</p>
                  {f.title_hi && <p className="text-[11px] text-muted-foreground">{f.title_hi}</p>}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">{(f.system_categories as any)?.name ?? "—"}</TableCell>
                <TableCell>
                  <Badge variant={f.severity === "critical" ? "destructive" : "outline"} className="text-[10px]">{f.severity}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(f)}><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => { if (confirm("Delete this fault?")) remove.mutate(f.id); }}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
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
