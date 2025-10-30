import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUserRole } from "@/hooks/useUserRole";
import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { UserPlus, Shield, Building2, Trash2, Search, Edit } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface UserProfile {
  id: string;
  full_name?: string;
  email?: string;
  created_at: string;
  roles: {
    id: string;
    role: string;
    organization_id?: string;
    organization_name?: string;
  }[];
}

interface Organization {
  id: string;
  name: string;
}

export const AdminUsers = () => {
  const { isSuperAdmin, loading: roleLoading } = useUserRole();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState({
    userId: '',
    role: 'patient' as 'super_admin' | 'hospital_admin' | 'patient',
    organization_id: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!isSuperAdmin) return;

      try {
        // Buscar todos os usuários com dados mascarados para segurança
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, full_name, email, created_at')
          .order('full_name');

        if (profilesError) throw profilesError;

        // Buscar todas as roles
        const { data: rolesData, error: rolesError } = await supabase
          .from('user_roles')
          .select('id, user_id, role, organization_id');

        if (rolesError) throw rolesError;

        // Buscar organizações
        const { data: orgsData, error: orgsError } = await supabase
          .from('organizations')
          .select('id, name')
          .order('name');

        if (orgsError) throw orgsError;

        // Criar um mapa de organizações
        const orgsMap = new Map(orgsData?.map(org => [org.id, org.name]) || []);

        // Combinar dados
        const usersWithRoles = (profilesData || []).map(profile => {
          const userRoles = (rolesData || [])
            .filter(role => role.user_id === profile.id)
            .map(role => ({
              id: role.id,
              role: role.role,
              organization_id: role.organization_id,
              organization_name: role.organization_id ? orgsMap.get(role.organization_id) : undefined
            }));

          return {
            ...profile,
            roles: userRoles
          };
        });

        setUsers(usersWithRoles);
        setFilteredUsers(usersWithRoles);
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

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(user =>
        user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [searchTerm, users]);

  const reloadUsers = async () => {
    try {
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, full_name, email, created_at')
        .order('full_name');

      const { data: rolesData } = await supabase
        .from('user_roles')
        .select('id, user_id, role, organization_id');

      const { data: orgsData } = await supabase
        .from('organizations')
        .select('id, name');

      const orgsMap = new Map(orgsData?.map(org => [org.id, org.name]) || []);

      const usersWithRoles = (profilesData || []).map(profile => {
        const userRoles = (rolesData || [])
          .filter(role => role.user_id === profile.id)
          .map(role => ({
            id: role.id,
            role: role.role,
            organization_id: role.organization_id,
            organization_name: role.organization_id ? orgsMap.get(role.organization_id) : undefined
          }));

        return {
          ...profile,
          roles: userRoles
        };
      });

      setUsers(usersWithRoles);
    } catch (error) {
      console.error('Error reloading users:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const roleData: any = {
        user_id: formData.userId,
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

      toast.success('Permissão atribuída com sucesso!');
      setDialogOpen(false);
      setSelectedUser(null);
      setFormData({ userId: '', role: 'patient', organization_id: '' });
      await reloadUsers();
    } catch (error) {
      console.error('Error creating role:', error);
      toast.error('Erro ao atribuir permissão');
    }
  };

  const openEditDialog = (user: UserProfile) => {
    setSelectedUser(user);
    setFormData({ userId: user.id, role: 'patient', organization_id: '' });
    setDialogOpen(true);
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
      await reloadUsers();
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
    <Layout title="Gerenciar Usuários">
      <div className="p-4 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-2xl font-bold">Usuários do Sistema</h2>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Pesquisar por nome ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuário</TableHead>
                <TableHead>Permissões</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{user.full_name || 'Nome não informado'}</span>
                      <span className="text-sm text-muted-foreground">{user.email}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-2">
                      {user.roles.length === 0 ? (
                        <Badge variant="outline">Sem permissões</Badge>
                      ) : (
                        user.roles.map((role) => (
                          <div key={role.id} className="flex items-center gap-2">
                            {getRoleBadge(role.role)}
                            {role.organization_name && (
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Building2 className="h-3 w-3" />
                                {role.organization_name}
                              </span>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0"
                              onClick={() => handleDeleteRole(role.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        ))
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEditDialog(user)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Adicionar Permissão
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filteredUsers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                    {searchTerm ? 'Nenhum usuário encontrado' : 'Nenhum usuário cadastrado'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setSelectedUser(null);
        }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {selectedUser ? `Atribuir Permissão - ${selectedUser.full_name}` : 'Atribuir Permissão'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
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
                    required
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
    </Layout>
  );
};
