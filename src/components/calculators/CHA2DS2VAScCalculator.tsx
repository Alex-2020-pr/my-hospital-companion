import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Heart } from "lucide-react";

const CRITERIA = [
  { id: "chf", label: "ICC / Disfunção VE", description: "Insuficiência cardíaca congestiva ou disfunção ventricular esquerda", points: 1 },
  { id: "hypertension", label: "Hipertensão", description: "Hipertensão arterial sistêmica", points: 1 },
  { id: "age75", label: "Idade ≥ 75 anos", description: "75 anos ou mais", points: 2 },
  { id: "diabetes", label: "Diabetes Mellitus", description: "Diabetes mellitus tipo 1 ou 2", points: 1 },
  { id: "stroke", label: "AVC / AIT / Tromboembolismo", description: "História de AVC, AIT ou tromboembolismo", points: 2 },
  { id: "vascular", label: "Doença vascular", description: "IAM prévio, doença arterial periférica ou placa aórtica", points: 1 },
  { id: "age65", label: "Idade 65-74 anos", description: "Entre 65 e 74 anos", points: 1 },
];

const STROKE_RISK = [
  { score: 0, risk: "0%", recommendation: "Considerar não anticoagular" },
  { score: 1, risk: "1.3%", recommendation: "Considerar anticoagulação oral" },
  { score: 2, risk: "2.2%", recommendation: "Anticoagulação oral recomendada" },
  { score: 3, risk: "3.2%", recommendation: "Anticoagulação oral recomendada" },
  { score: 4, risk: "4.0%", recommendation: "Anticoagulação oral recomendada" },
  { score: 5, risk: "6.7%", recommendation: "Anticoagulação oral recomendada" },
  { score: 6, risk: "9.8%", recommendation: "Anticoagulação oral recomendada" },
  { score: 7, risk: "9.6%", recommendation: "Anticoagulação oral recomendada" },
  { score: 8, risk: "6.7%", recommendation: "Anticoagulação oral recomendada" },
  { score: 9, risk: "15.2%", recommendation: "Anticoagulação oral recomendada" },
];

export function CHA2DS2VAScCalculator() {
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [sex, setSex] = useState<string>("");

  const handleCheck = (id: string, checked: boolean) => {
    setSelected(prev => ({ ...prev, [id]: checked }));
  };

  const calculateScore = () => {
    let total = 0;
    CRITERIA.forEach(c => {
      if (selected[c.id]) total += c.points;
    });
    if (sex === "female") total += 1;
    return total;
  };

  const score = calculateScore();
  const riskData = STROKE_RISK[Math.min(score, 9)];

  const getScoreColor = () => {
    if (score === 0) return "bg-green-500";
    if (score === 1) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-primary" />
          <CardTitle>CHA₂DS₂-VASc</CardTitle>
        </div>
        <CardDescription>Risco de AVC em Fibrilação Atrial</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Resultado */}
        <div className="p-4 bg-muted rounded-lg text-center">
          <p className="text-sm text-muted-foreground mb-1">Pontuação Total</p>
          <p className="text-4xl font-bold text-primary">{score}/9</p>
          <Badge className={`mt-2 ${getScoreColor()}`}>
            Risco anual de AVC: {riskData.risk}
          </Badge>
          <p className="text-sm mt-2 font-medium">{riskData.recommendation}</p>
        </div>

        {/* Sexo */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">Sexo (Sc)</Label>
          <RadioGroup value={sex} onValueChange={setSex} className="flex gap-4">
            <label
              className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors flex-1 ${
                sex === "male" ? "border-primary bg-primary/5" : "hover:bg-muted"
              }`}
            >
              <RadioGroupItem value="male" />
              <span className="font-medium">Masculino (0 pts)</span>
            </label>
            <label
              className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors flex-1 ${
                sex === "female" ? "border-primary bg-primary/5" : "hover:bg-muted"
              }`}
            >
              <RadioGroupItem value="female" />
              <span className="font-medium">Feminino (+1 pt)</span>
            </label>
          </RadioGroup>
        </div>

        {/* Critérios */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">Fatores de Risco</Label>
          <div className="space-y-2">
            {CRITERIA.map((criterion) => (
              <label
                key={criterion.id}
                className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  selected[criterion.id] ? "border-primary bg-primary/5" : "hover:bg-muted"
                }`}
              >
                <Checkbox
                  checked={selected[criterion.id] || false}
                  onCheckedChange={(checked) => handleCheck(criterion.id, checked as boolean)}
                  className="mt-0.5"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{criterion.label}</span>
                    <Badge variant="outline">+{criterion.points} pt{criterion.points > 1 ? "s" : ""}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{criterion.description}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Legenda */}
        <div className="p-3 bg-muted/50 rounded-lg text-xs text-muted-foreground">
          <p className="font-semibold mb-1">Legenda:</p>
          <ul className="list-disc list-inside space-y-0.5">
            <li><strong>C</strong> - Congestive heart failure (ICC)</li>
            <li><strong>H</strong> - Hypertension (Hipertensão)</li>
            <li><strong>A₂</strong> - Age ≥75 (Idade ≥75 - 2 pontos)</li>
            <li><strong>D</strong> - Diabetes mellitus</li>
            <li><strong>S₂</strong> - Stroke/TIA (AVC/AIT - 2 pontos)</li>
            <li><strong>V</strong> - Vascular disease (Doença vascular)</li>
            <li><strong>A</strong> - Age 65-74 (Idade 65-74)</li>
            <li><strong>Sc</strong> - Sex category (Sexo feminino)</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
