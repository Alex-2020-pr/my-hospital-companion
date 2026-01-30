import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { ShieldAlert } from "lucide-react";

const SENSORY_PERCEPTION = [
  { value: "1", label: "Completamente limitada", description: "Não responde a estímulos dolorosos" },
  { value: "2", label: "Muito limitada", description: "Responde apenas a estímulos dolorosos" },
  { value: "3", label: "Levemente limitada", description: "Responde a comandos verbais" },
  { value: "4", label: "Nenhuma limitação", description: "Responde a comandos verbais normalmente" },
];

const MOISTURE = [
  { value: "1", label: "Constantemente úmida", description: "Pele constantemente úmida" },
  { value: "2", label: "Muito úmida", description: "Pele frequentemente úmida" },
  { value: "3", label: "Ocasionalmente úmida", description: "Pele ocasionalmente úmida" },
  { value: "4", label: "Raramente úmida", description: "Pele geralmente seca" },
];

const ACTIVITY = [
  { value: "1", label: "Acamado", description: "Confinado ao leito" },
  { value: "2", label: "Confinado à cadeira", description: "Capacidade de andar limitada" },
  { value: "3", label: "Caminha ocasionalmente", description: "Caminha durante o dia" },
  { value: "4", label: "Caminha frequentemente", description: "Caminha fora do quarto 2x/dia" },
];

const MOBILITY = [
  { value: "1", label: "Completamente imóvel", description: "Não faz mudanças de posição" },
  { value: "2", label: "Muito limitada", description: "Mudanças ocasionais de posição" },
  { value: "3", label: "Levemente limitada", description: "Mudanças frequentes de posição" },
  { value: "4", label: "Sem limitações", description: "Faz mudanças frequentes sem ajuda" },
];

const NUTRITION = [
  { value: "1", label: "Muito pobre", description: "Nunca come refeição completa" },
  { value: "2", label: "Provavelmente inadequada", description: "Raramente come refeição completa" },
  { value: "3", label: "Adequada", description: "Come mais da metade das refeições" },
  { value: "4", label: "Excelente", description: "Come a maior parte das refeições" },
];

const FRICTION = [
  { value: "1", label: "Problema", description: "Requer ajuda máxima para mover-se" },
  { value: "2", label: "Problema potencial", description: "Move-se com dificuldade" },
  { value: "3", label: "Sem problema aparente", description: "Move-se independentemente" },
];

export function BradenCalculator() {
  const [sensory, setSensory] = useState<string>("");
  const [moisture, setMoisture] = useState<string>("");
  const [activity, setActivity] = useState<string>("");
  const [mobility, setMobility] = useState<string>("");
  const [nutrition, setNutrition] = useState<string>("");
  const [friction, setFriction] = useState<string>("");

  const total = 
    (parseInt(sensory) || 0) + 
    (parseInt(moisture) || 0) + 
    (parseInt(activity) || 0) + 
    (parseInt(mobility) || 0) + 
    (parseInt(nutrition) || 0) + 
    (parseInt(friction) || 0);

  const getClassification = () => {
    if (!sensory || !moisture || !activity || !mobility || !nutrition || !friction) return null;
    if (total <= 9) return { label: "Risco muito alto", color: "bg-red-600", description: "Avaliar diariamente" };
    if (total <= 12) return { label: "Risco alto", color: "bg-red-500", description: "Mudança decúbito 2/2h" };
    if (total <= 14) return { label: "Risco moderado", color: "bg-yellow-500", description: "Mudança decúbito 3/3h" };
    if (total <= 18) return { label: "Baixo risco", color: "bg-green-500", description: "Prevenção padrão" };
    return { label: "Sem risco", color: "bg-blue-500", description: "Manter cuidados gerais" };
  };

  const classification = getClassification();

  const renderSection = (
    title: string,
    value: string,
    onChange: (v: string) => void,
    options: typeof SENSORY_PERCEPTION
  ) => (
    <div className="space-y-3">
      <Label className="text-base font-semibold">{title}</Label>
      <RadioGroup value={value} onValueChange={onChange} className="space-y-2">
        {options.map((item) => (
          <label
            key={item.value}
            className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
              value === item.value ? "border-primary bg-primary/5" : "hover:bg-muted"
            }`}
          >
            <RadioGroupItem value={item.value} />
            <div className="flex-1">
              <span className="font-medium">{item.value} - {item.label}</span>
              <p className="text-xs text-muted-foreground">{item.description}</p>
            </div>
          </label>
        ))}
      </RadioGroup>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 text-primary" />
          <CardTitle>Escala de Braden</CardTitle>
        </div>
        <CardDescription>Risco de lesão por pressão</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Resultado */}
        <div className="p-4 bg-muted rounded-lg text-center">
          <p className="text-sm text-muted-foreground mb-1">Pontuação Total</p>
          <p className="text-4xl font-bold text-primary">{total || "-"}/23</p>
          {classification && (
            <Badge className={`mt-2 ${classification.color}`}>
              {classification.label} - {classification.description}
            </Badge>
          )}
        </div>

        {renderSection("Percepção Sensorial", sensory, setSensory, SENSORY_PERCEPTION)}
        {renderSection("Umidade", moisture, setMoisture, MOISTURE)}
        {renderSection("Atividade", activity, setActivity, ACTIVITY)}
        {renderSection("Mobilidade", mobility, setMobility, MOBILITY)}
        {renderSection("Nutrição", nutrition, setNutrition, NUTRITION)}
        {renderSection("Fricção e Cisalhamento", friction, setFriction, FRICTION)}
      </CardContent>
    </Card>
  );
}
