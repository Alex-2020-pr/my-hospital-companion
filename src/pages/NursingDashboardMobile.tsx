import { useNavigate } from "react-router-dom";
import { Activity, Heart, FileText, Clock, AlertCircle, ChevronRight, Users, Clipboard } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { NursingAlertBadge } from "@/components/NursingAlertBadge";
import { NursingAlertCard } from "@/components/NursingAlertCard";
import { useNursingAlerts } from "@/hooks/useNursingAlerts";

const NursingDashboardMobile = () => {
  const navigate = useNavigate();
  const { activeAlerts, resolveAlert } = useNursingAlerts();

  const patients = [
    {
      id: 1,
      name: "João da Silva",
      bed: "203",
      lastVitals: "120/80 mmHg • FC 78 • SpO2 98%",
      status: "stable",
      time: "10:30"
    },
    {
      id: 2,
      name: "Maria Santos",
      bed: "205",
      lastVitals: "135/90 mmHg • FC 82 • SpO2 96%",
      status: "attention",
      time: "09:15"
    },
    {
      id: 3,
      name: "Carlos Oliveira",
      bed: "208",
      lastVitals: "115/75 mmHg • FC 72 • SpO2 99%",
      status: "stable",
      time: "11:00"
    }
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-1">Enfermagem</h1>
            <p className="text-sm opacity-90">Dashboard</p>
          </div>
          <div className="text-primary-foreground">
            <NursingAlertBadge 
              alerts={activeAlerts} 
              onResolve={resolveAlert}
              onView={(id) => navigate('/nursing/history-mobile')}
            />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="p-4 grid grid-cols-3 gap-3">
        <Card className="bg-card">
          <CardContent className="p-4 text-center">
            <Users className="h-6 w-6 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold text-primary mb-1">12</div>
            <div className="text-xs text-muted-foreground">Pacientes</div>
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardContent className="p-4 text-center">
            <AlertCircle className="h-6 w-6 text-orange-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-orange-500 mb-1">{activeAlerts.length}</div>
            <div className="text-xs text-muted-foreground">Alertas</div>
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardContent className="p-4 text-center">
            <Clipboard className="h-6 w-6 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-600 mb-1">8</div>
            <div className="text-xs text-muted-foreground">Procedimentos</div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="px-4 mb-6">
        <h2 className="text-lg font-semibold mb-3">Ações Rápidas</h2>
        <div className="grid grid-cols-2 gap-3">
          <Button 
            onClick={() => navigate("/nursing/vital-signs-mobile")}
            className="h-24 flex flex-col items-center justify-center gap-2 bg-primary hover:bg-primary/90"
            size="lg"
          >
            <Activity className="h-8 w-8" />
            <span className="text-sm">Sinais Vitais</span>
          </Button>
          <Button 
            onClick={() => navigate("/nursing/evolution-mobile")}
            className="h-24 flex flex-col items-center justify-center gap-2 bg-primary hover:bg-primary/90"
            size="lg"
          >
            <FileText className="h-8 w-8" />
            <span className="text-sm">Evolução</span>
          </Button>
        </div>
      </div>

      {/* Alerts */}
      {activeAlerts.length > 0 && (
        <div className="px-4 mb-6">
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-orange-500" />
            Alertas Ativos
          </h2>
          <div className="space-y-3">
            {activeAlerts.slice(0, 2).map((alert) => (
              <NursingAlertCard
                key={alert.id}
                alert={alert}
                onResolve={resolveAlert}
                onView={(id) => navigate('/nursing/history-mobile')}
              />
            ))}
          </div>
        </div>
      )}

      {/* Recent Patients */}
      <div className="px-4">
        <h2 className="text-lg font-semibold mb-3">Pacientes Recentes</h2>
        <div className="space-y-3">
          {patients.map((patient) => (
            <Card 
              key={patient.id} 
              className="bg-card cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate("/nursing/history-mobile")}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Heart className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <div className="font-semibold">{patient.name}</div>
                      <div className="text-sm text-muted-foreground">Leito {patient.bed}</div>
                    </div>
                  </div>
                  <Badge variant={patient.status === "stable" ? "secondary" : "destructive"}>
                    {patient.status === "stable" ? "Estável" : "Atenção"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">PA: {patient.lastVitals}</span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {patient.time}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NursingDashboardMobile;
