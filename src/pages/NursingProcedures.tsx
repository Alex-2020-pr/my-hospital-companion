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
import { ClipboardList, Save, PenTool } from 'lucide-react';

interface Patient {
  id: string;
  full_name: string;
  bed_number: string;
}

const PROCEDURE_TYPES = [
  'Curativo',
  'Banho no leito',
  'Glicemia capilar',
  'Mudança de decúbito',
  'Medicação administrada',
  'Aspiração de VAS',
  'Sondagem vesical',
  'Sondagem nasoenteral',
  'Oxigenoterapia',
  'Outros'
];

export default function NursingProcedures() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isNurse } = useNurseRole();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [nurseId, setNurseId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [signature, setSignature] = useState('');
  
  const [formData, setFormData] = useState({
    patient_id: '',
    procedure_type: '',
    description: '',
    location: '',
    observations: ''
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
        .select('id, full_name, organization_id')
        .eq('user_id', user?.id)
        .single();

      if (!nurseData) return;
      setNurseId(nurseData.id);
      setSignature(nurseData.full_name);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.patient_id || !formData.procedure_type) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }

    if (!signature.trim()) {
      toast.error('Assinatura digital é obrigatória');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('nursing_procedures')
        .insert({
          patient_id: formData.patient_id,
          nurse_id: nurseId,
          procedure_type: formData.procedure_type,
          description: formData.description,
          location: formData.location,
          observations: formData.observations,
          digital_signature: signature
        });

      if (error) throw error;

      toast.success('Procedimento registrado com sucesso');
      
      // Limpar formulário
      setFormData({
        patient_id: '',
        procedure_type: '',
        description: '',
        location: '',
        observations: ''
      });

    } catch (error: any) {
      console.error('Erro:', error);
      toast.error('Erro ao registrar procedimento');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Registrar Procedimento">
      <Card className="max-w-3xl mx-auto p-6">
        <div className="flex items-center gap-2 mb-6">
          <ClipboardList className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">Registro de Procedimentos</h2>
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
              <Label>Tipo de Procedimento *</Label>
              <Select value={formData.procedure_type} onValueChange={(value) => setFormData({...formData, procedure_type: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {PROCEDURE_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Descrição do Procedimento</Label>
            <Textarea
              rows={4}
              placeholder="Descreva detalhadamente o procedimento realizado..."
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <Label>Local (se aplicável)</Label>
            <Input
              placeholder="Ex: MSD, abdômen, dorso..."
              value={formData.location}
              onChange={(e) => setFormData({...formData, location: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <Label>Observações</Label>
            <Textarea
              rows={3}
              placeholder="Observações adicionais, reações do paciente..."
              value={formData.observations}
              onChange={(e) => setFormData({...formData, observations: e.target.value})}
            />
          </div>

          <Card className="p-4 bg-muted">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <PenTool className="h-4 w-4" />
                <Label>Assinatura Digital *</Label>
              </div>
              <Input
                placeholder="Digite seu nome completo para assinar"
                value={signature}
                onChange={(e) => setSignature(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Ao assinar, você confirma que realizou o procedimento descrito.
              </p>
            </div>
          </Card>

          <div className="flex gap-3">
            <Button type="submit" disabled={loading} className="flex-1">
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Salvando...' : 'Salvar Procedimento'}
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
