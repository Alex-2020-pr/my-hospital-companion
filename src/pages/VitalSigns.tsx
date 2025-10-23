import { Layout } from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Activity, Heart, Droplet, Weight, Plus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface VitalSign {
  id: string;
  user_id: string;
  measurement_date: string;
  blood_pressure_systolic: number | null;
  blood_pressure_diastolic: number | null;
  heart_rate: number | null;
  glucose: number | null;
  weight: number | null;
  created_at: string;
  updated_at: string;
}

export const VitalSigns = () => {
  const { user } = useAuth();
  const [vitalSigns, setVitalSigns] = useState<VitalSign[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    blood_pressure_systolic: "",
    blood_pressure_diastolic: "",
    heart_rate: "",
    glucose: "",
    weight: ""
  });

  const fetchVitalSigns = async () => {
    if (!user) return;
    
    console.log('[VitalSigns] Fetching vital signs for user:', user.id);
    
    const { data, error } = await supabase
      .from('vital_signs' as any)
      .select('*')
      .eq('user_id', user.id)
      .order('measurement_date', { ascending: false });
    
    if (error) {
      console.error('[VitalSigns] Error fetching vital signs:', error);
      toast.error("Erro ao carregar sinais vitais");
      return;
    }
    
    console.log('[VitalSigns] Fetched vital signs:', data);
    setVitalSigns((data as unknown as VitalSign[]) || []);
  };

  useEffect(() => {
    fetchVitalSigns();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação dos limites médicos
    const systolic = formData.blood_pressure_systolic ? parseInt(formData.blood_pressure_systolic) : null;
    const diastolic = formData.blood_pressure_diastolic ? parseInt(formData.blood_pressure_diastolic) : null;
    const heartRate = formData.heart_rate ? parseInt(formData.heart_rate) : null;
    const glucose = formData.glucose ? parseFloat(formData.glucose) : null;
    const weight = formData.weight ? parseFloat(formData.weight) : null;

    if (systolic && (systolic < 70 || systolic > 250)) {
      toast.error("Pressão sistólica deve estar entre 70 e 250 mmHg");
      return;
    }
    if (diastolic && (diastolic < 40 || diastolic > 150)) {
      toast.error("Pressão diastólica deve estar entre 40 e 150 mmHg");
      return;
    }
    if (heartRate && (heartRate < 40 || heartRate > 200)) {
      toast.error("Frequência cardíaca deve estar entre 40 e 200 bpm");
      return;
    }
    if (glucose && (glucose < 40 || glucose > 600)) {
      toast.error("Glicemia deve estar entre 40 e 600 mg/dL");
      return;
    }
    if (weight && (weight < 20 || weight > 300)) {
      toast.error("Peso deve estar entre 20 e 300 kg");
      return;
    }

    setLoading(true);

    console.log('[VitalSigns] Inserting new vital sign for user:', user?.id);

    const { data, error } = await supabase
      .from('vital_signs' as any)
      .insert({
        user_id: user?.id,
        blood_pressure_systolic: systolic,
        blood_pressure_diastolic: diastolic,
        heart_rate: heartRate,
        glucose: glucose,
        weight: weight,
      })
      .select()
      .single();

    setLoading(false);

    if (error) {
      console.error('[VitalSigns] Error saving vital sign:', error);
      toast.error("Erro ao salvar medição");
      return;
    }

    console.log('[VitalSigns] Successfully saved vital sign:', data);

    toast.success("Medição salva com sucesso!");
    setIsDialogOpen(false);
    setFormData({
      blood_pressure_systolic: "",
      blood_pressure_diastolic: "",
      heart_rate: "",
      glucose: "",
      weight: ""
    });
    
    // Atualizar a lista de sinais vitais com o novo dado
    await fetchVitalSigns();
  };

  const latestVitalSign = vitalSigns[0];

  const chartData = vitalSigns
    .slice(0, 10)
    .reverse()
    .map(vs => ({
      date: format(new Date(vs.measurement_date), 'dd/MM', { locale: ptBR }),
      sistolica: vs.blood_pressure_systolic,
      diastolica: vs.blood_pressure_diastolic,
      bpm: vs.heart_rate,
      glicemia: vs.glucose,
      peso: vs.weight
    }));

  return (
    <Layout>
      <div className="p-4 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Sinais Vitais</h1>
            <p className="text-sm text-muted-foreground">Monitore sua saúde em tempo real</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary-dark">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Medição
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Nova Medição</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="systolic">Pressão Sistólica (70-250 mmHg)</Label>
                    <Input
                      id="systolic"
                      type="number"
                      placeholder="119"
                      min="70"
                      max="250"
                      value={formData.blood_pressure_systolic}
                      onChange={(e) => setFormData({ ...formData, blood_pressure_systolic: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="diastolic">Pressão Diastólica (40-150 mmHg)</Label>
                    <Input
                      id="diastolic"
                      type="number"
                      placeholder="78"
                      min="40"
                      max="150"
                      value={formData.blood_pressure_diastolic}
                      onChange={(e) => setFormData({ ...formData, blood_pressure_diastolic: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="heart_rate">Frequência Cardíaca (40-200 bpm)</Label>
                  <Input
                    id="heart_rate"
                    type="number"
                    placeholder="71"
                    min="40"
                    max="200"
                    value={formData.heart_rate}
                    onChange={(e) => setFormData({ ...formData, heart_rate: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="glucose">Glicemia (40-600 mg/dL)</Label>
                  <Input
                    id="glucose"
                    type="number"
                    step="0.1"
                    placeholder="97"
                    min="40"
                    max="600"
                    value={formData.glucose}
                    onChange={(e) => setFormData({ ...formData, glucose: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="weight">Peso (20-300 kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    placeholder="74.5"
                    min="20"
                    max="300"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Salvando..." : "Salvar Medição"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Cards com valores atuais */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="relative overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Activity className="h-5 w-5 text-primary" />
                </div>
                <Badge variant="outline" className="text-xs border-accent text-accent">
                  ●
                </Badge>
              </div>
              <h3 className="text-xs text-muted-foreground mb-1">Pressão Arterial</h3>
              <p className="text-2xl font-bold">
                {latestVitalSign?.blood_pressure_systolic || '--'}/{latestVitalSign?.blood_pressure_diastolic || '--'}
                <span className="text-xs font-normal text-muted-foreground ml-1">mmHg</span>
              </p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 bg-accent/10 rounded-lg">
                  <Heart className="h-5 w-5 text-accent" />
                </div>
                <Badge variant="outline" className="text-xs border-accent text-accent">
                  ●
                </Badge>
              </div>
              <h3 className="text-xs text-muted-foreground mb-1">Frequência Cardíaca</h3>
              <p className="text-2xl font-bold">
                {latestVitalSign?.heart_rate || '--'}
                <span className="text-xs font-normal text-muted-foreground ml-1">bpm</span>
              </p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Droplet className="h-5 w-5 text-primary" />
                </div>
                <Badge variant="outline" className="text-xs border-accent text-accent">
                  ●
                </Badge>
              </div>
              <h3 className="text-xs text-muted-foreground mb-1">Glicemia</h3>
              <p className="text-2xl font-bold">
                {latestVitalSign?.glucose || '--'}
                <span className="text-xs font-normal text-muted-foreground ml-1">mg/dL</span>
              </p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 bg-accent/10 rounded-lg">
                  <Weight className="h-5 w-5 text-accent" />
                </div>
                <Badge variant="outline" className="text-xs border-accent text-accent">
                  ●
                </Badge>
              </div>
              <h3 className="text-xs text-muted-foreground mb-1">Peso</h3>
              <p className="text-2xl font-bold">
                {latestVitalSign?.weight || '--'}
                <span className="text-xs font-normal text-muted-foreground ml-1">kg</span>
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos de histórico */}
        {chartData.length > 0 && (
          <>
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-4">Pressão Arterial Sistólica</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="sistolica" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      name="Pressão"
                      dot={{ fill: 'hsl(var(--primary))' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-4">Frequência Cardíaca</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="bpm" 
                      stroke="hsl(var(--accent))" 
                      strokeWidth={2}
                      name="BPM"
                      dot={{ fill: 'hsl(var(--accent))' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-4">Glicemia</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="glicemia" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      name="Glicemia (mg/dL)"
                      dot={{ fill: 'hsl(var(--primary))' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-4">Peso</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="peso" 
                      stroke="hsl(var(--accent))" 
                      strokeWidth={2}
                      name="Peso (kg)"
                      dot={{ fill: 'hsl(var(--accent))' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </>
        )}

        {vitalSigns.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Nenhuma medição registrada</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Comece a monitorar sua saúde adicionando sua primeira medição
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};
