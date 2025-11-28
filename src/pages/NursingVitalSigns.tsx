import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useNurseRole } from '@/hooks/useNurseRole';
import { toast } from 'sonner';
import { Activity, Save, Sparkles } from 'lucide-react';

interface Patient {
  id: string;
  full_name: string;
  bed_number: string;
}

export default function NursingVitalSigns() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isNurse, loading: nurseLoading } = useNurseRole();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [nurseId, setNurseId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    patient_id: '',
    temperature: '',
    blood_pressure_systolic: '',
    blood_pressure_diastolic: '',
    heart_rate: '',
    respiratory_rate: '',
    oxygen_saturation: '',
    pain_scale: '',
    notes: ''
  });

  useEffect(() => {
    if (nurseLoading) return;
    
    if (!isNurse) {
      toast.error('Acesso negado');
      navigate('/dashboard');
      return;
    }
    fetchData();
  }, [user, isNurse, nurseLoading, navigate]);

  const fetchData = async () => {
    try {
      // Buscar nurse_id
      const { data: nurseData } = await supabase
        .from('doctors')
        .select('id, organization_id')
        .eq('user_id', user?.id)
        .single();

      if (!nurseData) {
        // Dados de exemplo para demonstração
        setPatients([
          { id: 'demo-1', full_name: 'João da Silva', bed_number: '203' },
          { id: 'demo-2', full_name: 'Maria Santos', bed_number: '205' },
          { id: 'demo-3', full_name: 'Carlos Oliveira', bed_number: '208' }
        ]);
        setNurseId('demo-nurse-id');
        return;
      }

      setNurseId(nurseData.id);

      // Buscar pacientes
      const { data: patientsData } = await supabase
        .from('patients')
        .select('id, full_name, bed_number')
        .eq('organization_id', nurseData.organization_id)
        .eq('is_active', true)
        .order('bed_number');

      setPatients(patientsData || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados');
    }
  };

  const validateValues = () => {
    const warnings = [];
    
    if (formData.temperature) {
      const temp = parseFloat(formData.temperature);
      if (temp < 35 || temp > 39) warnings.push('Temperatura anormal detectada');
    }
    
    if (formData.blood_pressure_systolic && formData.blood_pressure_diastolic) {
      const sys = parseInt(formData.blood_pressure_systolic);
      const dia = parseInt(formData.blood_pressure_diastolic);
      if (sys < 90 || sys > 140 || dia < 60 || dia > 90) {
        warnings.push('Pressão arterial anormal detectada');
      }
    }
    
    if (formData.heart_rate) {
      const hr = parseInt(formData.heart_rate);
      if (hr < 60 || hr > 100) warnings.push('Frequência cardíaca anormal detectada');
    }
    
    if (formData.oxygen_saturation) {
      const sat = parseInt(formData.oxygen_saturation);
      if (sat < 95) warnings.push('Saturação de O2 baixa detectada');
    }
    
    return warnings;
  };

  const handleAISuggestion = async () => {
    if (!formData.patient_id) {
      toast.error('Selecione um paciente primeiro');
      return;
    }

    setAiLoading(true);
    try {
      const prompt = `Com base nos seguintes sinais vitais, sugira observações de enfermagem:
- Temperatura: ${formData.temperature}°C
- PA: ${formData.blood_pressure_systolic}/${formData.blood_pressure_diastolic} mmHg
- FC: ${formData.heart_rate} bpm
- FR: ${formData.respiratory_rate} ipm
- SpO2: ${formData.oxygen_saturation}%
- Dor: ${formData.pain_scale}/10

Forneça uma observação curta e objetiva sobre o estado do paciente.`;

      const { data, error } = await supabase.functions.invoke('health-chat', {
        body: { message: prompt }
      });

      if (error) throw error;

      setFormData(prev => ({
        ...prev,
        notes: data.response || 'Sem sugestões da IA'
      }));

      toast.success('Sugestão da IA gerada');
    } catch (error) {
      console.error('Erro na IA:', error);
      toast.error('Erro ao gerar sugestão da IA');
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.patient_id) {
      toast.error('Selecione um paciente');
      return;
    }

    const warnings = validateValues();
    const isAbnormal = warnings.length > 0;
    
    if (isAbnormal) {
      warnings.forEach(w => toast.warning(w));
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('nursing_vital_signs')
        .insert({
          patient_id: formData.patient_id,
          nurse_id: nurseId,
          temperature: formData.temperature ? parseFloat(formData.temperature) : null,
          blood_pressure_systolic: formData.blood_pressure_systolic ? parseInt(formData.blood_pressure_systolic) : null,
          blood_pressure_diastolic: formData.blood_pressure_diastolic ? parseInt(formData.blood_pressure_diastolic) : null,
          heart_rate: formData.heart_rate ? parseInt(formData.heart_rate) : null,
          respiratory_rate: formData.respiratory_rate ? parseInt(formData.respiratory_rate) : null,
          oxygen_saturation: formData.oxygen_saturation ? parseInt(formData.oxygen_saturation) : null,
          pain_scale: formData.pain_scale ? parseInt(formData.pain_scale) : null,
          notes: formData.notes,
          is_abnormal: isAbnormal
        });

      if (error) throw error;

      // Criar alerta se valores anormais
      if (isAbnormal) {
        await supabase.from('nursing_alerts').insert({
          patient_id: formData.patient_id,
          alert_type: 'vital_signs_abnormal',
          severity: 'high',
          message: warnings.join(', ')
        });
      }

      toast.success('Sinais vitais registrados com sucesso');
      
      // Limpar formulário
      setFormData({
        patient_id: '',
        temperature: '',
        blood_pressure_systolic: '',
        blood_pressure_diastolic: '',
        heart_rate: '',
        respiratory_rate: '',
        oxygen_saturation: '',
        pain_scale: '',
        notes: ''
      });

    } catch (error: any) {
      console.error('Erro ao salvar:', error);
      toast.error('Erro ao registrar sinais vitais');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Registrar Sinais Vitais">
      <Card className="max-w-3xl mx-auto p-6">
        <div className="flex items-center gap-2 mb-6">
          <Activity className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">Registro de Sinais Vitais</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="patient">Paciente *</Label>
            <Select value={formData.patient_id} onValueChange={(value) => setFormData({...formData, patient_id: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o paciente" />
              </SelectTrigger>
              <SelectContent>
                {patients.map((patient) => (
                  <SelectItem key={patient.id} value={patient.id}>
                    Leito {patient.bed_number} - {patient.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="temperature">Temperatura (°C)</Label>
              <Input
                id="temperature"
                type="number"
                step="0.1"
                placeholder="36.5"
                value={formData.temperature}
                onChange={(e) => setFormData({...formData, temperature: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label>Pressão Arterial (mmHg)</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="120"
                  value={formData.blood_pressure_systolic}
                  onChange={(e) => setFormData({...formData, blood_pressure_systolic: e.target.value})}
                />
                <span className="flex items-center">/</span>
                <Input
                  type="number"
                  placeholder="80"
                  value={formData.blood_pressure_diastolic}
                  onChange={(e) => setFormData({...formData, blood_pressure_diastolic: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="heart_rate">Frequência Cardíaca (bpm)</Label>
              <Input
                id="heart_rate"
                type="number"
                placeholder="72"
                value={formData.heart_rate}
                onChange={(e) => setFormData({...formData, heart_rate: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="respiratory_rate">Frequência Respiratória (ipm)</Label>
              <Input
                id="respiratory_rate"
                type="number"
                placeholder="16"
                value={formData.respiratory_rate}
                onChange={(e) => setFormData({...formData, respiratory_rate: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="oxygen_saturation">Saturação O2 (%)</Label>
              <Input
                id="oxygen_saturation"
                type="number"
                placeholder="98"
                value={formData.oxygen_saturation}
                onChange={(e) => setFormData({...formData, oxygen_saturation: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pain_scale">Escala de Dor (0-10)</Label>
              <Input
                id="pain_scale"
                type="number"
                min="0"
                max="10"
                placeholder="0"
                value={formData.pain_scale}
                onChange={(e) => setFormData({...formData, pain_scale: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="notes">Observações</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAISuggestion}
                disabled={aiLoading}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                {aiLoading ? 'Gerando...' : 'Sugerir com IA'}
              </Button>
            </div>
            <Textarea
              id="notes"
              rows={4}
              placeholder="Observações adicionais sobre o paciente..."
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
            />
          </div>

          <div className="flex gap-3">
            <Button type="submit" disabled={loading} className="flex-1">
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Salvando...' : 'Salvar Registro'}
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate('/nursing')}>
              Cancelar
            </Button>
          </div>
        </form>
      </Card>
    </Layout>
  );
}
