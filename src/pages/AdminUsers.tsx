import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUserRole } from "@/hooks/useUserRole";
import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { UserPlus, Shield, Building2, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

interface UserRole {
  id: string;
  user_id: string;
  role: string;
  organization_id?: string;
  profiles?: {
    full_name?: string;
    email?: string;
  };
  organizations?: {
    name: string;
  };
}

interface Organization {
  id: string;
  name: string;
}

export const AdminUsers = () => {
  const { isSuperAdmin, loading: roleLoading } = useUserRole();
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    role: 'patient' as 'super_admin' | 'hospital_admin' | 'patient',
    organization_id: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!isSuperAdmin) return;

      try {
        // Buscar todos os user roles
        const { data: rolesData, error: rolesError } = await supabase
          .from('user_roles')
          .select('*')
          .order('role');

        if (rolesError) throw rolesError;

        // Buscar dados dos usuários e organizações separadamente
        const rolesWithDetails = await Promise.all(
          (rolesData || []).map(async (role) => {
            const { data: profile } = await supabase
              .from('profiles')
              .select('full_name, email')
              .eq('id', role.user_id)
              .single();

            let organization = null;
            if (role.organization_id) {
              const { data: org } = await supabase
                .from('organizations')
                .select('name')
                .eq('id', role.organization_id)
                .single();
              organization = org;
            }

            return {
              ...role,
              profiles: profile,
              organizations: organization
            };
          })
        );

        // Buscar organizações para o select
        const { data: orgsData, error: orgsError } = await supabase
          .from('organizations')
          .select('id, name')
          .order('name');

        if (orgsError) throw orgsError;

        setUserRoles(rolesWithDetails);
        setOrganizations(orgsData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Erro ao carregar dados');
      } finally {
        setLoading(false);
      }
    };

    if (isSuperAdmin) {
      fetchData();
    }
  }, [isSuperAdmin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Buscar o user_id pelo email
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', formData.email)
        .single();

      if (userError || !userData) {
        toast.error('Usuário não encontrado com este email');
        return;
      }

      // Criar a role
      const roleData: any = {
        user_id: userData.id,
        role: formData.role
      };

      if (formData.role === 'hospital_admin' && formData.organization_id) {
        roleData.organization_id = formData.organization_id;
      }

      const { error } = await supabase
        .from('user_roles')
        .insert([roleData]);

      if (error) {
        if (error.message.includes('duplicate')) {
          toast.error('Este usuário já possui esta role');
        } else {
          throw error;
        }
        return;
      }

      toast.success('Role atribuída com sucesso!');
      setDialogOpen(false);
      setFormData({ email: '', role: 'patient', organization_id: '' });

      // Recarregar dados
      const { data: rolesData } = await supabase
        .from('user_roles')
        .select('*')
        .order('role');

      const rolesWithDetails = await Promise.all(
        (rolesData || []).map(async (role) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, email')
            .eq('id', role.user_id)
            .single();

          let organization = null;
          if (role.organization_id) {
            const { data: org } = await supabase
              .from('organizations')
              .select('name')
              .eq('id', role.organization_id)
              .single();
            organization = org;
          }

          return {
            ...role,
            profiles: profile,
            organizations: organization
          };
        })
      );

      setUserRoles(rolesWithDetails);
    } catch (error) {
      console.error('Error creating role:', error);
      toast.error('Erro ao atribuir role');
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    if (!confirm('Tem certeza que deseja remover esta permissão?')) return;

    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('id', roleId);

      if (error) throw error;

      toast.success('Permissão removida com sucesso');
      setUserRoles(prev => prev.filter(r => r.id !== roleId));
    } catch (error) {
      console.error('Error deleting role:', error);
      toast.error('Erro ao remover permissão');
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'super_admin':
        return <Badge className="bg-purple-500">Super Admin</Badge>;
      case 'hospital_admin':
        return <Badge className="bg-blue-500">Admin Hospital</Badge>;
      case 'patient':
        return <Badge variant="secondary">Paciente</Badge>;
      default:
        return <Badge>{role}</Badge>;
    }
  };

  if (roleLoading || loading) {
    return (
      <Layout title="Gerenciar Usuários">
        <div className="p-4">Carregando...</div>
      </Layout>
    );
  }

  if (!isSuperAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <Layout title="Gerenciar Usuários e Permissões">
      <div className="p-4 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Permissões de Usuários</h2>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Atribuir Permissão
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Atribuir Permissão a Usuário</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="email">Email do Usuário</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="usuario@exemplo.com"
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    O usuário deve estar cadastrado no sistema
                  </p>
                </div>
                <div>
                  <Label htmlFor="role">Tipo de Permissão</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value: any) => setFormData({ ...formData, role: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="super_admin">Super Admin</SelectItem>
                      <SelectItem value="hospital_admin">Admin Hospital</SelectItem>
                      <SelectItem value="patient">Paciente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {formData.role === 'hospital_admin' && (
                  <div>
                    <Label htmlFor="organization">Organização</Label>
                    <Select
                      value={formData.organization_id}
                      onValueChange={(value) => setFormData({ ...formData, organization_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a organização" />
                      </SelectTrigger>
                      <SelectContent>
                        {organizations.map((org) => (
                          <SelectItem key={org.id} value={org.id}>
                            {org.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <Button type="submit" className="w-full">
                  Atribuir Permissão
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4">
          {userRoles.map((userRole) => (
            <Card key={userRole.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5" />
                    <div>
                      <p className="text-base">
                        {userRole.profiles?.full_name || 'Nome não informado'}
                      </p>
                      <p className="text-sm font-normal text-muted-foreground">
                        {userRole.profiles?.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getRoleBadge(userRole.role)}
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteRole(userRole.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              {userRole.organization_id && (
                <CardContent>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Building2 className="h-4 w-4" />
                    <span>
                      {userRole.organizations?.name || 'Organização não encontrada'}
                    </span>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
};
