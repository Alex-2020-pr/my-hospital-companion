import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Video, VideoOff, Mic, MicOff, Phone, Monitor, MessageSquare, FileText, User, Clock, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const WAITING_PATIENTS = [
  { id: '1', name: 'Ana Paula Costa', waitTime: '5 min', type: 'Acompanhamento', photo: null },
  { id: '2', name: 'Roberto Almeida', waitTime: '12 min', type: 'Resultado de Exames', photo: null },
  { id: '3', name: 'Fernanda Oliveira', waitTime: '3 min', type: 'Primeira Consulta', photo: null },
];

const SCHEDULED_TELECONSULTS = [
  { id: '1', patient: 'Carlos Santos', time: '14:00', date: 'Hoje', type: 'Retorno' },
  { id: '2', patient: 'Mariana Lima', time: '14:30', date: 'Hoje', type: 'Primeira consulta' },
  { id: '3', patient: 'Paulo Ferreira', time: '15:00', date: 'Hoje', type: 'Resultado exames' },
  { id: '4', patient: 'Juliana Costa', time: '09:00', date: 'Amanhã', type: 'Acompanhamento' },
];

const HISTORY = [
  { id: '1', patient: 'Maria Silva', date: '03/12/2024', duration: '25 min', notes: 'Ajuste de medicação' },
  { id: '2', patient: 'João Pereira', date: '02/12/2024', duration: '18 min', notes: 'Avaliação resultados' },
  { id: '3', patient: 'Sandra Oliveira', date: '02/12/2024', duration: '30 min', notes: 'Primeira consulta' },
];

export const DoctorTelemedicine = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [inCall, setInCall] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [currentPatient, setCurrentPatient] = useState<typeof WAITING_PATIENTS[0] | null>(null);

  const startCall = (patient: typeof WAITING_PATIENTS[0]) => {
    setCurrentPatient(patient);
    setInCall(true);
    toast({
      title: "Chamada iniciada",
      description: `Conectando com ${patient.name}...`
    });
  };

  const endCall = () => {
    setInCall(false);
    setCurrentPatient(null);
    toast({
      title: "Chamada encerrada",
      description: "A teleconsulta foi finalizada"
    });
  };

  if (inCall && currentPatient) {
    return (
      <Layout title="Teleconsulta">
        <div className="h-[calc(100vh-120px)] flex flex-col">
          {/* Video Area */}
          <div className="flex-1 bg-gray-900 relative">
            {/* Main Video (Patient) */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white">
                <User className="h-32 w-32 mx-auto mb-4 opacity-50" />
                <p className="text-xl">{currentPatient.name}</p>
                <p className="text-sm opacity-70">Aguardando conexão de vídeo...</p>
              </div>
            </div>
            
            {/* Self Video (small) */}
            <div className="absolute bottom-4 right-4 w-32 h-24 bg-gray-800 rounded-lg border-2 border-white/20 flex items-center justify-center">
              {videoEnabled ? (
                <User className="h-8 w-8 text-white/50" />
              ) : (
                <VideoOff className="h-8 w-8 text-red-500" />
              )}
            </div>

            {/* Patient Info Bar */}
            <div className="absolute top-4 left-4 bg-black/50 rounded-lg p-3 text-white">
              <p className="font-semibold">{currentPatient.name}</p>
              <p className="text-sm opacity-70">{currentPatient.type}</p>
              <div className="flex items-center gap-1 mt-1 text-xs">
                <Clock className="h-3 w-3" />
                <span>00:00:00</span>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="bg-gray-800 p-4">
            <div className="flex items-center justify-center gap-4">
              <Button
                variant={audioEnabled ? "secondary" : "destructive"}
                size="lg"
                className="rounded-full h-14 w-14"
                onClick={() => setAudioEnabled(!audioEnabled)}
              >
                {audioEnabled ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
              </Button>
              
              <Button
                variant={videoEnabled ? "secondary" : "destructive"}
                size="lg"
                className="rounded-full h-14 w-14"
                onClick={() => setVideoEnabled(!videoEnabled)}
              >
                {videoEnabled ? <Video className="h-6 w-6" /> : <VideoOff className="h-6 w-6" />}
              </Button>

              <Button
                variant="secondary"
                size="lg"
                className="rounded-full h-14 w-14"
              >
                <Monitor className="h-6 w-6" />
              </Button>

              <Button
                variant="secondary"
                size="lg"
                className="rounded-full h-14 w-14"
              >
                <MessageSquare className="h-6 w-6" />
              </Button>

              <Button
                variant="secondary"
                size="lg"
                className="rounded-full h-14 w-14"
                onClick={() => navigate(`/doctor/patient/${currentPatient.id}`)}
              >
                <FileText className="h-6 w-6" />
              </Button>

              <Button
                variant="destructive"
                size="lg"
                className="rounded-full h-14 w-14"
                onClick={endCall}
              >
                <Phone className="h-6 w-6 rotate-[135deg]" />
              </Button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Teleconsulta">
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/medico-dashboard')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">Teleconsulta</h1>
            <p className="text-muted-foreground">Atendimento remoto</p>
          </div>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            Exemplo
          </Badge>
        </div>

        <Tabs defaultValue="waiting" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="waiting">
              Sala de Espera
              <Badge variant="destructive" className="ml-2">{WAITING_PATIENTS.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="scheduled">Agendadas</TabsTrigger>
            <TabsTrigger value="history">Histórico</TabsTrigger>
          </TabsList>

          <TabsContent value="waiting" className="space-y-4">
            {WAITING_PATIENTS.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  <Video className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Nenhum paciente aguardando</p>
                </CardContent>
              </Card>
            ) : (
              WAITING_PATIENTS.map((patient) => (
                <Card key={patient.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                          <User className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold">{patient.name}</p>
                          <p className="text-sm text-muted-foreground">{patient.type}</p>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            Aguardando há {patient.waitTime}
                          </div>
                        </div>
                      </div>
                      <Button onClick={() => startCall(patient)} className="bg-green-600 hover:bg-green-700">
                        <Video className="h-4 w-4 mr-2" />
                        Atender
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="scheduled" className="space-y-4">
            {SCHEDULED_TELECONSULTS.map((consult) => (
              <Card key={consult.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-center min-w-[60px]">
                        <p className="text-lg font-bold">{consult.time}</p>
                        <p className="text-xs text-muted-foreground">{consult.date}</p>
                      </div>
                      <div>
                        <p className="font-semibold">{consult.patient}</p>
                        <p className="text-sm text-muted-foreground">{consult.type}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                      {consult.date === 'Hoje' && (
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                          <Video className="h-4 w-4 mr-1" />
                          Iniciar
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            {HISTORY.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{item.patient}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {item.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {item.duration}
                        </span>
                      </div>
                      <p className="text-sm mt-1">{item.notes}</p>
                    </div>
                    <Button variant="outline" size="sm">
                      <FileText className="h-4 w-4 mr-1" />
                      Ver
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

export default DoctorTelemedicine;
