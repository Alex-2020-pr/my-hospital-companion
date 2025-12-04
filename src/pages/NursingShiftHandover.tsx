import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ClipboardList, User, AlertTriangle, CheckCircle2, Clock, Send, Printer } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const PATIENTS_HANDOVER = [
  {
    id: 'ex-1',
    name: 'Maria Silva Santos',
    bed: '101-A',
    diagnosis: 'Pneumonia Comunitária',
    highlights: ['ATB em andamento - Ceftriaxona D3', 'Febre controlada nas últimas 12h', 'Aguardando RX de controle'],
    alerts: ['Alergia a Dipirona'],
    vitalSigns: { pa: '120/80', fc: 82, temp: 36.8, spo2: 96 },
    pendencies: ['Colher hemocultura às 08:00', 'Avaliação fisioterapia'],
    medications: ['Ceftriaxona 1g EV 12/12h', 'Dipirona 1g EV SOS', 'Omeprazol 40mg EV 1x/dia']
  },
  {
    id: 'ex-2',
    name: 'João Carlos Oliveira',
    bed: '102-B',
    diagnosis: 'ICC Descompensada',
    highlights: ['Balanço hídrico negativo -500ml', 'Melhora do padrão respiratório', 'Diurético em bomba'],
    alerts: ['Restrição hídrica 1000ml/dia'],
    vitalSigns: { pa: '130/85', fc: 78, temp: 36.2, spo2: 94 },
    pendencies: ['Repetir BNP amanhã', 'Ajuste diurético conforme diurese'],
    medications: ['Furosemida 10mg/h EV', 'Carvedilol 6.25mg VO 12/12h', 'Espironolactona 25mg VO 1x/dia']
  },
  {
    id: 'ex-3',
    name: 'Ana Paula Costa',
    bed: '103-A',
    diagnosis: 'Pós-op Colecistectomia D1',
    highlights: ['Boa aceitação dieta líquida', 'Sem sinais de sangramento', 'Deambulando com auxílio'],
    alerts: [],
    vitalSigns: { pa: '118/75', fc: 72, temp: 36.5, spo2: 98 },
    pendencies: ['Evoluir dieta se tolerar', 'Alta prevista para amanhã'],
    medications: ['Dipirona 1g EV 6/6h', 'Enoxaparina 40mg SC 1x/dia', 'Ondansetrona 4mg EV SOS']
  },
];

export const NursingShiftHandover = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [generalNotes, setGeneralNotes] = useState('');
  const [selectedPatients, setSelectedPatients] = useState<string[]>(PATIENTS_HANDOVER.map(p => p.id));

  const togglePatient = (id: string) => {
    setSelectedPatients(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const submitHandover = () => {
    toast({
      title: "Passagem de plantão registrada",
      description: "O relatório foi enviado para a equipe do próximo turno"
    });
  };

  return (
    <Layout title="Passagem de Plantão">
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/nursing')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">Passagem de Plantão</h1>
            <p className="text-muted-foreground">Relatório de passagem de turno</p>
          </div>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            Exemplo
          </Badge>
        </div>

        {/* Info do Turno */}
        <Card className="bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-semibold">Turno Diurno</p>
                  <p className="text-sm text-muted-foreground">07:00 - 19:00</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Responsável</p>
                <p className="font-medium">Enf. Maria Silva</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Pacientes */}
        <div className="space-y-4">
          <h2 className="font-semibold text-lg">Pacientes ({PATIENTS_HANDOVER.length})</h2>
          
          {PATIENTS_HANDOVER.map((patient) => (
            <Card key={patient.id} className={selectedPatients.includes(patient.id) ? '' : 'opacity-50'}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Checkbox 
                      checked={selectedPatients.includes(patient.id)}
                      onCheckedChange={() => togglePatient(patient.id)}
                    />
                    <div>
                      <CardTitle className="text-base flex items-center gap-2">
                        <User className="h-4 w-4" />
                        {patient.name}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Leito {patient.bed} • {patient.diagnosis}
                      </p>
                    </div>
                  </div>
                  {patient.alerts.length > 0 && (
                    <Badge variant="destructive" className="flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      Alerta
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Alertas */}
                {patient.alerts.length > 0 && (
                  <div className="p-2 bg-red-50 rounded-lg border border-red-200">
                    {patient.alerts.map((alert, idx) => (
                      <p key={idx} className="text-sm text-red-700 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        {alert}
                      </p>
                    ))}
                  </div>
                )}

                {/* Sinais Vitais */}
                <div className="grid grid-cols-4 gap-2 text-center text-sm">
                  <div className="p-2 bg-muted rounded">
                    <p className="text-xs text-muted-foreground">PA</p>
                    <p className="font-medium">{patient.vitalSigns.pa}</p>
                  </div>
                  <div className="p-2 bg-muted rounded">
                    <p className="text-xs text-muted-foreground">FC</p>
                    <p className="font-medium">{patient.vitalSigns.fc}</p>
                  </div>
                  <div className="p-2 bg-muted rounded">
                    <p className="text-xs text-muted-foreground">Temp</p>
                    <p className="font-medium">{patient.vitalSigns.temp}°C</p>
                  </div>
                  <div className="p-2 bg-muted rounded">
                    <p className="text-xs text-muted-foreground">SpO2</p>
                    <p className="font-medium">{patient.vitalSigns.spo2}%</p>
                  </div>
                </div>

                {/* Destaques */}
                <div>
                  <p className="text-sm font-medium mb-1">Destaques:</p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {patient.highlights.map((h, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="h-3 w-3 text-green-600 mt-1" />
                        {h}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Pendências */}
                {patient.pendencies.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-1">Pendências:</p>
                    <ul className="text-sm space-y-1">
                      {patient.pendencies.map((p, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-amber-700">
                          <Clock className="h-3 w-3 mt-1" />
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Medicações principais */}
                <div>
                  <p className="text-sm font-medium mb-1">Medicações principais:</p>
                  <div className="flex flex-wrap gap-1">
                    {patient.medications.slice(0, 3).map((med, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {med}
                      </Badge>
                    ))}
                    {patient.medications.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{patient.medications.length - 3} mais
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Observações Gerais */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Observações Gerais do Turno</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Informações adicionais sobre o turno, ocorrências especiais, comunicados..."
              value={generalNotes}
              onChange={(e) => setGeneralNotes(e.target.value)}
              rows={4}
            />
          </CardContent>
        </Card>

        {/* Ações */}
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1">
            <Printer className="h-4 w-4 mr-2" />
            Imprimir
          </Button>
          <Button className="flex-1" onClick={submitHandover}>
            <Send className="h-4 w-4 mr-2" />
            Enviar Passagem
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default NursingShiftHandover;
