import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, MapPin, Plus, User } from "lucide-react";

export const Appointments = () => {
  const scheduledAppointments = [
    {
      id: 1,
      type: "Consulta Cardiologia",
      doctor: "Dr. João Silva",
      date: "15/01/2024",
      time: "14:30",
      location: "Consultório 205",
      status: "confirmado",
      canCancel: true
    },
    {
      id: 2,
      type: "Exame de Sangue",
      location: "Laboratório Central",
      date: "18/01/2024",
      time: "08:00",
      instructions: "Jejum de 12 horas",
      status: "agendado",
      canCancel: true
    }
  ];

  const appointmentHistory = [
    {
      id: 3,
      type: "Consulta Clínico Geral",
      doctor: "Dra. Ana Costa",
      date: "05/01/2024",
      time: "10:00",
      status: "realizada"
    },
    {
      id: 4,
      type: "Consulta Dermatologia",
      doctor: "Dr. Carlos Mendes",
      date: "28/12/2023",
      time: "16:30",
      status: "realizada"
    }
  ];

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
            {scheduledAppointments.map((appointment) => (
              <Card key={appointment.id} className="w-full">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-base">{appointment.type}</CardTitle>
                      {appointment.doctor && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <User className="h-4 w-4 mr-1" />
                          {appointment.doctor}
                        </div>
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
                    {appointment.date}
                    <Clock className="h-4 w-4 ml-4 mr-2" />
                    {appointment.time}
                  </div>
                  
                  {appointment.location && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 mr-2" />
                      {appointment.location}
                    </div>
                  )}

                  {appointment.instructions && (
                    <div className="bg-accent/10 p-3 rounded-lg">
                      <p className="text-sm font-medium text-accent-foreground">
                        Instruções:
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {appointment.instructions}
                      </p>
                    </div>
                  )}

                  {appointment.canCancel && (
                    <div className="flex space-x-2 pt-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        Reagendar
                      </Button>
                      <Button variant="destructive" size="sm" className="flex-1">
                        Cancelar
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            {appointmentHistory.map((appointment) => (
              <Card key={appointment.id} className="w-full">
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="space-y-1">
                      <h3 className="font-medium text-sm">{appointment.type}</h3>
                      {appointment.doctor && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <User className="h-4 w-4 mr-1" />
                          {appointment.doctor}
                        </div>
                      )}
                    </div>
                    <Badge variant={getStatusColor(appointment.status)}>
                      {getStatusText(appointment.status)}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-2" />
                    {appointment.date}
                    <Clock className="h-4 w-4 ml-4 mr-2" />
                    {appointment.time}
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
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};