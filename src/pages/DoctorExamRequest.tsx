import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search, Plus, Trash2, FileText, Send, Beaker, Heart, Brain, Bone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const EXAMPLE_PATIENTS = [
  { id: 'ex-1', name: 'Maria Silva Santos', bed: '101-A' },
  { id: 'ex-2', name: 'João Carlos Oliveira', bed: '102-B' },
  { id: 'ex-3', name: 'Ana Paula Costa', bed: '103-A' },
  { id: 'ex-4', name: 'Pedro Henrique Souza', bed: '104-B' },
  { id: 'ex-5', name: 'Carla Fernandes Lima', bed: '105-A' },
];

const EXAM_CATEGORIES = [
  {
    name: 'Laboratoriais',
    icon: Beaker,
    exams: [
      { code: 'HMG', name: 'Hemograma Completo', preparation: 'Jejum 4h' },
      { code: 'GLI', name: 'Glicemia de Jejum', preparation: 'Jejum 8-12h' },
      { code: 'CREA', name: 'Creatinina', preparation: 'Jejum 4h' },
      { code: 'UR', name: 'Ureia', preparation: 'Jejum 4h' },
      { code: 'TGO', name: 'TGO (AST)', preparation: 'Jejum 4h' },
      { code: 'TGP', name: 'TGP (ALT)', preparation: 'Jejum 4h' },
      { code: 'TSH', name: 'TSH', preparation: 'Jejum 4h' },
      { code: 'T4L', name: 'T4 Livre', preparation: 'Jejum 4h' },
      { code: 'COAG', name: 'Coagulograma', preparation: 'Jejum 4h' },
      { code: 'EAS', name: 'Urina Tipo 1 (EAS)', preparation: 'Jato médio' },
      { code: 'HEMO', name: 'Hemocultura', preparation: 'Coleta asséptica' },
      { code: 'PCR', name: 'Proteína C Reativa', preparation: 'Jejum 4h' },
    ]
  },
  {
    name: 'Cardiológicos',
    icon: Heart,
    exams: [
      { code: 'ECG', name: 'Eletrocardiograma', preparation: 'Nenhuma' },
      { code: 'ECOCG', name: 'Ecocardiograma', preparation: 'Nenhuma' },
      { code: 'HOLTER', name: 'Holter 24h', preparation: 'Nenhuma' },
      { code: 'MAPA', name: 'MAPA 24h', preparation: 'Nenhuma' },
      { code: 'TESTE', name: 'Teste Ergométrico', preparation: 'Jejum leve' },
    ]
  },
  {
    name: 'Imagem',
    icon: Bone,
    exams: [
      { code: 'RXT', name: 'Raio-X Tórax', preparation: 'Nenhuma' },
      { code: 'RXAB', name: 'Raio-X Abdome', preparation: 'Nenhuma' },
      { code: 'USAB', name: 'Ultrassom Abdome Total', preparation: 'Jejum 6h' },
      { code: 'TCCRN', name: 'TC Crânio', preparation: 'Verificar alergia contraste' },
      { code: 'TCTX', name: 'TC Tórax', preparation: 'Verificar alergia contraste' },
      { code: 'TCAB', name: 'TC Abdome', preparation: 'Jejum, verificar contraste' },
      { code: 'RMMCRN', name: 'RM Crânio', preparation: 'Verificar próteses metálicas' },
    ]
  },
  {
    name: 'Neurológicos',
    icon: Brain,
    exams: [
      { code: 'EEG', name: 'Eletroencefalograma', preparation: 'Cabelo lavado, seco' },
      { code: 'ENMG', name: 'Eletroneuromiografia', preparation: 'Nenhuma' },
      { code: 'DOPPLER', name: 'Doppler Carotídeas', preparation: 'Nenhuma' },
    ]
  },
];

interface SelectedExam {
  code: string;
  name: string;
  preparation: string;
  urgent: boolean;
  notes: string;
}

export const DoctorExamRequest = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedPatient, setSelectedPatient] = useState('');
  const [selectedExams, setSelectedExams] = useState<SelectedExam[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [clinicalIndication, setClinicalIndication] = useState('');
  const [activeCategory, setActiveCategory] = useState('Laboratoriais');

  const toggleExam = (exam: { code: string; name: string; preparation: string }) => {
    const exists = selectedExams.find(e => e.code === exam.code);
    if (exists) {
      setSelectedExams(selectedExams.filter(e => e.code !== exam.code));
    } else {
      setSelectedExams([...selectedExams, { ...exam, urgent: false, notes: '' }]);
    }
  };

  const toggleUrgent = (code: string) => {
    setSelectedExams(selectedExams.map(e => 
      e.code === code ? { ...e, urgent: !e.urgent } : e
    ));
  };

  const removeExam = (code: string) => {
    setSelectedExams(selectedExams.filter(e => e.code !== code));
  };

  const sendRequest = () => {
    if (!selectedPatient) {
      toast({ variant: "destructive", title: "Selecione um paciente" });
      return;
    }
    if (selectedExams.length === 0) {
      toast({ variant: "destructive", title: "Selecione pelo menos um exame" });
      return;
    }
    if (!clinicalIndication) {
      toast({ variant: "destructive", title: "Informe a indicação clínica" });
      return;
    }

    toast({
      title: "Solicitação enviada!",
      description: `${selectedExams.length} exame(s) solicitado(s) com sucesso`
    });
  };

  const filteredExams = EXAM_CATEGORIES.find(c => c.name === activeCategory)?.exams.filter(
    exam => exam.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            exam.code.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <Layout title="Solicitação de Exames">
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/medico-dashboard')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">Solicitação de Exames</h1>
            <p className="text-muted-foreground">Solicitar exames para o paciente</p>
          </div>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            Exemplo
          </Badge>
        </div>

        {/* Paciente */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Paciente</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedPatient} onValueChange={setSelectedPatient}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o paciente" />
              </SelectTrigger>
              <SelectContent>
                {EXAMPLE_PATIENTS.map((patient) => (
                  <SelectItem key={patient.id} value={patient.id}>
                    {patient.name} - Leito {patient.bed}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Busca e Categorias */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Selecionar Exames</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar exame..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Categorias */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {EXAM_CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                return (
                  <Button
                    key={cat.name}
                    variant={activeCategory === cat.name ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setActiveCategory(cat.name)}
                    className="whitespace-nowrap"
                  >
                    <Icon className="h-4 w-4 mr-1" />
                    {cat.name}
                  </Button>
                );
              })}
            </div>

            {/* Lista de Exames */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[300px] overflow-y-auto">
              {filteredExams.map((exam) => {
                const isSelected = selectedExams.some(e => e.code === exam.code);
                return (
                  <div
                    key={exam.code}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      isSelected ? 'bg-primary/10 border-primary' : 'hover:bg-muted'
                    }`}
                    onClick={() => toggleExam(exam)}
                  >
                    <div className="flex items-center gap-2">
                      <Checkbox checked={isSelected} />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{exam.name}</p>
                        <p className="text-xs text-muted-foreground">{exam.code} • {exam.preparation}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Exames Selecionados */}
        {selectedExams.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Exames Selecionados ({selectedExams.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {selectedExams.map((exam) => (
                <div key={exam.code} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{exam.name}</span>
                      {exam.urgent && (
                        <Badge variant="destructive" className="text-xs">URGENTE</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{exam.preparation}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant={exam.urgent ? 'destructive' : 'outline'}
                      size="sm"
                      onClick={() => toggleUrgent(exam.code)}
                    >
                      Urgente
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeExam(exam.code)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Indicação Clínica */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Indicação Clínica</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Descreva a indicação clínica para os exames solicitados..."
              value={clinicalIndication}
              onChange={(e) => setClinicalIndication(e.target.value)}
              rows={3}
            />
          </CardContent>
        </Card>

        {/* Ações */}
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1">
            <FileText className="h-4 w-4 mr-2" />
            Pré-visualizar
          </Button>
          <Button className="flex-1" onClick={sendRequest}>
            <Send className="h-4 w-4 mr-2" />
            Enviar Solicitação
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default DoctorExamRequest;
