import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Key, Copy, CheckCircle, AlertCircle, Info } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const TokenGenerator = () => {
  const [token, setToken] = useState("");
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);
  const { user } = useAuth();

  const generateToken = async () => {
    if (!user) {
      toast.error("Você precisa estar autenticado");
      return;
    }

    setGenerating(true);
    try {
      // Obter a sessão atual do usuário
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) throw error;
      
      if (session?.access_token) {
        setToken(session.access_token);
        toast.success("Token JWT gerado com sucesso!");
      } else {
        toast.error("Não foi possível obter o token");
      }
    } catch (error) {
      console.error('Erro ao gerar token:', error);
      toast.error("Erro ao gerar token");
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(token);
    setCopied(true);
    toast.success("Token copiado!");
    setTimeout(() => setCopied(false), 2000);
  };

  const anonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmcnB6ZnpvZmhpamd5Y3BkZmNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEwNzE4NDgsImV4cCI6MjA3NjY0Nzg0OH0.d91T0yASnL4g5KMxsxZu7B78-5kgyEMp_KQyQ1f6iAs";

  return (
    <Layout title="Gerador de Tokens">
      <div className="p-4 space-y-6">
        {/* Header */}
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary rounded-lg">
                <Key className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <CardTitle>Gerador de Tokens de Teste</CardTitle>
                <CardDescription>
                  Gere tokens JWT para testar as APIs de integração
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Informações Importantes */}
        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-700">
              <Info className="h-5 w-5" />
              Tipos de Tokens
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">1. Token JWT (Usuário Autenticado)</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Use este token para testar requisições autenticadas como se fosse o usuário logado.
              </p>
              <Badge variant="outline">Gerado abaixo</Badge>
            </div>
            <div>
              <h4 className="font-medium mb-2">2. API Key (Integração ERP)</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Para integração com sistemas externos, você precisa de uma API Key cadastrada na tabela <code>integration_partners</code>.
              </p>
              <Badge variant="outline">Via Header X-API-Key</Badge>
            </div>
            <div>
              <h4 className="font-medium mb-2">3. Anon Key (Requisições Públicas)</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Chave pública para requisições não autenticadas.
              </p>
              <Badge variant="outline">Disponível abaixo</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Gerador de Token JWT */}
        <Card>
          <CardHeader>
            <CardTitle>Token JWT (Usuário)</CardTitle>
            <CardDescription>
              Gere um token JWT baseado na sua sessão atual
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={generateToken} 
              disabled={generating}
              className="w-full"
            >
              {generating ? "Gerando..." : "Gerar Token JWT"}
            </Button>

            {token && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">Token gerado com sucesso!</span>
                </div>

                <div className="space-y-2">
                  <Label>Seu Token JWT:</Label>
                  <div className="relative">
                    <Input
                      value={token}
                      readOnly
                      className="font-mono text-xs pr-10"
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      className="absolute right-1 top-1 h-7 w-7 p-0"
                      onClick={copyToClipboard}
                    >
                      {copied ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="bg-muted p-4 rounded-lg space-y-2">
                  <p className="text-sm font-medium">Como usar:</p>
                  <pre className="text-xs overflow-x-auto">
{`curl -X GET <URL> \\
  -H "Authorization: Bearer ${token.substring(0, 30)}..."`}
                  </pre>
                </div>

                <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-medium">⚠️ Atenção:</p>
                    <p>Este token expira após 1 hora. Gere um novo quando necessário.</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Anon Key */}
        <Card>
          <CardHeader>
            <CardTitle>Anon Key (Chave Pública)</CardTitle>
            <CardDescription>
              Chave pública para requisições não autenticadas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Anon Key:</Label>
              <div className="relative">
                <Input
                  value={anonKey}
                  readOnly
                  className="font-mono text-xs pr-10"
                />
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute right-1 top-1 h-7 w-7 p-0"
                  onClick={() => {
                    navigator.clipboard.writeText(anonKey);
                    toast.success("Anon Key copiada!");
                  }}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="bg-muted p-4 rounded-lg space-y-2">
              <p className="text-sm font-medium">Como usar:</p>
              <pre className="text-xs overflow-x-auto">
{`curl -X POST <URL> \\
  -H "apikey: ${anonKey.substring(0, 30)}..." \\
  -H "Content-Type: application/json"`}
              </pre>
            </div>
          </CardContent>
        </Card>

        {/* API Key para ERP */}
        <Card className="border-orange-200 bg-orange-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-700">
              <AlertCircle className="h-5 w-5" />
              API Key para Integração ERP
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm">
              Para integrar com sistemas ERP externos, você precisa cadastrar um parceiro na tabela <code className="bg-white px-1 py-0.5 rounded">integration_partners</code> com uma API Key específica.
            </p>
            <div className="bg-white p-3 rounded-lg">
              <p className="text-sm font-medium mb-2">Exemplo de inserção:</p>
              <pre className="text-xs overflow-x-auto bg-muted p-2 rounded">
{`INSERT INTO integration_partners 
(name, description, api_key, is_active)
VALUES 
('Hospital XYZ', 'Sistema ERP', 
 'sua-api-key-segura-aqui', true);`}
              </pre>
            </div>
            <p className="text-sm text-muted-foreground">
              Essa API Key deve ser enviada no header <code className="bg-white px-1 py-0.5 rounded">X-API-Key</code> nas requisições.
            </p>
          </CardContent>
        </Card>

        {/* URL Base */}
        <Card>
          <CardHeader>
            <CardTitle>URL Base das APIs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label>Base URL:</Label>
              <code className="block bg-muted p-3 rounded-lg text-sm break-all">
                https://jfrpzfzofhijgycpdfcj.supabase.co/functions/v1
              </code>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};