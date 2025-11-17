import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useUserRole } from "@/hooks/useUserRole";
import { Navigate, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Users, Send, Mail, MessageSquare, BarChart3, HardDrive, Building2, Phone, MessageCircle, Stethoscope } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { HospitalStorageUpgradeDialog } from "@/components/HospitalStorageUpgradeDialog";
import { Progress } from "@/components/ui/progress";

interface Patient {
  id: string;
  full_name?: string;
  email?: string;
  phone?: string;
  storage_used_bytes: number;
  storage_limit_bytes: number;
}

interface DashboardStats {
  totalPatients: number;
  totalStorageUsed: number;
  totalStorageLimit: number;
  activePatients: number;
  totalDoctors: number;
}

export const HospitalPanel = () => {
  const navigate = useNavigate();
  const { isHospitalAdmin, roles, loading: roleLoading } = useUserRole();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [selectedPatients, setSelectedPatients] = useState<string[]>([]);
  const [messageData, setMessageData] = useState({
    subject: '',
    message: ''
  });
  const [stats, setStats] = useState<DashboardStats>({
    totalPatients: 0,
    totalStorageUsed: 0,
    totalStorageLimit: 0,
    activePatients: 0,
    totalDoctors: 0
  });
  const [organizationData, setOrganizationData] = useState<any>(null);
  const [contactDialogOpen, setContactDialogOpen] = useState(false);

  const organizationId = roles.find(r => r.role === 'hospital_admin')?.organizationId;

  useEffect(() => {
    const fetchData = async () => {
      if (!organizationId) return;

      try {
        // Buscar pacientes
        const { data: patientsData, error: patientsError } = await supabase
          .from('profiles')
          .select('id, full_name, email, phone, storage_used_bytes, storage_limit_bytes')
          .eq('organization_id', organizationId);

        if (patientsError) throw patientsError;
        
        const patientsArray = patientsData || [];
        setPatients(patientsArray);

        // Buscar médicos da organização
        const { data: doctorsData, error: doctorsError } = await supabase
          .from('doctors')
          .select('id')
          .eq('organization_id', organizationId)
          .eq('is_active', true);

        if (doctorsError) throw doctorsError;

        // Calcular estatísticas
        const totalStorage = patientsArray.reduce((sum, p) => sum + p.storage_used_bytes, 0);
        const totalLimit = patientsArray.reduce((sum, p) => sum + p.storage_limit_bytes, 0);
        const active = patientsArray.filter(p => p.storage_used_bytes > 0).length;

        setStats({
          totalPatients: patientsArray.length,
          totalStorageUsed: totalStorage,
          totalStorageLimit: totalLimit,
          activePatients: active,
          totalDoctors: doctorsData?.length || 0
        });

        // Buscar dados da organização
        const { data: orgData, error: orgError } = await supabase
          .from('organizations')
          .select('*')
          .eq('id', organizationId)
          .single();

        if (orgError) throw orgError;
        setOrganizationData(orgData);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Erro ao carregar dados');
      } finally {
        setLoading(false);
      }
    };

    if (isHospitalAdmin && organizationId) {
      fetchData();
    }
  }, [isHospitalAdmin, organizationId]);

  const handleSendMessage = async () => {
    if (!messageData.subject.trim() || !messageData.message.trim()) {
      toast.error('Preencha todos os campos');
      return;
    }

    if (selectedPatients.length === 0) {
      toast.error('Selecione pelo menos um paciente');
      return;
    }

    try {
      const messages = selectedPatients.map(patientId => ({
        user_id: patientId,
        subject: messageData.subject,
        message: messageData.message,
        sender_type: 'hospital',
        status: 'unread'
      }));

      const { error } = await supabase
        .from('messages')
        .insert(messages);

      if (error) throw error;

      toast.success(`Mensagem enviada para ${selectedPatients.length} paciente(s)`);
      setMessageDialogOpen(false);
      setMessageData({ subject: '', message: '' });
      setSelectedPatients([]);
    } catch (error) {
      console.error('Error sending messages:', error);
      toast.error('Erro ao enviar mensagens');
    }
  };

  const togglePatientSelection = (patientId: string) => {
    setSelectedPatients(prev =>
      prev.includes(patientId)
        ? prev.filter(id => id !== patientId)
        : [...prev, patientId]
    );
  };

  const selectAllPatients = () => {
    if (selectedPatients.length === patients.length) {
      setSelectedPatients([]);
    } else {
      setSelectedPatients(patients.map(p => p.id));
    }
  };

  const handleContactAM2 = (method: 'system' | 'whatsapp') => {
    if (method === 'whatsapp') {
      const phone = '5545999901902'; // (45) 99990-1902
      const message = encodeURIComponent('Olá AM2 Soluções! Gostaria de falar sobre o sistema de saúde.');
      window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
    } else {
      navigate('/contato');
    }
    setContactDialogOpen(false);
  };

  if (roleLoading) {
    return (
      <Layout title="Painel do Hospital">
        <div className="p-4">Carregando...</div>
      </Layout>
    );
  }

  if (!isHospitalAdmin) {
    return <Navigate to="/" replace />;
  }

  const formatBytes = (bytes: number) => {
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <Layout title="Painel do Hospital">
      <div className="p-4 space-y-6">
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="patients">Pacientes</TabsTrigger>
            <TabsTrigger value="info">Informações</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6 mt-6">
            {/* Cards de Estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total de Pacientes</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalPatients}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.activePatients} ativos
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Médicos Cadastrados</CardTitle>
                  <Stethoscope className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalDoctors}</div>
                  <p className="text-xs text-muted-foreground">
                    Equipe médica ativa
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Armazenamento da Organização</CardTitle>
                  <HardDrive className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <div className="text-2xl font-bold">
                      {((organizationData?.storage_used_bytes || 0) / 1073741824).toFixed(2)} GB
                    </div>
                    <p className="text-xs text-muted-foreground">
                      de {((organizationData?.storage_limit_bytes || 536870912) / 1073741824).toFixed(2)} GB contratados
                    </p>
                  </div>
                  <Progress 
                    value={((organizationData?.storage_used_bytes || 0) / (organizationData?.storage_limit_bytes || 536870912)) * 100} 
                    className="h-2"
                  />
                  {organizationData && (
                    <HospitalStorageUpgradeDialog
                      organizationId={organizationData.id}
                      currentLimit={organizationData.storage_limit_bytes || 536870912}
                      currentUsed={organizationData.storage_used_bytes || 0}
                    />
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Uso de Armazenamento</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats.totalStorageLimit > 0 
                      ? ((stats.totalStorageUsed / stats.totalStorageLimit) * 100).toFixed(1)
                      : 0}%
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 mt-2">
                    <div
                      className="bg-primary h-2 rounded-full"
                      style={{
                        width: `${Math.min((stats.totalStorageUsed / stats.totalStorageLimit) * 100, 100)}%`
                      }}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Organização</CardTitle>
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-lg font-bold line-clamp-2">
                    {organizationData?.name || 'Carregando...'}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Ações Rápidas */}
            <Card>
              <CardHeader>
                <CardTitle>Ações Rápidas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button
                    onClick={() => navigate('/hospital/messaging')}
                    variant="outline"
                    className="h-auto py-6 flex-col gap-2"
                  >
                    <MessageSquare className="h-8 w-8" />
                    <div className="text-center">
                      <p className="font-semibold">Mensagens aos Pacientes</p>
                      <p className="text-xs text-muted-foreground">Enviar alertas e comunicados</p>
                    </div>
                  </Button>
                  <Button
                    onClick={() => setMessageDialogOpen(true)}
                    variant="outline"
                    className="h-auto py-6 flex-col gap-2"
                  >
                    <Send className="h-8 w-8" />
                    <div className="text-center">
                      <p className="font-semibold">Mensagem Individual</p>
                      <p className="text-xs text-muted-foreground">Enviar para pacientes específicos</p>
                    </div>
                  </Button>
                  <Button
                    onClick={() => navigate('/admin/storage')}
                    variant="outline"
                    className="h-auto py-6 flex-col gap-2"
                  >
                    <HardDrive className="h-8 w-8" />
                    <div className="text-center">
                      <p className="font-semibold">Gestão de Armazenamento</p>
                      <p className="text-xs text-muted-foreground">Gerenciar limites de storage</p>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="patients" className="space-y-6 mt-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Meus Pacientes</h2>
                <p className="text-muted-foreground">{patients.length} pacientes cadastrados</p>
              </div>
            </div>

        <Dialog open={messageDialogOpen} onOpenChange={setMessageDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Enviar Mensagem aos Pacientes</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Pacientes Selecionados: {selectedPatients.length}</Label>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-2"
                  onClick={selectAllPatients}
                >
                  {selectedPatients.length === patients.length ? 'Desselecionar Todos' : 'Selecionar Todos'}
                </Button>
              </div>
              <div>
                <Label htmlFor="subject">Assunto</Label>
                <Input
                  id="subject"
                  value={messageData.subject}
                  onChange={(e) => setMessageData({ ...messageData, subject: e.target.value })}
                  placeholder="Ex: Campanha de Vacinação"
                />
              </div>
              <div>
                <Label htmlFor="message">Mensagem</Label>
                <Textarea
                  id="message"
                  value={messageData.message}
                  onChange={(e) => setMessageData({ ...messageData, message: e.target.value })}
                  placeholder="Digite sua mensagem..."
                  rows={5}
                />
              </div>
              <Button onClick={handleSendMessage} className="w-full">
                Enviar para {selectedPatients.length} paciente(s)
              </Button>
            </div>
          </DialogContent>
        </Dialog>

            {loading ? (
              <p>Carregando...</p>
            ) : (
              <div className="grid gap-4">
                {patients.map((patient) => {
                  const storagePercentage = (patient.storage_used_bytes / patient.storage_limit_bytes) * 100;
                  return (
                    <Card key={patient.id} className={selectedPatients.includes(patient.id) ? 'border-primary' : ''}>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={selectedPatients.includes(patient.id)}
                              onChange={() => togglePatientSelection(patient.id)}
                              className="w-4 h-4"
                            />
                            <Users className="h-5 w-5" />
                            {patient.full_name || 'Nome não informado'}
                          </div>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 text-sm">
                          {patient.email && (
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-muted-foreground" />
                              <span>{patient.email}</span>
                            </div>
                          )}
                          {patient.phone && <p><strong>Telefone:</strong> {patient.phone}</p>}
                          <div>
                            <p className="font-medium">Armazenamento:</p>
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-muted rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full ${
                                    storagePercentage >= 80 ? 'bg-destructive' : 'bg-primary'
                                  }`}
                                  style={{ width: `${Math.min(storagePercentage, 100)}%` }}
                                />
                              </div>
                              <span className="text-xs">
                                {formatBytes(patient.storage_used_bytes)} / {formatBytes(patient.storage_limit_bytes)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="info" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Informações da Organização</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {organizationData ? (
                  <>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Nome</p>
                      <p className="text-lg font-semibold">{organizationData.name}</p>
                    </div>
                    {organizationData.type && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Tipo</p>
                        <p className="text-lg">{organizationData.type}</p>
                      </div>
                    )}
                    {organizationData.cnpj && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">CNPJ</p>
                        <p className="text-lg">{organizationData.cnpj}</p>
                      </div>
                    )}
                    {organizationData.address && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Endereço</p>
                        <p className="text-lg">{organizationData.address}</p>
                      </div>
                    )}
                    {organizationData.contact_phone && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Telefone</p>
                        <p className="text-lg">{organizationData.contact_phone}</p>
                      </div>
                    )}
                    {organizationData.contact_email && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Email</p>
                        <p className="text-lg">{organizationData.contact_email}</p>
                      </div>
                    )}
                  </>
                ) : (
                  <p>Carregando informações...</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Contato com AM2 - Suporte Técnico
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Empresa</p>
                  <p className="text-lg font-semibold">AM2 Soluções em Saúde</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Telefone</p>
                  <p className="text-lg">(45) 99990-1902</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p className="text-lg">comercial@am2solucoes.com.br</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Website</p>
                  <a 
                    href="https://www.am2solucoes.com.br" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-lg text-primary hover:underline"
                  >
                    www.am2solucoes.com.br
                  </a>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Localização</p>
                  <p className="text-lg">Cascavel - PR</p>
                </div>
                <Button 
                  onClick={() => setContactDialogOpen(true)} 
                  className="w-full"
                  variant="outline"
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Enviar Mensagem para AM2
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Contact AM2 Dialog */}
        <AlertDialog open={contactDialogOpen} onOpenChange={setContactDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Como deseja entrar em contato?</AlertDialogTitle>
              <AlertDialogDescription>
                Escolha o método preferido para enviar sua mensagem para a AM2 Soluções.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                onClick={() => handleContactAM2('system')}
                className="w-full sm:w-auto"
              >
                <Mail className="mr-2 h-4 w-4" />
                Enviar pelo Sistema
              </Button>
              <Button
                onClick={() => handleContactAM2('whatsapp')}
                className="w-full sm:w-auto bg-green-600 hover:bg-green-700"
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                Enviar pelo WhatsApp
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
};
