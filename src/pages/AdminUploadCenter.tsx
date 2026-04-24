import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, Upload, Search, FileText, BookOpen, Scroll, Trash2, History, Plus, X, Download, Tag, Loader2 } from "lucide-react";

type Category = "manual" | "circular" | "rule";

interface AdminDoc {
  id: string;
  title: string;
  description: string | null;
  category: Category;
  document_type: string | null;
  tags: string[];
  version: number;
  version_notes: string | null;
  parent_document_id: string | null;
  is_latest: boolean;
  file_url: string;
  file_size: number | null;
  file_type: string | null;
  file_name: string | null;
  uploaded_by: string;
  created_at: string;
  is_active: boolean;
}

const CATEGORIES: { id: Category | "all"; label: string; icon: typeof FileText; color: string }[] = [
  { id: "all", label: "All", icon: FileText, color: "from-slate-500 to-slate-700" },
  { id: "manual", label: "Manuals", icon: BookOpen, color: "from-blue-500 to-blue-700" },
  { id: "circular", label: "Circulars", icon: Scroll, color: "from-amber-500 to-orange-600" },
  { id: "rule", label: "Rules", icon: FileText, color: "from-emerald-500 to-emerald-700" },
];

const formatSize = (bytes: number | null) => {
  if (!bytes) return "—";
  const units = ["B", "KB", "MB", "GB"];
  let i = 0; let n = bytes;
  while (n >= 1024 && i < units.length - 1) { n /= 1024; i++; }
  return `${n.toFixed(1)} ${units[i]}`;
};

export default function AdminUploadCenter() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [docs, setDocs] = useState<AdminDoc[]>([]);
  const [activeCategory, setActiveCategory] = useState<Category | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showUpload, setShowUpload] = useState(false);
  const [versionsOf, setVersionsOf] = useState<AdminDoc | null>(null);
  const [versions, setVersions] = useState<AdminDoc[]>([]);

  // Form state
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "manual" as Category,
    document_type: "",
    tags: "",
    version_notes: "",
    parent_document_id: "" as string,
    file: null as File | null,
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      setUserId(session.user.id);
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id);
      const adminRoles = ["super_admin", "zone_admin", "division_admin", "lobby_admin"];
      const hasAdmin = (roles ?? []).some((r) => adminRoles.includes(r.role));
      setIsAdmin(hasAdmin);
      await loadDocs();
      setLoading(false);
    };
    init();
  }, [navigate]);

  const loadDocs = async () => {
    const { data, error } = await supabase
      .from("admin_documents")
      .select("*")
      .eq("is_latest", true)
      .eq("is_active", true)
      .order("created_at", { ascending: false });
    if (error) { toast.error("Failed to load documents"); return; }
    setDocs((data ?? []) as AdminDoc[]);
  };

  const loadVersions = async (doc: AdminDoc) => {
    const rootId = doc.parent_document_id ?? doc.id;
    const { data } = await supabase
      .from("admin_documents")
      .select("*")
      .or(`id.eq.${rootId},parent_document_id.eq.${rootId}`)
      .order("version", { ascending: false });
    setVersions((data ?? []) as AdminDoc[]);
    setVersionsOf(doc);
  };

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return docs.filter((d) => {
      if (activeCategory !== "all" && d.category !== activeCategory) return false;
      if (!q) return true;
      return (
        d.title.toLowerCase().includes(q) ||
        (d.description ?? "").toLowerCase().includes(q) ||
        (d.document_type ?? "").toLowerCase().includes(q) ||
        d.tags.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [docs, activeCategory, searchQuery]);

  const resetForm = () => {
    setForm({
      title: "", description: "", category: "manual", document_type: "",
      tags: "", version_notes: "", parent_document_id: "", file: null,
    });
  };

  const handleUpload = async () => {
    if (!form.file || !form.title.trim() || !userId) {
      toast.error("Title and file are required");
      return;
    }
    setUploading(true);
    try {
      const ext = form.file.name.split(".").pop() ?? "bin";
      const path = `${form.category}/${userId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("admin-documents")
        .upload(path, form.file, { upsert: false });
      if (upErr) throw upErr;
      const { data: { publicUrl } } = supabase.storage.from("admin-documents").getPublicUrl(path);

      const tagsArr = form.tags.split(",").map((t) => t.trim()).filter(Boolean);

      let version = 1;
      let parent_document_id: string | null = null;
      if (form.parent_document_id) {
        const parent = docs.find((d) => d.id === form.parent_document_id);
        if (parent) {
          const rootId = parent.parent_document_id ?? parent.id;
          parent_document_id = rootId;
          const { data: existing } = await supabase
            .from("admin_documents")
            .select("version")
            .or(`id.eq.${rootId},parent_document_id.eq.${rootId}`)
            .order("version", { ascending: false })
            .limit(1);
          version = ((existing?.[0]?.version ?? 0) as number) + 1;
          // Demote previous latest
          await supabase
            .from("admin_documents")
            .update({ is_latest: false })
            .or(`id.eq.${rootId},parent_document_id.eq.${rootId}`);
        }
      }

      const { error: insErr } = await supabase.from("admin_documents").insert({
        title: form.title.trim(),
        description: form.description.trim() || null,
        category: form.category,
        document_type: form.document_type.trim() || null,
        tags: tagsArr,
        version,
        version_notes: form.version_notes.trim() || null,
        parent_document_id,
        is_latest: true,
        file_url: publicUrl,
        file_size: form.file.size,
        file_type: form.file.type || ext,
        file_name: form.file.name,
        uploaded_by: userId,
      });
      if (insErr) throw insErr;

      toast.success(parent_document_id ? `Version ${version} uploaded` : "Document uploaded");
      setShowUpload(false);
      resetForm();
      await loadDocs();
    } catch (e: any) {
      toast.error(e.message ?? "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (doc: AdminDoc) => {
    if (!confirm(`Delete "${doc.title}" v${doc.version}? This cannot be undone.`)) return;
    const { error } = await supabase
      .from("admin_documents")
      .update({ is_active: false })
      .eq("id", doc.id);
    if (error) { toast.error("Delete failed"); return; }
    toast.success("Document removed");
    await loadDocs();
    if (versionsOf) await loadVersions(versionsOf);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="animate-fade-in p-6 text-center">
        <div className="bg-card border border-border rounded-2xl p-8 max-w-sm mx-auto">
          <div className="mx-auto w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
            <X className="text-destructive" />
          </div>
          <h2 className="font-bold text-lg text-foreground">Access Restricted</h2>
          <p className="text-sm text-muted-foreground mt-2">The Upload Center is available to admins only.</p>
          <button onClick={() => navigate("/")} className="mt-5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium press-effect">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in pb-24">
      {/* Header */}
      <div className="bg-card sticky top-0 z-20 border-b border-border px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="press-effect"><ArrowLeft size={22} /></button>
        <div className="flex-1">
          <h1 className="text-base font-bold text-foreground">Upload Center</h1>
          <p className="text-xs text-muted-foreground">Manuals · Circulars · Rules</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowUpload(true); }}
          className="press-effect flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold shadow-sm"
        >
          <Plus size={16} /> Upload
        </button>
      </div>

      {/* Search */}
      <div className="px-4 pt-4">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, tag, or type…"
            className="w-full pl-10 pr-4 py-3 rounded-2xl bg-muted/60 border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
      </div>

      {/* Category chips */}
      <div className="px-4 mt-3 flex gap-2 overflow-x-auto no-scrollbar">
        {CATEGORIES.map((c) => {
          const active = activeCategory === c.id;
          const Icon = c.icon;
          return (
            <button
              key={c.id}
              onClick={() => setActiveCategory(c.id)}
              className={`press-effect shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold border transition-all ${
                active
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "bg-card text-foreground border-border"
              }`}
            >
              <Icon size={14} /> {c.label}
            </button>
          );
        })}
      </div>

      {/* List */}
      <div className="px-4 mt-4 space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground text-sm">
            <FileText size={36} className="mx-auto mb-2 opacity-40" />
            No documents found.
          </div>
        ) : (
          filtered.map((d) => {
            const cat = CATEGORIES.find((c) => c.id === d.category)!;
            const Icon = cat.icon;
            return (
              <div key={d.id} className="bg-card border border-border rounded-2xl p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center text-white shrink-0`}>
                    <Icon size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-foreground text-sm leading-snug truncate">{d.title}</h3>
                      <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">v{d.version}</span>
                    </div>
                    {d.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{d.description}</p>}
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      {d.document_type && (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-muted text-muted-foreground">{d.document_type}</span>
                      )}
                      {d.tags.slice(0, 3).map((t) => (
                        <span key={t} className="inline-flex items-center gap-0.5 text-[10px] px-2 py-0.5 rounded-md bg-accent/40 text-foreground">
                          <Tag size={9} /> {t}
                        </span>
                      ))}
                      <span className="text-[10px] text-muted-foreground ml-auto">{formatSize(d.file_size)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
                  <a
                    href={d.file_url}
                    target="_blank"
                    rel="noreferrer"
                    className="press-effect flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold"
                  >
                    <Download size={14} /> Open
                  </a>
                  <button
                    onClick={() => loadVersions(d)}
                    className="press-effect px-3 py-2 rounded-xl bg-muted text-foreground text-xs font-semibold flex items-center gap-1"
                  >
                    <History size={14} /> Versions
                  </button>
                  <button
                    onClick={() => handleDelete(d)}
                    className="press-effect px-3 py-2 rounded-xl bg-destructive/10 text-destructive text-xs font-semibold"
                    aria-label="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center animate-fade-in" onClick={() => !uploading && setShowUpload(false)}>
          <div
            className="bg-card w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-5 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2"><Upload size={18} /> Upload Document</h2>
              <button onClick={() => setShowUpload(false)} disabled={uploading} className="press-effect"><X size={20} /></button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Title *</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full mt-1 px-3 py-2.5 rounded-xl bg-muted border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                  placeholder="e.g. WAP-7 Driver Manual"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Category *</label>
                <div className="grid grid-cols-3 gap-2 mt-1">
                  {(["manual", "circular", "rule"] as Category[]).map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setForm({ ...form, category: c })}
                      className={`press-effect py-2 rounded-xl text-xs font-semibold capitalize border ${
                        form.category === c ? "bg-primary text-primary-foreground border-primary" : "bg-muted border-border text-foreground"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Document Type</label>
                <input
                  value={form.document_type}
                  onChange={(e) => setForm({ ...form, document_type: e.target.value })}
                  className="w-full mt-1 px-3 py-2.5 rounded-xl bg-muted border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                  placeholder="e.g. Locomotive, Safety, Operating"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Tags (comma-separated)</label>
                <input
                  value={form.tags}
                  onChange={(e) => setForm({ ...form, tags: e.target.value })}
                  className="w-full mt-1 px-3 py-2.5 rounded-xl bg-muted border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                  placeholder="WAP7, electric, brake"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={2}
                  className="w-full mt-1 px-3 py-2.5 rounded-xl bg-muted border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
                  placeholder="Short summary…"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground">New version of (optional)</label>
                <select
                  value={form.parent_document_id}
                  onChange={(e) => setForm({ ...form, parent_document_id: e.target.value })}
                  className="w-full mt-1 px-3 py-2.5 rounded-xl bg-muted border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                >
                  <option value="">— Upload as new document —</option>
                  {docs.filter((d) => d.category === form.category).map((d) => (
                    <option key={d.id} value={d.id}>{d.title} (v{d.version})</option>
                  ))}
                </select>
              </div>
              {form.parent_document_id && (
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Version Notes</label>
                  <input
                    value={form.version_notes}
                    onChange={(e) => setForm({ ...form, version_notes: e.target.value })}
                    className="w-full mt-1 px-3 py-2.5 rounded-xl bg-muted border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                    placeholder="What changed in this version?"
                  />
                </div>
              )}
              <div>
                <label className="text-xs font-semibold text-muted-foreground">File *</label>
                <label className="mt-1 block border-2 border-dashed border-border rounded-xl p-4 text-center cursor-pointer hover:border-primary/60 transition-colors">
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => setForm({ ...form, file: e.target.files?.[0] ?? null })}
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.png,.jpg,.jpeg"
                  />
                  {form.file ? (
                    <div>
                      <FileText className="mx-auto mb-1 text-primary" size={22} />
                      <p className="text-xs font-medium text-foreground truncate">{form.file.name}</p>
                      <p className="text-[10px] text-muted-foreground">{formatSize(form.file.size)}</p>
                    </div>
                  ) : (
                    <div className="text-muted-foreground">
                      <Upload className="mx-auto mb-1" size={22} />
                      <p className="text-xs">Tap to choose a file</p>
                      <p className="text-[10px] mt-0.5">PDF, DOC, XLS, PPT, images</p>
                    </div>
                  )}
                </label>
              </div>

              <button
                onClick={handleUpload}
                disabled={uploading || !form.file || !form.title.trim()}
                className="w-full press-effect py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {uploading ? <><Loader2 className="animate-spin" size={16} /> Uploading…</> : <><Upload size={16} /> Upload Document</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Versions Modal */}
      {versionsOf && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center animate-fade-in" onClick={() => setVersionsOf(null)}>
          <div className="bg-card w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-5 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2"><History size={18} /> Versions</h2>
                <p className="text-xs text-muted-foreground truncate">{versionsOf.title}</p>
              </div>
              <button onClick={() => setVersionsOf(null)} className="press-effect"><X size={20} /></button>
            </div>
            <div className="space-y-2">
              {versions.filter((v) => v.is_active).map((v) => (
                <div key={v.id} className={`p-3 rounded-xl border ${v.is_latest ? "border-primary bg-primary/5" : "border-border bg-muted/40"}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-foreground">v{v.version}</span>
                      {v.is_latest && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-primary text-primary-foreground">LATEST</span>}
                    </div>
                    <span className="text-[10px] text-muted-foreground">{new Date(v.created_at).toLocaleDateString()}</span>
                  </div>
                  {v.version_notes && <p className="text-xs text-muted-foreground mt-1">{v.version_notes}</p>}
                  <div className="flex gap-2 mt-2">
                    <a href={v.file_url} target="_blank" rel="noreferrer" className="press-effect flex-1 text-center py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold">Open</a>
                    <button onClick={() => handleDelete(v)} className="press-effect px-3 py-1.5 rounded-lg bg-destructive/10 text-destructive text-xs font-semibold">
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
