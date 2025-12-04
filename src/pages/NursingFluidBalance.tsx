import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Droplets, ArrowUp, ArrowDown, User, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const EXAMPLE_PATIENTS = [
  { id: 'ex-1', name: 'Maria Silva Santos', bed: '101-A' },
  { id: 'ex-2', name: 'João Carlos Oliveira', bed: '102-B' },
  { id: 'ex-3', name: 'Ana Paula Costa', bed: '103-A' },
];

const INTAKE_TYPES = [
  'SF 0,9% EV',
  'SG 5% EV',
  'Ringer Lactato EV',
  'Dieta Enteral',
  'Dieta VO',
  'Água VO',
  'Medicação EV',
  'Hemoderivados',
  'Outros'
];

const OUTPUT_TYPES = [
  'Diurese espontânea',
  'Diurese SVD',
  'Evacuação',
  'Vômito',
  'Drenagem gástrica',
  'Drenagem torácica',
  'Drenagem abdominal',
  'Perdas insensíveis',
  'Outros'
];

interface BalanceEntry {
  id: string;
  time: string;
  type: 'intake' | 'output';
  category: string;
  volume: number;
  notes: string;
}

export const NursingFluidBalance = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedPatient, setSelectedPatient] = useState('ex-1');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [entryType, setEntryType] = useState<'intake' | 'output'>('intake');
  
  const [entries, setEntries] = useState<BalanceEntry[]>([
    { id: '1', time: '06:00', type: 'intake', category: 'SF 0,9% EV', volume: 500, notes: '' },
    { id: '2', time: '06:30', type: 'output', category: 'Diurese SVD', volume: 300, notes: 'Urina clara' },
    { id: '3', time: '08:00', type: 'intake', category: 'Dieta VO', volume: 200, notes: 'Café da manhã' },
    { id: '4', time: '10:00', type: 'intake', category: 'Medicação EV', volume: 100, notes: 'ATB' },
    { id: '5', time: '10:30', type: 'output', category: 'Diurese SVD', volume: 250, notes: '' },
    { id: '6', time: '12:00', type: 'intake', category: 'Dieta VO', volume: 350, notes: 'Almoço' },
    { id: '7', time: '14:00', type: 'output', category: 'Diurese SVD', volume: 400, notes: '' },
  ]);

  const [newEntry, setNewEntry] = useState({
    category: '',
    volume: '',
    notes: ''
  });

  const totalIntake = entries.filter(e => e.type === 'intake').reduce((sum, e) => sum + e.volume, 0);
  const totalOutput = entries.filter(e => e.type === 'output').reduce((sum, e) => sum + e.volume, 0);
  const balance = totalIntake - totalOutput;

  const addEntry = () => {
    if (!newEntry.category || !newEntry.volume) {
      toast({ variant: "destructive", title: "Preencha categoria e volume" });
      return;
    }

    const entry: BalanceEntry = {
      id: Date.now().toString(),
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      type: entryType,
      category: newEntry.category,
      volume: parseInt(newEntry.volume),
      notes: newEntry.notes
    };

    setEntries([entry, ...entries]);
    setNewEntry({ category: '', volume: '', notes: '' });
    setDialogOpen(false);
    
    toast({
      title: entryType === 'intake' ? 'Ganho registrado' : 'Perda registrada',
      description: `${newEntry.volume}ml de ${newEntry.category}`
    });
  };

  const patient = EXAMPLE_PATIENTS.find(p => p.id === selectedPatient);

  return (
    <Layout title="Balanço Hídrico">
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/nursing')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">Balanço Hídrico</h1>
            <p className="text-muted-foreground">Controle de ganhos e perdas</p>
          </div>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            Exemplo
          </Badge>
        </div>

        {/* Seleção de Paciente */}
        <Card>
          <CardContent className="p-4">
            <Select value={selectedPatient} onValueChange={setSelectedPatient}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o paciente" />
              </SelectTrigger>
              <SelectContent>
                {EXAMPLE_PATIENTS.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name} - Leito {p.bed}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Resumo do Balanço */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-3 text-center">
              <ArrowUp className="h-5 w-5 text-green-600 mx-auto mb-1" />
              <p className="text-xl font-bold text-green-700">{totalIntake}</p>
              <p className="text-xs text-green-600">ml Ganhos</p>
            </CardContent>
          </Card>
          <Card className="bg-red-50 border-red-200">
            <CardContent className="p-3 text-center">
              <ArrowDown className="h-5 w-5 text-red-600 mx-auto mb-1" />
              <p className="text-xl font-bold text-red-700">{totalOutput}</p>
              <p className="text-xs text-red-600">ml Perdas</p>
            </CardContent>
          </Card>
          <Card className={balance >= 0 ? 'bg-blue-50 border-blue-200' : 'bg-amber-50 border-amber-200'}>
            <CardContent className="p-3 text-center">
              <Droplets className={`h-5 w-5 mx-auto mb-1 ${balance >= 0 ? 'text-blue-600' : 'text-amber-600'}`} />
              <p className={`text-xl font-bold ${balance >= 0 ? 'text-blue-700' : 'text-amber-700'}`}>
                {balance >= 0 ? '+' : ''}{balance}
              </p>
              <p className={`text-xs ${balance >= 0 ? 'text-blue-600' : 'text-amber-600'}`}>ml Balanço</p>
            </CardContent>
          </Card>
        </div>

        {/* Botões de Registro */}
        <div className="grid grid-cols-2 gap-3">
          <Dialog open={dialogOpen && entryType === 'intake'} onOpenChange={(open) => { setDialogOpen(open); if (open) setEntryType('intake'); }}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="h-4 w-4 mr-2" />
                Registrar Ganho
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <ArrowUp className="h-5 w-5 text-green-600" />
                  Registrar Ganho
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Tipo</Label>
                  <Select value={newEntry.category} onValueChange={(v) => setNewEntry({ ...newEntry, category: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {INTAKE_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Volume (ml)</Label>
                  <Input
                    type="number"
                    placeholder="Ex: 500"
                    value={newEntry.volume}
                    onChange={(e) => setNewEntry({ ...newEntry, volume: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Observações</Label>
                  <Input
                    placeholder="Observações..."
                    value={newEntry.notes}
                    onChange={(e) => setNewEntry({ ...newEntry, notes: e.target.value })}
                  />
                </div>
                <Button className="w-full bg-green-600 hover:bg-green-700" onClick={addEntry}>
                  Registrar Ganho
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={dialogOpen && entryType === 'output'} onOpenChange={(open) => { setDialogOpen(open); if (open) setEntryType('output'); }}>
            <DialogTrigger asChild>
              <Button variant="destructive">
                <Plus className="h-4 w-4 mr-2" />
                Registrar Perda
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <ArrowDown className="h-5 w-5 text-red-600" />
                  Registrar Perda
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Tipo</Label>
                  <Select value={newEntry.category} onValueChange={(v) => setNewEntry({ ...newEntry, category: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {OUTPUT_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Volume (ml)</Label>
                  <Input
                    type="number"
                    placeholder="Ex: 300"
                    value={newEntry.volume}
                    onChange={(e) => setNewEntry({ ...newEntry, volume: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Observações</Label>
                  <Input
                    placeholder="Ex: Urina clara"
                    value={newEntry.notes}
                    onChange={(e) => setNewEntry({ ...newEntry, notes: e.target.value })}
                  />
                </div>
                <Button variant="destructive" className="w-full" onClick={addEntry}>
                  Registrar Perda
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Histórico */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Registros do Dia</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {entries.map((entry) => (
              <div 
                key={entry.id} 
                className={`flex items-center justify-between p-3 rounded-lg ${
                  entry.type === 'intake' ? 'bg-green-50' : 'bg-red-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${
                    entry.type === 'intake' ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    {entry.type === 'intake' ? (
                      <ArrowUp className="h-4 w-4 text-green-600" />
                    ) : (
                      <ArrowDown className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{entry.category}</p>
                    {entry.notes && (
                      <p className="text-xs text-muted-foreground">{entry.notes}</p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${
                    entry.type === 'intake' ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {entry.type === 'intake' ? '+' : '-'}{entry.volume}ml
                  </p>
                  <p className="text-xs text-muted-foreground flex items-center justify-end gap-1">
                    <Clock className="h-3 w-3" />
                    {entry.time}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default NursingFluidBalance;
