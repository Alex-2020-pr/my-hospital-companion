import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  CreditCard,
  Shield,
  Edit,
  Bell,
  Heart,
  AlertTriangle
} from "lucide-react";

export const Profile = () => {
  const patientData = {
    name: "Maria Silva Santos",
    birthDate: "15/03/1985",
    cpf: "123.456.789-10",
    phone: "(11) 99999-8888",
    email: "maria.santos@email.com",
    address: "Rua das Flores, 123 - Centro, São Paulo - SP",
    cep: "01234-567",
    healthPlan: "Unimed Premium",
    cardNumber: "123456789",
    validUntil: "12/2025"
  };

  const medicalInfo = {
    bloodType: "O+",
    allergies: ["Penicilina", "Dipirona"],
    chronicConditions: ["Hipertensão", "Diabetes Tipo 2"],
    emergencyContact: {
      name: "João Santos (Esposo)",
      phone: "(11) 99999-7777"
    }
  };

  const preferences = {
    notifications: true,
    emailReminders: true,
    smsReminders: false
  };

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
                <Input value={patientData.name} readOnly />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Data de Nascimento</Label>
                  <Input value={patientData.birthDate} readOnly />
                </div>
                <div className="space-y-2">
                  <Label>CPF</Label>
                  <Input value={patientData.cpf} readOnly />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Telefone</Label>
                <Input value={patientData.phone} />
              </div>

              <div className="space-y-2">
                <Label>E-mail</Label>
                <Input value={patientData.email} />
              </div>

              <div className="space-y-2">
                <Label>Endereço</Label>
                <Input value={patientData.address} />
              </div>

              <Button variant="outline" className="w-full">
                <Edit className="h-4 w-4 mr-2" />
                Editar Informações
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Plano de Saúde */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-base">
              <CreditCard className="h-5 w-5 mr-2 text-accent" />
              Plano de Saúde
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">{patientData.healthPlan}</h3>
                <p className="text-sm text-muted-foreground">
                  Cartão: {patientData.cardNumber}
                </p>
                <p className="text-sm text-muted-foreground">
                  Válido até: {patientData.validUntil}
                </p>
              </div>
              <Badge variant="default">Ativo</Badge>
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Coberturas Disponíveis:</h4>
              <div className="grid grid-cols-2 gap-2">
                <Badge variant="outline" className="justify-center">Consultas</Badge>
                <Badge variant="outline" className="justify-center">Exames</Badge>
                <Badge variant="outline" className="justify-center">Cirurgias</Badge>
                <Badge variant="outline" className="justify-center">Emergência</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Informações Médicas */}
        <Card className="border-destructive/20">
          <CardHeader>
            <CardTitle className="flex items-center text-base">
              <Heart className="h-5 w-5 mr-2 text-destructive" />
              Informações Médicas Importantes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Tipo Sanguíneo</Label>
                <div className="mt-1">
                  <Badge variant="destructive" className="text-sm">
                    {medicalInfo.bloodType}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center">
                <AlertTriangle className="h-4 w-4 mr-1 text-destructive" />
                Alergias
              </Label>
              <div className="flex flex-wrap gap-2">
                {medicalInfo.allergies.map((allergy, index) => (
                  <Badge key={index} variant="destructive" className="text-xs">
                    {allergy}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Condições Crônicas</Label>
              <div className="flex flex-wrap gap-2">
                {medicalInfo.chronicConditions.map((condition, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {condition}
                  </Badge>
                ))}
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label className="text-sm font-medium">Contato de Emergência</Label>
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="font-medium text-sm">{medicalInfo.emergencyContact.name}</p>
                <p className="text-sm text-muted-foreground">{medicalInfo.emergencyContact.phone}</p>
              </div>
            </div>

            <Button variant="outline" className="w-full">
              <Edit className="h-4 w-4 mr-2" />
              Atualizar Informações Médicas
            </Button>
          </CardContent>
        </Card>

        {/* Preferências */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-base">
              <Bell className="h-5 w-5 mr-2 text-primary" />
              Preferências de Notificação
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-sm">Notificações Push</h4>
                  <p className="text-xs text-muted-foreground">
                    Receber notificações do aplicativo
                  </p>
                </div>
                <Badge variant={preferences.notifications ? "default" : "secondary"}>
                  {preferences.notifications ? "Ativado" : "Desativado"}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-sm">Lembretes por E-mail</h4>
                  <p className="text-xs text-muted-foreground">
                    Receber lembretes de consultas e exames
                  </p>
                </div>
                <Badge variant={preferences.emailReminders ? "default" : "secondary"}>
                  {preferences.emailReminders ? "Ativado" : "Desativado"}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-sm">SMS</h4>
                  <p className="text-xs text-muted-foreground">
                    Receber SMS para lembretes urgentes
                  </p>
                </div>
                <Badge variant={preferences.smsReminders ? "default" : "secondary"}>
                  {preferences.smsReminders ? "Ativado" : "Desativado"}
                </Badge>
              </div>
            </div>

            <Button variant="outline" className="w-full">
              <Edit className="h-4 w-4 mr-2" />
              Alterar Preferências
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
            <Button variant="destructive" className="w-full justify-start">
              Sair da Conta
            </Button>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};