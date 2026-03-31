import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Search, UserPlus, Shield } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

type AppRole = "super_admin" | "zone_admin" | "division_admin" | "lobby_admin" | "crew_user";

const ROLE_COLORS: Record<AppRole, string> = {
  super_admin: "bg-destructive/10 text-destructive",
  zone_admin: "bg-primary/10 text-primary",
  division_admin: "bg-railway-orange/10 text-railway-orange",
  lobby_admin: "bg-railway-info/10 text-railway-info",
  crew_user: "bg-muted text-muted-foreground",
};

export default function AdminUsers() {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [roleDialog, setRoleDialog] = useState<{ userId: string; currentRole: AppRole } | null>(null);
  const [newRole, setNewRole] = useState<AppRole>("crew_user");

  const { data: users, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data: profiles } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
      const { data: roles } = await supabase.from("user_roles").select("*");
      return (profiles ?? []).map((p) => ({
        ...p,
        roles: (roles ?? []).filter((r) => r.user_id === p.user_id).map((r) => r.role as AppRole),
      }));
    },
  });

  const updateRole = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: AppRole }) => {
      // Delete existing roles
      await supabase.from("user_roles").delete().eq("user_id", userId);
      // Insert new role
      const { error } = await supabase.from("user_roles").insert({ user_id: userId, role });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success(t("admin.roleUpdated"));
      setRoleDialog(null);
    },
    onError: () => toast.error("Failed to update role"),
  });

  const filtered = (users ?? []).filter((u) =>
    u.full_name.toLowerCase().includes(search.toLowerCase()) ||
    (u.cms_id ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder={t("admin.searchUsers")} value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
      </div>

      <div className="stat-card overflow-hidden p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("auth.fullName")}</TableHead>
              <TableHead>CMS ID</TableHead>
              <TableHead>{t("admin.designation")}</TableHead>
              <TableHead>{t("profile.role")}</TableHead>
              <TableHead>{t("admin.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">{t("auth.pleaseWait")}</TableCell></TableRow>
            ) : filtered.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">{t("admin.noUsers")}</TableCell></TableRow>
            ) : (
              filtered.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.full_name || "—"}</TableCell>
                  <TableCell className="text-muted-foreground text-xs">{user.cms_id || "—"}</TableCell>
                  <TableCell className="text-muted-foreground text-xs">{user.designation || "—"}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {user.roles.map((role) => (
                        <Badge key={role} variant="outline" className={`text-[10px] ${ROLE_COLORS[role]}`}>{role.replace("_", " ")}</Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Dialog open={roleDialog?.userId === user.user_id} onOpenChange={(open) => {
                      if (open) {
                        setRoleDialog({ userId: user.user_id, currentRole: user.roles[0] || "crew_user" });
                        setNewRole(user.roles[0] || "crew_user");
                      } else setRoleDialog(null);
                    }}>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm"><Shield className="h-3.5 w-3.5 mr-1" />{t("admin.changeRole")}</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader><DialogTitle>{t("admin.changeRole")}: {user.full_name}</DialogTitle></DialogHeader>
                        <Select value={newRole} onValueChange={(v) => setNewRole(v as AppRole)}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {(["super_admin", "zone_admin", "division_admin", "lobby_admin", "crew_user"] as AppRole[]).map((r) => (
                              <SelectItem key={r} value={r}>{r.replace("_", " ")}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button onClick={() => updateRole.mutate({ userId: user.user_id, role: newRole })} disabled={updateRole.isPending}>
                          {t("admin.save")}
                        </Button>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <p className="text-xs text-muted-foreground">{filtered.length} {t("admin.usersTotal")}</p>
    </div>
  );
}
