import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Activity, Heart, Thermometer, Wind, Droplets, User, ChevronRight, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

// DADOS DE EXEMPLO - Lista de Pacientes
const EXAMPLE_PATIENTS = [
  { id: "p1", name: "Maria Silva Santos", bed: "12A", registry: "REG-001", lastVitals: "08:30", status: "attention" },
  { id: "p2", name: "João Oliveira Lima", bed: "12B", registry: "REG-002", lastVitals: "08:15", status: "critical" },
  { id: "p3", name: "Ana Costa Ferreira", bed: "14A", registry: "REG-003", lastVitals: "08:45", status: "stable" },
  { id: "p4", name: "Roberto Lima Souza", bed: "14B", registry: "REG-004", lastVitals: "08:00", status: "stable" },
  { id: "p5", name: "Lucia Ferreira Gomes", bed: "16A", registry: "REG-005", lastVitals: "07:45", status: "critical" }
];

// DADOS DE EXEMPLO - Últimos sinais vitais do paciente selecionado
const EXAMPLE_LAST_VITALS = {
  temperature: "36.8",
  systolic: "140",
  diastolic: "90",
  heartRate: "78",
  respiratory: "18",
  saturation: "95",
  painScale: "3",
  time: "08:30"
};

const NursingVitalSignsMobile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [step, setStep] = useState<'select' | 'register'>('select');
  const [selectedPatient, setSelectedPatient] = useState<typeof EXAMPLE_PATIENTS[0] | null>(null);

  const [vitals, setVitals] = useState({
    temperature: "",
    systolic: "",
    diastolic: "",
    heartRate: "",
    respiratory: "",
    saturation: "",
    painScale: "",
    notes: ""
  });

  const handleSelectPatient = (patient: typeof EXAMPLE_PATIENTS[0]) => {
    setSelectedPatient(patient);
    setStep('register');
  };

  const handleSave = () => {
    if (!selectedPatient) return;
    
    toast({
      title: "Sinais vitais registrados",
      description: `Dados de ${selectedPatient.name} salvos com sucesso.`,
    });
    navigate("/nursing/dashboard-mobile");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "critical": return "text-destructive bg-destructive/10";
      case "attention": return "text-orange-600 bg-orange-50";
      default: return "text-green-600 bg-green-50";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "critical": return "Crítico";
      case "attention": return "Atenção";
      default: return "Estável";
    }
  };

  const isAbnormal = (field: string, value: string) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return false;
    
    switch (field) {
      case 'temperature': return numValue < 36 || numValue > 37.5;
      case 'systolic': return numValue < 90 || numValue > 140;
      case 'diastolic': return numValue < 60 || numValue > 90;
      case 'heartRate': return numValue < 60 || numValue > 100;
      case 'respiratory': return numValue < 12 || numValue > 20;
      case 'saturation': return numValue < 94;
      case 'painScale': return numValue > 3;
      default: return false;
    }
  };

  if (step === 'select') {
    return (
      <div className="min-h-screen bg-background pb-20">
        {/* Header */}
        <div className="bg-primary text-primary-foreground p-4 shadow-lg">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate("/nursing/dashboard-mobile")}
              className="text-primary-foreground hover:bg-primary-foreground/20"
            >
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">Sinais Vitais</h1>
              <p className="text-sm opacity-90">Selecione um paciente</p>
            </div>
          </div>
        </div>

        {/* Patient List */}
        <div className="p-4 space-y-3">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
            <p className="text-xs text-yellow-700 text-center">
              📋 Dados de exemplo para demonstração
            </p>
          </div>

          {EXAMPLE_PATIENTS.map((patient) => (
            <Card 
              key={patient.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleSelectPatient(patient)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
                      patient.status === 'critical' ? 'bg-destructive/10' : 
                      patient.status === 'attention' ? 'bg-orange-100' : 'bg-primary/10'
                    }`}>
                      <User className={`h-6 w-6 ${
                        patient.status === 'critical' ? 'text-destructive' : 
                        patient.status === 'attention' ? 'text-orange-500' : 'text-primary'
                      }`} />
                    </div>
                    <div>
                      <p className="font-semibold">{patient.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Leito {patient.bed} • {patient.registry}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Última aferição: {patient.lastVitals}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(patient.status)}>
                      {getStatusLabel(patient.status)}
                    </Badge>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-4 shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setStep('select')}
            className="text-primary-foreground hover:bg-primary-foreground/20"
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">Sinais Vitais</h1>
            <p className="text-sm opacity-90">Registrar aferição</p>
          </div>
        </div>
        
        {/* Patient Info */}
        {selectedPatient && (
          <Card className="bg-primary-foreground/10 border-0">
            <CardContent className="p-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                  <Heart className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <p className="font-semibold text-primary-foreground">{selectedPatient.name}</p>
                  <p className="text-sm text-primary-foreground/80">
                    Leito {selectedPatient.bed} • {selectedPatient.registry}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Últimos Valores */}
      <div className="p-4">
        <Card className="mb-4 bg-muted/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Última Aferição: {EXAMPLE_LAST_VITALS.time}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="text-center p-2 bg-background rounded">
                <p className="text-muted-foreground">PA</p>
                <p className="font-semibold">{EXAMPLE_LAST_VITALS.systolic}/{EXAMPLE_LAST_VITALS.diastolic}</p>
              </div>
              <div className="text-center p-2 bg-background rounded">
                <p className="text-muted-foreground">FC</p>
                <p className="font-semibold">{EXAMPLE_LAST_VITALS.heartRate} bpm</p>
              </div>
              <div className="text-center p-2 bg-background rounded">
                <p className="text-muted-foreground">SpO2</p>
                <p className="font-semibold">{EXAMPLE_LAST_VITALS.saturation}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Vitals Form */}
      <div className="px-4 space-y-4">
        {/* Temperature */}
        <Card className={isAbnormal('temperature', vitals.temperature) ? 'border-destructive' : ''}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                isAbnormal('temperature', vitals.temperature) ? 'bg-destructive/10' : 'bg-red-100'
              }`}>
                <Thermometer className={`h-5 w-5 ${isAbnormal('temperature', vitals.temperature) ? 'text-destructive' : 'text-red-600'}`} />
              </div>
              <Label htmlFor="temp" className="text-base font-semibold">Temperatura</Label>
              {isAbnormal('temperature', vitals.temperature) && (
                <Badge variant="destructive" className="ml-auto text-xs">Alterada</Badge>
              )}
            </div>
            <Input 
              id="temp"
              type="number" 
              step="0.1"
              placeholder="36.5"
              value={vitals.temperature}
              onChange={(e) => setVitals({...vitals, temperature: e.target.value})}
              className={`h-12 text-lg ${isAbnormal('temperature', vitals.temperature) ? 'border-destructive' : ''}`}
            />
            <p className="text-xs text-muted-foreground mt-2">°C (Normal: 36.0 - 37.5)</p>
          </CardContent>
        </Card>

        {/* Blood Pressure */}
        <Card className={(isAbnormal('systolic', vitals.systolic) || isAbnormal('diastolic', vitals.diastolic)) ? 'border-destructive' : ''}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                (isAbnormal('systolic', vitals.systolic) || isAbnormal('diastolic', vitals.diastolic)) ? 'bg-destructive/10' : 'bg-blue-100'
              }`}>
                <Activity className={`h-5 w-5 ${(isAbnormal('systolic', vitals.systolic) || isAbnormal('diastolic', vitals.diastolic)) ? 'text-destructive' : 'text-blue-600'}`} />
              </div>
              <Label className="text-base font-semibold">Pressão Arterial</Label>
              {(isAbnormal('systolic', vitals.systolic) || isAbnormal('diastolic', vitals.diastolic)) && (
                <Badge variant="destructive" className="ml-auto text-xs">Alterada</Badge>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Input 
                  type="number" 
                  placeholder="120"
                  value={vitals.systolic}
                  onChange={(e) => setVitals({...vitals, systolic: e.target.value})}
                  className={`h-12 text-lg ${isAbnormal('systolic', vitals.systolic) ? 'border-destructive' : ''}`}
                />
                <p className="text-xs text-muted-foreground mt-2">Sistólica</p>
              </div>
              <div>
                <Input 
                  type="number" 
                  placeholder="80"
                  value={vitals.diastolic}
                  onChange={(e) => setVitals({...vitals, diastolic: e.target.value})}
                  className={`h-12 text-lg ${isAbnormal('diastolic', vitals.diastolic) ? 'border-destructive' : ''}`}
                />
                <p className="text-xs text-muted-foreground mt-2">Diastólica</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Heart Rate */}
        <Card className={isAbnormal('heartRate', vitals.heartRate) ? 'border-destructive' : ''}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                isAbnormal('heartRate', vitals.heartRate) ? 'bg-destructive/10' : 'bg-pink-100'
              }`}>
                <Heart className={`h-5 w-5 ${isAbnormal('heartRate', vitals.heartRate) ? 'text-destructive' : 'text-pink-600'}`} />
              </div>
              <Label htmlFor="hr" className="text-base font-semibold">Frequência Cardíaca</Label>
              {isAbnormal('heartRate', vitals.heartRate) && (
                <Badge variant="destructive" className="ml-auto text-xs">Alterada</Badge>
              )}
            </div>
            <Input 
              id="hr"
              type="number" 
              placeholder="75"
              value={vitals.heartRate}
              onChange={(e) => setVitals({...vitals, heartRate: e.target.value})}
              className={`h-12 text-lg ${isAbnormal('heartRate', vitals.heartRate) ? 'border-destructive' : ''}`}
            />
            <p className="text-xs text-muted-foreground mt-2">bpm (Normal: 60 - 100)</p>
          </CardContent>
        </Card>

        {/* Respiratory Rate */}
        <Card className={isAbnormal('respiratory', vitals.respiratory) ? 'border-destructive' : ''}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                isAbnormal('respiratory', vitals.respiratory) ? 'bg-destructive/10' : 'bg-cyan-100'
              }`}>
                <Wind className={`h-5 w-5 ${isAbnormal('respiratory', vitals.respiratory) ? 'text-destructive' : 'text-cyan-600'}`} />
              </div>
              <Label htmlFor="rr" className="text-base font-semibold">Frequência Respiratória</Label>
              {isAbnormal('respiratory', vitals.respiratory) && (
                <Badge variant="destructive" className="ml-auto text-xs">Alterada</Badge>
              )}
            </div>
            <Input 
              id="rr"
              type="number" 
              placeholder="16"
              value={vitals.respiratory}
              onChange={(e) => setVitals({...vitals, respiratory: e.target.value})}
              className={`h-12 text-lg ${isAbnormal('respiratory', vitals.respiratory) ? 'border-destructive' : ''}`}
            />
            <p className="text-xs text-muted-foreground mt-2">irpm (Normal: 12 - 20)</p>
          </CardContent>
        </Card>

        {/* Oxygen Saturation */}
        <Card className={isAbnormal('saturation', vitals.saturation) ? 'border-destructive' : ''}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                isAbnormal('saturation', vitals.saturation) ? 'bg-destructive/10' : 'bg-green-100'
              }`}>
                <Droplets className={`h-5 w-5 ${isAbnormal('saturation', vitals.saturation) ? 'text-destructive' : 'text-green-600'}`} />
              </div>
              <Label htmlFor="spo2" className="text-base font-semibold">Saturação de O₂</Label>
              {isAbnormal('saturation', vitals.saturation) && (
                <Badge variant="destructive" className="ml-auto text-xs">Alterada</Badge>
              )}
            </div>
            <Input 
              id="spo2"
              type="number" 
              placeholder="98"
              value={vitals.saturation}
              onChange={(e) => setVitals({...vitals, saturation: e.target.value})}
              className={`h-12 text-lg ${isAbnormal('saturation', vitals.saturation) ? 'border-destructive' : ''}`}
            />
            <p className="text-xs text-muted-foreground mt-2">% (Normal: ≥94)</p>
          </CardContent>
        </Card>

        {/* Pain Scale */}
        <Card className={isAbnormal('painScale', vitals.painScale) ? 'border-orange-400' : ''}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                isAbnormal('painScale', vitals.painScale) ? 'bg-orange-100' : 'bg-purple-100'
              }`}>
                <Activity className={`h-5 w-5 ${isAbnormal('painScale', vitals.painScale) ? 'text-orange-600' : 'text-purple-600'}`} />
              </div>
              <Label htmlFor="pain" className="text-base font-semibold">Escala de Dor</Label>
              {isAbnormal('painScale', vitals.painScale) && (
                <Badge className="ml-auto text-xs bg-orange-500">Atenção</Badge>
              )}
            </div>
            <Input 
              id="pain"
              type="number" 
              min="0"
              max="10"
              placeholder="0"
              value={vitals.painScale}
              onChange={(e) => setVitals({...vitals, painScale: e.target.value})}
              className={`h-12 text-lg ${isAbnormal('painScale', vitals.painScale) ? 'border-orange-400' : ''}`}
            />
            <p className="text-xs text-muted-foreground mt-2">0-10 (0 = Sem dor)</p>
          </CardContent>
        </Card>

        {/* Notes */}
        <Card>
          <CardContent className="p-4">
            <Label htmlFor="notes" className="text-base font-semibold">Observações</Label>
            <Textarea
              id="notes"
              placeholder="Observações sobre o paciente..."
              value={vitals.notes}
              onChange={(e) => setVitals({...vitals, notes: e.target.value})}
              className="mt-3 min-h-[80px]"
            />
          </CardContent>
        </Card>

        {/* Save Button */}
        <Button 
          onClick={handleSave}
          className="w-full h-14 text-lg bg-primary hover:bg-primary/90"
          size="lg"
        >
          <CheckCircle2 className="h-5 w-5 mr-2" />
          Salvar Registro
        </Button>
      </div>
    </div>
  );
};

export default NursingVitalSignsMobile;
