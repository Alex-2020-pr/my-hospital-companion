import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from '@/hooks/useUserRole';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Navigate } from 'react-router-dom';
import { HardDrive, Users, AlertCircle, CheckCircle, Clock } from 'lucide-react';

export const AdminStorageManagement = () => {
  const { isSuperAdmin, isHospitalAdmin, loading: roleLoading } = useUserRole();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [organization, setOrganization] = useState<any>(null);
  const [patients, setPatients] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [defaultLimit, setDefaultLimit] = useState(10);

  useEffect(() => {
    if (isHospitalAdmin || isSuperAdmin) {
      fetchData();
    }
  }, [isHospitalAdmin, isSuperAdmin, user]);

  const fetchData = async () => {
    try {
      // Buscar organização do hospital admin
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id, organizations(*)')
        .eq('id', user?.id)
        .single();

      if (profile?.organizations) {
        setOrganization(profile.organizations);
        setDefaultLimit(profile.organizations.default_patient_storage_limit / (1024 * 1024)); // Converter para MB
      }

      // Buscar pacientes da organização
      const { data: patientsData } = await supabase
        .from('profiles')
        .select('*')
        .eq('organization_id', profile?.organization_id);

      setPatients(patientsData || []);

      // Buscar solicitações pendentes
      const { data: requestsData } = await supabase
        .from('storage_requests')
        .select('*, profiles(full_name, email)')
        .eq('organization_id', profile?.organization_id)
        .order('created_at', { ascending: false });

      setRequests(requestsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatBytes = (bytes: number) => {
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const handleUpdateDefaultLimit = async () => {
    try {
      const limitInBytes = defaultLimit * 1024 * 1024;
      
      const { error } = await supabase
        .from('organizations')
        .update({ default_patient_storage_limit: limitInBytes })
        .eq('id', organization?.id);

      if (error) throw error;

      toast({
        title: 'Limite atualizado',
        description: 'O limite padrão de armazenamento foi atualizado.'
      });

      fetchData();
    } catch (error) {
      console.error('Error updating limit:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o limite.',
        variant: 'destructive'
      });
    }
  };

  const handleUpdatePatientLimit = async (patientId: string, newLimit: number) => {
    try {
      const limitInBytes = newLimit * 1024 * 1024;
      
      const { error } = await supabase
        .from('profiles')
        .update({ storage_limit_bytes: limitInBytes })
        .eq('id', patientId);

      if (error) throw error;

      toast({
        title: 'Limite atualizado',
        description: 'O limite do paciente foi atualizado.'
      });

      fetchData();
    } catch (error) {
      console.error('Error updating patient limit:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o limite.',
        variant: 'destructive'
      });
    }
  };

  const handleReviewRequest = async (requestId: string, status: 'approved' | 'rejected', notes?: string) => {
    try {
      const { error } = await supabase
        .from('storage_requests')
        .update({
          status,
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString(),
          notes
        })
        .eq('id', requestId);

      if (error) throw error;

      // Se aprovado, atualizar o limite do paciente
      if (status === 'approved') {
        const request = requests.find(r => r.id === requestId);
        if (request) {
          await supabase
            .from('profiles')
            .update({ 
              storage_limit_bytes: request.requested_bytes 
            })
            .eq('id', request.user_id);
        }
      }

      toast({
        title: status === 'approved' ? 'Solicitação aprovada' : 'Solicitação rejeitada',
        description: `A solicitação foi ${status === 'approved' ? 'aprovada' : 'rejeitada'}.`
      });

      fetchData();
    } catch (error) {
      console.error('Error reviewing request:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível processar a solicitação.',
        variant: 'destructive'
      });
    }
  };

  if (roleLoading || loading) {
    return (
      <Layout title="Gestão de Armazenamento">
        <div className="flex items-center justify-center min-h-[400px]">
          <p>Carregando...</p>
        </div>
      </Layout>
    );
  }

  if (!isHospitalAdmin && !isSuperAdmin) {
    return <Navigate to="/" />;
  }

  const totalUsed = patients.reduce((acc, p) => acc + p.storage_used_bytes, 0);
  const totalLimit = organization?.storage_limit_bytes || 0;
  const usagePercentage = (totalUsed / totalLimit) * 100;

  return (
    <Layout title="Gestão de Armazenamento">
      <div className="space-y-6">
        {/* Resumo da Organização */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Usado</CardTitle>
              <HardDrive className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatBytes(totalUsed)}</div>
              <p className="text-xs text-muted-foreground">
                de {formatBytes(totalLimit)} ({usagePercentage.toFixed(1)}%)
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Pacientes</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{patients.length}</div>
              <p className="text-xs text-muted-foreground">pacientes ativos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Solicitações Pendentes</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {requests.filter(r => r.status === 'pending').length}
              </div>
              <p className="text-xs text-muted-foreground">aguardando análise</p>
            </CardContent>
          </Card>
        </div>

        {/* Configuração de Limite Padrão */}
        <Card>
          <CardHeader>
            <CardTitle>Limite Padrão por Paciente</CardTitle>
            <CardDescription>
              Define o espaço de armazenamento padrão para novos pacientes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <Label htmlFor="defaultLimit">Limite Padrão (MB)</Label>
                <Input
                  id="defaultLimit"
                  type="number"
                  value={defaultLimit}
                  onChange={(e) => setDefaultLimit(parseFloat(e.target.value))}
                />
              </div>
              <Button onClick={handleUpdateDefaultLimit}>Atualizar</Button>
            </div>
          </CardContent>
        </Card>

        {/* Solicitações Pendentes */}
        {requests.filter(r => r.status === 'pending').length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Solicitações de Armazenamento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {requests
                .filter(r => r.status === 'pending')
                .map((request) => (
                  <div key={request.id} className="flex justify-between items-center p-4 border rounded">
                    <div>
                      <p className="font-medium">{request.profiles?.full_name}</p>
                      <p className="text-sm text-muted-foreground">{request.profiles?.email}</p>
                      <p className="text-sm mt-1">
                        Solicitando: <span className="font-semibold">{formatBytes(request.requested_bytes)}</span>
                      </p>
                      {request.notes && (
                        <p className="text-sm text-muted-foreground mt-1">Observação: {request.notes}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleReviewRequest(request.id, 'approved')}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Aprovar
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleReviewRequest(request.id, 'rejected')}
                      >
                        <AlertCircle className="h-4 w-4 mr-1" />
                        Rejeitar
                      </Button>
                    </div>
                  </div>
                ))}
            </CardContent>
          </Card>
        )}

        {/* Lista de Pacientes */}
        <Card>
          <CardHeader>
            <CardTitle>Pacientes e Uso de Armazenamento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {patients.map((patient) => {
                const percentage = (patient.storage_used_bytes / patient.storage_limit_bytes) * 100;
                return (
                  <div key={patient.id} className="flex justify-between items-center p-3 border rounded">
                    <div className="flex-1">
                      <p className="font-medium">{patient.full_name || 'Sem nome'}</p>
                      <p className="text-sm text-muted-foreground">{patient.email}</p>
                      <div className="mt-2 space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>Uso: {formatBytes(patient.storage_used_bytes)}</span>
                          <span>{percentage.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all ${
                              percentage >= 90 ? 'bg-destructive' :
                              percentage >= 80 ? 'bg-yellow-500' :
                              'bg-primary'
                            }`}
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="ml-4">
                      <Input
                        type="number"
                        className="w-24"
                        defaultValue={patient.storage_limit_bytes / (1024 * 1024)}
                        onBlur={(e) => handleUpdatePatientLimit(patient.id, parseFloat(e.target.value))}
                      />
                      <p className="text-xs text-muted-foreground mt-1">MB limite</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};
