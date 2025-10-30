import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { 
  User, 
  Shield,
  Edit,
  Link as LinkIcon,
  Bell,
  Code,
  Mail,
  Phone,
  Sparkles
} from "lucide-react";
import am2Logo from "@/assets/am2-logo.jpg";
import am2LogoCompleto from "@/assets/am2-logo-completo.png";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { Loader2, Save, X } from "lucide-react";
import { PushNotificationSettings } from "@/components/PushNotificationSettings";

export const Profile = () => {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) {
        toast({
          title: "Erro ao carregar perfil",
          description: error.message,
          variant: "destructive",
        });
      } else {
        setProfile(data);
      }
      setLoading(false);
    };

    fetchProfile();
  }, [user, toast]);

  const handleEdit = () => {
    setEditedProfile({ ...profile });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedProfile(null);
  };

  const handleSave = async () => {
    if (!user) return;
    
    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: editedProfile.full_name,
        phone: editedProfile.phone,
        birth_date: editedProfile.birth_date,
        cpf: editedProfile.cpf,
        notification_preferences: editedProfile.notification_preferences,
      })
      .eq('id', user.id);

    if (error) {
      toast({
        title: "Erro ao salvar",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setProfile(editedProfile);
      setIsEditing(false);
      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram salvas com sucesso.",
      });
    }
    setSaving(false);
  };

  const handleNotificationToggle = (key: string, value: boolean) => {
    if (!isEditing) {
      handleEdit();
    }
    const updatedPreferences = {
      ...(editedProfile?.notification_preferences || profile?.notification_preferences || {}),
      [key]: value
    };
    setEditedProfile({ 
      ...(editedProfile || profile), 
      notification_preferences: updatedPreferences 
    });
    
    // Auto-save notification preferences
    supabase
      .from('profiles')
      .update({ notification_preferences: updatedPreferences })
      .eq('id', user?.id)
      .then(({ error }) => {
        if (!error) {
          setProfile({ ...profile, notification_preferences: updatedPreferences });
        }
      });
  };

  const handleInputChange = (field: string, value: string) => {
    setEditedProfile({ ...editedProfile, [field]: value });
  };

  const handleLogout = async () => {
    try {
      await signOut();
      // Sempre redireciona, independente de erro
      navigate("/auth");
    } catch (err) {
      // Mesmo com erro (sessão expirada), apenas redireciona
      navigate("/auth");
    }
  };

  if (loading) {
    return (
      <Layout title="Meu Perfil">
        <div className="p-4 flex items-center justify-center">
          <p>Carregando perfil...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Meu Perfil">
      <div className="p-4 space-y-6">
        {/* Dados Pessoais */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-base">
              <User className="h-5 w-5 mr-2 text-primary" />
              Dados Pessoais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label>Nome Completo</Label>
                <Input 
                  value={isEditing ? (editedProfile?.full_name || '') : (profile?.full_name || '')} 
                  readOnly={!isEditing}
                  onChange={(e) => handleInputChange('full_name', e.target.value)}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Data de Nascimento</Label>
                  <Input 
                    type="date"
                    value={isEditing ? (editedProfile?.birth_date || '') : (profile?.birth_date || '')} 
                    readOnly={!isEditing}
                    onChange={(e) => handleInputChange('birth_date', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>CPF</Label>
                  <Input 
                    value={isEditing ? (editedProfile?.cpf || '') : (profile?.cpf || '')} 
                    readOnly={!isEditing}
                    onChange={(e) => handleInputChange('cpf', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Telefone</Label>
                <Input 
                  value={isEditing ? (editedProfile?.phone || '') : (profile?.phone || '')} 
                  readOnly={!isEditing}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>E-mail</Label>
                <Input value={profile?.email || ''} readOnly />
              </div>

              {!isEditing ? (
                <Button variant="outline" className="w-full" onClick={handleEdit}>
                  <Edit className="h-4 w-4 mr-2" />
                  Editar Informações
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    className="flex-1" 
                    onClick={handleCancel}
                    disabled={saving}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancelar
                  </Button>
                  <Button 
                    className="flex-1" 
                    onClick={handleSave}
                    disabled={saving}
                  >
                    {saving ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Salvar
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Alertas e Lembretes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-base">
              <Bell className="h-5 w-5 mr-2 text-primary" />
              Alertas e Lembretes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground mb-3">
              Configure quais alertas e lembretes você deseja receber
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Horários de Medicação</Label>
                  <p className="text-xs text-muted-foreground">Lembretes para tomar seus medicamentos</p>
                </div>
                <Switch
                  checked={profile?.notification_preferences?.medication_reminders ?? true}
                  onCheckedChange={(checked) => handleNotificationToggle('medication_reminders', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Sinais Vitais</Label>
                  <p className="text-xs text-muted-foreground">Lembrete para registrar sinais vitais</p>
                </div>
                <Switch
                  checked={profile?.notification_preferences?.vital_signs ?? true}
                  onCheckedChange={(checked) => handleNotificationToggle('vital_signs', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Consultas Agendadas</Label>
                  <p className="text-xs text-muted-foreground">Lembretes de consultas próximas</p>
                </div>
                <Switch
                  checked={profile?.notification_preferences?.scheduled_appointments ?? true}
                  onCheckedChange={(checked) => handleNotificationToggle('scheduled_appointments', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Exames Agendados</Label>
                  <p className="text-xs text-muted-foreground">Lembretes de exames próximos</p>
                </div>
                <Switch
                  checked={profile?.notification_preferences?.scheduled_exams ?? true}
                  onCheckedChange={(checked) => handleNotificationToggle('scheduled_exams', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Preparo de Exames</Label>
                  <p className="text-xs text-muted-foreground">Instruções de preparo para exames</p>
                </div>
                <Switch
                  checked={profile?.notification_preferences?.exam_preparation ?? true}
                  onCheckedChange={(checked) => handleNotificationToggle('exam_preparation', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Atividade Física</Label>
                  <p className="text-xs text-muted-foreground">Lembretes para praticar exercícios</p>
                </div>
                <Switch
                  checked={profile?.notification_preferences?.physical_activity ?? true}
                  onCheckedChange={(checked) => handleNotificationToggle('physical_activity', checked)}
                />
              </div>

              <div className="border-t pt-4 mt-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">Mostrar Exemplos</Label>
                    <p className="text-xs text-muted-foreground">Exibir exemplos de lembretes, receitas e documentos</p>
                  </div>
                  <Switch
                    checked={profile?.notification_preferences?.show_examples ?? true}
                    onCheckedChange={(checked) => handleNotificationToggle('show_examples', checked)}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notificações Push */}
        <PushNotificationSettings />

        {/* Integrações */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-base">
              <LinkIcon className="h-5 w-5 mr-2 text-primary" />
              Integrações
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground mb-3">
              Gerencie suas autorizações para compartilhamento de dados de saúde
            </p>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => navigate('/integracoes')}
            >
              Gerenciar Integrações LGPD
            </Button>
          </CardContent>
        </Card>

        {/* Segurança */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-base">
              <Shield className="h-5 w-5 mr-2 text-primary" />
              Segurança
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              Alterar Senha
            </Button>
            <Button variant="outline" className="w-full justify-start">
              Configurar Autenticação de 2 Fatores
            </Button>
            <Button 
              variant="destructive" 
              className="w-full justify-start"
              onClick={handleLogout}
            >
              Sair da Conta
            </Button>
          </CardContent>
        </Card>

        {/* Histórico de Versões */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-base">
              <Sparkles className="h-5 w-5 mr-2 text-primary" />
              Novidades e Atualizações
            </CardTitle>
            <CardDescription>
              Acompanhe o histórico de melhorias da plataforma
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => navigate('/changelog')}
              variant="outline"
              className="w-full"
            >
              Ver Histórico de Versões
            </Button>
          </CardContent>
        </Card>

        {/* Dados do Desenvolvedor */}
        <Card className="border-muted">
          <CardHeader>
            <CardTitle className="flex items-center text-base text-muted-foreground">
              <Code className="h-5 w-5 mr-2" />
              Desenvolvido por
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <a 
                href="https://www.am2solucoes.com.br" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:opacity-80 transition-opacity"
              >
                <img 
                  src={am2LogoCompleto} 
                  alt="AM2 Soluções" 
                  className="h-16"
                />
              </a>
              <div className="flex-1 space-y-1">
                <a 
                  href="https://www.am2solucoes.com.br" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm font-medium hover:text-primary transition-colors block"
                >
                  AM2 Soluções em Saúde
                </a>
                <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                  <a 
                    href="tel:+5545999901902" 
                    className="flex items-center gap-1 hover:text-primary transition-colors"
                  >
                    <Phone className="h-3 w-3" />
                    (45) 99990-1902
                  </a>
                  <a 
                    href="mailto:comercial@am2solucoes.com.br" 
                    className="flex items-center gap-1 hover:text-primary transition-colors"
                  >
                    <Mail className="h-3 w-3" />
                    comercial@am2solucoes.com.br
                  </a>
                  <span className="text-xs">Cascavel - PR</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};