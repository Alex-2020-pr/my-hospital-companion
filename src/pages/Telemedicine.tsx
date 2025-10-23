import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Video, Calendar, Clock, User, Plus, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface TelemedicineAppointment {
  id: string;
  doctor_name: string;
  specialty: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  meeting_url: string | null;
  instructions: string | null;
}

export const Telemedicine = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<TelemedicineAppointment[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    doctor_name: "",
    specialty: "",
    appointment_date: format(new Date(), "yyyy-MM-dd"),
    appointment_time: "14:00"
  });

  useEffect(() => {
    if (user) {
      fetchAppointments();
    }
  }, [user]);

  const fetchAppointments = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('telemedicine_appointments' as any)
      .select('*')
      .eq('user_id', user.id)
      .order('appointment_date', { ascending: true })
      .order('appointment_time', { ascending: true });

    if (error) {
      toast.error("Erro ao carregar consultas");
      return;
    }

    setAppointments((data as any) || []);
  };

  const handleScheduleAppointment = async () => {
    if (!user || !formData.doctor_name || !formData.specialty) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    setLoading(true);

    const { error } = await supabase
      .from('telemedicine_appointments' as any)
      .insert({
        user_id: user.id,
        doctor_name: formData.doctor_name,
        specialty: formData.specialty,
        appointment_date: formData.appointment_date,
        appointment_time: formData.appointment_time,
        status: 'scheduled'
      });

    setLoading(false);

    if (error) {
      toast.error("Erro ao agendar consulta");
      return;
    }

    toast.success("Consulta agendada com sucesso!");
    setIsDialogOpen(false);
    setFormData({
      doctor_name: "",
      specialty: "",
      appointment_date: format(new Date(), "yyyy-MM-dd"),
      appointment_time: "14:00"
    });
    fetchAppointments();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-500';
      case 'confirmed':
        return 'bg-green-500';
      case 'completed':
        return 'bg-gray-500';
      case 'cancelled':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'Agendada';
      case 'confirmed':
        return 'Confirmada';
      case 'completed':
        return 'Realizada';
      case 'cancelled':
        return 'Cancelada';
      default:
        return status;
    }
  };

  const nextAppointment = appointments.find(
    apt => apt.status === 'confirmed' || apt.status === 'scheduled'
  );

  const upcomingAppointments = appointments.filter(
    apt => apt.status === 'confirmed' || apt.status === 'scheduled'
  );

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Telemedicina</h1>
            <p className="text-muted-foreground">Consultas médicas online seguras e convenientes</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Agendar Consulta
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Nova Consulta Online</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="doctor_name">Nome do Médico *</Label>
                  <Input
                    id="doctor_name"
                    value={formData.doctor_name}
                    onChange={(e) => setFormData({ ...formData, doctor_name: e.target.value })}
                    placeholder="Ex: Dra. Maria Santos"
                  />
                </div>
                <div>
                  <Label htmlFor="specialty">Especialidade *</Label>
                  <Input
                    id="specialty"
                    value={formData.specialty}
                    onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                    placeholder="Ex: Cardiologia"
                  />
                </div>
                <div>
                  <Label htmlFor="appointment_date">Data *</Label>
                  <Input
                    id="appointment_date"
                    type="date"
                    value={formData.appointment_date}
                    onChange={(e) => setFormData({ ...formData, appointment_date: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="appointment_time">Horário *</Label>
                  <Input
                    id="appointment_time"
                    type="time"
                    value={formData.appointment_time}
                    onChange={(e) => setFormData({ ...formData, appointment_time: e.target.value })}
                  />
                </div>
                <Button onClick={handleScheduleAppointment} disabled={loading} className="w-full">
                  {loading ? "Agendando..." : "Agendar Consulta"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {nextAppointment && (
          <Card className="border-primary/50 bg-primary/5">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4">Próxima Consulta Online</h2>
              <div className="flex items-start gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                    {nextAppointment.doctor_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <div>
                    <h3 className="font-semibold text-lg">{nextAppointment.doctor_name}</h3>
                    <p className="text-sm text-muted-foreground">{nextAppointment.specialty}</p>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>Hoje</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{nextAppointment.appointment_time}</span>
                    </div>
                  </div>
                  <Badge className={getStatusColor(nextAppointment.status)}>
                    {getStatusLabel(nextAppointment.status)}
                  </Badge>
                </div>
                <Button className="gap-2">
                  <Video className="h-4 w-4" />
                  Entrar na Consulta
                </Button>
              </div>
              {nextAppointment.instructions && (
                <div className="mt-4 p-4 bg-background rounded-lg">
                  <h4 className="font-medium mb-2">Instruções para a Consulta</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Verifique sua conexão de internet antes da consulta</li>
                    <li>• Teste sua câmera e microfone</li>
                    <li>• Esteja em um ambiente silencioso e bem iluminado</li>
                    <li>• Tenha em mãos seus exames e receitas anteriores</li>
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <h2 className="text-xl font-semibold mb-4">Consultas Agendadas</h2>
            <div className="space-y-4">
              {upcomingAppointments.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center text-muted-foreground">
                    Nenhuma consulta agendada
                  </CardContent>
                </Card>
              ) : (
                upcomingAppointments.map((appointment) => (
                  <Card key={appointment.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-muted">
                            {appointment.doctor_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-semibold">{appointment.doctor_name}</h3>
                              <p className="text-sm text-muted-foreground">{appointment.specialty}</p>
                            </div>
                            <Badge variant="outline" className={getStatusColor(appointment.status)}>
                              {getStatusLabel(appointment.status)}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              <span>
                                {format(new Date(appointment.appointment_date), "dd 'de' MMMM", { locale: ptBR })}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              <span>{appointment.appointment_time}</span>
                            </div>
                          </div>
                          {appointment.status === 'confirmed' && (
                            <Button variant="outline" size="sm" className="mt-2">
                              Reagendar
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Como Funciona</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
                    1
                  </div>
                  <div>
                    <p className="font-medium">Agende sua consulta</p>
                    <p className="text-sm text-muted-foreground">Escolha o médico, data e horário</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
                    2
                  </div>
                  <div>
                    <p className="font-medium">Receba a confirmação</p>
                    <p className="text-sm text-muted-foreground">Você receberá um link para a consulta</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
                    3
                  </div>
                  <div>
                    <p className="font-medium">Entre na consulta</p>
                    <p className="text-sm text-muted-foreground">Clique no link no horário agendado</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Suporte Técnico</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Está com problemas técnicos? Nossa equipe está pronta para ajudar.
                </p>
                <Button variant="outline" className="w-full gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Falar com Suporte
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};
