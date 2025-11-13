import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertCircle,
  Bell,
  ChevronDown,
  ChevronUp,
  FileText,
  Pill,
  Stethoscope,
  Activity,
  Phone,
  MessageSquare
} from "lucide-react";

// DADOS DE EXEMPLO - Paciente
const PATIENT_MOCK = {
  id: "p1",
  name: "Maria Silva Santos",
  age: 65,
  bedNumber: "Leito 12A",
  registryNumber: "REG-2024-00123",
  allergies: ["Dipirona", "Penicilina"],
  avatar: null
};

// DADOS DE EXEMPLO - Diagnósticos
const DIAGNOSES_MOCK = [
  { id: 1, diagnosis: "Insuficiência Cardíaca Congestiva", date: "2024-11-10", doctor: "Dr. Carlos Silva" },
  { id: 2, diagnosis: "Hipertensão Arterial Sistêmica", date: "2024-11-08", doctor: "Dr. Carlos Silva" },
  { id: 3, diagnosis: "Diabetes Mellitus Tipo 2", date: "2024-10-25", doctor: "Dra. Ana Costa" }
];

// DADOS DE EXEMPLO - Sinais Vitais (últimas 24h)
const VITAL_SIGNS_MOCK = [
  { time: "06:00", bp: "140/90", hr: 78, temp: 36.8, spo2: 95 },
  { time: "10:00", bp: "145/92", hr: 82, temp: 36.9, spo2: 94 },
  { time: "14:00", bp: "150/95", hr: 85, temp: 37.1, spo2: 93 },
  { time: "18:00", bp: "148/94", hr: 80, temp: 37.0, spo2: 94 },
  { time: "22:00", bp: "142/88", hr: 76, temp: 36.7, spo2: 96 }
];

// DADOS DE EXEMPLO - Medicações Atuais
const MEDICATIONS_MOCK = [
  { id: 1, name: "Losartana", dosage: "50mg", frequency: "1x ao dia", time: "08:00" },
  { id: 2, name: "Metformina", dosage: "850mg", frequency: "2x ao dia", time: "08:00 e 20:00" },
  { id: 3, name: "Furosemida", dosage: "40mg", frequency: "1x ao dia", time: "08:00" },
  { id: 4, name: "AAS", dosage: "100mg", frequency: "1x ao dia", time: "20:00" }
];

// DADOS DE EXEMPLO - Últimos Exames
const EXAMS_MOCK = [
  { id: 1, name: "Hemograma Completo", date: "2024-11-12", status: "Disponível", hasImage: false },
  { id: 2, name: "Raio-X Tórax", date: "2024-11-11", status: "Disponível", hasImage: true, imageUrl: "https://via.placeholder.com/400x600/1E40AF/FFFFFF?text=RX+Torax" },
  { id: 3, name: "ECG", date: "2024-11-10", status: "Disponível", hasImage: true, imageUrl: "https://via.placeholder.com/600x400/10B981/FFFFFF?text=ECG" }
];

// DADOS DE EXEMPLO - Intercorrências
const EVENTS_MOCK = [
  { id: 1, date: "2024-11-12 14:30", type: "Clínica", description: "Paciente relatou dispneia aos pequenos esforços. Administrado O2 suplementar 2L/min.", severity: "medium" },
  { id: 2, date: "2024-11-11 22:15", type: "Enfermagem", description: "Dificuldade para dormir. Administrado medicação conforme prescrição.", severity: "low" },
  { id: 3, date: "2024-11-10 09:00", type: "Clínica", description: "Edema em MMII +2/4. Ajustado diurético.", severity: "medium" }
];

export default function PatientRecord() {
  const [openSections, setOpenSections] = useState({
    diagnosis: true,
    vitals: true,
    medications: true,
    exams: true,
    events: true
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high": return "text-destructive";
      case "medium": return "text-yellow-600";
      default: return "text-muted-foreground";
    }
  };

  return (
    <Layout title="Ficha do Paciente">
      <div className="min-h-screen bg-background pb-24">
        {/* Header do Paciente */}
        <div className="bg-card border-b border-border p-4 mb-4">
          <div className="flex items-start gap-3 mb-3">
            <Avatar className="h-16 w-16 border-2 border-border">
              <AvatarImage src={PATIENT_MOCK.avatar || undefined} />
              <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
                {PATIENT_MOCK.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h2 className="font-bold text-lg">{PATIENT_MOCK.name}</h2>
              <p className="text-sm text-muted-foreground">{PATIENT_MOCK.age} anos</p>
              <div className="flex gap-2 mt-1">
                <Badge variant="outline" className="text-xs">
                  {PATIENT_MOCK.bedNumber}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {PATIENT_MOCK.registryNumber}
                </Badge>
              </div>
            </div>
          </div>

          {/* Alergias */}
          {PATIENT_MOCK.allergies.length > 0 && (
            <div className="flex items-center gap-2 p-2 bg-destructive/10 rounded-lg border border-destructive/20">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <div className="flex-1">
                <p className="text-xs font-semibold text-destructive">Alergias:</p>
                <p className="text-xs text-destructive">{PATIENT_MOCK.allergies.join(", ")}</p>
              </div>
            </div>
          )}

          {/* Ações Rápidas */}
          <div className="grid grid-cols-2 gap-2 mt-3">
            <Button variant="outline" size="sm" className="gap-2">
              <Phone className="h-4 w-4" />
              Enfermagem
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Pill className="h-4 w-4" />
              Prescrever
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <FileText className="h-4 w-4" />
              Solicitar Exame
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <MessageSquare className="h-4 w-4" />
              Chat
            </Button>
          </div>
        </div>

        <div className="px-4 space-y-3">
          {/* Resumo Clínico */}
          <Collapsible open={openSections.diagnosis} onOpenChange={() => toggleSection("diagnosis")}>
            <Card>
              <CollapsibleTrigger className="w-full">
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Stethoscope className="h-4 w-4 text-primary" />
                    Resumo Clínico
                  </CardTitle>
                  {openSections.diagnosis ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="space-y-2 pt-0">
                  {DIAGNOSES_MOCK.map((diag) => (
                    <div key={diag.id} className="p-2 bg-muted/50 rounded text-sm">
                      <p className="font-medium">{diag.diagnosis}</p>
                      <p className="text-xs text-muted-foreground">
                        {diag.date} • {diag.doctor}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* Sinais Vitais */}
          <Collapsible open={openSections.vitals} onOpenChange={() => toggleSection("vitals")}>
            <Card>
              <CollapsibleTrigger className="w-full">
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Activity className="h-4 w-4 text-primary" />
                    Sinais Vitais (24h)
                  </CardTitle>
                  {openSections.vitals ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-0">
                  {/* Mini-gráfico simulado */}
                  <div className="mb-3 p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-end justify-between h-24 gap-1">
                      {VITAL_SIGNS_MOCK.map((vs, idx) => (
                        <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                          <div 
                            className="w-full bg-primary/70 rounded-t"
                            style={{ height: `${(vs.spo2 - 85) * 4}%` }}
                          />
                          <span className="text-[10px] text-muted-foreground">{vs.time}</span>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-center text-muted-foreground mt-2">SpO2 %</p>
                  </div>
                  
                  {/* Últimas medições */}
                  <div className="space-y-2">
                    {VITAL_SIGNS_MOCK.slice(-2).reverse().map((vs, idx) => (
                      <div key={idx} className="grid grid-cols-2 gap-2 text-xs">
                        <div className="p-2 bg-muted/50 rounded">
                          <p className="text-muted-foreground">PA</p>
                          <p className="font-semibold">{vs.bp} mmHg</p>
                        </div>
                        <div className="p-2 bg-muted/50 rounded">
                          <p className="text-muted-foreground">FC</p>
                          <p className="font-semibold">{vs.hr} bpm</p>
                        </div>
                        <div className="p-2 bg-muted/50 rounded">
                          <p className="text-muted-foreground">Temp</p>
                          <p className="font-semibold">{vs.temp}°C</p>
                        </div>
                        <div className="p-2 bg-muted/50 rounded">
                          <p className="text-muted-foreground">SpO2</p>
                          <p className="font-semibold">{vs.spo2}%</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* Medicações Atuais */}
          <Collapsible open={openSections.medications} onOpenChange={() => toggleSection("medications")}>
            <Card>
              <CollapsibleTrigger className="w-full">
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Pill className="h-4 w-4 text-primary" />
                    Medicações Atuais
                  </CardTitle>
                  {openSections.medications ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="space-y-2 pt-0">
                  {MEDICATIONS_MOCK.map((med) => (
                    <div key={med.id} className="p-2 bg-muted/50 rounded text-sm">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{med.name}</p>
                          <p className="text-xs text-muted-foreground">{med.dosage} • {med.frequency}</p>
                        </div>
                        <Badge variant="outline" className="text-xs">{med.time}</Badge>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* Últimos Exames */}
          <Collapsible open={openSections.exams} onOpenChange={() => toggleSection("exams")}>
            <Card>
              <CollapsibleTrigger className="w-full">
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    Últimos Exames
                  </CardTitle>
                  {openSections.exams ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="space-y-2 pt-0">
                  {EXAMS_MOCK.map((exam) => (
                    <div key={exam.id} className="p-2 bg-muted/50 rounded text-sm">
                      <div className="flex justify-between items-center">
                        <div className="flex-1">
                          <p className="font-medium">{exam.name}</p>
                          <p className="text-xs text-muted-foreground">{exam.date}</p>
                        </div>
                        {exam.hasImage && (
                          <Dialog>
                            <DialogTrigger asChild>
                              <div className="ml-2 w-12 h-12 bg-primary/10 rounded border border-primary/20 cursor-pointer hover:bg-primary/20 transition-colors flex items-center justify-center">
                                <FileText className="h-6 w-6 text-primary" />
                              </div>
                            </DialogTrigger>
                            <DialogContent className="max-w-[95vw] max-h-[95vh] p-2">
                              <img 
                                src={exam.imageUrl} 
                                alt={exam.name}
                                className="w-full h-full object-contain"
                              />
                            </DialogContent>
                          </Dialog>
                        )}
                        {!exam.hasImage && (
                          <Button variant="ghost" size="sm" className="text-xs">
                            Ver laudo
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* Intercorrências */}
          <Collapsible open={openSections.events} onOpenChange={() => toggleSection("events")}>
            <Card>
              <CollapsibleTrigger className="w-full">
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Bell className="h-4 w-4 text-primary" />
                    Histórico de Intercorrências
                  </CardTitle>
                  {openSections.events ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="space-y-2 pt-0">
                  {EVENTS_MOCK.map((event) => (
                    <div key={event.id} className="p-2 bg-muted/50 rounded text-sm border-l-2 border-primary">
                      <div className="flex items-start gap-2">
                        <AlertCircle className={`h-4 w-4 mt-0.5 ${getSeverityColor(event.severity)}`} />
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-1">
                            <p className="text-xs font-semibold">{event.type}</p>
                            <p className="text-xs text-muted-foreground">{event.date}</p>
                          </div>
                          <p className="text-xs">{event.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        </div>
      </div>
    </Layout>
  );
}
