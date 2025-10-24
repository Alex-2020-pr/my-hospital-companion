import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Key, Copy, CheckCircle, AlertCircle, Info, Plus, Trash2, XCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useUserRole } from "@/hooks/useUserRole";

interface Organization {
  id: string;
  name: string;
  type: string;
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
  organizations: { name: string };
}

export const TokenGenerator = () => {
  const { user } = useAuth();
  const { isSuperAdmin } = useUserRole();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [tokens, setTokens] = useState<ApiToken[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<string>("");
  const [tokenName, setTokenName] = useState("");
  const [generating, setGenerating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [revokeDialogOpen, setRevokeDialogOpen] = useState(false);
  const [selectedToken, setSelectedToken] = useState<ApiToken | null>(null);
  const [revokeReason, setRevokeReason] = useState("");

  useEffect(() => {
    if (isSuperAdmin) {
      fetchOrganizations();
      fetchTokens();
    }
  }, [isSuperAdmin]);

  const fetchOrganizations = async () => {
    try {
      const { data, error } = await supabase
        .from('organizations')
        .select('id, name, type')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setOrganizations(data || []);
    } catch (error) {
      console.error('Error fetching organizations:', error);
      toast.error('Erro ao carregar organizações');
    }
  };

  const fetchTokens = async () => {
    try {
      const { data, error } = await supabase
        .from('organization_api_tokens')
        .select('*, organizations(name)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTokens(data || []);
    } catch (error) {
      console.error('Error fetching tokens:', error);
      toast.error('Erro ao carregar tokens');
    }
  };

  const generateToken = async () => {
    if (!selectedOrg || !tokenName.trim()) {
      toast.error("Selecione uma organização e informe um nome");
      return;
    }

    setGenerating(true);
    try {
      // Generate token using database function
      const { data: tokenData, error: tokenError } = await supabase
        .rpc('generate_api_token');

      if (tokenError) throw tokenError;

      // Insert token into database
      const { error: insertError } = await supabase
        .from('organization_api_tokens')
        .insert({
          organization_id: selectedOrg,
          token: tokenData,
          name: tokenName,
          created_by: user?.id
        });

      if (insertError) throw insertError;

      toast.success("Token gerado com sucesso!");
      setDialogOpen(false);
      setTokenName("");
      setSelectedOrg("");
      fetchTokens();
    } catch (error) {
      console.error('Error generating token:', error);
      toast.error("Erro ao gerar token");
    } finally {
      setGenerating(false);
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
      fetchTokens();
    } catch (error) {
      console.error('Error revoking token:', error);
      toast.error("Erro ao revogar token");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Token copiado!");
  };

  const getStatusBadge = (token: ApiToken) => {
    if (!token.is_active) {
      return <Badge variant="destructive">Revogado</Badge>;
    }
    if (token.expires_at && new Date(token.expires_at) < new Date()) {
      return <Badge variant="secondary">Expirado</Badge>;
    }
    return <Badge variant="default" className="bg-green-600">Ativo</Badge>;
  };

  if (!isSuperAdmin) {
    return (
      <Layout title="Gerador de Tokens">
        <div className="p-4">
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                Você não tem permissão para acessar esta página.
              </p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Gerador de Tokens de API">
      <div className="p-4 space-y-6">
        {/* Header */}
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary rounded-lg">
                  <Key className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <CardTitle>Tokens de API por Organização</CardTitle>
                  <CardDescription>
                    Gere e gerencie tokens de acesso para hospitais e clínicas
                  </CardDescription>
                </div>
              </div>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Gerar Novo Token
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Gerar Token de API</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="organization">Organização *</Label>
                      <Select value={selectedOrg} onValueChange={setSelectedOrg}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a organização" />
                        </SelectTrigger>
                        <SelectContent>
                          {organizations.map((org) => (
                            <SelectItem key={org.id} value={org.id}>
                              {org.name} ({org.type === 'hospital' ? 'Hospital' : 'Clínica'})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="tokenName">Nome do Token *</Label>
                      <Input
                        id="tokenName"
                        placeholder="Ex: Produção, Teste, Desenvolvimento"
                        value={tokenName}
                        onChange={(e) => setTokenName(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Nome descritivo para identificar o token
                      </p>
                    </div>
                    <Button 
                      onClick={generateToken} 
                      disabled={generating || !selectedOrg || !tokenName.trim()}
                      className="w-full"
                    >
                      {generating ? "Gerando..." : "Gerar Token"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
        </Card>

        {/* Informações */}
        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-700">
              <Info className="h-5 w-5" />
              Como Usar os Tokens
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm">
              Os tokens de API devem ser enviados no header <code className="bg-white px-1 py-0.5 rounded">X-API-Key</code> nas requisições às APIs de integração.
            </p>
            <div className="bg-white p-3 rounded-lg">
              <p className="text-sm font-medium mb-2">Exemplo de uso:</p>
              <pre className="text-xs overflow-x-auto bg-muted p-2 rounded">
{`curl -X POST https://jfrpzfzofhijgycpdfcj.supabase.co/functions/v1/erp-sync-appointments \\
  -H "X-API-Key: org_seu_token_aqui" \\
  -H "Content-Type: application/json" \\
  -d '{"user_cpf": "12345678900", "appointments": [...]}'`}
              </pre>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Tokens */}
        <Card>
          <CardHeader>
            <CardTitle>Tokens Cadastrados</CardTitle>
            <CardDescription>
              Gerencie os tokens de acesso das organizações
            </CardDescription>
          </CardHeader>
          <CardContent>
            {tokens.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Nenhum token cadastrado ainda
              </p>
            ) : (
              <div className="space-y-4">
                {tokens.map((token) => (
                  <Card key={token.id} className={!token.is_active ? 'opacity-60' : ''}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold">{token.name}</h4>
                            {getStatusBadge(token)}
                          </div>
                          
                          <div className="text-sm space-y-1">
                            <p>
                              <strong>Organização:</strong>{' '}
                              {(token.organizations as any)?.name}
                            </p>
                            <p>
                              <strong>Criado em:</strong>{' '}
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
                                  <strong>Revogado em:</strong>{' '}
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
                              <Input
                                value={token.token}
                                readOnly
                                className="font-mono text-xs flex-1"
                              />
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => copyToClipboard(token.token)}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
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
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dialog de Revogação */}
        <Dialog open={revokeDialogOpen} onOpenChange={setRevokeDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-5 w-5" />
                Revogar Token
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm">
                Tem certeza que deseja revogar o token <strong>{selectedToken?.name}</strong>?
              </p>
              <p className="text-sm text-muted-foreground">
                Esta ação não pode ser desfeita. O token deixará de funcionar imediatamente.
              </p>
              <div>
                <Label htmlFor="revokeReason">Motivo da Revogação *</Label>
                <Textarea
                  id="revokeReason"
                  placeholder="Ex: Inadimplência, Solicitação do cliente, Segurança comprometida"
                  value={revokeReason}
                  onChange={(e) => setRevokeReason(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setRevokeDialogOpen(false);
                    setSelectedToken(null);
                    setRevokeReason("");
                  }}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  variant="destructive"
                  onClick={revokeToken}
                  disabled={!revokeReason.trim()}
                  className="flex-1"
                >
                  Revogar Token
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};