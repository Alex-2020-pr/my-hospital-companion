import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useUserRole } from "@/hooks/useUserRole";
import { Navigate, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Users, Building2, Activity, FileText } from "lucide-react";

interface DashboardStats {
  totalUsers: number;
  totalOrganizations: number;
  totalDocuments: number;
  usersByOrganization: { name: string; count: number }[];
}

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const { isSuperAdmin, loading: roleLoading } = useUserRole();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalOrganizations: 0,
    totalDocuments: 0,
    usersByOrganization: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [profilesRes, orgsRes, docsRes] = await Promise.all([
          supabase.from('profiles').select('id, organization_id', { count: 'exact' }),
          supabase.from('organizations').select('id', { count: 'exact' }),
          supabase.from('documents').select('id', { count: 'exact' })
        ]);

        const { data: orgData } = await supabase
          .from('profiles')
          .select(`
            organization_id,
            organizations (name)
          `);

        const orgCounts = orgData?.reduce((acc, profile) => {
          if (profile.organizations) {
            const org = profile.organizations as any;
            const name = org.name || 'Sem organização';
            acc[name] = (acc[name] || 0) + 1;
          }
          return acc;
        }, {} as Record<string, number>);

        setStats({
          totalUsers: profilesRes.count || 0,
          totalOrganizations: orgsRes.count || 0,
          totalDocuments: docsRes.count || 0,
          usersByOrganization: Object.entries(orgCounts || {}).map(([name, count]) => ({
            name,
            count: count as number
          }))
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isSuperAdmin) {
      fetchStats();
    }
  }, [isSuperAdmin]);

  if (roleLoading || loading) {
    return (
      <Layout title="Dashboard Administrativo">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground">Carregando informações...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!isSuperAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <Layout title="Dashboard Administrativo">
      <div className="p-4 space-y-6">
        <div className="flex gap-4 mb-6">
          <Button onClick={() => navigate('/admin/organizations')} variant="outline">
            <Building2 className="mr-2 h-4 w-4" />
            Gerenciar Organizações
          </Button>
          <Button onClick={() => navigate('/admin/partners')} variant="outline">
            <Activity className="mr-2 h-4 w-4" />
            Gerenciar Parceiros
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? '...' : stats.totalUsers}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Organizações</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? '...' : stats.totalOrganizations}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Documentos</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? '...' : stats.totalDocuments}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Usuários por Organização</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Carregando...</p>
            ) : stats.usersByOrganization.length > 0 ? (
              <div className="space-y-2">
                {stats.usersByOrganization.map((org, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <span className="font-medium">{org.name}</span>
                    <span className="text-muted-foreground">{org.count} usuários</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">Nenhum dado disponível</p>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};
