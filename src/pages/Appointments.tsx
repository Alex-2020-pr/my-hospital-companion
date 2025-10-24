import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, MapPin, Plus, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Appointment {
  id: string;
  type: string;
  doctor_name: string;
  specialty: string | null;
  appointment_date: string;
  appointment_time: string;
  location: string | null;
  status: string;
  notes: string | null;
}

export const Appointments = () => {
  const { user } = useAuth();
  const [scheduledAppointments, setScheduledAppointments] = useState<Appointment[]>([]);
  const [appointmentHistory, setAppointmentHistory] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchAppointments();
    }
  }, [user]);

  const fetchAppointments = async () => {
    if (!user) return;

    setLoading(true);

    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('user_id', user.id)
      .order('appointment_date', { ascending: true })
      .order('appointment_time', { ascending: true });

    if (error) {
      toast.error("Erro ao carregar consultas");
      setLoading(false);
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const scheduled = (data || []).filter(apt => {
      const aptDate = new Date(apt.appointment_date);
      return aptDate >= today && (apt.status === 'scheduled' || apt.status === 'confirmed');
    });

    const history = (data || []).filter(apt => {
      const aptDate = new Date(apt.appointment_date);
      return aptDate < today || apt.status === 'completed' || apt.status === 'cancelled';
    });

    setScheduledAppointments(scheduled as Appointment[]);
    setAppointmentHistory(history as Appointment[]);
    setLoading(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmado':
        return 'default';
      case 'agendado':
        return 'secondary';
      case 'realizada':
        return 'outline';
      case 'cancelada':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmado':
        return 'Confirmado';
      case 'agendado':
        return 'Agendado';
      case 'realizada':
        return 'Realizada';
      case 'cancelada':
        return 'Cancelada';
      default:
        return status;
    }
  };

  return (
    <Layout title="Consultas">
      <div className="p-4 space-y-4">
        {/* Botão Agendar Nova Consulta */}
        <Button className="w-full" size="lg">
          <Plus className="h-4 w-4 mr-2" />
          Agendar Nova Consulta
        </Button>

        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upcoming">Próximas</TabsTrigger>
            <TabsTrigger value="history">Histórico</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-4">
            {loading ? (
              <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                  Carregando consultas...
                </CardContent>
              </Card>
            ) : scheduledAppointments.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                  Nenhuma consulta agendada
                </CardContent>
              </Card>
            ) : (
              scheduledAppointments.map((appointment) => (
                <Card key={appointment.id} className="w-full">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-base">{appointment.type}</CardTitle>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <User className="h-4 w-4 mr-1" />
                          {appointment.doctor_name}
                        </div>
                        {appointment.specialty && (
                          <p className="text-sm text-muted-foreground">{appointment.specialty}</p>
                        )}
                      </div>
                      <Badge variant={getStatusColor(appointment.status)}>
                        {getStatusText(appointment.status)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-2" />
                      {format(parseISO(appointment.appointment_date), "dd/MM/yyyy")}
                      <Clock className="h-4 w-4 ml-4 mr-2" />
                      {appointment.appointment_time.slice(0, 5)}
                    </div>
                    
                    {appointment.location && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4 mr-2" />
                        {appointment.location}
                      </div>
                    )}

                    {appointment.notes && (
                      <div className="bg-accent/10 p-3 rounded-lg">
                        <p className="text-sm font-medium text-accent-foreground">
                          Observações:
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {appointment.notes}
                        </p>
                      </div>
                    )}

                    <div className="flex space-x-2 pt-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        Reagendar
                      </Button>
                      <Button variant="destructive" size="sm" className="flex-1">
                        Cancelar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            {loading ? (
              <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                  Carregando histórico...
                </CardContent>
              </Card>
            ) : appointmentHistory.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                  Nenhuma consulta no histórico
                </CardContent>
              </Card>
            ) : (
              appointmentHistory.map((appointment) => (
                <Card key={appointment.id} className="w-full">
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="space-y-1">
                        <h3 className="font-medium text-sm">{appointment.type}</h3>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <User className="h-4 w-4 mr-1" />
                          {appointment.doctor_name}
                        </div>
                        {appointment.specialty && (
                          <p className="text-sm text-muted-foreground">{appointment.specialty}</p>
                        )}
                      </div>
                      <Badge variant={getStatusColor(appointment.status)}>
                        {getStatusText(appointment.status)}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-2" />
                      {format(parseISO(appointment.appointment_date), "dd/MM/yyyy")}
                      <Clock className="h-4 w-4 ml-4 mr-2" />
                      {appointment.appointment_time.slice(0, 5)}
                    </div>

                    <div className="flex space-x-2 pt-3">
                      <Button variant="outline" size="sm" className="flex-1">
                        Ver Detalhes
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        Reagendar Similar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};