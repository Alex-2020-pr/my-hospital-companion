import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Pill, Clock, Search, Plus, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  instructions: string | null;
  is_active: boolean;
  start_date: string;
  end_date: string | null;
}

interface Schedule {
  id: string;
  medication_id: string;
  time: string;
  taken: boolean;
}

export const Medications = () => {
  const { user } = useAuth();
  const [medications, setMedications] = useState<Medication[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    dosage: "",
    frequency: "",
    instructions: "",
    start_date: format(new Date(), "yyyy-MM-dd"),
    schedules: ["08:00"]
  });

  useEffect(() => {
    if (user) {
      fetchMedications();
      fetchSchedules();
    }
  }, [user]);

  const fetchMedications = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('medications' as any)
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('name');

    if (error) {
      toast.error("Erro ao carregar medicamentos");
      return;
    }

    setMedications((data as any) || []);
  };

  const fetchSchedules = async () => {
    if (!user) return;

    const { data: meds } = await supabase
      .from('medications' as any)
      .select('id')
      .eq('user_id', user.id);

    if (!meds || meds.length === 0) return;

    const medIds = meds.map((m: any) => m.id);

    const { data, error } = await supabase
      .from('medication_schedules' as any)
      .select('*')
      .in('medication_id', medIds);

    if (error) {
      toast.error("Erro ao carregar horários");
      return;
    }

    setSchedules((data as any) || []);
  };

  const handleAddMedication = async () => {
    if (!user || !formData.name || !formData.dosage || !formData.frequency) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    setLoading(true);

    const { data: medication, error: medError } = await supabase
      .from('medications' as any)
      .insert({
        user_id: user.id,
        name: formData.name,
        dosage: formData.dosage,
        frequency: formData.frequency,
        instructions: formData.instructions || null,
        start_date: formData.start_date,
        is_active: true
      })
      .select()
      .single();

    if (medError) {
      toast.error("Erro ao adicionar medicamento");
      setLoading(false);
      return;
    }

    // Add schedules
    const scheduleInserts = formData.schedules.map(time => ({
      medication_id: (medication as any).id,
      time: time
    }));

    const { error: schedError } = await supabase
      .from('medication_schedules' as any)
      .insert(scheduleInserts);

    setLoading(false);

    if (schedError) {
      toast.error("Erro ao adicionar horários");
      return;
    }

    toast.success("Medicamento adicionado com sucesso!");
    setIsDialogOpen(false);
    setFormData({
      name: "",
      dosage: "",
      frequency: "",
      instructions: "",
      start_date: format(new Date(), "yyyy-MM-dd"),
      schedules: ["08:00"]
    });
    fetchMedications();
    fetchSchedules();
  };

  const handleMarkAsTaken = async (scheduleId: string) => {
    const { error } = await supabase
      .from('medication_schedules' as any)
      .update({ taken: true, taken_at: new Date().toISOString() })
      .eq('id', scheduleId);

    if (error) {
      toast.error("Erro ao marcar como tomado");
      return;
    }

    toast.success("Marcado como tomado!");
    fetchSchedules();
  };

  const addScheduleTime = () => {
    setFormData({
      ...formData,
      schedules: [...formData.schedules, "12:00"]
    });
  };

  const updateScheduleTime = (index: number, value: string) => {
    const newSchedules = [...formData.schedules];
    newSchedules[index] = value;
    setFormData({ ...formData, schedules: newSchedules });
  };

  const removeScheduleTime = (index: number) => {
    const newSchedules = formData.schedules.filter((_, i) => i !== index);
    setFormData({ ...formData, schedules: newSchedules });
  };

  const filteredMedications = medications.filter(med =>
    med.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTodaySchedules = () => {
    const today = new Date();
    const todaySchedules: Array<{ time: string; medication: Medication; schedule: Schedule }> = [];

    medications.forEach(med => {
      const medSchedules = schedules.filter(s => s.medication_id === med.id);
      medSchedules.forEach(schedule => {
        todaySchedules.push({ time: schedule.time, medication: med, schedule });
      });
    });

    return todaySchedules.sort((a, b) => a.time.localeCompare(b.time));
  };

  const todaySchedules = getTodaySchedules();

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Medicamentos</h1>
            <p className="text-muted-foreground">Gerencie seus medicamentos e horários</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Medicamento
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Novo Medicamento</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Nome do Medicamento *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Omeprazol"
                  />
                </div>
                <div>
                  <Label htmlFor="dosage">Dosagem *</Label>
                  <Input
                    id="dosage"
                    value={formData.dosage}
                    onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                    placeholder="Ex: 40mg"
                  />
                </div>
                <div>
                  <Label htmlFor="frequency">Frequência *</Label>
                  <Input
                    id="frequency"
                    value={formData.frequency}
                    onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                    placeholder="Ex: 1x ao dia"
                  />
                </div>
                <div>
                  <Label htmlFor="start_date">Data de Início</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Horários</Label>
                  <div className="space-y-2">
                    {formData.schedules.map((time, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          type="time"
                          value={time}
                          onChange={(e) => updateScheduleTime(index, e.target.value)}
                        />
                        {formData.schedules.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => removeScheduleTime(index)}
                          >
                            ×
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button type="button" variant="outline" onClick={addScheduleTime} className="w-full">
                      + Adicionar Horário
                    </Button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="instructions">Instruções</Label>
                  <Textarea
                    id="instructions"
                    value={formData.instructions}
                    onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                    placeholder="Ex: Tomar em jejum pela manhã"
                    rows={3}
                  />
                </div>
                <Button onClick={handleAddMedication} disabled={loading} className="w-full">
                  {loading ? "Salvando..." : "Salvar Medicamento"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar medicamentos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <h2 className="text-xl font-semibold mb-4">Medicamentos Ativos</h2>
            <div className="grid gap-4">
              {filteredMedications.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center text-muted-foreground">
                    Nenhum medicamento encontrado
                  </CardContent>
                </Card>
              ) : (
                filteredMedications.map((medication) => {
                  const medSchedules = schedules.filter(s => s.medication_id === medication.id);
                  const nextDose = medSchedules.find(s => !s.taken);

                  return (
                    <Card key={medication.id}>
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="p-3 rounded-lg bg-primary/10">
                            <Pill className="h-6 w-6 text-primary" />
                          </div>
                          <div className="flex-1 space-y-2">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-semibold text-lg">{medication.name}</h3>
                                <p className="text-sm text-muted-foreground">{medication.dosage}</p>
                              </div>
                              <Badge>{medication.frequency}</Badge>
                            </div>
                            {nextDose && (
                              <div className="flex items-center gap-2 text-sm">
                                <Clock className="h-4 w-4" />
                                <span>Próxima dose: Hoje às {nextDose.time}</span>
                              </div>
                            )}
                            {medication.instructions && (
                              <p className="text-sm text-muted-foreground">{medication.instructions}</p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Horários de Hoje
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {todaySchedules.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Nenhum horário para hoje
                  </p>
                ) : (
                  todaySchedules.map(({ time, medication, schedule }) => (
                    <div
                      key={schedule.id}
                      className={`p-3 rounded-lg border ${
                        schedule.taken ? 'bg-muted opacity-60' : 'bg-background'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-primary">{time}</span>
                        {!schedule.taken && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleMarkAsTaken(schedule.id)}
                          >
                            Marcar
                          </Button>
                        )}
                      </div>
                      <p className="text-sm font-medium">{medication.name} {medication.dosage}</p>
                      {schedule.taken && (
                        <p className="text-xs text-muted-foreground mt-1">✓ Tomado</p>
                      )}
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};
