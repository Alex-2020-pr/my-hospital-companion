import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUserRole } from "@/hooks/useUserRole";
import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Send, MessageSquare, Eye, EyeOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

interface Message {
  id: string;
  title: string;
  message: string;
  priority: string;
  is_active: boolean;
  created_at: string;
  read_count?: number;
}

export const HospitalMessaging = () => {
  const { user } = useAuth();
  const { isHospitalAdmin, loading: roleLoading } = useUserRole();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    priority: 'normal'
  });

  useEffect(() => {
    const fetchOrganizationAndMessages = async () => {
      if (!user || !isHospitalAdmin) return;

      try {
        // Buscar a organização do admin
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('organization_id')
          .eq('user_id', user.id)
          .eq('role', 'hospital_admin')
          .single();

        if (roleError) throw roleError;

        setOrganizationId(roleData.organization_id);

        // Buscar mensagens da organização
        const { data: messagesData, error: messagesError } = await supabase
          .from('organization_messages')
          .select('*')
          .eq('organization_id', roleData.organization_id)
          .order('created_at', { ascending: false });

        if (messagesError) throw messagesError;

        // Para cada mensagem, buscar quantas pessoas leram
        const messagesWithReads = await Promise.all(
          (messagesData || []).map(async (msg) => {
            const { count } = await supabase
              .from('message_reads')
              .select('*', { count: 'exact', head: true })
              .eq('message_id', msg.id);

            return { ...msg, read_count: count || 0 };
          })
        );

        setMessages(messagesWithReads);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Erro ao carregar dados');
      } finally {
        setLoading(false);
      }
    };

    if (isHospitalAdmin) {
      fetchOrganizationAndMessages();
    }
  }, [user, isHospitalAdmin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!organizationId || !user) return;

    try {
      const { error } = await supabase
        .from('organization_messages')
        .insert([{
          organization_id: organizationId,
          sender_id: user.id,
          title: formData.title,
          message: formData.message,
          priority: formData.priority
        }]);

      if (error) throw error;

      toast.success('Mensagem enviada com sucesso!');
      setFormData({ title: '', message: '', priority: 'normal' });

      // Recarregar mensagens
      const { data: messagesData } = await supabase
        .from('organization_messages')
        .select('*')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false });

      const messagesWithReads = await Promise.all(
        (messagesData || []).map(async (msg) => {
          const { count } = await supabase
            .from('message_reads')
            .select('*', { count: 'exact', head: true })
            .eq('message_id', msg.id);

          return { ...msg, read_count: count || 0 };
        })
      );

      setMessages(messagesWithReads);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Erro ao enviar mensagem');
    }
  };

  const toggleMessageActive = async (messageId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('organization_messages')
        .update({ is_active: !currentStatus })
        .eq('id', messageId);

      if (error) throw error;

      setMessages(prev =>
        prev.map(msg =>
          msg.id === messageId ? { ...msg, is_active: !currentStatus } : msg
        )
      );

      toast.success(
        !currentStatus ? 'Mensagem ativada' : 'Mensagem desativada'
      );
    } catch (error) {
      console.error('Error toggling message:', error);
      toast.error('Erro ao atualizar mensagem');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-500';
      case 'high':
        return 'bg-orange-500';
      case 'normal':
        return 'bg-blue-500';
      case 'low':
        return 'bg-gray-500';
      default:
        return 'bg-blue-500';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'Urgente';
      case 'high':
        return 'Alta';
      case 'normal':
        return 'Normal';
      case 'low':
        return 'Baixa';
      default:
        return 'Normal';
    }
  };

  if (roleLoading || loading) {
    return (
      <Layout title="Mensagens aos Pacientes">
        <div className="p-4">Carregando...</div>
      </Layout>
    );
  }

  if (!isHospitalAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <Layout title="Mensagens aos Pacientes">
      <div className="p-4 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              Enviar Nova Mensagem
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ex: Campanha de Vacinação"
                  required
                />
              </div>
              <div>
                <Label htmlFor="message">Mensagem</Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Digite a mensagem para os pacientes..."
                  rows={4}
                  required
                />
              </div>
              <div>
                <Label htmlFor="priority">Prioridade</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) => setFormData({ ...formData, priority: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Baixa</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                    <SelectItem value="urgent">Urgente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full">
                <Send className="h-4 w-4 mr-2" />
                Enviar Mensagem
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Mensagens Enviadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            {messages.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                Nenhuma mensagem enviada ainda
              </p>
            ) : (
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className="border rounded-lg p-4 space-y-2"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold">{msg.title}</h4>
                          <Badge
                            className={`${getPriorityColor(msg.priority)} text-white`}
                          >
                            {getPriorityLabel(msg.priority)}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {msg.message}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>
                            {new Date(msg.created_at).toLocaleString('pt-BR')}
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {msg.read_count} visualizações
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={msg.is_active}
                          onCheckedChange={() => toggleMessageActive(msg.id, msg.is_active)}
                        />
                        {msg.is_active ? (
                          <Eye className="h-4 w-4 text-green-500" />
                        ) : (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};
