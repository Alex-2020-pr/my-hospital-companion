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
import { Building2, Plus, Pencil, Trash2, Key, Copy, Eye, EyeOff, XCircle, AlertCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/hooks/useAuth";

interface Organization {
  id: string;
  name: string;
  type: string;
  cnpj?: string;
  website?: string;
  contact_email?: string;
  contact_phone?: string;
  address?: string;
  is_active: boolean;
}

interface ApiToken {
  id: string;
  organization_id: string;
  token: string;
  name: string;
  is_active: boolean;
  expires_at: string | null;
  last_used_at: string | null;
  created_at: string;
  revoked_at: string | null;
  revoke_reason: string | null;
}

export const AdminOrganizations = () => {
  const { user } = useAuth();
  const { isSuperAdmin, loading: roleLoading } = useUserRole();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'hospital',
    cnpj: '',
    website: '',
    contact_email: '',
    contact_phone: '',
    address: '',
    is_active: true
  });
  const [loadingWebsiteData, setLoadingWebsiteData] = useState(false);
  
  // Token management states
  const [selectedOrgForTokens, setSelectedOrgForTokens] = useState<string | null>(null);
  const [orgTokens, setOrgTokens] = useState<ApiToken[]>([]);
  const [tokenDialogOpen, setTokenDialogOpen] = useState(false);
  const [tokenName, setTokenName] = useState("");
  const [generatingToken, setGeneratingToken] = useState(false);
  const [showTokens, setShowTokens] = useState<Record<string, boolean>>({});
  const [revokeDialogOpen, setRevokeDialogOpen] = useState(false);
  const [selectedToken, setSelectedToken] = useState<ApiToken | null>(null);
  const [revokeReason, setRevokeReason] = useState("");

  const fetchOrganizations = async () => {
    try {
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .order('name');

      if (error) throw error;
      setOrganizations(data || []);
    } catch (error) {
      console.error('Error fetching organizations:', error);
      toast.error('Erro ao carregar organizações');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isSuperAdmin) {
      fetchOrganizations();
    }
  }, [isSuperAdmin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingOrg) {
        const { error } = await supabase
          .from('organizations')
          .update(formData)
          .eq('id', editingOrg.id);

        if (error) throw error;
        toast.success('Organização atualizada com sucesso');
      } else {
        const { error } = await supabase
          .from('organizations')
          .insert([formData]);

        if (error) throw error;
        toast.success('Organização criada com sucesso');
      }

      setDialogOpen(false);
      resetForm();
      fetchOrganizations();
    } catch (error) {
      console.error('Error saving organization:', error);
      toast.error('Erro ao salvar organização');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta organização?')) return;

    try {
      const { error } = await supabase
        .from('organizations')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Organização excluída com sucesso');
      fetchOrganizations();
    } catch (error) {
      console.error('Error deleting organization:', error);
      toast.error('Erro ao excluir organização');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'hospital',
      cnpj: '',
      website: '',
      contact_email: '',
      contact_phone: '',
      address: '',
      is_active: true
    });
    setEditingOrg(null);
  };

  const fetchWebsiteData = async () => {
    if (!formData.website) {
      toast.error('Por favor, insira um site válido');
      return;
    }

    setLoadingWebsiteData(true);
    try {
      // Normalize URL
      let url = formData.website;
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }

      // Fetch website metadata
      const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`);
      const data = await response.json();
      
      if (data.contents) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(data.contents, 'text/html');
        
        // Try to extract organization name from title or meta tags
        const title = doc.querySelector('title')?.textContent || '';
        const ogTitle = doc.querySelector('meta[property="og:title"]')?.getAttribute('content') || '';
        const description = doc.querySelector('meta[name="description"]')?.getAttribute('content') || '';
        
        // Update form with extracted data
        setFormData(prev => ({
          ...prev,
          name: prev.name || ogTitle || title.split('-')[0].trim() || '',
        }));
        
        toast.success('Dados extraídos do site com sucesso!');
      }
    } catch (error) {
      console.error('Error fetching website data:', error);
      toast.error('Não foi possível extrair dados do site. Por favor, preencha manualmente.');
    } finally {
      setLoadingWebsiteData(false);
    }
  };

  const openEditDialog = (org: Organization) => {
    setEditingOrg(org);
    setFormData({
      name: org.name,
      type: org.type,
      cnpj: org.cnpj || '',
      website: org.website || '',
      contact_email: org.contact_email || '',
      contact_phone: org.contact_phone || '',
      address: org.address || '',
      is_active: org.is_active
    });
    setDialogOpen(true);
  };

  // Token management functions
  const fetchOrgTokens = async (orgId: string) => {
    try {
      const { data, error } = await supabase
        .from('organization_api_tokens')
        .select('*')
        .eq('organization_id', orgId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrgTokens(data || []);
    } catch (error) {
      console.error('Error fetching tokens:', error);
      toast.error('Erro ao carregar tokens');
    }
  };

  const openTokensDialog = (orgId: string) => {
    setSelectedOrgForTokens(orgId);
    fetchOrgTokens(orgId);
    setTokenDialogOpen(true);
  };

  const generateToken = async () => {
    if (!selectedOrgForTokens || !tokenName.trim()) {
      toast.error("Informe um nome para o token");
      return;
    }

    setGeneratingToken(true);
    try {
      const { data: tokenData, error: tokenError } = await supabase
        .rpc('generate_api_token');

      if (tokenError) throw tokenError;

      const { error: insertError } = await supabase
        .from('organization_api_tokens')
        .insert({
          organization_id: selectedOrgForTokens,
          token: tokenData,
          name: tokenName,
          created_by: user?.id
        });

      if (insertError) throw insertError;

      toast.success("Token gerado com sucesso!");
      setTokenName("");
      fetchOrgTokens(selectedOrgForTokens);
    } catch (error) {
      console.error('Error generating token:', error);
      toast.error("Erro ao gerar token");
    } finally {
      setGeneratingToken(false);
    }
  };

  const revokeToken = async () => {
    if (!selectedToken || !revokeReason.trim()) {
      toast.error("Informe o motivo da revogação");
      return;
    }

    try {
      const { error } = await supabase
        .from('organization_api_tokens')
        .update({
          is_active: false,
          revoked_at: new Date().toISOString(),
          revoked_by: user?.id,
          revoke_reason: revokeReason
        })
        .eq('id', selectedToken.id);

      if (error) throw error;

      toast.success("Token revogado com sucesso!");
      setRevokeDialogOpen(false);
      setSelectedToken(null);
      setRevokeReason("");
      if (selectedOrgForTokens) {
        fetchOrgTokens(selectedOrgForTokens);
      }
    } catch (error) {
      console.error('Error revoking token:', error);
      toast.error("Erro ao revogar token");
    }
  };

  const copyToken = (token: string) => {
    navigator.clipboard.writeText(token);
    toast.success("Token copiado!");
  };

  const toggleShowToken = (id: string) => {
    setShowTokens(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getStatusBadge = (token: ApiToken) => {
    if (!token.is_active) {
      return <Badge variant="destructive">Revogado</Badge>;
    }
    if (token.expires_at && new Date(token.expires_at) < new Date()) {
      return <Badge variant="secondary">Expirado</Badge>;
    }
    return <Badge className="bg-green-600 hover:bg-green-700">Ativo</Badge>;
  };

  // Aguarda o carregamento das roles antes de qualquer verificação
  if (roleLoading) {
    return (
      <Layout title="Organizações">
        <div className="p-4">Carregando permissões...</div>
      </Layout>
    );
  }

  // Só redireciona se não for super admin E já terminou de carregar
  if (!roleLoading && !isSuperAdmin) {
    console.log('AdminOrganizations: redirecionando - não é super admin');
    return <Navigate to="/" replace />;
  }

  return (
    <Layout title="Gerenciar Organizações">
      <div className="p-4 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Hospitais e Clínicas</h2>
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nova Organização
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingOrg ? 'Editar' : 'Nova'} Organização</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="website">Site (para preenchimento automático)</Label>
                  <div className="flex gap-2">
                    <Input
                      id="website"
                      type="url"
                      placeholder="https://exemplo.com.br"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={fetchWebsiteData}
                      disabled={!formData.website || loadingWebsiteData}
                    >
                      {loadingWebsiteData ? 'Buscando...' : 'Auto-preencher'}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Informe o site para tentar preencher automaticamente alguns dados
                  </p>
                </div>

                <div>
                  <Label htmlFor="name">Nome *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="type">Tipo *</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData({ ...formData, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hospital">Hospital</SelectItem>
                      <SelectItem value="clinic">Clínica</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="cnpj">CNPJ</Label>
                  <Input
                    id="cnpj"
                    placeholder="00.000.000/0000-00"
                    value={formData.cnpj}
                    onChange={(e) => {
                      // Remove non-numeric characters
                      const numeric = e.target.value.replace(/\D/g, '');
                      // Format CNPJ
                      let formatted = numeric;
                      if (numeric.length > 2) formatted = `${numeric.slice(0, 2)}.${numeric.slice(2)}`;
                      if (numeric.length > 5) formatted = `${formatted.slice(0, 6)}.${numeric.slice(5)}`;
                      if (numeric.length > 8) formatted = `${formatted.slice(0, 10)}/${numeric.slice(8)}`;
                      if (numeric.length > 12) formatted = `${formatted.slice(0, 15)}-${numeric.slice(12, 14)}`;
                      setFormData({ ...formData, cnpj: formatted });
                    }}
                    maxLength={18}
                  />
                </div>

                <div>
                  <Label htmlFor="contact_email">Email de Contato</Label>
                  <Input
                    id="contact_email"
                    type="email"
                    placeholder="contato@exemplo.com.br"
                    value={formData.contact_email}
                    onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="contact_phone">Telefone</Label>
                  <Input
                    id="contact_phone"
                    placeholder="(00) 0000-0000"
                    value={formData.contact_phone}
                    onChange={(e) => {
                      // Remove non-numeric characters
                      const numeric = e.target.value.replace(/\D/g, '');
                      // Format phone
                      let formatted = numeric;
                      if (numeric.length > 0) formatted = `(${numeric.slice(0, 2)}`;
                      if (numeric.length > 2) formatted = `${formatted}) ${numeric.slice(2)}`;
                      if (numeric.length > 6) formatted = `${formatted.slice(0, 10)}-${numeric.slice(6, 10)}`;
                      if (numeric.length > 10) formatted = `${formatted.slice(0, 9)} ${numeric.slice(6, 11)}`;
                      setFormData({ ...formData, contact_phone: formatted });
                    }}
                    maxLength={15}
                  />
                </div>

                <div>
                  <Label htmlFor="address">Endereço Completo</Label>
                  <Input
                    id="address"
                    placeholder="Rua, número, bairro, cidade - UF"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>

                <Button type="submit" className="w-full">
                  {editingOrg ? 'Atualizar Organização' : 'Criar Organização'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <p>Carregando...</p>
        ) : (
          <div className="grid gap-4">
            {organizations.map((org) => (
              <Card key={org.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-5 w-5" />
                      {org.name}
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => openTokensDialog(org.id)}
                        className="gap-2"
                      >
                        <Key className="h-4 w-4" />
                        Tokens API
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => openEditDialog(org)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(org.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <p><strong>Tipo:</strong> {org.type === 'hospital' ? 'Hospital' : 'Clínica'}</p>
                    {org.cnpj && <p><strong>CNPJ:</strong> {org.cnpj}</p>}
                    {org.website && (
                      <p>
                        <strong>Site:</strong>{' '}
                        <a 
                          href={org.website.startsWith('http') ? org.website : `https://${org.website}`}
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          {org.website}
                        </a>
                      </p>
                    )}
                    {org.contact_email && <p><strong>Email:</strong> {org.contact_email}</p>}
                    {org.contact_phone && <p><strong>Telefone:</strong> {org.contact_phone}</p>}
                    {org.address && <p><strong>Endereço:</strong> {org.address}</p>}
                    <p><strong>Status:</strong> {org.is_active ? 'Ativo' : 'Inativo'}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Token Management Dialog */}
        <Dialog open={tokenDialogOpen} onOpenChange={(open) => {
          setTokenDialogOpen(open);
          if (!open) {
            setSelectedOrgForTokens(null);
            setOrgTokens([]);
            setTokenName("");
          }
        }}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Gerenciar Tokens de API
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              {/* Generate Token Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Gerar Novo Token</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="tokenName">Nome do Token</Label>
                    <Input
                      id="tokenName"
                      placeholder="Ex: Produção, Teste, Desenvolvimento"
                      value={tokenName}
                      onChange={(e) => setTokenName(e.target.value)}
                    />
                  </div>
                  <Button 
                    onClick={generateToken} 
                    disabled={generatingToken || !tokenName.trim()}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {generatingToken ? "Gerando..." : "Gerar Token"}
                  </Button>
                </CardContent>
              </Card>

              {/* Tokens List */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Tokens Cadastrados</CardTitle>
                </CardHeader>
                <CardContent>
                  {orgTokens.length === 0 ? (
                    <p className="text-center text-muted-foreground py-4">
                      Nenhum token cadastrado ainda
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {orgTokens.map((token) => (
                        <Card key={token.id} className={!token.is_active ? 'opacity-60' : ''}>
                          <CardContent className="pt-4">
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-semibold">{token.name}</h4>
                                  {getStatusBadge(token)}
                                </div>
                                {token.is_active && (
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => {
                                      setSelectedToken(token);
                                      setRevokeDialogOpen(true);
                                    }}
                                  >
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Revogar
                                  </Button>
                                )}
                              </div>
                              
                              <div className="text-sm space-y-1 text-muted-foreground">
                                <p>
                                  <strong>Criado:</strong>{' '}
                                  {new Date(token.created_at).toLocaleDateString('pt-BR')}
                                </p>
                                {token.last_used_at && (
                                  <p>
                                    <strong>Último uso:</strong>{' '}
                                    {new Date(token.last_used_at).toLocaleString('pt-BR')}
                                  </p>
                                )}
                                {token.revoked_at && (
                                  <>
                                    <p>
                                      <strong>Revogado:</strong>{' '}
                                      {new Date(token.revoked_at).toLocaleString('pt-BR')}
                                    </p>
                                    {token.revoke_reason && (
                                      <p>
                                        <strong>Motivo:</strong>{' '}
                                        <span className="text-destructive">{token.revoke_reason}</span>
                                      </p>
                                    )}
                                  </>
                                )}
                              </div>

                              {token.is_active && (
                                <div className="flex items-center gap-2">
                                  <code className="flex-1 bg-muted p-2 rounded text-xs font-mono overflow-x-auto">
                                    {showTokens[token.id] ? token.token : '••••••••••••••••••••'}
                                  </code>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => toggleShowToken(token.id)}
                                  >
                                    {showTokens[token.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => copyToken(token.token)}
                                  >
                                    <Copy className="h-4 w-4" />
                                  </Button>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </DialogContent>
        </Dialog>

        {/* Revoke Token Dialog */}
        <AlertDialog open={revokeDialogOpen} onOpenChange={setRevokeDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-5 w-5" />
                Revogar Token
              </AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja revogar o token <strong>{selectedToken?.name}</strong>?
                Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="my-4">
              <Label htmlFor="revokeReason">Motivo da Revogação *</Label>
              <Textarea
                id="revokeReason"
                placeholder="Ex: Inadimplência, Solicitação do cliente, Segurança comprometida"
                value={revokeReason}
                onChange={(e) => setRevokeReason(e.target.value)}
                rows={3}
              />
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => {
                setSelectedToken(null);
                setRevokeReason("");
              }}>
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={revokeToken}
                disabled={!revokeReason.trim()}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Revogar Token
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
};
