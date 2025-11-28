import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Activity, Heart, Thermometer, Wind, Droplets } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const NursingVitalSignsMobile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [selectedPatient] = useState({
    name: "João da Silva",
    bed: "203",
    registry: "12345"
  });

  const [vitals, setVitals] = useState({
    temperature: "36.7",
    systolic: "120",
    diastolic: "80",
    heartRate: "78",
    respiratory: "16",
    saturation: "98"
  });

  const handleSave = () => {
    toast({
      title: "Sinais vitais registrados",
      description: `Dados de ${selectedPatient.name} salvos com sucesso.`,
    });
    navigate("/nursing/dashboard-mobile");
  };

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
            <h1 className="text-2xl font-bold">Sinais Vitais</h1>
          </div>
        </div>
        
        {/* Patient Info */}
        <Card className="bg-primary-foreground/10 border-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
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
          </CardContent>
        </Card>
      </div>

      {/* Vitals Form */}
      <div className="p-4 space-y-4">
        {/* Temperature */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                <Thermometer className="h-5 w-5 text-red-600" />
              </div>
              <Label htmlFor="temp" className="text-base font-semibold">Temperatura</Label>
            </div>
            <Input 
              id="temp"
              type="number" 
              placeholder="36.5"
              value={vitals.temperature}
              onChange={(e) => setVitals({...vitals, temperature: e.target.value})}
              className="h-14 text-lg"
            />
            <p className="text-xs text-muted-foreground mt-2">°C</p>
          </CardContent>
        </Card>

        {/* Blood Pressure */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Activity className="h-5 w-5 text-blue-600" />
              </div>
              <Label className="text-base font-semibold">Pressão Arterial</Label>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Input 
                  type="number" 
                  placeholder="120"
                  value={vitals.systolic}
                  onChange={(e) => setVitals({...vitals, systolic: e.target.value})}
                  className="h-14 text-lg"
                />
                <p className="text-xs text-muted-foreground mt-2">Sistólica</p>
              </div>
              <div>
                <Input 
                  type="number" 
                  placeholder="80"
                  value={vitals.diastolic}
                  onChange={(e) => setVitals({...vitals, diastolic: e.target.value})}
                  className="h-14 text-lg"
                />
                <p className="text-xs text-muted-foreground mt-2">Diastólica</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Heart Rate */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-full bg-pink-100 flex items-center justify-center">
                <Heart className="h-5 w-5 text-pink-600" />
              </div>
              <Label htmlFor="hr" className="text-base font-semibold">Frequência Cardíaca</Label>
            </div>
            <Input 
              id="hr"
              type="number" 
              placeholder="75"
              value={vitals.heartRate}
              onChange={(e) => setVitals({...vitals, heartRate: e.target.value})}
              className="h-14 text-lg"
            />
            <p className="text-xs text-muted-foreground mt-2">bpm</p>
          </CardContent>
        </Card>

        {/* Respiratory Rate */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-full bg-cyan-100 flex items-center justify-center">
                <Wind className="h-5 w-5 text-cyan-600" />
              </div>
              <Label htmlFor="rr" className="text-base font-semibold">Frequência Respiratória</Label>
            </div>
            <Input 
              id="rr"
              type="number" 
              placeholder="16"
              value={vitals.respiratory}
              onChange={(e) => setVitals({...vitals, respiratory: e.target.value})}
              className="h-14 text-lg"
            />
            <p className="text-xs text-muted-foreground mt-2">rpm</p>
          </CardContent>
        </Card>

        {/* Oxygen Saturation */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                <Droplets className="h-5 w-5 text-green-600" />
              </div>
              <Label htmlFor="spo2" className="text-base font-semibold">Saturação de O₂</Label>
            </div>
            <Input 
              id="spo2"
              type="number" 
              placeholder="98"
              value={vitals.saturation}
              onChange={(e) => setVitals({...vitals, saturation: e.target.value})}
              className="h-14 text-lg"
            />
            <p className="text-xs text-muted-foreground mt-2">%</p>
          </CardContent>
        </Card>

        {/* Save Button */}
        <Button 
          onClick={handleSave}
          className="w-full h-14 text-lg bg-primary hover:bg-primary/90"
          size="lg"
        >
          Salvar Registro
        </Button>
      </div>
    </div>
  );
};

export default NursingVitalSignsMobile;
