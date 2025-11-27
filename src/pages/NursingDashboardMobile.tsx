import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { 
  Activity, 
  AlertCircle, 
  FileText, 
  ClipboardList,
  Users,
  Clock,
  ChevronRight
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
  severity: string;
  message: string;
}

export default function NursingDashboardMobile() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [stats, setStats] = useState({ total: 0, critical: 0, pending: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const { data: nurseData } = await supabase
        .from('doctors')
        .select('organization_id')
        .eq('user_id', user?.id)
        .single();

      if (!nurseData?.organization_id) {
        toast.error('Enfermeiro não está associado a uma organização');
        return;
      }

      const { data: patientsData } = await supabase
        .from('patients')
        .select('id, full_name, bed_number, registry_number, allergies')
        .eq('organization_id', nurseData.organization_id)
        .eq('is_active', true)
        .order('bed_number');

      const { data: alertsData } = await supabase
        .from('nursing_alerts')
        .select(`
          id,
          patient_id,
          severity,
          message,
          patients!inner(full_name)
        `)
        .eq('is_active', true)
        .order('severity', { ascending: false })
        .limit(5);

      const formattedAlerts = alertsData?.map((alert: any) => ({
        id: alert.id,
        patient_id: alert.patient_id,
        patient_name: alert.patients.full_name,
        severity: alert.severity,
        message: alert.message
      })) || [];

      setPatients(patientsData || []);
      setAlerts(formattedAlerts);
      
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
      case 'critical': return 'bg-red-100 text-red-700 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default: return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  if (loading) {
    return (
      <Layout title="Plantão de Enfermagem">
        <div className="flex items-center justify-center h-screen bg-gradient-to-b from-blue-50 to-white">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
            <p className="text-blue-600 font-medium">Carregando plantão...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Plantão">
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        {/* Header com estatísticas */}
        <div className="bg-blue-600 text-white p-6 rounded-b-3xl shadow-lg">
          <h1 className="text-2xl font-bold mb-6">Plantão de Enfermagem</h1>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white/20 backdrop-blur rounded-2xl p-4 text-center">
              <Users className="h-8 w-8 mx-auto mb-2" />
              <p className="text-3xl font-bold">{stats.total}</p>
              <p className="text-xs opacity-90">Pacientes</p>
            </div>
            <div className="bg-white/20 backdrop-blur rounded-2xl p-4 text-center">
              <AlertCircle className="h-8 w-8 mx-auto mb-2" />
              <p className="text-3xl font-bold">{stats.critical}</p>
              <p className="text-xs opacity-90">Críticos</p>
            </div>
            <div className="bg-white/20 backdrop-blur rounded-2xl p-4 text-center">
              <Clock className="h-8 w-8 mx-auto mb-2" />
              <p className="text-3xl font-bold">{stats.pending}</p>
              <p className="text-xs opacity-90">Alertas</p>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-4 -mt-4">
          {/* Ações Rápidas */}
          <Card className="p-4 shadow-lg">
            <h2 className="text-lg font-bold text-gray-800 mb-3">Ações Rápidas</h2>
            <div className="grid grid-cols-2 gap-3">
              <Button 
                size="lg" 
                className="h-24 flex flex-col gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-md"
                onClick={() => navigate('/nursing/vital-signs')}
              >
                <Activity className="h-8 w-8" />
                <span className="text-sm font-semibold">Sinais Vitais</span>
              </Button>
              <Button 
                size="lg" 
                variant="secondary"
                className="h-24 flex flex-col gap-2 rounded-2xl shadow-md"
                onClick={() => navigate('/nursing/evolution')}
              >
                <FileText className="h-8 w-8" />
                <span className="text-sm font-semibold">Evolução</span>
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="h-24 flex flex-col gap-2 rounded-2xl shadow-md border-2"
                onClick={() => navigate('/nursing/procedures')}
              >
                <ClipboardList className="h-8 w-8" />
                <span className="text-sm font-semibold">Procedimentos</span>
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="h-24 flex flex-col gap-2 rounded-2xl shadow-md border-2 border-blue-200 bg-blue-50"
                onClick={() => navigate('/nursing/patient')}
              >
                <Users className="h-8 w-8 text-blue-600" />
                <span className="text-sm font-semibold text-blue-600">Ver Pacientes</span>
              </Button>
            </div>
          </Card>

          {/* Alertas Ativos */}
          {alerts.length > 0 && (
            <Card className="p-4 shadow-lg border-l-4 border-l-orange-500">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-orange-500" />
                  Alertas Ativos
                </h2>
                <Badge className="bg-orange-500">{alerts.length}</Badge>
              </div>
              <div className="space-y-3">
                {alerts.map((alert) => (
                  <div 
                    key={alert.id}
                    className={`p-4 rounded-xl border-2 ${getSeverityColor(alert.severity)} cursor-pointer active:scale-95 transition-transform`}
                    onClick={() => navigate(`/nursing/patient/${alert.patient_id}`)}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-sm">{alert.patient_name}</span>
                      <ChevronRight className="h-5 w-5" />
                    </div>
                    <p className="text-sm opacity-90">{alert.message}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Lista de Pacientes */}
          <Card className="p-4 shadow-lg">
            <h2 className="text-lg font-bold text-gray-800 mb-3">Pacientes do Plantão</h2>
            <div className="space-y-2">
              {patients.slice(0, 5).map((patient) => (
                <div
                  key={patient.id}
                  className="flex items-center justify-between p-4 bg-white border-2 border-gray-100 rounded-xl hover:border-blue-300 cursor-pointer active:scale-95 transition-all shadow-sm"
                  onClick={() => navigate(`/nursing/patient/${patient.id}`)}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-14 h-14 bg-blue-100 rounded-xl">
                      <div className="text-center">
                        <p className="text-xs text-blue-600 font-medium">Leito</p>
                        <p className="text-lg font-bold text-blue-700">{patient.bed_number || 'N/A'}</p>
                      </div>
                    </div>
                    <div>
                      <p className="font-bold text-gray-800">{patient.full_name}</p>
                      <p className="text-xs text-gray-500">
                        Prontuário: {patient.registry_number || 'N/A'}
                      </p>
                      {patient.allergies && patient.allergies.length > 0 && (
                        <div className="flex gap-1 mt-1">
                          <Badge variant="destructive" className="text-xs">
                            ⚠️ Alergias
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="h-6 w-6 text-gray-400" />
                </div>
              ))}
            </div>
            {patients.length > 5 && (
              <Button 
                variant="ghost" 
                className="w-full mt-3 text-blue-600"
                onClick={() => navigate('/nursing/patients')}
              >
                Ver todos os {patients.length} pacientes
              </Button>
            )}
          </Card>
        </div>
      </div>
    </Layout>
  );
}
