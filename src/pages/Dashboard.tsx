import { Layout } from "@/components/Layout";
import { QuickActionCard } from "@/components/QuickActionCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  Stethoscope, 
  FileText, 
  MessageCircle, 
  Clock, 
  AlertCircle,
  CheckCircle,
  Bell
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import heroImage from "@/assets/medical-hero.jpg";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

export const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [userName, setUserName] = useState<string>("");

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) return;
      
      const { data } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();
      
      if (data?.full_name) {
        setUserName(data.full_name.split(' ')[0]);
      }
    };

    fetchUserProfile();
  }, [user]);

  const upcomingAppointments = [
    {
      id: 1,
      type: "Consulta Cardiologia",
      doctor: "Dr. João Silva",
      date: "15/01/2024",
      time: "14:30",
      status: "confirmado"
    },
    {
      id: 2,
      type: "Exame de Sangue",
      location: "Laboratório Central",
      date: "18/01/2024",
      time: "08:00",
      status: "agendado"
    }
  ];

  const recentResults = [
    {
      id: 1,
      type: "Hemograma Completo",
      date: "10/01/2024",
      status: "disponível"
    },
    {
      id: 2,
      type: "Raio-X Tórax",
      date: "08/01/2024",
      status: "disponível"
    }
  ];

  return (
    <Layout>
      <div className="p-4 space-y-6">
        {/* Header com saudação */}
        <div className="relative bg-primary text-primary-foreground rounded-lg p-6 overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <img src={heroImage} alt="Medical background" className="w-full h-full object-cover" />
          </div>
          <div className="relative z-10">
            <h1 className="text-2xl font-bold mb-2">Olá, {userName || 'Usuário'}!</h1>
            <p className="opacity-90">Bem-vindo ao seu portal de saúde</p>
          </div>
        </div>

        {/* Ações Rápidas */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Ações Rápidas</h2>
          <div className="grid grid-cols-2 gap-3">
            <QuickActionCard
              title="Agendar Consulta"
              description="Nova consulta médica"
              icon={Calendar}
              onClick={() => navigate('/consultas')}
            />
            <QuickActionCard
              title="Ver Exames"
              description="Resultados disponíveis"
              icon={Stethoscope}
              onClick={() => navigate('/exames')}
              variant="accent"
            />
            <QuickActionCard
              title="Documentos"
              description="Receitas e atestados"
              icon={FileText}
              onClick={() => navigate('/documentos')}
            />
            <QuickActionCard
              title="Falar Conosco"
              description="Suporte e dúvidas"
              icon={MessageCircle}
              onClick={() => navigate('/contato')}
            />
          </div>
        </div>

        {/* Próximas Consultas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-primary" />
              <span>Próximas Consultas</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingAppointments.map((appointment) => (
              <div key={appointment.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{appointment.type}</h4>
                  <p className="text-xs text-muted-foreground">
                    {appointment.doctor || appointment.location}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {appointment.date} às {appointment.time}
                  </p>
                </div>
                <Badge variant={appointment.status === 'confirmado' ? 'default' : 'secondary'}>
                  {appointment.status === 'confirmado' ? 'Confirmado' : 'Agendado'}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Resultados Recentes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-accent" />
              <span>Resultados Recentes</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentResults.map((result) => (
              <div key={result.id} className="flex items-center justify-between p-3 bg-accent/5 rounded-lg border border-accent/20">
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{result.type}</h4>
                  <p className="text-xs text-muted-foreground">{result.date}</p>
                </div>
                <Badge variant="outline" className="text-accent border-accent">
                  Disponível
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Notificações Importantes */}
        <Card className="border-destructive/20 bg-destructive/5">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <span>Lembretes Importantes</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm">• Lembre-se de fazer jejum de 12h para o exame de sangue</p>
              <p className="text-sm">• Consulta de retorno cardiologia em 3 dias</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};