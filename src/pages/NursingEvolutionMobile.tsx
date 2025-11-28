import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, FileText, Heart, Save } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const NursingEvolutionMobile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [selectedPatient] = useState({
    name: "João da Silva",
    bed: "203",
    registry: "12345"
  });

  const [evolution, setEvolution] = useState({
    type: "daily",
    subjective: "Paciente sem queixas no momento.",
    objective: "Temp 36.7°C, PA 120/80 mmHg, FC 78 bpm, SpO2 98%. Ferida limpa e seca.",
    assessment: "Paciente consciente, orientado, sem queixas. Evolução satisfatória.",
    plan: "Manter cuidados, controlar sinais vitais 6/6h, curativo conforme rotina."
  });

  const handleSave = () => {
    toast({
      title: "Evolução registrada",
      description: `Evolução de ${selectedPatient.name} salva com sucesso.`,
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
            <h1 className="text-2xl font-bold">Evolução</h1>
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

      {/* Evolution Form */}
      <div className="p-4 space-y-4">
        {/* Type */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <Label className="text-base font-semibold">Tipo de Evolução</Label>
            </div>
            <Select value={evolution.type} onValueChange={(value) => setEvolution({...evolution, type: value})}>
              <SelectTrigger className="h-14 text-base">
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admission">Admissão</SelectItem>
                <SelectItem value="daily">Evolução Diária</SelectItem>
                <SelectItem value="discharge">Alta</SelectItem>
                <SelectItem value="intercurrence">Intercorrência</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Subjective */}
        <Card>
          <CardContent className="p-4">
            <Label htmlFor="subjective" className="text-base font-semibold mb-3 block">
              Dados Subjetivos
            </Label>
            <Textarea 
              id="subjective"
              placeholder="Relato do paciente, queixas, sintomas..."
              value={evolution.subjective}
              onChange={(e) => setEvolution({...evolution, subjective: e.target.value})}
              className="min-h-[100px] text-base"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Exemplo: Paciente relata dor no local da incisão cirúrgica
            </p>
          </CardContent>
        </Card>

        {/* Objective */}
        <Card>
          <CardContent className="p-4">
            <Label htmlFor="objective" className="text-base font-semibold mb-3 block">
              Dados Objetivos
            </Label>
            <Textarea 
              id="objective"
              placeholder="Exame físico, sinais vitais, aparência..."
              value={evolution.objective}
              onChange={(e) => setEvolution({...evolution, objective: e.target.value})}
              className="min-h-[100px] text-base"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Exemplo: PA 120/80, FC 75bpm, afebril, ferida limpa e seca
            </p>
          </CardContent>
        </Card>

        {/* Assessment */}
        <Card>
          <CardContent className="p-4">
            <Label htmlFor="assessment" className="text-base font-semibold mb-3 block">
              Avaliação
            </Label>
            <Textarea 
              id="assessment"
              placeholder="Análise do quadro, diagnósticos de enfermagem..."
              value={evolution.assessment}
              onChange={(e) => setEvolution({...evolution, assessment: e.target.value})}
              className="min-h-[100px] text-base"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Exemplo: Paciente em recuperação pós-operatória estável
            </p>
          </CardContent>
        </Card>

        {/* Plan */}
        <Card>
          <CardContent className="p-4">
            <Label htmlFor="plan" className="text-base font-semibold mb-3 block">
              Plano de Cuidados
            </Label>
            <Textarea 
              id="plan"
              placeholder="Intervenções planejadas, cuidados..."
              value={evolution.plan}
              onChange={(e) => setEvolution({...evolution, plan: e.target.value})}
              className="min-h-[100px] text-base"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Exemplo: Manter curativos, controlar sinais vitais 6/6h
            </p>
          </CardContent>
        </Card>

        {/* Save Button */}
        <Button 
          onClick={handleSave}
          className="w-full h-14 text-lg bg-primary hover:bg-primary/90"
          size="lg"
        >
          <Save className="h-5 w-5 mr-2" />
          Salvar Evolução
        </Button>
      </div>
    </div>
  );
};

export default NursingEvolutionMobile;
