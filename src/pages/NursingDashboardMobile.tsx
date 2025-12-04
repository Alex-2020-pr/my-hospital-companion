import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Activity, Heart, FileText, Clock, AlertCircle, ChevronRight, Users, Clipboard, Home,
  Pill, Thermometer, Droplets, Bell, CheckCircle2, XCircle, ArrowRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { NursingAlertBadge } from "@/components/NursingAlertBadge";
import { NursingAlertCard } from "@/components/NursingAlertCard";
import { useNursingAlerts } from "@/hooks/useNursingAlerts";
import { NursingMenu } from "@/components/NursingMenu";

// DADOS DE EXEMPLO - Pacientes do setor
const EXAMPLE_PATIENTS = [
  {
    id: "p1",
    name: "Maria Silva Santos",
    bed: "12A",
    age: 65,
    diagnosis: "ICC Descompensada",
    lastVitals: { bp: "140/90", hr: 78, temp: 36.8, spo2: 95 },
    lastVitalsTime: "08:30",
    status: "attention",
    pendingMeds: 2,
    alerts: ["PA elevada", "Edema +2/4"]
  },
  {
    id: "p2",
    name: "João Oliveira Lima",
    bed: "12B",
    age: 72,
    diagnosis: "DPOC Exacerbado",
    lastVitals: { bp: "130/85", hr: 88, temp: 37.2, spo2: 91 },
    lastVitalsTime: "08:15",
    status: "critical",
    pendingMeds: 3,
    alerts: ["SpO2 baixa", "Febre", "Dispneia"]
  },
  {
    id: "p3",
    name: "Ana Costa Ferreira",
    bed: "14A",
    age: 58,
    diagnosis: "DM2 + HAS",
    lastVitals: { bp: "125/80", hr: 72, temp: 36.5, spo2: 98 },
    lastVitalsTime: "08:45",
    status: "stable",
    pendingMeds: 1,
    alerts: []
  },
  {
    id: "p4",
    name: "Roberto Lima Souza",
    bed: "14B",
    age: 45,
    diagnosis: "Pós-op Colecistectomia",
    lastVitals: { bp: "118/76", hr: 68, temp: 36.6, spo2: 99 },
    lastVitalsTime: "08:00",
    status: "stable",
    pendingMeds: 0,
    alerts: []
  },
  {
    id: "p5",
    name: "Lucia Ferreira Gomes",
    bed: "16A",
    age: 82,
    diagnosis: "Pneumonia Comunitária",
    lastVitals: { bp: "100/60", hr: 92, temp: 38.1, spo2: 93 },
    lastVitalsTime: "07:45",
    status: "critical",
    pendingMeds: 4,
    alerts: ["Hipotensão", "Febre alta", "Taquicardia"]
  }
];

// DADOS DE EXEMPLO - Medicações Pendentes
const EXAMPLE_PENDING_MEDS = [
  { id: "m1", patient: "Maria Silva", bed: "12A", medication: "Furosemida 40mg EV", time: "10:00", status: "pending" },
  { id: "m2", patient: "João Oliveira", bed: "12B", medication: "Salbutamol NBZ", time: "10:00", status: "pending" },
  { id: "m3", patient: "João Oliveira", bed: "12B", medication: "Dipirona 1g EV", time: "10:00", status: "pending" },
  { id: "m4", patient: "Lucia Ferreira", bed: "16A", medication: "Ceftriaxona 1g EV", time: "10:00", status: "pending" },
  { id: "m5", patient: "Lucia Ferreira", bed: "16A", medication: "Dipirona 1g EV", time: "09:00", status: "late" },
  { id: "m6", patient: "Ana Costa", bed: "14A", medication: "Metformina 850mg VO", time: "08:00", status: "done" }
];

// DADOS DE EXEMPLO - Procedimentos do Dia
const EXAMPLE_PROCEDURES = [
  { id: "pr1", patient: "Maria Silva", bed: "12A", procedure: "Curativo MID", time: "11:00", done: false },
  { id: "pr2", patient: "João Oliveira", bed: "12B", procedure: "Aspiração traqueal", time: "09:00", done: true },
  { id: "pr3", patient: "Roberto Lima", bed: "14B", procedure: "Retirada de dreno", time: "14:00", done: false },
  { id: "pr4", patient: "Lucia Ferreira", bed: "16A", procedure: "Coleta de hemocultura", time: "08:00", done: true }
];

// DADOS DE EXEMPLO - Evoluções Pendentes
const EXAMPLE_PENDING_EVOLUTIONS = [
  { id: "e1", patient: "Maria Silva", bed: "12A", lastEvolution: "Ontem 20:00" },
  { id: "e2", patient: "João Oliveira", bed: "12B", lastEvolution: "Ontem 20:00" },
  { id: "e3", patient: "Lucia Ferreira", bed: "16A", lastEvolution: "Ontem 14:00" }
];

const NursingDashboardMobile = () => {
  const navigate = useNavigate();
  const { activeAlerts, resolveAlert } = useNursingAlerts();
  const [selectedTab, setSelectedTab] = useState<'patients' | 'meds' | 'procedures'>('patients');

  const getStatusColor = (status: string) => {
    switch (status) {
      case "critical": return "text-destructive bg-destructive/10 border-destructive/30";
      case "attention": return "text-orange-600 bg-orange-50 border-orange-200";
      default: return "text-green-600 bg-green-50 border-green-200";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "critical": return "Crítico";
      case "attention": return "Atenção";
      default: return "Estável";
    }
  };

  const pendingMedsCount = EXAMPLE_PENDING_MEDS.filter(m => m.status !== 'done').length;
  const lateMedsCount = EXAMPLE_PENDING_MEDS.filter(m => m.status === 'late').length;
  const pendingProcedures = EXAMPLE_PROCEDURES.filter(p => !p.done).length;
  const criticalPatients = EXAMPLE_PATIENTS.filter(p => p.status === 'critical').length;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-4 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold">Enfermagem</h1>
            <p className="text-sm opacity-90">Plantão Diurno • Enf. Paula Santos</p>
          </div>
          <div className="flex items-center gap-2">
            <NursingAlertBadge 
              alerts={activeAlerts} 
              onResolve={resolveAlert}
              onView={(id) => navigate('/nursing/history-mobile')}
            />
            <NursingMenu />
          </div>
        </div>

        {/* Exemplo Badge */}
        <div className="bg-yellow-500/20 border border-yellow-400/30 rounded-lg p-2 text-center">
          <p className="text-xs text-yellow-100">
            📋 Exibindo dados de exemplo para demonstração
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="p-4 grid grid-cols-4 gap-2">
        <Card className={`${criticalPatients > 0 ? 'border-destructive/50 bg-destructive/5' : ''}`}>
          <CardContent className="p-3 text-center">
            <Users className={`h-5 w-5 mx-auto mb-1 ${criticalPatients > 0 ? 'text-destructive' : 'text-primary'}`} />
            <div className={`text-xl font-bold ${criticalPatients > 0 ? 'text-destructive' : 'text-primary'}`}>
              {EXAMPLE_PATIENTS.length}
            </div>
            <div className="text-[10px] text-muted-foreground">Pacientes</div>
          </CardContent>
        </Card>
        <Card className={lateMedsCount > 0 ? 'border-orange-400/50 bg-orange-50' : ''}>
          <CardContent className="p-3 text-center">
            <Pill className={`h-5 w-5 mx-auto mb-1 ${lateMedsCount > 0 ? 'text-orange-500' : 'text-blue-500'}`} />
            <div className={`text-xl font-bold ${lateMedsCount > 0 ? 'text-orange-500' : 'text-blue-500'}`}>
              {pendingMedsCount}
            </div>
            <div className="text-[10px] text-muted-foreground">Medicações</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <Clipboard className="h-5 w-5 text-green-600 mx-auto mb-1" />
            <div className="text-xl font-bold text-green-600">{pendingProcedures}</div>
            <div className="text-[10px] text-muted-foreground">Proced.</div>
          </CardContent>
        </Card>
        <Card className={activeAlerts.length > 0 ? 'border-destructive/50 bg-destructive/5' : ''}>
          <CardContent className="p-3 text-center">
            <AlertCircle className={`h-5 w-5 mx-auto mb-1 ${activeAlerts.length > 0 ? 'text-destructive' : 'text-muted-foreground'}`} />
            <div className={`text-xl font-bold ${activeAlerts.length > 0 ? 'text-destructive' : 'text-muted-foreground'}`}>
              {activeAlerts.length}
            </div>
            <div className="text-[10px] text-muted-foreground">Alertas</div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="px-4 mb-4">
        <div className="grid grid-cols-2 gap-3">
          <Button 
            onClick={() => navigate("/nursing/vital-signs-mobile")}
            className="h-16 flex flex-col items-center justify-center gap-1 bg-primary hover:bg-primary/90"
            size="lg"
          >
            <Activity className="h-6 w-6" />
            <span className="text-xs">Registrar Sinais Vitais</span>
          </Button>
          <Button 
            onClick={() => navigate("/nursing/evolution-mobile")}
            className="h-16 flex flex-col items-center justify-center gap-1 bg-primary hover:bg-primary/90"
            size="lg"
          >
            <FileText className="h-6 w-6" />
            <span className="text-xs">Nova Evolução</span>
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="px-4 mb-4">
        <div className="flex gap-2 bg-muted/50 p-1 rounded-lg">
          <Button 
            variant={selectedTab === 'patients' ? 'default' : 'ghost'}
            size="sm"
            className="flex-1 text-xs"
            onClick={() => setSelectedTab('patients')}
          >
            Pacientes
          </Button>
          <Button 
            variant={selectedTab === 'meds' ? 'default' : 'ghost'}
            size="sm"
            className="flex-1 text-xs relative"
            onClick={() => setSelectedTab('meds')}
          >
            Medicações
            {lateMedsCount > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-orange-500 rounded-full text-[10px] flex items-center justify-center text-white">
                {lateMedsCount}
              </span>
            )}
          </Button>
          <Button 
            variant={selectedTab === 'procedures' ? 'default' : 'ghost'}
            size="sm"
            className="flex-1 text-xs"
            onClick={() => setSelectedTab('procedures')}
          >
            Procedimentos
          </Button>
        </div>
      </div>

      {/* Content based on selected tab */}
      <div className="px-4 space-y-3">
        {selectedTab === 'patients' && (
          <>
            {/* Alertas Urgentes */}
            {criticalPatients > 0 && (
              <Card className="border-destructive/50 bg-destructive/5">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2 text-destructive">
                    <AlertCircle className="h-4 w-4" />
                    {criticalPatients} Paciente(s) Crítico(s)
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  {EXAMPLE_PATIENTS.filter(p => p.status === 'critical').map(patient => (
                    <div key={patient.id} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div>
                        <p className="font-medium text-sm">{patient.name}</p>
                        <p className="text-xs text-muted-foreground">Leito {patient.bed}</p>
                      </div>
                      <div className="flex gap-1 flex-wrap justify-end max-w-[50%]">
                        {patient.alerts.map((alert, i) => (
                          <Badge key={i} variant="destructive" className="text-[10px]">{alert}</Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Lista de Pacientes */}
            {EXAMPLE_PATIENTS.map((patient) => (
              <Card 
                key={patient.id} 
                className={`cursor-pointer hover:shadow-md transition-shadow border ${
                  patient.status === 'critical' ? 'border-destructive/30' : 
                  patient.status === 'attention' ? 'border-orange-300' : ''
                }`}
                onClick={() => navigate("/nursing/history-mobile")}
              >
                <CardContent className="p-3">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                        patient.status === 'critical' ? 'bg-destructive/10' : 
                        patient.status === 'attention' ? 'bg-orange-100' : 'bg-primary/10'
                      }`}>
                        <Heart className={`h-5 w-5 ${
                          patient.status === 'critical' ? 'text-destructive' : 
                          patient.status === 'attention' ? 'text-orange-500' : 'text-primary'
                        }`} />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{patient.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Leito {patient.bed} • {patient.age} anos
                        </p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(patient.status)}>
                      {getStatusLabel(patient.status)}
                    </Badge>
                  </div>
                  
                  <p className="text-xs text-muted-foreground mb-2">{patient.diagnosis}</p>
                  
                  {/* Sinais Vitais */}
                  <div className="grid grid-cols-4 gap-2 text-[10px] bg-muted/30 p-2 rounded">
                    <div className="text-center">
                      <p className="text-muted-foreground">PA</p>
                      <p className="font-semibold">{patient.lastVitals.bp}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-muted-foreground">FC</p>
                      <p className="font-semibold">{patient.lastVitals.hr}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-muted-foreground">Tax</p>
                      <p className="font-semibold">{patient.lastVitals.temp}°C</p>
                    </div>
                    <div className="text-center">
                      <p className="text-muted-foreground">SpO2</p>
                      <p className={`font-semibold ${patient.lastVitals.spo2 < 94 ? 'text-destructive' : ''}`}>
                        {patient.lastVitals.spo2}%
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-2 text-xs">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Última aferição: {patient.lastVitalsTime}
                    </span>
                    {patient.pendingMeds > 0 && (
                      <Badge variant="secondary" className="text-[10px]">
                        <Pill className="h-3 w-3 mr-1" />
                        {patient.pendingMeds} med.
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </>
        )}

        {selectedTab === 'meds' && (
          <>
            {/* Medicações Atrasadas */}
            {lateMedsCount > 0 && (
              <Card className="border-orange-400/50 bg-orange-50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2 text-orange-600">
                    <AlertCircle className="h-4 w-4" />
                    {lateMedsCount} Medicação(ões) Atrasada(s)
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-2">
                  {EXAMPLE_PENDING_MEDS.filter(m => m.status === 'late').map(med => (
                    <div key={med.id} className="flex items-center justify-between p-2 bg-background rounded border border-orange-200">
                      <div>
                        <p className="font-medium text-sm">{med.medication}</p>
                        <p className="text-xs text-muted-foreground">{med.patient} • Leito {med.bed}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="destructive" className="text-xs">{med.time}</Badge>
                        <Button size="sm" variant="outline" className="h-7 text-xs">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Checar
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Próximas Medicações */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  Medicações das 10:00
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-2">
                {EXAMPLE_PENDING_MEDS.filter(m => m.status === 'pending').map(med => (
                  <div key={med.id} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                    <div>
                      <p className="font-medium text-sm">{med.medication}</p>
                      <p className="text-xs text-muted-foreground">{med.patient} • Leito {med.bed}</p>
                    </div>
                    <Button size="sm" variant="outline" className="h-7 text-xs">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Checar
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Medicações Checadas */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2 text-green-600">
                  <CheckCircle2 className="h-4 w-4" />
                  Já Administradas
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-2">
                {EXAMPLE_PENDING_MEDS.filter(m => m.status === 'done').map(med => (
                  <div key={med.id} className="flex items-center justify-between p-2 bg-green-50 rounded border border-green-200">
                    <div>
                      <p className="font-medium text-sm text-green-700">{med.medication}</p>
                      <p className="text-xs text-green-600">{med.patient} • Leito {med.bed}</p>
                    </div>
                    <Badge className="bg-green-500 text-xs">{med.time} ✓</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </>
        )}

        {selectedTab === 'procedures' && (
          <>
            {/* Procedimentos Pendentes */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Clipboard className="h-4 w-4 text-primary" />
                  Procedimentos Pendentes
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-2">
                {EXAMPLE_PROCEDURES.filter(p => !p.done).map(proc => (
                  <div key={proc.id} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                    <div>
                      <p className="font-medium text-sm">{proc.procedure}</p>
                      <p className="text-xs text-muted-foreground">{proc.patient} • Leito {proc.bed}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">{proc.time}</Badge>
                      <Button size="sm" variant="outline" className="h-7 text-xs">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Feito
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Procedimentos Realizados */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2 text-green-600">
                  <CheckCircle2 className="h-4 w-4" />
                  Procedimentos Realizados
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-2">
                {EXAMPLE_PROCEDURES.filter(p => p.done).map(proc => (
                  <div key={proc.id} className="flex items-center justify-between p-2 bg-green-50 rounded border border-green-200">
                    <div>
                      <p className="font-medium text-sm text-green-700">{proc.procedure}</p>
                      <p className="text-xs text-green-600">{proc.patient} • Leito {proc.bed}</p>
                    </div>
                    <Badge className="bg-green-500 text-xs">{proc.time} ✓</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </>
        )}

        {/* Evoluções Pendentes */}
        {selectedTab === 'patients' && EXAMPLE_PENDING_EVOLUTIONS.length > 0 && (
          <Card className="border-yellow-300 bg-yellow-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2 text-yellow-700">
                <FileText className="h-4 w-4" />
                Evoluções Pendentes
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {EXAMPLE_PENDING_EVOLUTIONS.map(ev => (
                <div key={ev.id} className="flex items-center justify-between py-2 border-b border-yellow-200 last:border-0">
                  <div>
                    <p className="font-medium text-sm">{ev.patient}</p>
                    <p className="text-xs text-muted-foreground">Leito {ev.bed} • Última: {ev.lastEvolution}</p>
                  </div>
                  <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => navigate('/nursing/evolution-mobile')}>
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Botão para voltar ao Portal */}
      <div className="text-center py-6 px-4">
        <Button 
          variant="ghost" 
          className="text-muted-foreground"
          onClick={() => navigate('/portal')}
        >
          <Home className="h-4 w-4 mr-2" />
          Voltar ao Portal
        </Button>
      </div>
    </div>
  );
};

export default NursingDashboardMobile;
