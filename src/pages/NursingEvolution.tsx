import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useNurseRole } from '@/hooks/useNurseRole';
import { toast } from 'sonner';
import { FileText, Save, Sparkles } from 'lucide-react';

interface Patient {
  id: string;
  full_name: string;
  bed_number: string;
}

export default function NursingEvolution() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isNurse } = useNurseRole();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [nurseId, setNurseId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    patient_id: '',
    evolution_type: 'DAE',
    subjective_data: '',
    objective_data: '',
    assessment: '',
    plan: '',
    free_text: '',
    ai_suggestions: '',
    adl_evaluation: {
      bath: false,
      feeding: false,
      mobility: false,
      hygiene: false
    },
    wounds_evaluation: {
      has_wounds: false,
      description: ''
    },
    pain_evaluation: {
      has_pain: false,
      intensity: 0,
      location: ''
    },
    mobility_evaluation: {
      independent: false,
      assisted: false,
      bedridden: false
    }
  });

  useEffect(() => {
    if (!isNurse) {
      toast.error('Acesso negado');
      navigate('/dashboard');
      return;
    }
    fetchData();
  }, [user, isNurse, navigate]);

  const fetchData = async () => {
    try {
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
        return;
      }
      
      setNurseId(nurseData.id);

      const { data: patientsData } = await supabase
        .from('patients')
        .select('id, full_name, bed_number')
        .eq('organization_id', nurseData.organization_id)
        .eq('is_active', true)
        .order('bed_number');

      setPatients(patientsData || []);
    } catch (error) {
      console.error('Erro:', error);
    }
  };

  const handleAISuggestion = async () => {
    if (!formData.patient_id) {
      toast.error('Selecione um paciente primeiro');
      return;
    }

    setAiLoading(true);
    try {
      const context = formData.evolution_type === 'SOAP' 
        ? `Subjetivo: ${formData.subjective_data}\nObjetivo: ${formData.objective_data}\nAvaliação: ${formData.assessment}\nPlano: ${formData.plan}`
        : formData.free_text;

      const prompt = `Com base nas informações do paciente, sugira uma evolução de enfermagem ${formData.evolution_type}:\n\n${context}\n\nForneça uma evolução completa e profissional.`;

      const { data, error } = await supabase.functions.invoke('health-chat', {
        body: { message: prompt }
      });

      if (error) throw error;

      setFormData(prev => ({
        ...prev,
        ai_suggestions: data.response || ''
      }));

      toast.success('Sugestão gerada pela IA');
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao gerar sugestão');
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

    setLoading(true);
    try {
      const { error } = await supabase
        .from('nursing_evolutions')
        .insert({
          patient_id: formData.patient_id,
          nurse_id: nurseId,
          evolution_type: formData.evolution_type,
          subjective_data: formData.subjective_data,
          objective_data: formData.objective_data,
          assessment: formData.assessment,
          plan: formData.plan,
          free_text: formData.free_text,
          ai_suggestions: formData.ai_suggestions,
          adl_evaluation: formData.adl_evaluation,
          wounds_evaluation: formData.wounds_evaluation,
          pain_evaluation: formData.pain_evaluation,
          mobility_evaluation: formData.mobility_evaluation
        });

      if (error) throw error;

      toast.success('Evolução registrada com sucesso');
      navigate('/nursing');
    } catch (error: any) {
      console.error('Erro:', error);
      toast.error('Erro ao registrar evolução');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Evolução de Enfermagem">
      <Card className="max-w-4xl mx-auto p-6">
        <div className="flex items-center gap-2 mb-6">
          <FileText className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">Evolução de Enfermagem</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Paciente *</Label>
              <Select value={formData.patient_id} onValueChange={(value) => setFormData({...formData, patient_id: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {patients.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      Leito {p.bed_number} - {p.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Tipo de Evolução</Label>
              <Select value={formData.evolution_type} onValueChange={(value) => setFormData({...formData, evolution_type: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DAE">DAE (Dados, Ações, Evolução)</SelectItem>
                  <SelectItem value="SOAP">SOAP (Subjetivo, Objetivo, Avaliação, Plano)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Tabs defaultValue="evolution" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="evolution">Evolução</TabsTrigger>
              <TabsTrigger value="checklists">Checklists</TabsTrigger>
              <TabsTrigger value="ai">IA</TabsTrigger>
            </TabsList>

            <TabsContent value="evolution" className="space-y-4">
              {formData.evolution_type === 'SOAP' ? (
                <>
                  <div className="space-y-2">
                    <Label>Subjetivo (S)</Label>
                    <Textarea
                      rows={3}
                      placeholder="Queixas e relatos do paciente..."
                      value={formData.subjective_data}
                      onChange={(e) => setFormData({...formData, subjective_data: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Objetivo (O)</Label>
                    <Textarea
                      rows={3}
                      placeholder="Sinais vitais, exame físico..."
                      value={formData.objective_data}
                      onChange={(e) => setFormData({...formData, objective_data: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Avaliação (A)</Label>
                    <Textarea
                      rows={3}
                      placeholder="Análise e diagnóstico de enfermagem..."
                      value={formData.assessment}
                      onChange={(e) => setFormData({...formData, assessment: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Plano (P)</Label>
                    <Textarea
                      rows={3}
                      placeholder="Condutas e cuidados..."
                      value={formData.plan}
                      onChange={(e) => setFormData({...formData, plan: e.target.value})}
                    />
                  </div>
                </>
              ) : (
                <div className="space-y-2">
                  <Label>Evolução Livre</Label>
                  <Textarea
                    rows={10}
                    placeholder="Descreva a evolução do paciente..."
                    value={formData.free_text}
                    onChange={(e) => setFormData({...formData, free_text: e.target.value})}
                  />
                </div>
              )}
            </TabsContent>

            <TabsContent value="checklists" className="space-y-4">
              <Card className="p-4">
                <h3 className="font-semibold mb-3">Atividades de Vida Diária (AVD)</h3>
                <div className="space-y-2">
                  {Object.entries({bath: 'Banho', feeding: 'Alimentação', mobility: 'Mobilidade', hygiene: 'Higiene'}).map(([key, label]) => (
                    <div key={key} className="flex items-center space-x-2">
                      <Checkbox
                        checked={formData.adl_evaluation[key as keyof typeof formData.adl_evaluation]}
                        onCheckedChange={(checked) => setFormData({
                          ...formData,
                          adl_evaluation: {...formData.adl_evaluation, [key]: checked}
                        })}
                      />
                      <Label>{label}</Label>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-4">
                <h3 className="font-semibold mb-3">Mobilidade</h3>
                <div className="space-y-2">
                  {Object.entries({independent: 'Independente', assisted: 'Com auxílio', bedridden: 'Acamado'}).map(([key, label]) => (
                    <div key={key} className="flex items-center space-x-2">
                      <Checkbox
                        checked={formData.mobility_evaluation[key as keyof typeof formData.mobility_evaluation]}
                        onCheckedChange={(checked) => setFormData({
                          ...formData,
                          mobility_evaluation: {...formData.mobility_evaluation, [key]: checked}
                        })}
                      />
                      <Label>{label}</Label>
                    </div>
                  ))}
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="ai" className="space-y-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleAISuggestion}
                disabled={aiLoading}
                className="w-full"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                {aiLoading ? 'Gerando sugestão...' : 'Gerar sugestão com IA'}
              </Button>
              
              {formData.ai_suggestions && (
                <div className="space-y-2">
                  <Label>Sugestão da IA</Label>
                  <Textarea
                    rows={10}
                    value={formData.ai_suggestions}
                    onChange={(e) => setFormData({...formData, ai_suggestions: e.target.value})}
                  />
                </div>
              )}
            </TabsContent>
          </Tabs>

          <div className="flex gap-3">
            <Button type="submit" disabled={loading} className="flex-1">
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Salvando...' : 'Salvar Evolução'}
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
