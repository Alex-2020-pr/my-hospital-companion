import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useUserRole } from "@/hooks/useUserRole";
import { Navigate, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Users, Building2, Activity, FileText, HardDrive, Shield, DollarSign } from "lucide-react";

interface DashboardStats {
  totalUsers: number;
  totalOrganizations: number;
  totalDocuments: number;
  totalStorageUsed: number;
  usersByOrganization: { name: string; count: number }[];
  storageByUser: { name: string; email: string; storage: number }[];
}

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const { isSuperAdmin, loading: roleLoading } = useUserRole();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalOrganizations: 0,
    totalDocuments: 0,
    totalStorageUsed: 0,
    usersByOrganization: [],
    storageByUser: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [profilesRes, orgsRes, docsRes] = await Promise.all([
          supabase.from('profiles').select('id, organization_id, storage_used_bytes, full_name, email', { count: 'exact' }),
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

        // Calculate total storage used
        const totalStorage = profilesRes.data?.reduce((acc, profile) => {
          return acc + (profile.storage_used_bytes || 0);
        }, 0) || 0;

        // Get storage by user
        const storageByUser = profilesRes.data
          ?.filter(p => (p.storage_used_bytes || 0) > 0)
          .sort((a, b) => (b.storage_used_bytes || 0) - (a.storage_used_bytes || 0))
          .slice(0, 10)
          .map(p => ({
            name: p.full_name || 'Usuário sem nome',
            email: p.email || '',
            storage: p.storage_used_bytes || 0
          })) || [];

        setStats({
          totalUsers: profilesRes.count || 0,
          totalOrganizations: orgsRes.count || 0,
          totalDocuments: docsRes.count || 0,
          totalStorageUsed: totalStorage,
          usersByOrganization: Object.entries(orgCounts || {}).map(([name, count]) => ({
            name,
            count: count as number
          })),
          storageByUser
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
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4">Gerenciamento</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <Button onClick={() => navigate('/admin/users')} variant="outline" className="h-auto py-4 flex-col">
              <Shield className="h-6 w-6 mb-2" />
              <span className="text-sm">Usuários</span>
            </Button>
            <Button onClick={() => navigate('/admin/organizations')} variant="outline" className="h-auto py-4 flex-col">
              <Building2 className="h-6 w-6 mb-2" />
              <span className="text-sm">Organizações</span>
            </Button>
            <Button onClick={() => navigate('/admin/partners')} variant="outline" className="h-auto py-4 flex-col">
              <Activity className="h-6 w-6 mb-2" />
              <span className="text-sm">Parceiros</span>
            </Button>
            <Button onClick={() => navigate('/api-docs')} variant="outline" className="h-auto py-4 flex-col">
              <FileText className="h-6 w-6 mb-2" />
              <span className="text-sm">API Docs</span>
            </Button>
            <Button onClick={() => navigate('/token-generator')} variant="outline" className="h-auto py-4 flex-col">
              <FileText className="h-6 w-6 mb-2" />
              <span className="text-sm">Tokens</span>
            </Button>
            <Button onClick={() => navigate('/admin/push-notifications')} variant="outline" className="h-auto py-4 flex-col">
              <Activity className="h-6 w-6 mb-2" />
              <span className="text-sm">Notificações</span>
            </Button>
            <Button onClick={() => navigate('/admin/costs')} variant="outline" className="h-auto py-4 flex-col">
              <DollarSign className="h-6 w-6 mb-2" />
              <span className="text-sm">Custos</span>
            </Button>
            <Button onClick={() => navigate('/admin/storage')} variant="outline" className="h-auto py-4 flex-col">
              <HardDrive className="h-6 w-6 mb-2" />
              <span className="text-sm">Armazenamento</span>
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Armazenamento Total</CardTitle>
              <HardDrive className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? '...' : `${(stats.totalStorageUsed / 1024 / 1024).toFixed(2)} MB`}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

          <Card>
            <CardHeader>
              <CardTitle>Top 10 - Uso de Armazenamento por Paciente</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p>Carregando...</p>
              ) : stats.storageByUser.length > 0 ? (
                <div className="space-y-2">
                  {stats.storageByUser.map((user, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                      <span className="text-sm font-semibold">
                        {(user.storage / 1024 / 1024).toFixed(2)} MB
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">Nenhum dado disponível</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};
