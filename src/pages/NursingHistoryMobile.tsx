import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Heart, Activity, FileText, Calendar, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const NursingHistoryMobile = () => {
  const navigate = useNavigate();
  
  const [selectedPatient] = useState({
    name: "João da Silva",
    bed: "203",
    registry: "12345",
    admission: "15/01/2024",
    diagnosis: "Pós-operatório de apendicectomia"
  });

  const vitalHistory = [
    { date: "28/11/2024", time: "14:00", temp: "36.8", bp: "120/80", hr: "75", spo2: "98" },
    { date: "28/11/2024", time: "10:00", temp: "36.5", bp: "118/78", hr: "72", spo2: "99" },
    { date: "27/11/2024", time: "18:00", temp: "37.2", bp: "125/82", hr: "78", spo2: "97" },
    { date: "27/11/2024", time: "14:00", temp: "36.9", bp: "122/80", hr: "76", spo2: "98" }
  ];

  const evolutionHistory = [
    {
      date: "28/11/2024",
      time: "14:30",
      type: "Evolução Diária",
      nurse: "Enf. Maria Silva",
      summary: "Paciente em bom estado geral, ferida operatória limpa e seca..."
    },
    {
      date: "27/11/2024",
      time: "18:15",
      type: "Evolução Diária",
      nurse: "Enf. João Santos",
      summary: "Aceitou dieta leve, deambulando com auxílio, sem queixas..."
    },
    {
      date: "27/11/2024",
      time: "10:00",
      type: "Admissão",
      nurse: "Enf. Maria Silva",
      summary: "Paciente admitido proveniente do centro cirúrgico..."
    }
  ];

  const medications = [
    { name: "Dipirona 500mg", time: "08:00 - 14:00 - 20:00", status: "Administrado" },
    { name: "Omeprazol 20mg", time: "08:00", status: "Administrado" },
    { name: "Cefalexina 500mg", time: "08:00 - 20:00", status: "Pendente" }
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-6 shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate("/nursing/dashboard-mobile")}
            className="text-primary-foreground hover:bg-primary-foreground/20"
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Histórico</h1>
          </div>
        </div>
        
        {/* Patient Info */}
        <Card className="bg-primary-foreground/10 border-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-12 w-12 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                <Heart className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <div className="font-semibold text-primary-foreground">{selectedPatient.name}</div>
                <div className="text-sm text-primary-foreground/80">
                  Leito {selectedPatient.bed} • Registro {selectedPatient.registry}
                </div>
              </div>
            </div>
            <div className="text-sm text-primary-foreground/90 space-y-1">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Admissão: {selectedPatient.admission}
              </div>
              <div className="flex items-start gap-2">
                <FileText className="h-4 w-4 mt-0.5" />
                <span>{selectedPatient.diagnosis}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="p-4">
        <Tabs defaultValue="vitals" className="w-full">
          <TabsList className="grid w-full grid-cols-3 h-12">
            <TabsTrigger value="vitals" className="text-xs">Sinais Vitais</TabsTrigger>
            <TabsTrigger value="evolution" className="text-xs">Evoluções</TabsTrigger>
            <TabsTrigger value="meds" className="text-xs">Medicações</TabsTrigger>
          </TabsList>

          {/* Vitals History */}
          <TabsContent value="vitals" className="space-y-3 mt-4">
            {vitalHistory.map((vital, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-primary" />
                      <span className="font-semibold text-sm">{vital.date}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{vital.time}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                        <span className="text-xs font-bold text-red-600">T°</span>
                      </div>
                      <div>
                        <div className="font-medium">{vital.temp}°C</div>
                        <div className="text-xs text-muted-foreground">Temperatura</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-xs font-bold text-blue-600">PA</span>
                      </div>
                      <div>
                        <div className="font-medium">{vital.bp}</div>
                        <div className="text-xs text-muted-foreground">mmHg</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-pink-100 flex items-center justify-center">
                        <span className="text-xs font-bold text-pink-600">FC</span>
                      </div>
                      <div>
                        <div className="font-medium">{vital.hr} bpm</div>
                        <div className="text-xs text-muted-foreground">Freq. Cardíaca</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                        <span className="text-xs font-bold text-green-600">O₂</span>
                      </div>
                      <div>
                        <div className="font-medium">{vital.spo2}%</div>
                        <div className="text-xs text-muted-foreground">Saturação</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Evolution History */}
          <TabsContent value="evolution" className="space-y-3 mt-4">
            {evolutionHistory.map((evolution, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-primary" />
                      <span className="font-semibold text-sm">{evolution.date}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{evolution.time}</span>
                  </div>
                  <Badge variant="secondary" className="mb-2">{evolution.type}</Badge>
                  <p className="text-sm text-muted-foreground mb-2">{evolution.summary}</p>
                  <div className="text-xs text-muted-foreground">{evolution.nurse}</div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Medications */}
          <TabsContent value="meds" className="space-y-3 mt-4">
            {medications.map((med, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-semibold text-sm">{med.name}</div>
                    <Badge variant={med.status === "Administrado" ? "default" : "secondary"}>
                      {med.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <TrendingUp className="h-3 w-3" />
                    <span>{med.time}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default NursingHistoryMobile;
