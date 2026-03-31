import { Shield } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminUsers from "@/components/admin/AdminUsers";
import AdminZones from "@/components/admin/AdminZones";
import AdminDivisions from "@/components/admin/AdminDivisions";
import AdminLobbies from "@/components/admin/AdminLobbies";
import AdminManuals from "@/components/admin/AdminManuals";
import AdminRuleBooks from "@/components/admin/AdminRuleBooks";
import AdminDivisionDocs from "@/components/admin/AdminDivisionDocs";

export default function Admin() {
  const { t } = useLanguage();
  const { isAdmin } = useAuth();

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
        <Shield className="h-12 w-12 text-muted-foreground" />
        <h2 className="text-lg font-bold text-foreground">{t("admin.accessDenied")}</h2>
        <p className="text-sm text-muted-foreground">{t("admin.accessDeniedDesc")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-railway-orange/10 flex items-center justify-center">
          <Shield className="h-5 w-5 text-railway-orange" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-foreground">{t("admin.title")}</h2>
          <p className="text-sm text-muted-foreground">{t("admin.subtitle")}</p>
        </div>
      </div>

      <Tabs defaultValue="users" className="w-full">
        <TabsList className="w-full grid grid-cols-3 md:grid-cols-7">
          <TabsTrigger value="users">{t("admin.tabUsers")}</TabsTrigger>
          <TabsTrigger value="zones">{t("admin.tabZones")}</TabsTrigger>
          <TabsTrigger value="divisions">{t("admin.tabDivisions")}</TabsTrigger>
          <TabsTrigger value="lobbies">{t("admin.tabLobbies")}</TabsTrigger>
          <TabsTrigger value="manuals">{t("admin.tabManuals")}</TabsTrigger>
          <TabsTrigger value="rulebooks">{t("admin.tabRuleBooks")}</TabsTrigger>
          <TabsTrigger value="divdocs">Div Docs</TabsTrigger>
        </TabsList>
        <TabsContent value="users"><AdminUsers /></TabsContent>
        <TabsContent value="zones"><AdminZones /></TabsContent>
        <TabsContent value="divisions"><AdminDivisions /></TabsContent>
        <TabsContent value="lobbies"><AdminLobbies /></TabsContent>
        <TabsContent value="manuals"><AdminManuals /></TabsContent>
        <TabsContent value="rulebooks"><AdminRuleBooks /></TabsContent>
        <TabsContent value="divdocs"><AdminDivisionDocs /></TabsContent>
      </Tabs>
    </div>
  );
}
