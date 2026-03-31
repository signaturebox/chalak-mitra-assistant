import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Plus, Trash2, Pencil, Star } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const CATEGORIES = ["G&SR", "ACTM", "Subsidiary Rules", "Safety Circulars"];

export default function AdminRuleBooks() {
  const { t } = useLanguage();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [titleHi, setTitleHi] = useState("");
  const [category, setCategory] = useState("");
  const [chapterNumber, setChapterNumber] = useState("");
  const [section, setSection] = useState("");
  const [description, setDescription] = useState("");
  const [descriptionHi, setDescriptionHi] = useState("");
  const [content, setContent] = useState("");
  const [contentHi, setContentHi] = useState("");
  const [tags, setTags] = useState("");
  const [isImportant, setIsImportant] = useState(false);
  const [filterCategory, setFilterCategory] = useState("all");

  const { data: ruleBooks, isLoading } = useQuery({
    queryKey: ["admin-rulebooks"],
    queryFn: async () => {
      const { data } = await supabase.from("rule_books").select("*").order("category").order("chapter_number");
      return data ?? [];
    },
  });

  const save = useMutation({
    mutationFn: async () => {
      const payload = {
        title,
        title_hi: titleHi || null,
        category,
        chapter_number: chapterNumber || null,
        section: section || null,
        description: description || null,
        description_hi: descriptionHi || null,
        content: content || null,
        content_hi: contentHi || null,
        tags: tags ? tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
        is_important: isImportant,
      };
      if (editId) {
        const { error } = await supabase.from("rule_books").update(payload).eq("id", editId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("rule_books").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-rulebooks"] });
      toast.success(editId ? t("admin.updated") : t("admin.created"));
      resetForm();
    },
    onError: () => toast.error("Failed"),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("rule_books").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-rulebooks"] });
      toast.success(t("admin.deleted"));
    },
  });

  const resetForm = () => {
    setOpen(false); setEditId(null); setTitle(""); setTitleHi(""); setCategory("");
    setChapterNumber(""); setSection(""); setDescription(""); setDescriptionHi("");
    setContent(""); setContentHi(""); setTags(""); setIsImportant(false);
  };

  const startEdit = (r: any) => {
    setEditId(r.id); setTitle(r.title); setTitleHi(r.title_hi ?? ""); setCategory(r.category);
    setChapterNumber(r.chapter_number ?? ""); setSection(r.section ?? "");
    setDescription(r.description ?? ""); setDescriptionHi(r.description_hi ?? "");
    setContent(r.content ?? ""); setContentHi(r.content_hi ?? "");
    setTags((r.tags ?? []).join(", ")); setIsImportant(r.is_important ?? false);
    setOpen(true);
  };

  const filtered = (ruleBooks ?? []).filter((r) => filterCategory === "all" || r.category === filterCategory);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("rulebooks.all")}</SelectItem>
            {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Dialog open={open} onOpenChange={(o) => { if (!o) resetForm(); else setOpen(true); }}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="h-4 w-4 mr-1" />{t("admin.addRule")}</Button>
          </DialogTrigger>
          <DialogContent className="max-h-[85vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editId ? t("admin.editRule") : t("admin.addRule")}</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger><SelectValue placeholder={t("admin.selectCategory")} /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
              <div className="grid grid-cols-2 gap-2">
                <Input placeholder={t("admin.chapterNo")} value={chapterNumber} onChange={(e) => setChapterNumber(e.target.value)} />
                <Input placeholder={t("admin.section")} value={section} onChange={(e) => setSection(e.target.value)} />
              </div>
              <Input placeholder={t("admin.ruleTitle")} value={title} onChange={(e) => setTitle(e.target.value)} />
              <Input placeholder={t("admin.ruleTitleHi")} value={titleHi} onChange={(e) => setTitleHi(e.target.value)} />
              <Textarea placeholder={t("admin.ruleDesc")} value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
              <Textarea placeholder={t("admin.ruleDescHi")} value={descriptionHi} onChange={(e) => setDescriptionHi(e.target.value)} rows={2} />
              <Textarea placeholder={t("admin.ruleContent")} value={content} onChange={(e) => setContent(e.target.value)} rows={3} />
              <Textarea placeholder={t("admin.ruleContentHi")} value={contentHi} onChange={(e) => setContentHi(e.target.value)} rows={3} />
              <Input placeholder={t("admin.tagsComma")} value={tags} onChange={(e) => setTags(e.target.value)} />
              <div className="flex items-center gap-2">
                <Switch checked={isImportant} onCheckedChange={setIsImportant} />
                <span className="text-sm text-muted-foreground">{t("admin.markImportant")}</span>
              </div>
              <Button onClick={() => save.mutate()} disabled={!title || !category || save.isPending} className="w-full">{t("admin.save")}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="stat-card overflow-hidden p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("admin.ruleTitle")}</TableHead>
              <TableHead>{t("admin.category")}</TableHead>
              <TableHead>{t("admin.chapterNo")}</TableHead>
              <TableHead>{t("admin.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">{t("auth.pleaseWait")}</TableCell></TableRow>
            ) : filtered.length === 0 ? (
              <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">{t("admin.noData")}</TableCell></TableRow>
            ) : filtered.map((r) => (
              <TableRow key={r.id}>
                <TableCell>
                  <div className="flex items-center gap-1.5">
                    {r.is_important && <Star className="h-3 w-3 text-railway-orange fill-railway-orange shrink-0" />}
                    <div>
                      <p className="font-medium text-sm">{r.title}</p>
                      {r.title_hi && <p className="text-[11px] text-muted-foreground">{r.title_hi}</p>}
                    </div>
                  </div>
                </TableCell>
                <TableCell><Badge variant="outline" className="text-[10px]">{r.category}</Badge></TableCell>
                <TableCell className="text-muted-foreground text-xs">{r.chapter_number ?? "—"}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => startEdit(r)}><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => remove.mutate(r.id)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <p className="text-xs text-muted-foreground">{filtered.length} {t("admin.rulesTotal")}</p>
    </div>
  );
}
