import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ArrowLeft, Activity, FileText, ClipboardList } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface Patient {
  id: string;
  full_name: string;
  bed_number: string;
  registry_number: string;
  allergies: string[];
}

export default function NursingPatientHistory() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [vitalSigns, setVitalSigns] = useState<any[]>([]);
  const [evolutions, setEvolutions] = useState<any[]>([]);
  const [procedures, setProcedures] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (patientId) {
      fetchPatientHistory();
    }
  }, [patientId]);

  const fetchPatientHistory = async () => {
    try {
      setLoading(true);

      // Buscar dados do paciente
      const { data: patientData, error: patientError } = await supabase
        .from('patients')
        .select('*')
        .eq('id', patientId)
        .single();

      if (patientError) throw patientError;
      setPatient(patientData);

      // Buscar sinais vitais
      const { data: vitalsData } = await supabase
        .from('nursing_vital_signs')
        .select('*, doctors!nurse_id(full_name)')
        .eq('patient_id', patientId)
        .order('measurement_date', { ascending: false })
        .limit(50);

      setVitalSigns(vitalsData || []);

      // Buscar evoluções
      const { data: evolutionsData } = await supabase
        .from('nursing_evolutions')
        .select('*, doctors!nurse_id(full_name)')
        .eq('patient_id', patientId)
        .order('evolution_date', { ascending: false });

      setEvolutions(evolutionsData || []);

      // Buscar procedimentos
      const { data: proceduresData } = await supabase
        .from('nursing_procedures')
        .select('*, doctors!nurse_id(full_name)')
        .eq('patient_id', patientId)
        .order('procedure_date', { ascending: false });

      setProcedures(proceduresData || []);

    } catch (error: any) {
      console.error('Erro ao carregar histórico:', error);
      toast.error('Erro ao carregar histórico do paciente');
    } finally {
      setLoading(false);
    }
  };

  const prepareChartData = () => {
    return vitalSigns.slice(0, 10).reverse().map(v => ({
      date: new Date(v.measurement_date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      temp: v.temperature,
      fc: v.heart_rate,
      pa_sys: v.blood_pressure_systolic,
      pa_dia: v.blood_pressure_diastolic,
      spo2: v.oxygen_saturation
    }));
  };

  if (loading) {
    return (
      <Layout title="Histórico do Paciente">
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  if (!patient) {
    return (
      <Layout title="Paciente não encontrado">
        <Card className="p-6 text-center">
          <p>Paciente não encontrado</p>
          <Button onClick={() => navigate('/nursing')} className="mt-4">
            Voltar
          </Button>
        </Card>
      </Layout>
    );
  }

  return (
    <Layout title={`Histórico - ${patient.full_name}`}>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/nursing')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{patient.full_name}</h1>
            <p className="text-muted-foreground">
              Leito: {patient.bed_number} | Prontuário: {patient.registry_number}
            </p>
          </div>
        </div>

        <Tabs defaultValue="vitals" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="vitals">
              <Activity className="h-4 w-4 mr-2" />
              Sinais Vitais
            </TabsTrigger>
            <TabsTrigger value="evolutions">
              <FileText className="h-4 w-4 mr-2" />
              Evoluções
            </TabsTrigger>
            <TabsTrigger value="procedures">
              <ClipboardList className="h-4 w-4 mr-2" />
              Procedimentos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="vitals" className="space-y-6">
            {vitalSigns.length > 0 && (
              <Card className="p-6">
                <h3 className="font-semibold mb-4">Gráfico de Sinais Vitais</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={prepareChartData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="temp" stroke="#ef4444" name="Temp (°C)" />
                    <Line type="monotone" dataKey="fc" stroke="#3b82f6" name="FC (bpm)" />
                    <Line type="monotone" dataKey="spo2" stroke="#10b981" name="SpO2 (%)" />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            )}

            <Card className="p-6">
              <h3 className="font-semibold mb-4">Histórico de Registros</h3>
              <div className="space-y-3">
                {vitalSigns.map((vital) => (
                  <div key={vital.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">
                        {new Date(vital.measurement_date).toLocaleString('pt-BR')}
                      </span>
                      {vital.is_abnormal && (
                        <Badge variant="destructive">Anormal</Badge>
                      )}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                      {vital.temperature && <p>Temp: {vital.temperature}°C</p>}
                      {vital.blood_pressure_systolic && (
                        <p>PA: {vital.blood_pressure_systolic}/{vital.blood_pressure_diastolic} mmHg</p>
                      )}
                      {vital.heart_rate && <p>FC: {vital.heart_rate} bpm</p>}
                      {vital.oxygen_saturation && <p>SpO2: {vital.oxygen_saturation}%</p>}
                      {vital.pain_scale !== null && <p>Dor: {vital.pain_scale}/10</p>}
                    </div>
                    {vital.notes && (
                      <p className="text-sm text-muted-foreground mt-2">{vital.notes}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">
                      Por: {vital.doctors?.full_name}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="evolutions">
            <Card className="p-6">
              <div className="space-y-4">
                {evolutions.map((evo) => (
                  <div key={evo.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">
                        {new Date(evo.evolution_date).toLocaleString('pt-BR')}
                      </span>
                      <Badge>{evo.evolution_type}</Badge>
                    </div>
                    
                    {evo.evolution_type === 'SOAP' ? (
                      <div className="space-y-2 text-sm">
                        {evo.subjective_data && <p><strong>S:</strong> {evo.subjective_data}</p>}
                        {evo.objective_data && <p><strong>O:</strong> {evo.objective_data}</p>}
                        {evo.assessment && <p><strong>A:</strong> {evo.assessment}</p>}
                        {evo.plan && <p><strong>P:</strong> {evo.plan}</p>}
                      </div>
                    ) : (
                      <p className="text-sm">{evo.free_text}</p>
                    )}
                    
                    <p className="text-xs text-muted-foreground mt-2">
                      Por: {evo.doctors?.full_name}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="procedures">
            <Card className="p-6">
              <div className="space-y-3">
                {procedures.map((proc) => (
                  <div key={proc.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">
                        {new Date(proc.procedure_date).toLocaleString('pt-BR')}
                      </span>
                      <Badge variant="secondary">{proc.procedure_type}</Badge>
                    </div>
                    {proc.description && (
                      <p className="text-sm mb-2">{proc.description}</p>
                    )}
                    {proc.location && (
                      <p className="text-sm text-muted-foreground">Local: {proc.location}</p>
                    )}
                    {proc.observations && (
                      <p className="text-sm text-muted-foreground mt-1">{proc.observations}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">
                      Por: {proc.doctors?.full_name} | Assinatura: {proc.digital_signature}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
