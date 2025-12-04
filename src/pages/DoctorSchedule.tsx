import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, Clock, User, MapPin, Video, Building, ChevronLeft, ChevronRight } from "lucide-react";
import { format, addDays, startOfWeek } from "date-fns";
import { ptBR } from "date-fns/locale";

// Dados de exemplo
const EXAMPLE_APPOINTMENTS = [
  {
    id: '1',
    patient_name: 'Maria Silva Santos',
    patient_id: 'ex-1',
    type: 'Consulta de Retorno',
    time: '08:00',
    duration: 30,
    status: 'confirmed',
    location: 'Consultório 3',
    mode: 'presencial',
    notes: 'Retorno pós-operatório'
  },
  {
    id: '2',
    patient_name: 'João Carlos Oliveira',
    patient_id: 'ex-2',
    type: 'Primeira Consulta',
    time: '08:30',
    duration: 45,
    status: 'confirmed',
    location: 'Consultório 3',
    mode: 'presencial',
    notes: 'Encaminhamento cardiologia'
  },
  {
    id: '3',
    patient_name: 'Ana Paula Costa',
    patient_id: 'ex-3',
    type: 'Teleconsulta',
    time: '09:30',
    duration: 30,
    status: 'waiting',
    location: 'Online',
    mode: 'telemedicina',
    notes: 'Acompanhamento hipertensão'
  },
  {
    id: '4',
    patient_name: 'Pedro Henrique Souza',
    patient_id: 'ex-4',
    type: 'Consulta de Retorno',
    time: '10:30',
    duration: 30,
    status: 'scheduled',
    location: 'Consultório 3',
    mode: 'presencial',
    notes: ''
  },
  {
    id: '5',
    patient_name: 'Carla Fernandes Lima',
    patient_id: 'ex-5',
    type: 'Avaliação Pré-Operatória',
    time: '11:00',
    duration: 60,
    status: 'scheduled',
    location: 'Consultório 3',
    mode: 'presencial',
    notes: 'Cirurgia agendada para 15/12'
  },
  {
    id: '6',
    patient_name: 'Roberto Almeida',
    patient_id: 'ex-6',
    type: 'Teleconsulta',
    time: '14:00',
    duration: 30,
    status: 'scheduled',
    location: 'Online',
    mode: 'telemedicina',
    notes: 'Resultado de exames'
  },
  {
    id: '7',
    patient_name: 'Fernanda Oliveira',
    patient_id: 'ex-7',
    type: 'Consulta de Rotina',
    time: '14:30',
    duration: 30,
    status: 'scheduled',
    location: 'Consultório 3',
    mode: 'presencial',
    notes: ''
  }
];

const SHIFTS = [
  { date: '2024-12-04', shift: 'Diurno', location: 'UTI Adulto', time: '07:00 - 19:00' },
  { date: '2024-12-06', shift: 'Noturno', location: 'Pronto Socorro', time: '19:00 - 07:00' },
  { date: '2024-12-09', shift: 'Diurno', location: 'Enfermaria', time: '07:00 - 19:00' },
  { date: '2024-12-11', shift: 'Diurno', location: 'UTI Adulto', time: '07:00 - 19:00' },
];

export const DoctorSchedule = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-700 border-green-200';
      case 'waiting': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'scheduled': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'completed': return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Confirmado';
      case 'waiting': return 'Aguardando';
      case 'scheduled': return 'Agendado';
      case 'completed': return 'Concluído';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  return (
    <Layout title="Agenda Médica">
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/medico-dashboard')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">Minha Agenda</h1>
            <p className="text-muted-foreground">
              {format(selectedDate, "EEEE, d 'de' MMMM", { locale: ptBR })}
            </p>
          </div>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            Dados de Exemplo
          </Badge>
        </div>

        <Tabs defaultValue="today" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="today">Hoje</TabsTrigger>
            <TabsTrigger value="week">Semana</TabsTrigger>
            <TabsTrigger value="shifts">Plantões</TabsTrigger>
          </TabsList>

          <TabsContent value="today" className="space-y-4">
            {/* Resumo do Dia */}
            <div className="grid grid-cols-3 gap-4">
              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-green-700">2</p>
                  <p className="text-sm text-green-600">Confirmados</p>
                </CardContent>
              </Card>
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-blue-700">4</p>
                  <p className="text-sm text-blue-600">Agendados</p>
                </CardContent>
              </Card>
              <Card className="bg-yellow-50 border-yellow-200">
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-yellow-700">1</p>
                  <p className="text-sm text-yellow-600">Aguardando</p>
                </CardContent>
              </Card>
            </div>

            {/* Lista de Consultas */}
            <div className="space-y-3">
              {EXAMPLE_APPOINTMENTS.map((apt) => (
                <Card key={apt.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="text-center min-w-[60px]">
                          <p className="text-lg font-bold">{apt.time}</p>
                          <p className="text-xs text-muted-foreground">{apt.duration} min</p>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold">{apt.patient_name}</h3>
                            <Badge className={getStatusColor(apt.status)}>
                              {getStatusText(apt.status)}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{apt.type}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            {apt.mode === 'telemedicina' ? (
                              <span className="flex items-center gap-1">
                                <Video className="h-3 w-3" /> Online
                              </span>
                            ) : (
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" /> {apt.location}
                              </span>
                            )}
                          </div>
                          {apt.notes && (
                            <p className="text-xs text-muted-foreground mt-1 italic">{apt.notes}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button 
                          size="sm" 
                          onClick={() => navigate(`/doctor/patient/${apt.patient_id}`)}
                        >
                          Prontuário
                        </Button>
                        {apt.mode === 'telemedicina' && apt.status !== 'completed' && (
                          <Button size="sm" variant="outline" className="bg-green-50">
                            <Video className="h-4 w-4 mr-1" />
                            Iniciar
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="week" className="space-y-4">
            {/* Navegação da Semana */}
            <div className="flex items-center justify-between">
              <Button variant="outline" size="sm" onClick={() => setWeekStart(addDays(weekStart, -7))}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="font-medium">
                {format(weekStart, "d MMM", { locale: ptBR })} - {format(addDays(weekStart, 6), "d MMM yyyy", { locale: ptBR })}
              </span>
              <Button variant="outline" size="sm" onClick={() => setWeekStart(addDays(weekStart, 7))}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Grid da Semana */}
            <div className="grid grid-cols-7 gap-2">
              {weekDays.map((day) => (
                <Card 
                  key={day.toISOString()} 
                  className={`cursor-pointer transition-colors ${
                    format(day, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd') 
                      ? 'ring-2 ring-primary' 
                      : ''
                  }`}
                  onClick={() => setSelectedDate(day)}
                >
                  <CardContent className="p-2 text-center">
                    <p className="text-xs text-muted-foreground">
                      {format(day, 'EEE', { locale: ptBR })}
                    </p>
                    <p className="text-lg font-bold">{format(day, 'd')}</p>
                    <div className="mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {Math.floor(Math.random() * 5) + 3}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {format(selectedDate, "EEEE, d 'de' MMMM", { locale: ptBR })}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {EXAMPLE_APPOINTMENTS.slice(0, 4).map((apt) => (
                    <div key={apt.id} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm">{apt.time}</span>
                        <span className="text-sm">{apt.patient_name}</span>
                      </div>
                      <Badge className={getStatusColor(apt.status)} variant="outline">
                        {getStatusText(apt.status)}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="shifts" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Meus Plantões</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {SHIFTS.map((shift, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="text-center min-w-[80px]">
                        <p className="font-bold">{shift.date.split('-').reverse().slice(0, 2).join('/')}</p>
                        <p className="text-xs text-muted-foreground">{shift.time}</p>
                      </div>
                      <div>
                        <p className="font-medium">{shift.shift}</p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Building className="h-3 w-3" />
                          {shift.location}
                        </p>
                      </div>
                    </div>
                    <Badge variant={shift.shift === 'Noturno' ? 'secondary' : 'outline'}>
                      {shift.shift}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default DoctorSchedule;
