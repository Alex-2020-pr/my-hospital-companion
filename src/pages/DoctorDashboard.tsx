import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DoctorMenu } from "@/components/DoctorMenu";
import { 
  Video, 
  FileText, 
  Pill, 
  MessageSquare, 
  AlertCircle, 
  Clock,
  MapPin,
  TrendingUp
} from "lucide-react";

// DADOS DE EXEMPLO (não conectados ao banco)
const DOCTOR_DATA = {
  name: "Dr. Carlos Silva",
  specialty: "Cardiologia",
  avatar: null,
  onDuty: true
};

const AGENDA_EXEMPLO = [
  { id: 1, time: "09:00", patient: "Maria Santos", type: "Consulta", room: "201" },
  { id: 2, time: "10:30", patient: "João Oliveira", type: "Retorno", room: "201" },
  { id: 3, time: "14:00", patient: "Ana Costa", type: "Primeira consulta", room: "203" }
];

const PACIENTES_DIA = [
  { id: 1, name: "Pedro Almeida", age: 65, bed: "Leito 12A", priority: "high", status: "Estável" },
  { id: 2, name: "Lucia Ferreira", age: 52, bed: "Leito 08B", priority: "medium", status: "Observação" },
  { id: 3, name: "Roberto Lima", age: 71, bed: "Leito 15C", priority: "high", status: "Crítico" },
  { id: 4, name: "Carla Mendes", age: 45, bed: "Leito 03A", priority: "low", status: "Recuperação" }
];

const ALERTAS_CLINICOS = [
  { 
    id: 1, 
    type: "result", 
    patient: "Pedro Almeida", 
    message: "Novo resultado de exame disponível - Troponina elevada",
    time: "há 15min"
  },
  { 
    id: 2, 
    type: "vital", 
    patient: "Roberto Lima", 
    message: "Sinais vitais alterados - PA: 160/95 mmHg",
    time: "há 8min"
  }
];

export default function DoctorDashboard() {
  const [onDuty, setOnDuty] = useState(DOCTOR_DATA.onDuty);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "text-destructive";
      case "medium": return "text-yellow-600";
      default: return "text-muted-foreground";
    }
  };

  return (
    <Layout title="Dashboard Médico">
      <div className="min-h-screen bg-background pb-24">
        {/* Topbar com informações do médico */}
        <div className="bg-primary text-primary-foreground p-4 mb-4">
          <div className="flex items-center justify-between gap-3">
            <DoctorMenu 
              onDutyMode={onDuty} 
              onToggleDutyMode={setOnDuty}
            />
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <Avatar className="h-12 w-12 border-2 border-primary-foreground">
                <AvatarImage src={DOCTOR_DATA.avatar || undefined} />
                <AvatarFallback className="bg-primary-foreground text-primary text-lg font-semibold">
                  {DOCTOR_DATA.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h2 className="font-semibold text-base truncate">{DOCTOR_DATA.name}</h2>
                <p className="text-sm opacity-90 truncate">{DOCTOR_DATA.specialty}</p>
              </div>
            </div>
            <Badge 
              variant={onDuty ? "secondary" : "outline"}
              className={onDuty ? "bg-green-500 text-white border-0" : ""}
            >
              {onDuty ? "Em plantão" : "Off"}
            </Badge>
          </div>
        </div>

        <div className="px-4 space-y-4">
          {/* Agenda do Dia */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Agenda do Dia
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {AGENDA_EXEMPLO.map((item) => (
                <div 
                  key={item.id}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-center">
                      <p className="font-semibold text-primary">{item.time}</p>
                    </div>
                    <div className="border-l-2 border-primary pl-3">
                      <p className="font-medium text-sm">{item.patient}</p>
                      <p className="text-xs text-muted-foreground">{item.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    {item.room}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Pacientes do Dia */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Pacientes do Dia</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {PACIENTES_DIA.map((patient) => (
                <div 
                  key={patient.id}
                  className="flex items-center justify-between p-3 bg-card border border-border rounded-lg hover:bg-accent/5 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <AlertCircle className={`h-5 w-5 ${getPriorityColor(patient.priority)}`} />
                    <div>
                      <p className="font-medium text-sm">{patient.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {patient.age} anos • {patient.bed}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {patient.status}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Alertas Clínicos */}
          <Card className="border-destructive/20 bg-destructive/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2 text-destructive">
                <AlertCircle className="h-5 w-5" />
                Alertas Clínicos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {ALERTAS_CLINICOS.map((alert) => (
                <div 
                  key={alert.id}
                  className="p-3 bg-background rounded-lg border border-destructive/20"
                >
                  <div className="flex items-start justify-between mb-1">
                    <p className="font-medium text-sm">{alert.patient}</p>
                    <span className="text-xs text-muted-foreground">{alert.time}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{alert.message}</p>
                  <div className="mt-2 flex items-center gap-1 text-xs text-primary">
                    <TrendingUp className="h-3 w-3" />
                    Ver detalhes
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  variant="outline" 
                  className="h-20 flex-col gap-2 hover:bg-primary/5 hover:border-primary"
                >
                  <Video className="h-6 w-6" />
                  <span className="text-xs">Teleconsulta</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-20 flex-col gap-2 hover:bg-primary/5 hover:border-primary"
                >
                  <Pill className="h-6 w-6" />
                  <span className="text-xs">Prescrever</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-20 flex-col gap-2 hover:bg-primary/5 hover:border-primary"
                >
                  <FileText className="h-6 w-6" />
                  <span className="text-xs">Novo Laudo</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-20 flex-col gap-2 hover:bg-primary/5 hover:border-primary"
                >
                  <MessageSquare className="h-6 w-6" />
                  <span className="text-xs">Chat Equipe</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
