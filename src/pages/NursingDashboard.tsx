import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useNurseRole } from '@/hooks/useNurseRole';
import { toast } from 'sonner';
import { 
  Activity, 
  AlertCircle, 
  Stethoscope, 
  FileText, 
  ClipboardList,
  TrendingUp,
  Clock,
  Users
} from 'lucide-react';

interface Patient {
  id: string;
  full_name: string;
  bed_number: string;
  registry_number: string;
  allergies: string[];
}

interface Alert {
  id: string;
  patient_id: string;
  patient_name: string;
  alert_type: string;
  severity: string;
  message: string;
  created_at: string;
}

export default function NursingDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isNurse, loading: roleLoading } = useNurseRole();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    critical: 0,
    pending: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!roleLoading && !isNurse) {
      toast.error('Acesso negado: somente enfermeiros');
      navigate('/dashboard');
      return;
    }
    
    if (user && isNurse) {
      fetchDashboardData();
    }
  }, [user, isNurse, roleLoading, navigate]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Buscar dados do enfermeiro
      const { data: nurseData } = await supabase
        .from('doctors')
        .select('organization_id')
        .eq('user_id', user?.id)
        .single();

      if (!nurseData?.organization_id) {
        toast.error('Enfermeiro não está associado a uma organização');
        return;
      }

      // Buscar pacientes da organização
      const { data: patientsData, error: patientsError } = await supabase
        .from('patients')
        .select('id, full_name, bed_number, registry_number, allergies')
        .eq('organization_id', nurseData.organization_id)
        .eq('is_active', true)
        .order('bed_number');

      if (patientsError) throw patientsError;

      // Buscar alertas ativos
      const { data: alertsData, error: alertsError } = await supabase
        .from('nursing_alerts')
        .select(`
          id,
          patient_id,
          alert_type,
          severity,
          message,
          created_at,
          patients!inner(full_name)
        `)
        .eq('is_active', true)
        .order('severity', { ascending: false })
        .order('created_at', { ascending: false });

      if (alertsError) throw alertsError;

      const formattedAlerts = alertsData?.map((alert: any) => ({
        id: alert.id,
        patient_id: alert.patient_id,
        patient_name: alert.patients.full_name,
        alert_type: alert.alert_type,
        severity: alert.severity,
        message: alert.message,
        created_at: alert.created_at
      })) || [];

      setPatients(patientsData || []);
      setAlerts(formattedAlerts);
      
      // Calcular estatísticas
      const criticalAlerts = formattedAlerts.filter(a => a.severity === 'critical' || a.severity === 'high').length;
      setStats({
        total: patientsData?.length || 0,
        critical: criticalAlerts,
        pending: formattedAlerts.length
      });

    } catch (error: any) {
      console.error('Erro ao carregar dashboard:', error);
      toast.error('Erro ao carregar dados do plantão');
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  if (loading || roleLoading) {
    return (
      <Layout title="Dashboard de Enfermagem">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Carregando...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Dashboard de Enfermagem">
      <div className="space-y-6">
        {/* Estatísticas Rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total de Pacientes</p>
                <p className="text-3xl font-bold">{stats.total}</p>
              </div>
              <Users className="h-12 w-12 text-primary opacity-20" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pacientes Críticos</p>
                <p className="text-3xl font-bold text-destructive">{stats.critical}</p>
              </div>
              <AlertCircle className="h-12 w-12 text-destructive opacity-20" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Alertas Pendentes</p>
                <p className="text-3xl font-bold text-orange-500">{stats.pending}</p>
              </div>
              <Clock className="h-12 w-12 text-orange-500 opacity-20" />
            </div>
          </Card>
        </div>

        {/* Ações Rápidas */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Ações Rápidas</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <Button 
              size="lg" 
              className="h-auto py-4 flex flex-col gap-2"
              onClick={() => navigate('/nursing/vital-signs')}
            >
              <Activity className="h-6 w-6" />
              <span>Registrar Sinais Vitais</span>
            </Button>
            <Button 
              size="lg" 
              variant="secondary"
              className="h-auto py-4 flex flex-col gap-2"
              onClick={() => navigate('/nursing/evolution')}
            >
              <FileText className="h-6 w-6" />
              <span>Registrar Evolução</span>
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="h-auto py-4 flex flex-col gap-2"
              onClick={() => navigate('/nursing/procedures')}
            >
              <ClipboardList className="h-6 w-6" />
              <span>Registrar Procedimento</span>
            </Button>
            <Button 
              size="lg" 
              variant="destructive"
              className="h-auto py-4 flex flex-col gap-2"
              onClick={() => navigate('/nursing/incidents')}
            >
              <AlertCircle className="h-6 w-6" />
              <span>Registrar Intercorrência</span>
            </Button>
          </div>
        </Card>

        {/* Alertas Ativos */}
        {alerts.length > 0 && (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-destructive" />
                Alertas Ativos
              </h2>
            </div>
            <div className="space-y-3">
              {alerts.slice(0, 5).map((alert) => (
                <div 
                  key={alert.id}
                  className="flex items-start justify-between p-3 border rounded-lg hover:bg-accent cursor-pointer"
                  onClick={() => navigate(`/nursing/patient/${alert.patient_id}`)}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={getSeverityColor(alert.severity)}>
                        {alert.severity.toUpperCase()}
                      </Badge>
                      <span className="font-medium">{alert.patient_name}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{alert.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(alert.created_at).toLocaleString('pt-BR')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Lista de Pacientes */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Pacientes do Plantão</h2>
          <div className="space-y-2">
            {patients.map((patient) => (
              <div
                key={patient.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent cursor-pointer"
                onClick={() => navigate(`/nursing/patient/${patient.id}`)}
              >
                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-center justify-center w-16 h-16 bg-primary/10 rounded-lg">
                    <Stethoscope className="h-6 w-6 text-primary" />
                    <span className="text-xs font-medium">{patient.bed_number || 'N/A'}</span>
                  </div>
                  <div>
                    <p className="font-medium">{patient.full_name}</p>
                    <p className="text-sm text-muted-foreground">
                      Prontuário: {patient.registry_number || 'N/A'}
                    </p>
                    {patient.allergies && patient.allergies.length > 0 && (
                      <div className="flex gap-1 mt-1">
                        {patient.allergies.map((allergy, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            ⚠️ {allergy}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  Ver Detalhes
                </Button>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </Layout>
  );
}
