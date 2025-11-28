import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useNurseRole } from '@/hooks/useNurseRole';
import { toast } from 'sonner';
import { AlertTriangle, Save, CheckCircle2, Eye } from 'lucide-react';

interface Patient {
  id: string;
  full_name: string;
  bed_number: string;
}

interface Incident {
  id: string;
  patient_id: string;
  patient_name: string;
  incident_type: string;
  severity: string;
  description: string;
  incident_date: string;
  resolved: boolean;
}

const INCIDENT_TYPES = [
  'Queda',
  'Erro de medicação',
  'Lesão por pressão',
  'Extubação acidental',
  'Perda de acesso venoso',
  'Reação adversa',
  'Flebite',
  'Sangramento',
  'Alteração neurológica súbita',
  'Outros'
];

const SEVERITY_LEVELS = [
  { value: 'low', label: 'Baixa', color: 'secondary' },
  { value: 'medium', label: 'Média', color: 'default' },
  { value: 'high', label: 'Alta', color: 'destructive' },
  { value: 'critical', label: 'Crítica', color: 'destructive' }
];

export default function NursingIncidents() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isNurse } = useNurseRole();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [reporterName, setReporterName] = useState('');
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'form' | 'list'>('form');
  
  const [formData, setFormData] = useState({
    patient_id: '',
    incident_type: '',
    severity: 'medium',
    description: '',
    actions_taken: ''
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
      setReporterName(nurseData.id);

      const { data: patientsData } = await supabase
        .from('patients')
        .select('id, full_name, bed_number')
        .eq('organization_id', nurseData.organization_id)
        .eq('is_active', true)
        .order('bed_number');

      setPatients(patientsData || []);

      // Buscar intercorrências recentes
      const { data: incidentsData } = await supabase
        .from('nursing_incidents')
        .select(`
          id,
          patient_id,
          incident_type,
          severity,
          description,
          incident_date,
          resolved,
          patients!inner(full_name)
        `)
        .order('incident_date', { ascending: false })
        .limit(10);

      const formattedIncidents = incidentsData?.map((inc: any) => ({
        id: inc.id,
        patient_id: inc.patient_id,
        patient_name: inc.patients.full_name,
        incident_type: inc.incident_type,
        severity: inc.severity,
        description: inc.description,
        incident_date: inc.incident_date,
        resolved: inc.resolved
      })) || [];

      setIncidents(formattedIncidents);
    } catch (error) {
      console.error('Erro:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.patient_id || !formData.incident_type || !formData.description) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('nursing_incidents')
        .insert({
          patient_id: formData.patient_id,
          reported_by: reporterName,
          incident_type: formData.incident_type,
          severity: formData.severity,
          description: formData.description,
          actions_taken: formData.actions_taken
        });

      if (error) throw error;

      // Criar alerta crítico se necessário
      if (formData.severity === 'critical' || formData.severity === 'high') {
        await supabase.from('nursing_alerts').insert({
          patient_id: formData.patient_id,
          alert_type: 'incident',
          severity: formData.severity,
          message: `Intercorrência: ${formData.incident_type} - ${formData.description.substring(0, 100)}`
        });
      }

      toast.success('Intercorrência registrada com sucesso');
      
      // Limpar formulário
      setFormData({
        patient_id: '',
        incident_type: '',
        severity: 'medium',
        description: '',
        actions_taken: ''
      });

      fetchData(); // Atualizar lista
    } catch (error: any) {
      console.error('Erro:', error);
      toast.error('Erro ao registrar intercorrência');
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (incidentId: string) => {
    try {
      const { error } = await supabase
        .from('nursing_incidents')
        .update({ resolved: true, resolved_at: new Date().toISOString() })
        .eq('id', incidentId);

      if (error) throw error;

      toast.success('Intercorrência marcada como resolvida');
      fetchData();
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao atualizar intercorrência');
    }
  };

  const getSeverityBadge = (severity: string) => {
    const level = SEVERITY_LEVELS.find(s => s.value === severity);
    return (
      <Badge variant={level?.color as any}>
        {level?.label || severity}
      </Badge>
    );
  };

  return (
    <Layout title="Intercorrências">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-destructive" />
            <h2 className="text-2xl font-bold">Intercorrências</h2>
          </div>
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'form' ? 'default' : 'outline'}
              onClick={() => setViewMode('form')}
            >
              Registrar Nova
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              onClick={() => setViewMode('list')}
            >
              <Eye className="h-4 w-4 mr-2" />
              Ver Histórico
            </Button>
          </div>
        </div>

        {viewMode === 'form' ? (
          <Card className="p-6">
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
                  <Label>Tipo de Intercorrência *</Label>
                  <Select value={formData.incident_type} onValueChange={(value) => setFormData({...formData, incident_type: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {INCIDENT_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Gravidade *</Label>
                <Select value={formData.severity} onValueChange={(value) => setFormData({...formData, severity: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SEVERITY_LEVELS.map((level) => (
                      <SelectItem key={level.value} value={level.value}>
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Descrição Detalhada da Intercorrência *</Label>
                <Textarea
                  rows={5}
                  placeholder="Descreva o que aconteceu, quando, onde, como o paciente estava antes e depois do evento..."
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label>Ações Tomadas</Label>
                <Textarea
                  rows={4}
                  placeholder="Descreva as medidas adotadas, acionamento de equipe médica, procedimentos realizados..."
                  value={formData.actions_taken}
                  onChange={(e) => setFormData({...formData, actions_taken: e.target.value})}
                  className="resize-none"
                />
              </div>

              <Card className="p-4 bg-orange-50 dark:bg-orange-950 border-orange-200 dark:border-orange-800">
                <div className="flex gap-3">
                  <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-semibold text-orange-900 dark:text-orange-100 mb-1">
                      Importante: Notificação Obrigatória
                    </p>
                    <p className="text-orange-800 dark:text-orange-200">
                      Este registro ficará disponível para análise da gestão e será usado para melhoria contínua dos processos de segurança do paciente.
                    </p>
                  </div>
                </div>
              </Card>

              <div className="flex gap-3">
                <Button type="submit" disabled={loading} className="flex-1">
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? 'Salvando...' : 'Registrar Intercorrência'}
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate('/nursing')}>
                  Cancelar
                </Button>
              </div>
            </form>
          </Card>
        ) : (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Histórico de Intercorrências</h3>
            <div className="space-y-3">
              {incidents.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Nenhuma intercorrência registrada
                </p>
              ) : (
                incidents.map((incident) => (
                  <div
                    key={incident.id}
                    className="flex items-start justify-between p-4 border rounded-lg hover:bg-accent"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getSeverityBadge(incident.severity)}
                        <Badge variant="outline">{incident.incident_type}</Badge>
                        {incident.resolved && (
                          <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Resolvida
                          </Badge>
                        )}
                      </div>
                      <p className="font-medium">{incident.patient_name}</p>
                      <p className="text-sm text-muted-foreground line-clamp-2">{incident.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(incident.incident_date).toLocaleString('pt-BR')}
                      </p>
                    </div>
                    {!incident.resolved && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleResolve(incident.id)}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        Resolver
                      </Button>
                    )}
                  </div>
                ))
              )}
            </div>
          </Card>
        )}
      </div>
    </Layout>
  );
}
