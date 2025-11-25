import { Layout } from "@/components/Layout";
import { QuickActionCard } from "@/components/QuickActionCard";
import { StorageAlert } from "@/components/StorageAlert";
import { NotificationBell } from "@/components/NotificationBell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  Stethoscope, 
  FileText, 
  MessageCircle, 
  Clock, 
  AlertCircle,
  CheckCircle,
  Bell,
  Activity,
  Pill,
  Video,
  MessageSquare
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import heroImage from "@/assets/medical-hero.jpg";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface NotificationPreferences {
  medication_reminders?: boolean;
  vital_signs?: boolean;
  scheduled_appointments?: boolean;
  scheduled_exams?: boolean;
  exam_preparation?: boolean;
  physical_activity?: boolean;
  show_examples?: boolean;
}

export const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [userName, setUserName] = useState<string>("");
  const [reminders, setReminders] = useState<any[]>([]);
  const [notificationPreferences, setNotificationPreferences] = useState<NotificationPreferences | null>(null);
  const [showExamples, setShowExamples] = useState(true);
  const [hasShownVersionToast, setHasShownVersionToast] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;
      
      // Check for new versions and show toast
      checkNewVersions();
      
      // Fetch user profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('full_name, notification_preferences')
        .eq('id', user.id)
        .maybeSingle();
      
      if (profileData?.full_name) {
        setUserName(profileData.full_name.split(' ')[0]);
      }
      
      const preferences = (profileData?.notification_preferences || {}) as NotificationPreferences;
      setNotificationPreferences(preferences);
      setShowExamples(preferences.show_examples !== false);
      
      // Generate reminders based on preferences
      const newReminders: any[] = [];
      const today = new Date().toISOString().split('T')[0];
      
      // Medication reminders
      if (preferences.medication_reminders !== false) {
        const { data: medications } = await supabase
          .from('medications')
          .select('*, medication_schedules(*)')
          .eq('user_id', user.id)
          .eq('is_active', true);
        
        if (medications && medications.length > 0) {
          medications.forEach((med: any) => {
            if (med.medication_schedules && med.medication_schedules.length > 0) {
              const now = new Date();
              const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
              
              med.medication_schedules.forEach((schedule: any) => {
                if (!schedule.taken && schedule.time >= currentTime) {
                  newReminders.push({
                    id: `med-${schedule.id}`,
                    icon: Pill,
                    message: `${med.name} - ${med.dosage} às ${schedule.time}`,
                    priority: 'high'
                  });
                }
              });
            }
          });
        }
      }
      
      // Vital signs reminder
      if (preferences.vital_signs !== false) {
        const { data: todayVitals } = await supabase
          .from('vital_signs')
          .select('id')
          .eq('user_id', user.id)
          .gte('measurement_date', today)
          .limit(1);
        
        if (!todayVitals || todayVitals.length === 0) {
          newReminders.push({
            id: 'vital-signs',
            icon: Activity,
            message: 'Você ainda não registrou seus sinais vitais hoje',
            priority: 'medium'
          });
        }
      }
      
      // Appointments reminders
      if (preferences.scheduled_appointments !== false) {
        const { data: upcomingAppointments } = await supabase
          .from('appointments')
          .select('*')
          .eq('user_id', user.id)
          .gte('appointment_date', today)
          .order('appointment_date', { ascending: true })
          .limit(3);
        
        if (upcomingAppointments && upcomingAppointments.length > 0) {
          upcomingAppointments.forEach((apt: any) => {
            const aptDate = new Date(apt.appointment_date);
            const daysUntil = Math.ceil((aptDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
            
            if (daysUntil <= 3) {
              newReminders.push({
                id: `apt-${apt.id}`,
                icon: Calendar,
                message: `Consulta ${apt.specialty} com ${apt.doctor_name} em ${daysUntil} ${daysUntil === 1 ? 'dia' : 'dias'}`,
                priority: daysUntil === 0 ? 'high' : 'medium'
              });
            }
          });
        }
      }
      
      // Exams reminders
      if (preferences.scheduled_exams !== false || preferences.exam_preparation !== false) {
        const { data: upcomingExams } = await supabase
          .from('exams')
          .select('*')
          .eq('user_id', user.id)
          .gte('exam_date', today)
          .in('status', ['scheduled', 'pending'])
          .order('exam_date', { ascending: true })
          .limit(3);
        
        if (upcomingExams && upcomingExams.length > 0) {
          upcomingExams.forEach((exam: any) => {
            const examDate = new Date(exam.exam_date);
            const daysUntil = Math.ceil((examDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
            
            if (preferences.exam_preparation !== false && exam.preparation_instructions && daysUntil <= 2) {
              newReminders.push({
                id: `exam-prep-${exam.id}`,
                icon: AlertCircle,
                message: `Preparo para ${exam.name}: ${exam.preparation_instructions}`,
                priority: 'high'
              });
            }
            
            if (preferences.scheduled_exams !== false && daysUntil <= 3) {
              newReminders.push({
                id: `exam-${exam.id}`,
                icon: Stethoscope,
                message: `Exame ${exam.name} agendado para ${new Date(exam.exam_date).toLocaleDateString('pt-BR')}`,
                priority: 'medium'
              });
            }
          });
        }
      }
      
      // Physical activity reminder
      if (preferences.physical_activity !== false) {
        const hour = new Date().getHours();
        if (hour >= 6 && hour <= 20) {
          newReminders.push({
            id: 'physical-activity',
            icon: Activity,
            message: 'Que tal fazer uma caminhada ou exercício hoje?',
            priority: 'low'
          });
        }
      }
      
      setReminders(newReminders);
    };

    fetchDashboardData();
  }, [user]);

  const checkNewVersions = async () => {
    if (!user || hasShownVersionToast) return;

    try {
      const { data: versionsData } = await supabase
        .from('app_versions')
        .select('*')
        .eq('is_published', true)
        .order('release_date', { ascending: false })
        .limit(1);

      if (!versionsData || versionsData.length === 0) return;

      const { data: viewedData } = await supabase
        .from('user_version_views')
        .select('version_id')
        .eq('user_id', user.id)
        .eq('version_id', versionsData[0].id);

      if (!viewedData || viewedData.length === 0) {
        toast({
          title: "✨ Nova atualização disponível!",
          description: `${versionsData[0].title} - Clique para ver detalhes`,
          action: (
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/changelog')}
            >
              Ver
            </Button>
          ),
        });
        setHasShownVersionToast(true);
      }
    } catch (error) {
      console.error('Error checking versions:', error);
    }
  };

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
    <Layout title="Início">
      <div className="p-4 space-y-6">
        <StorageAlert />
        
        {/* Header com saudação e notificações */}
        <div className="relative bg-primary text-primary-foreground rounded-lg p-6 overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <img src={heroImage} alt="Medical background" className="w-full h-full object-cover" />
          </div>
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-2">Olá, {userName || 'Usuário'}!</h1>
              <p className="opacity-90">Bem-vindo ao seu portal de saúde</p>
            </div>
            <NotificationBell />
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
              title="Telemedicina"
              description="Consulta online"
              icon={Video}
              onClick={() => navigate('/telemedicina')}
              variant="accent"
            />
            <QuickActionCard
              title="Medicamentos"
              description="Gerencie seus remédios"
              icon={Pill}
              onClick={() => navigate('/medicamentos')}
            />
            <QuickActionCard
              title="Sinais Vitais"
              description="Monitore sua saúde"
              icon={Activity}
              onClick={() => navigate('/sinais-vitais')}
            />
            <QuickActionCard
              title="Ver Exames"
              description="Resultados disponíveis"
              icon={Stethoscope}
              onClick={() => navigate('/exames')}
            />
            <QuickActionCard
              title="Documentos"
              description="Receitas e atestados"
              icon={FileText}
              onClick={() => navigate('/documentos')}
            />
            <QuickActionCard
              title="Assistente IA"
              description="Tire dúvidas de saúde"
              icon={MessageSquare}
              onClick={() => navigate('/health-chat')}
              variant="accent"
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

        {/* Lembretes Importantes */}
        {(reminders.length > 0 || showExamples) && (
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="h-5 w-5 text-primary" />
                <span>Lembretes Importantes</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* Exemplo fixo em vermelho */}
                {showExamples && (
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-destructive/15 border-2 border-destructive/40">
                    <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0 text-destructive" />
                    <div>
                      <p className="text-sm font-medium text-destructive">Exemplo de Lembrete</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Este é um exemplo de como seus lembretes aparecem. Configure em Perfil → Alertas e Lembretes
                      </p>
                    </div>
                  </div>
                )}
                
                {reminders.map((reminder) => {
                  const Icon = reminder.icon;
                  return (
                    <div 
                      key={reminder.id}
                      className={`flex items-start gap-3 p-3 rounded-lg ${
                        reminder.priority === 'high' 
                          ? 'bg-destructive/10 border border-destructive/20' 
                          : reminder.priority === 'medium'
                          ? 'bg-primary/10 border border-primary/20'
                          : 'bg-muted/50'
                      }`}
                    >
                      <Icon className={`h-5 w-5 mt-0.5 flex-shrink-0 ${
                        reminder.priority === 'high'
                          ? 'text-destructive'
                          : reminder.priority === 'medium'
                          ? 'text-primary'
                          : 'text-muted-foreground'
                      }`} />
                      <p className="text-sm">{reminder.message}</p>
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                Configure seus lembretes em{' '}
                <span 
                  className="text-primary cursor-pointer underline"
                  onClick={() => navigate('/perfil')}
                >
                  Perfil → Alertas e Lembretes
                </span>
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};