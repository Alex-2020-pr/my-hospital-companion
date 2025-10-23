import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Shield, Building2, CheckCircle2, XCircle } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface Partner {
  id: string;
  name: string;
  description: string;
  is_active: boolean;
}

interface Consent {
  id: string;
  partner_id: string;
  consent_given: boolean;
  consent_date: string | null;
  revoked_at: string | null;
}

export default function IntegrationConsents() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [consents, setConsents] = useState<Consent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [showConsentDialog, setShowConsentDialog] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Buscar parceiros ativos
      const { data: partnersData, error: partnersError } = await supabase
        .from('integration_partners')
        .select('*')
        .eq('is_active', true);

      if (partnersError) throw partnersError;
      setPartners(partnersData || []);

      // Buscar consentimentos do usuário
      const { data: consentsData, error: consentsError } = await supabase
        .from('patient_consents')
        .select('*')
        .eq('user_id', user.id);

      if (consentsError) throw consentsError;
      setConsents(consentsData || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar dados",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getConsentForPartner = (partnerId: string) => {
    return consents.find(c => c.partner_id === partnerId);
  };

  const handleConsentToggle = async (partner: Partner, currentConsent: Consent | undefined) => {
    if (!currentConsent || !currentConsent.consent_given) {
      // Mostrar dialog para dar consentimento
      setSelectedPartner(partner);
      setShowConsentDialog(true);
    } else {
      // Revogar consentimento diretamente
      await revokeConsent(currentConsent.id);
    }
  };

  const grantConsent = async () => {
    if (!selectedPartner) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const consentText = `Autorizo ${selectedPartner.name} a compartilhar meus dados de saúde com este aplicativo, conforme a Lei Geral de Proteção de Dados (LGPD). Entendo que posso revogar esta autorização a qualquer momento.`;

      const { error } = await supabase
        .from('patient_consents')
        .upsert({
          user_id: user.id,
          partner_id: selectedPartner.id,
          consent_given: true,
          consent_date: new Date().toISOString(),
          consent_text: consentText,
          revoked_at: null,
        });

      if (error) throw error;

      toast({
        title: "Consentimento concedido",
        description: `Você autorizou a integração com ${selectedPartner.name}`,
      });

      fetchData();
    } catch (error: any) {
      toast({
        title: "Erro ao conceder consentimento",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setShowConsentDialog(false);
      setSelectedPartner(null);
    }
  };

  const revokeConsent = async (consentId: string) => {
    try {
      const { error } = await supabase
        .from('patient_consents')
        .update({
          consent_given: false,
          revoked_at: new Date().toISOString(),
        })
        .eq('id', consentId);

      if (error) throw error;

      toast({
        title: "Consentimento revogado",
        description: "A integração foi desativada com sucesso",
      });

      fetchData();
    } catch (error: any) {
      toast({
        title: "Erro ao revogar consentimento",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <p>Carregando...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Integrações e Consentimentos</h1>
            <p className="text-muted-foreground">
              Gerencie suas autorizações de compartilhamento de dados conforme LGPD
            </p>
          </div>
        </div>

        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Seus Direitos LGPD
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>• Você pode autorizar ou revogar o acesso aos seus dados a qualquer momento</p>
            <p>• Apenas sistemas autorizados podem enviar dados para seu perfil</p>
            <p>• Seus dados são protegidos e nunca compartilhados sem seu consentimento</p>
            <p>• Você tem direito a saber quais dados estão sendo compartilhados</p>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Parceiros Disponíveis</h2>
          
          {partners.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Nenhum parceiro disponível no momento
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {partners.map((partner) => {
                const consent = getConsentForPartner(partner.id);
                const isActive = consent?.consent_given && !consent?.revoked_at;

                return (
                  <Card key={partner.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <Building2 className="h-6 w-6 text-primary mt-1" />
                          <div className="flex-1">
                            <CardTitle className="text-xl">{partner.name}</CardTitle>
                            <CardDescription className="mt-2">
                              {partner.description || "Sistema de gestão de saúde"}
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <Badge variant={isActive ? "default" : "secondary"}>
                            {isActive ? (
                              <span className="flex items-center gap-1">
                                <CheckCircle2 className="h-3 w-3" />
                                Ativo
                              </span>
                            ) : (
                              <span className="flex items-center gap-1">
                                <XCircle className="h-3 w-3" />
                                Inativo
                              </span>
                            )}
                          </Badge>
                          <Switch
                            checked={isActive}
                            onCheckedChange={() => handleConsentToggle(partner, consent)}
                          />
                        </div>
                      </div>
                    </CardHeader>
                    {consent?.consent_date && (
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          Autorizado em: {new Date(consent.consent_date).toLocaleDateString('pt-BR')}
                        </p>
                        {consent.revoked_at && (
                          <p className="text-sm text-destructive">
                            Revogado em: {new Date(consent.revoked_at).toLocaleDateString('pt-BR')}
                          </p>
                        )}
                      </CardContent>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <AlertDialog open={showConsentDialog} onOpenChange={setShowConsentDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Consentimento de Compartilhamento de Dados</AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>
                Você está prestes a autorizar <strong>{selectedPartner?.name}</strong> a 
                compartilhar seus dados de saúde com este aplicativo.
              </p>
              <div className="bg-muted p-4 rounded-lg space-y-2 text-sm">
                <p><strong>Dados que serão compartilhados:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Consultas e agendamentos</li>
                  <li>Exames e resultados</li>
                  <li>Prescrições médicas</li>
                  <li>Documentos de saúde</li>
                </ul>
              </div>
              <p>
                Conforme a LGPD, você pode revogar esta autorização a qualquer momento. 
                Seus dados são criptografados e protegidos.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={grantConsent}>
              Autorizar Integração
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
}
