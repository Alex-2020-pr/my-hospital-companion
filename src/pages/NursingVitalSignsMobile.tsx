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
import { toast } from 'sonner';
import { Activity, Save, Sparkles, ArrowLeft } from 'lucide-react';

interface Patient {
  id: string;
  full_name: string;
  bed_number: string;
}

export default function NursingVitalSignsMobile() {
  const navigate = useNavigate();
  const { user } = useAuth();
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
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const { data: nurseData } = await supabase
        .from('doctors')
        .select('id, organization_id')
        .eq('user_id', user?.id)
        .single();

      if (!nurseData) return;
      setNurseId(nurseData.id);

      const { data: patientsData } = await supabase
        .from('patients')
        .select('id, full_name, bed_number')
        .eq('organization_id', nurseData.organization_id)
        .eq('is_active', true)
        .order('bed_number');

      setPatients(patientsData || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
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

  const validateValues = () => {
    const warnings = [];
    
    if (formData.temperature) {
      const temp = parseFloat(formData.temperature);
      if (temp < 35 || temp > 39) warnings.push('Temperatura anormal');
    }
    
    if (formData.blood_pressure_systolic && formData.blood_pressure_diastolic) {
      const sys = parseInt(formData.blood_pressure_systolic);
      const dia = parseInt(formData.blood_pressure_diastolic);
      if (sys < 90 || sys > 140 || dia < 60 || dia > 90) {
        warnings.push('Pressão arterial anormal');
      }
    }
    
    if (formData.heart_rate) {
      const hr = parseInt(formData.heart_rate);
      if (hr < 60 || hr > 100) warnings.push('FC anormal');
    }
    
    if (formData.oxygen_saturation) {
      const sat = parseInt(formData.oxygen_saturation);
      if (sat < 95) warnings.push('SpO2 baixa');
    }
    
    return warnings;
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

      if (isAbnormal) {
        await supabase.from('nursing_alerts').insert({
          patient_id: formData.patient_id,
          alert_type: 'vital_signs_abnormal',
          severity: 'high',
          message: warnings.join(', ')
        });
      }

      toast.success('Sinais vitais registrados!');
      navigate('/nursing');

    } catch (error: any) {
      console.error('Erro:', error);
      toast.error('Erro ao registrar sinais vitais');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Sinais Vitais">
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white pb-20">
        {/* Header */}
        <div className="bg-blue-600 text-white p-6 rounded-b-3xl shadow-lg mb-4">
          <div className="flex items-center gap-3 mb-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate('/nursing')}
              className="text-white hover:bg-white/20"
            >
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <Activity className="h-7 w-7" />
            <h1 className="text-2xl font-bold">Sinais Vitais</h1>
          </div>
          <p className="text-blue-100 text-sm pl-14">Registro de medições</p>
        </div>

        <form onSubmit={handleSubmit} className="px-4 space-y-4">
          {/* Seleção de Paciente */}
          <Card className="p-5 shadow-lg">
            <Label className="text-lg font-bold text-gray-800 mb-3 block">Paciente *</Label>
            <Select value={formData.patient_id} onValueChange={(value) => setFormData({...formData, patient_id: value})}>
              <SelectTrigger className="h-14 text-lg">
                <SelectValue placeholder="Selecione o paciente" />
              </SelectTrigger>
              <SelectContent>
                {patients.map((patient) => (
                  <SelectItem key={patient.id} value={patient.id} className="text-lg py-4">
                    Leito {patient.bed_number} - {patient.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Card>

          {/* Sinais Vitais */}
          <Card className="p-5 shadow-lg space-y-4">
            <h3 className="text-lg font-bold text-gray-800 mb-3">Medições</h3>
            
            <div>
              <Label className="text-base font-semibold">Temperatura (°C)</Label>
              <Input
                type="number"
                step="0.1"
                placeholder="36.5"
                value={formData.temperature}
                onChange={(e) => setFormData({...formData, temperature: e.target.value})}
                className="h-14 text-lg mt-2"
              />
            </div>

            <div>
              <Label className="text-base font-semibold">Pressão Arterial (mmHg)</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  type="number"
                  placeholder="120"
                  value={formData.blood_pressure_systolic}
                  onChange={(e) => setFormData({...formData, blood_pressure_systolic: e.target.value})}
                  className="h-14 text-lg"
                />
                <span className="flex items-center text-2xl font-bold">/</span>
                <Input
                  type="number"
                  placeholder="80"
                  value={formData.blood_pressure_diastolic}
                  onChange={(e) => setFormData({...formData, blood_pressure_diastolic: e.target.value})}
                  className="h-14 text-lg"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-base font-semibold">FC (bpm)</Label>
                <Input
                  type="number"
                  placeholder="72"
                  value={formData.heart_rate}
                  onChange={(e) => setFormData({...formData, heart_rate: e.target.value})}
                  className="h-14 text-lg mt-2"
                />
              </div>
              <div>
                <Label className="text-base font-semibold">FR (ipm)</Label>
                <Input
                  type="number"
                  placeholder="16"
                  value={formData.respiratory_rate}
                  onChange={(e) => setFormData({...formData, respiratory_rate: e.target.value})}
                  className="h-14 text-lg mt-2"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-base font-semibold">SpO2 (%)</Label>
                <Input
                  type="number"
                  placeholder="98"
                  value={formData.oxygen_saturation}
                  onChange={(e) => setFormData({...formData, oxygen_saturation: e.target.value})}
                  className="h-14 text-lg mt-2"
                />
              </div>
              <div>
                <Label className="text-base font-semibold">Dor (0-10)</Label>
                <Input
                  type="number"
                  min="0"
                  max="10"
                  placeholder="0"
                  value={formData.pain_scale}
                  onChange={(e) => setFormData({...formData, pain_scale: e.target.value})}
                  className="h-14 text-lg mt-2"
                />
              </div>
            </div>
          </Card>

          {/* Observações com IA */}
          <Card className="p-5 shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Observações</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAISuggestion}
                disabled={aiLoading}
                className="gap-2"
              >
                <Sparkles className="h-4 w-4" />
                {aiLoading ? 'Gerando...' : 'IA'}
              </Button>
            </div>
            <Textarea
              rows={4}
              placeholder="Observações sobre o paciente..."
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              className="text-base"
            />
          </Card>

          {/* Botões */}
          <div className="flex gap-3 pt-2">
            <Button 
              type="submit" 
              disabled={loading} 
              className="flex-1 h-14 text-lg bg-blue-600 hover:bg-blue-700 rounded-2xl shadow-lg"
            >
              <Save className="h-5 w-5 mr-2" />
              {loading ? 'Salvando...' : 'Salvar Registro'}
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
