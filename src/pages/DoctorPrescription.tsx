import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Pill, Clock, AlertTriangle, Trash2, FileText, Printer, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const EXAMPLE_PATIENTS = [
  { id: 'ex-1', name: 'Maria Silva Santos', bed: '101-A' },
  { id: 'ex-2', name: 'João Carlos Oliveira', bed: '102-B' },
  { id: 'ex-3', name: 'Ana Paula Costa', bed: '103-A' },
  { id: 'ex-4', name: 'Pedro Henrique Souza', bed: '104-B' },
  { id: 'ex-5', name: 'Carla Fernandes Lima', bed: '105-A' },
];

const MEDICATIONS_DB = [
  { name: 'Dipirona', presentations: ['500mg comprimido', '1g/2ml ampola', '500mg/ml gotas'] },
  { name: 'Omeprazol', presentations: ['20mg cápsula', '40mg frasco-ampola'] },
  { name: 'Losartana', presentations: ['50mg comprimido', '100mg comprimido'] },
  { name: 'Metformina', presentations: ['500mg comprimido', '850mg comprimido'] },
  { name: 'Enoxaparina', presentations: ['40mg/0,4ml seringa', '60mg/0,6ml seringa'] },
  { name: 'Ceftriaxona', presentations: ['1g frasco-ampola'] },
  { name: 'Amoxicilina', presentations: ['500mg cápsula', '875mg comprimido'] },
  { name: 'Paracetamol', presentations: ['500mg comprimido', '750mg comprimido', '200mg/ml gotas'] },
];

interface PrescriptionItem {
  id: string;
  medication: string;
  presentation: string;
  dose: string;
  route: string;
  frequency: string;
  duration: string;
  instructions: string;
}

export const DoctorPrescription = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedPatient, setSelectedPatient] = useState<string>('');
  const [prescriptionItems, setPrescriptionItems] = useState<PrescriptionItem[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchMed, setSearchMed] = useState('');
  
  const [newItem, setNewItem] = useState({
    medication: '',
    presentation: '',
    dose: '',
    route: 'VO',
    frequency: '',
    duration: '',
    instructions: ''
  });

  const routes = [
    { value: 'VO', label: 'Via Oral' },
    { value: 'EV', label: 'Endovenosa' },
    { value: 'IM', label: 'Intramuscular' },
    { value: 'SC', label: 'Subcutânea' },
    { value: 'SL', label: 'Sublingual' },
    { value: 'TD', label: 'Transdérmica' },
    { value: 'Inalatória', label: 'Inalatória' },
    { value: 'Retal', label: 'Retal' },
  ];

  const frequencies = [
    '1x ao dia', '2x ao dia', '3x ao dia', '4x ao dia',
    '6/6h', '8/8h', '12/12h', 'SOS', 'Dose única'
  ];

  const filteredMeds = MEDICATIONS_DB.filter(med => 
    med.name.toLowerCase().includes(searchMed.toLowerCase())
  );

  const addMedication = () => {
    if (!newItem.medication || !newItem.dose || !newItem.frequency) {
      toast({
        variant: "destructive",
        title: "Campos obrigatórios",
        description: "Preencha medicamento, dose e frequência"
      });
      return;
    }

    setPrescriptionItems([...prescriptionItems, {
      id: Date.now().toString(),
      ...newItem
    }]);

    setNewItem({
      medication: '',
      presentation: '',
      dose: '',
      route: 'VO',
      frequency: '',
      duration: '',
      instructions: ''
    });
    setSearchMed('');
    setDialogOpen(false);

    toast({
      title: "Medicamento adicionado",
      description: `${newItem.medication} adicionado à prescrição`
    });
  };

  const removeMedication = (id: string) => {
    setPrescriptionItems(prescriptionItems.filter(item => item.id !== id));
  };

  const savePrescription = () => {
    if (!selectedPatient) {
      toast({
        variant: "destructive",
        title: "Selecione um paciente",
        description: "É necessário selecionar um paciente para salvar a prescrição"
      });
      return;
    }

    if (prescriptionItems.length === 0) {
      toast({
        variant: "destructive",
        title: "Prescrição vazia",
        description: "Adicione pelo menos um medicamento"
      });
      return;
    }

    toast({
      title: "Prescrição salva!",
      description: "A prescrição foi enviada para a farmácia"
    });
  };

  return (
    <Layout title="Prescrição Digital">
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/medico-dashboard')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">Prescrição Digital</h1>
            <p className="text-muted-foreground">Nova prescrição médica</p>
          </div>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            Exemplo
          </Badge>
        </div>

        {/* Seleção de Paciente */}
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

        {/* Lista de Medicamentos */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Medicamentos</CardTitle>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Adicionar
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Adicionar Medicamento</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  {/* Busca de Medicamento */}
                  <div>
                    <Label>Medicamento *</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar medicamento..."
                        value={searchMed}
                        onChange={(e) => setSearchMed(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    {searchMed && (
                      <div className="mt-2 border rounded-lg max-h-32 overflow-y-auto">
                        {filteredMeds.map((med) => (
                          <button
                            key={med.name}
                            className="w-full p-2 text-left hover:bg-muted text-sm"
                            onClick={() => {
                              setNewItem({ ...newItem, medication: med.name });
                              setSearchMed('');
                            }}
                          >
                            {med.name}
                          </button>
                        ))}
                      </div>
                    )}
                    {newItem.medication && (
                      <Badge className="mt-2">{newItem.medication}</Badge>
                    )}
                  </div>

                  {/* Apresentação */}
                  {newItem.medication && (
                    <div>
                      <Label>Apresentação</Label>
                      <Select 
                        value={newItem.presentation} 
                        onValueChange={(v) => setNewItem({ ...newItem, presentation: v })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          {MEDICATIONS_DB.find(m => m.name === newItem.medication)?.presentations.map((p) => (
                            <SelectItem key={p} value={p}>{p}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Dose e Via */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Dose *</Label>
                      <Input
                        placeholder="Ex: 1 comprimido"
                        value={newItem.dose}
                        onChange={(e) => setNewItem({ ...newItem, dose: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Via</Label>
                      <Select 
                        value={newItem.route} 
                        onValueChange={(v) => setNewItem({ ...newItem, route: v })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {routes.map((r) => (
                            <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Frequência e Duração */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Frequência *</Label>
                      <Select 
                        value={newItem.frequency} 
                        onValueChange={(v) => setNewItem({ ...newItem, frequency: v })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          {frequencies.map((f) => (
                            <SelectItem key={f} value={f}>{f}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Duração</Label>
                      <Input
                        placeholder="Ex: 7 dias"
                        value={newItem.duration}
                        onChange={(e) => setNewItem({ ...newItem, duration: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Instruções */}
                  <div>
                    <Label>Instruções especiais</Label>
                    <Textarea
                      placeholder="Ex: Tomar após as refeições"
                      value={newItem.instructions}
                      onChange={(e) => setNewItem({ ...newItem, instructions: e.target.value })}
                    />
                  </div>

                  <Button className="w-full" onClick={addMedication}>
                    Adicionar à Prescrição
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {prescriptionItems.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Pill className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Nenhum medicamento adicionado</p>
                <p className="text-sm">Clique em "Adicionar" para incluir medicamentos</p>
              </div>
            ) : (
              <div className="space-y-3">
                {prescriptionItems.map((item, index) => (
                  <div key={item.id} className="p-3 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm text-muted-foreground">{index + 1}.</span>
                          <span className="font-semibold">{item.medication}</span>
                          {item.presentation && (
                            <Badge variant="outline" className="text-xs">{item.presentation}</Badge>
                          )}
                        </div>
                        <p className="text-sm mt-1">
                          {item.dose} - {item.route} - {item.frequency}
                          {item.duration && ` por ${item.duration}`}
                        </p>
                        {item.instructions && (
                          <p className="text-xs text-muted-foreground mt-1 italic">
                            {item.instructions}
                          </p>
                        )}
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => removeMedication(item.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Ações */}
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1">
            <FileText className="h-4 w-4 mr-2" />
            Pré-visualizar
          </Button>
          <Button variant="outline" className="flex-1">
            <Printer className="h-4 w-4 mr-2" />
            Imprimir
          </Button>
        </div>

        <Button className="w-full" size="lg" onClick={savePrescription}>
          Salvar e Enviar Prescrição
        </Button>
      </div>
    </Layout>
  );
};

export default DoctorPrescription;
