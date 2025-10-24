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
import { Users, Send, Mail, MessageSquare } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface Patient {
  id: string;
  full_name?: string;
  email?: string;
  phone?: string;
  storage_used_bytes: number;
  storage_limit_bytes: number;
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

  const organizationId = roles.find(r => r.role === 'hospital_admin')?.organizationId;

  useEffect(() => {
    const fetchPatients = async () => {
      if (!organizationId) return;

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name, email, phone, storage_used_bytes, storage_limit_bytes')
          .eq('organization_id', organizationId);

        if (error) throw error;
        setPatients(data || []);
      } catch (error) {
        console.error('Error fetching patients:', error);
        toast.error('Erro ao carregar pacientes');
      } finally {
        setLoading(false);
      }
    };

    if (isHospitalAdmin && organizationId) {
      fetchPatients();
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
        <Card>
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            </div>
          </CardContent>
        </Card>

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
      </div>
    </Layout>
  );
};
