import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Brain } from "lucide-react";

const EYE_RESPONSES = [
  { value: "4", label: "Espontânea", description: "Abre os olhos espontaneamente" },
  { value: "3", label: "Ao comando verbal", description: "Abre os olhos ao estímulo verbal" },
  { value: "2", label: "À dor", description: "Abre os olhos ao estímulo doloroso" },
  { value: "1", label: "Nenhuma", description: "Não abre os olhos" },
];

const VERBAL_RESPONSES = [
  { value: "5", label: "Orientada", description: "Resposta orientada e adequada" },
  { value: "4", label: "Confusa", description: "Resposta confusa, desorientada" },
  { value: "3", label: "Palavras inapropriadas", description: "Palavras desconexas" },
  { value: "2", label: "Sons incompreensíveis", description: "Sons ininteligíveis" },
  { value: "1", label: "Nenhuma", description: "Sem resposta verbal" },
];

const MOTOR_RESPONSES = [
  { value: "6", label: "Obedece comandos", description: "Obedece comandos verbais" },
  { value: "5", label: "Localiza dor", description: "Localiza estímulo doloroso" },
  { value: "4", label: "Retirada à dor", description: "Retira membro ao estímulo" },
  { value: "3", label: "Flexão anormal", description: "Decorticação" },
  { value: "2", label: "Extensão anormal", description: "Descerebração" },
  { value: "1", label: "Nenhuma", description: "Sem resposta motora" },
];

export function GlasgowCalculator() {
  const [eye, setEye] = useState<string>("");
  const [verbal, setVerbal] = useState<string>("");
  const [motor, setMotor] = useState<string>("");

  const total = (parseInt(eye) || 0) + (parseInt(verbal) || 0) + (parseInt(motor) || 0);

  const getClassification = () => {
    if (!eye || !verbal || !motor) return null;
    if (total >= 13) return { label: "Leve", color: "bg-green-500", description: "TCE leve" };
    if (total >= 9) return { label: "Moderado", color: "bg-yellow-500", description: "TCE moderado" };
    return { label: "Grave", color: "bg-red-500", description: "TCE grave - considerar IOT" };
  };

  const classification = getClassification();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          <CardTitle>Escala de Coma de Glasgow</CardTitle>
        </div>
        <CardDescription>Avaliação do nível de consciência</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Resultado */}
        <div className="p-4 bg-muted rounded-lg text-center">
          <p className="text-sm text-muted-foreground mb-1">Pontuação Total</p>
          <p className="text-4xl font-bold text-primary">{total || "-"}/15</p>
          {classification && (
            <Badge className={`mt-2 ${classification.color}`}>
              {classification.label} - {classification.description}
            </Badge>
          )}
        </div>

        {/* Abertura Ocular */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">Abertura Ocular (O)</Label>
          <RadioGroup value={eye} onValueChange={setEye} className="space-y-2">
            {EYE_RESPONSES.map((item) => (
              <label
                key={item.value}
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  eye === item.value ? "border-primary bg-primary/5" : "hover:bg-muted"
                }`}
              >
                <RadioGroupItem value={item.value} />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{item.value} - {item.label}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>
              </label>
            ))}
          </RadioGroup>
        </div>

        {/* Resposta Verbal */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">Resposta Verbal (V)</Label>
          <RadioGroup value={verbal} onValueChange={setVerbal} className="space-y-2">
            {VERBAL_RESPONSES.map((item) => (
              <label
                key={item.value}
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  verbal === item.value ? "border-primary bg-primary/5" : "hover:bg-muted"
                }`}
              >
                <RadioGroupItem value={item.value} />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{item.value} - {item.label}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>
              </label>
            ))}
          </RadioGroup>
        </div>

        {/* Resposta Motora */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">Resposta Motora (M)</Label>
          <RadioGroup value={motor} onValueChange={setMotor} className="space-y-2">
            {MOTOR_RESPONSES.map((item) => (
              <label
                key={item.value}
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  motor === item.value ? "border-primary bg-primary/5" : "hover:bg-muted"
                }`}
              >
                <RadioGroupItem value={item.value} />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{item.value} - {item.label}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>
              </label>
            ))}
          </RadioGroup>
        </div>
      </CardContent>
    </Card>
  );
}
