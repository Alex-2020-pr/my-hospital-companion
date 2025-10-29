import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useUserRole } from "@/hooks/useUserRole";
import { Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Bell, Send, Users, Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface User {
  id: string;
  full_name: string;
  email: string;
}

interface NotificationHistory {
  id: string;
  title: string;
  body: string;
  sent_at: string;
  recipient_id: string;
  profiles: {
    full_name: string;
    email: string;
  };
}

export const AdminPushNotifications = () => {
  const { isSuperAdmin, loading: roleLoading } = useUserRole();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [history, setHistory] = useState<NotificationHistory[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    if (isSuperAdmin) {
      loadUsers();
      loadHistory();
    }
  }, [isSuperAdmin]);

  const loadUsers = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .order('full_name');

    if (error) {
      console.error('Erro ao carregar usuários:', error);
      return;
    }

    setUsers(data || []);
  };

  const loadHistory = async () => {
    const { data, error } = await supabase
      .from('push_notifications')
      .select(`
        id,
        title,
        body,
        sent_at,
        recipient_id
      `)
      .order('sent_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Erro ao carregar histórico:', error);
      setHistory([]);
    } else {
      // Buscar os perfis dos recipients
      const recipientIds = data.map(n => n.recipient_id).filter(Boolean);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', recipientIds);

      const profilesMap = new Map(profiles?.map(p => [p.id, p]) || []);

      const historyWithProfiles = data.map(notif => ({
        ...notif,
        profiles: profilesMap.get(notif.recipient_id!) || { full_name: 'Desconhecido', email: '' }
      }));

      setHistory(historyWithProfiles);
    }
    setLoadingHistory(false);
  };

  const handleSend = async () => {
    if (!selectedUserId || !title || !body) {
      toast.error('Preencha todos os campos');
      return;
    }

    setSending(true);

    try {
      const { error } = await supabase.functions.invoke('send-push-notification', {
        body: {
          userId: selectedUserId,
          title,
          body
        }
      });

      if (error) throw error;

      toast.success('Notificação enviada com sucesso!');
      setTitle('');
      setBody('');
      setSelectedUserId('');
      loadHistory();
    } catch (error) {
      console.error('Erro ao enviar notificação:', error);
      toast.error('Erro ao enviar notificação');
    } finally {
      setSending(false);
    }
  };

  if (roleLoading) {
    return (
      <Layout title="Notificações Push">
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </Layout>
    );
  }

  if (!isSuperAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <Layout title="Notificações Push">
      <div className="p-4 space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Bell className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Notificações Push</h1>
            <p className="text-muted-foreground">Envie notificações personalizadas para os usuários</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              Enviar Notificação
            </CardTitle>
            <CardDescription>
              Selecione um usuário e envie uma notificação push personalizada
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="user">Destinatário</Label>
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um usuário" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.full_name || user.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Novo exame disponível"
                maxLength={50}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="body">Mensagem</Label>
              <Textarea
                id="body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Ex: Seu resultado de exame está disponível para visualização"
                rows={4}
                maxLength={200}
              />
            </div>

            <Button 
              onClick={handleSend} 
              disabled={sending || !selectedUserId || !title || !body}
              className="w-full"
            >
              {sending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Enviar Notificação
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Histórico de Notificações
            </CardTitle>
            <CardDescription>
              Últimas 20 notificações enviadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingHistory ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : history.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Nenhuma notificação enviada ainda
              </p>
            ) : (
              <div className="space-y-3">
                {history.map((notif) => (
                  <div key={notif.id} className="p-4 border rounded-lg space-y-2">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-semibold">{notif.title}</h4>
                        <p className="text-sm text-muted-foreground">{notif.body}</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-xs text-muted-foreground">
                      <span>
                        Para: {notif.profiles?.full_name || notif.profiles?.email || 'Usuário desconhecido'}
                      </span>
                      <span>
                        {new Date(notif.sent_at).toLocaleString('pt-BR')}
                      </span>
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
