import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useUserRole } from "@/hooks/useUserRole";
import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Key, Plus, Pencil, Trash2, Copy, Eye, EyeOff } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface Partner {
  id: string;
  name: string;
  description?: string;
  api_key: string;
  is_active: boolean;
}

export const AdminPartners = () => {
  const { isSuperAdmin, loading: roleLoading } = useUserRole();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  const [showApiKeys, setShowApiKeys] = useState<Record<string, boolean>>({});
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    api_key: '',
    is_active: true
  });

  const fetchPartners = async () => {
    try {
      const { data, error } = await supabase
        .from('integration_partners')
        .select('*')
        .order('name');

      if (error) throw error;
      setPartners(data || []);
    } catch (error) {
      console.error('Error fetching partners:', error);
      toast.error('Erro ao carregar parceiros');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isSuperAdmin) {
      fetchPartners();
    }
  }, [isSuperAdmin]);

  const generateApiKey = () => {
    const key = 'sk_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    setFormData({ ...formData, api_key: key });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingPartner) {
        const { error } = await supabase
          .from('integration_partners')
          .update(formData)
          .eq('id', editingPartner.id);

        if (error) throw error;
        toast.success('Parceiro atualizado com sucesso');
      } else {
        const { error } = await supabase
          .from('integration_partners')
          .insert([formData]);

        if (error) throw error;
        toast.success('Parceiro criado com sucesso');
      }

      setDialogOpen(false);
      resetForm();
      fetchPartners();
    } catch (error) {
      console.error('Error saving partner:', error);
      toast.error('Erro ao salvar parceiro');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este parceiro?')) return;

    try {
      const { error } = await supabase
        .from('integration_partners')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Parceiro excluído com sucesso');
      fetchPartners();
    } catch (error) {
      console.error('Error deleting partner:', error);
      toast.error('Erro ao excluir parceiro');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      api_key: '',
      is_active: true
    });
    setEditingPartner(null);
  };

  const openEditDialog = (partner: Partner) => {
    setEditingPartner(partner);
    setFormData({
      name: partner.name,
      description: partner.description || '',
      api_key: partner.api_key,
      is_active: partner.is_active
    });
    setDialogOpen(true);
  };

  const copyApiKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast.success('API Key copiada!');
  };

  const toggleShowApiKey = (id: string) => {
    setShowApiKeys(prev => ({ ...prev, [id]: !prev[id] }));
  };

  if (roleLoading) {
    return (
      <Layout title="Parceiros">
        <div className="p-4">Carregando...</div>
      </Layout>
    );
  }

  if (!isSuperAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <Layout title="Gerenciar Parceiros de Integração">
      <div className="p-4 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Parceiros de Integração</h2>
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Parceiro
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingPartner ? 'Editar' : 'Novo'} Parceiro</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="api_key">API Key</Label>
                  <div className="flex gap-2">
                    <Input
                      id="api_key"
                      value={formData.api_key}
                      onChange={(e) => setFormData({ ...formData, api_key: e.target.value })}
                      required
                    />
                    <Button type="button" onClick={generateApiKey}>
                      Gerar
                    </Button>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <Label htmlFor="is_active">Ativo</Label>
                </div>
                <Button type="submit" className="w-full">
                  {editingPartner ? 'Atualizar' : 'Criar'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <p>Carregando...</p>
        ) : (
          <div className="grid gap-4">
            {partners.map((partner) => (
              <Card key={partner.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Key className="h-5 w-5" />
                      {partner.name}
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => openEditDialog(partner)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(partner.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    {partner.description && <p>{partner.description}</p>}
                    <div className="flex items-center gap-2">
                      <Label>API Key:</Label>
                      <code className="flex-1 bg-muted p-2 rounded text-xs font-mono">
                        {showApiKeys[partner.id] ? partner.api_key : '••••••••••••••••••••'}
                      </code>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => toggleShowApiKey(partner.id)}
                      >
                        {showApiKeys[partner.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyApiKey(partner.api_key)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <p><strong>Status:</strong> {partner.is_active ? 'Ativo' : 'Inativo'}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};
