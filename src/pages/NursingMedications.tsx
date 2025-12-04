import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, AlertTriangle, CheckCircle2, Pill, User, Barcode, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const PENDING_MEDICATIONS = [
  {
    id: '1',
    patient: 'Maria Silva Santos',
    bed: '101-A',
    medication: 'Dipirona 500mg',
    dose: '1 ampola',
    route: 'EV',
    time: '08:00',
    status: 'pending',
    prescriber: 'Dr. Carlos Mendes',
    notes: 'Diluir em 100ml SF'
  },
  {
    id: '2',
    patient: 'João Carlos Oliveira',
    bed: '102-B',
    medication: 'Omeprazol 40mg',
    dose: '1 frasco-ampola',
    route: 'EV',
    time: '08:00',
    status: 'pending',
    prescriber: 'Dra. Ana Paula',
    notes: ''
  },
  {
    id: '3',
    patient: 'Maria Silva Santos',
    bed: '101-A',
    medication: 'Enoxaparina 40mg',
    dose: '1 seringa',
    route: 'SC',
    time: '08:00',
    status: 'pending',
    prescriber: 'Dr. Carlos Mendes',
    notes: 'Aplicar no abdome'
  },
  {
    id: '4',
    patient: 'Pedro Henrique Souza',
    bed: '104-B',
    medication: 'Ceftriaxona 1g',
    dose: '1 frasco-ampola',
    route: 'EV',
    time: '08:00',
    status: 'delayed',
    prescriber: 'Dr. Roberto Lima',
    notes: 'Reconstituir em 10ml AD'
  },
  {
    id: '5',
    patient: 'Ana Paula Costa',
    bed: '103-A',
    medication: 'Metformina 850mg',
    dose: '1 comprimido',
    route: 'VO',
    time: '08:00',
    status: 'pending',
    prescriber: 'Dra. Fernanda Costa',
    notes: 'Após café da manhã'
  },
];

const ADMINISTERED = [
  {
    id: '6',
    patient: 'Carla Fernandes Lima',
    bed: '105-A',
    medication: 'Losartana 50mg',
    dose: '1 comprimido',
    route: 'VO',
    time: '06:00',
    administeredAt: '06:05',
    administeredBy: 'Enf. Maria Silva',
    status: 'administered'
  },
  {
    id: '7',
    patient: 'Maria Silva Santos',
    bed: '101-A',
    medication: 'Captopril 25mg',
    dose: '1 comprimido',
    route: 'VO',
    time: '06:00',
    administeredAt: '06:10',
    administeredBy: 'Enf. Maria Silva',
    status: 'administered'
  },
];

export const NursingMedications = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [medications, setMedications] = useState(PENDING_MEDICATIONS);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedMed, setSelectedMed] = useState<typeof PENDING_MEDICATIONS[0] | null>(null);
  const [observation, setObservation] = useState('');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'delayed': return 'bg-red-100 text-red-700 border-red-200';
      case 'administered': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendente';
      case 'delayed': return 'Atrasado';
      case 'administered': return 'Administrado';
      default: return status;
    }
  };

  const openAdministerDialog = (med: typeof PENDING_MEDICATIONS[0]) => {
    setSelectedMed(med);
    setDialogOpen(true);
  };

  const administerMedication = () => {
    if (selectedMed) {
      setMedications(medications.filter(m => m.id !== selectedMed.id));
      toast({
        title: "Medicação administrada",
        description: `${selectedMed.medication} administrado para ${selectedMed.patient}`
      });
      setDialogOpen(false);
      setSelectedMed(null);
      setObservation('');
    }
  };

  const pendingCount = medications.filter(m => m.status === 'pending').length;
  const delayedCount = medications.filter(m => m.status === 'delayed').length;

  return (
    <Layout title="Medicações">
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/nursing')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">Medicações</h1>
            <p className="text-muted-foreground">Aprazamento e administração</p>
          </div>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            Exemplo
          </Badge>
        </div>

        {/* Resumo */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold text-yellow-700">{pendingCount}</p>
              <p className="text-xs text-yellow-600">Pendentes</p>
            </CardContent>
          </Card>
          <Card className="bg-red-50 border-red-200">
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold text-red-700">{delayedCount}</p>
              <p className="text-xs text-red-600">Atrasados</p>
            </CardContent>
          </Card>
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold text-green-700">{ADMINISTERED.length}</p>
              <p className="text-xs text-green-600">Administrados</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="pending">
              Pendentes
              {(pendingCount + delayedCount) > 0 && (
                <Badge variant="destructive" className="ml-2">{pendingCount + delayedCount}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="administered">Administrados</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-3">
            {/* Atrasados primeiro */}
            {medications.filter(m => m.status === 'delayed').map((med) => (
              <Card key={med.id} className="border-red-200 bg-red-50/50">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                        <Badge className={getStatusColor(med.status)}>
                          {getStatusText(med.status)}
                        </Badge>
                        <span className="text-sm font-mono">{med.time}</span>
                      </div>
                      <p className="font-semibold">{med.patient}</p>
                      <p className="text-xs text-muted-foreground">Leito {med.bed}</p>
                      <div className="mt-2 p-2 bg-white rounded">
                        <p className="font-medium">{med.medication}</p>
                        <p className="text-sm text-muted-foreground">
                          {med.dose} - {med.route}
                        </p>
                        {med.notes && (
                          <p className="text-xs text-muted-foreground italic mt-1">{med.notes}</p>
                        )}
                      </div>
                    </div>
                    <Button onClick={() => openAdministerDialog(med)}>
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      Administrar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Pendentes */}
            {medications.filter(m => m.status === 'pending').map((med) => (
              <Card key={med.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Clock className="h-4 w-4 text-yellow-600" />
                        <Badge className={getStatusColor(med.status)}>
                          {getStatusText(med.status)}
                        </Badge>
                        <span className="text-sm font-mono">{med.time}</span>
                      </div>
                      <p className="font-semibold">{med.patient}</p>
                      <p className="text-xs text-muted-foreground">Leito {med.bed}</p>
                      <div className="mt-2 p-2 bg-muted/50 rounded">
                        <p className="font-medium">{med.medication}</p>
                        <p className="text-sm text-muted-foreground">
                          {med.dose} - {med.route}
                        </p>
                        {med.notes && (
                          <p className="text-xs text-muted-foreground italic mt-1">{med.notes}</p>
                        )}
                      </div>
                    </div>
                    <Button onClick={() => openAdministerDialog(med)}>
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      Administrar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="administered" className="space-y-3">
            {ADMINISTERED.map((med) => (
              <Card key={med.id} className="bg-green-50/30">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <Badge className={getStatusColor(med.status)}>
                          {getStatusText(med.status)}
                        </Badge>
                        <span className="text-sm text-green-700">às {med.administeredAt}</span>
                      </div>
                      <p className="font-semibold">{med.patient}</p>
                      <p className="text-xs text-muted-foreground">Leito {med.bed}</p>
                      <div className="mt-2 p-2 bg-white rounded">
                        <p className="font-medium">{med.medication}</p>
                        <p className="text-sm text-muted-foreground">
                          {med.dose} - {med.route}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Por: {med.administeredBy}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>

        {/* Dialog de Administração */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmar Administração</DialogTitle>
            </DialogHeader>
            {selectedMed && (
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="h-4 w-4" />
                    <span className="font-semibold">{selectedMed.patient}</span>
                    <Badge variant="outline">Leito {selectedMed.bed}</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Pill className="h-4 w-4" />
                    <span>{selectedMed.medication}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedMed.dose} - {selectedMed.route}
                  </p>
                  {selectedMed.notes && (
                    <p className="text-sm text-amber-600 mt-2">
                      ⚠️ {selectedMed.notes}
                    </p>
                  )}
                </div>

                <div>
                  <Label>Leitura do código de barras</Label>
                  <Button variant="outline" className="w-full mt-2">
                    <Barcode className="h-4 w-4 mr-2" />
                    Escanear Código
                  </Button>
                </div>

                <div>
                  <Label>Observações (opcional)</Label>
                  <Textarea
                    placeholder="Observações sobre a administração..."
                    value={observation}
                    onChange={(e) => setObservation(e.target.value)}
                  />
                </div>

                <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-lg">
                  <Checkbox id="confirm" />
                  <Label htmlFor="confirm" className="text-sm">
                    Confirmo a verificação dos 9 certos da medicação
                  </Label>
                </div>

                <Button className="w-full" onClick={administerMedication}>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Confirmar Administração
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default NursingMedications;
