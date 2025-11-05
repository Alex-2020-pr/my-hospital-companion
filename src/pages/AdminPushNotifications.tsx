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
import { Bell, Send, Users, Loader2, BellOff, RefreshCw, TestTube } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";

interface User {
  id: string;
  full_name: string;
  email: string;
  hasNotifications?: boolean;
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
  responses?: Array<{
    id: string;
    response_text: string;
    created_at: string;
    user_name: string;
  }>;
}

export const AdminPushNotifications = () => {
  const { isSuperAdmin, loading: roleLoading } = useUserRole();
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [sendingTest, setSendingTest] = useState(false);
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

    // Verificar quais usuários têm notificações ativadas
    const { data: subs } = await supabase
      .from('push_subscriptions')
      .select('user_id');

    const usersWithNotifications = new Set(subs?.map(s => s.user_id) || []);

    const usersWithStatus = (data || []).map(user => ({
      ...user,
      hasNotifications: usersWithNotifications.has(user.id)
    }));

    setUsers(usersWithStatus);
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

      // Buscar respostas para cada notificação
      const notificationIds = data.map(n => n.id);
      const { data: responses } = await supabase
        .from('notification_responses')
        .select('id, notification_id, response_text, created_at, user_id')
        .in('notification_id', notificationIds)
        .order('created_at', { ascending: false });

      // Buscar perfis dos usuários que responderam
      const responseUserIds = [...new Set(responses?.map(r => r.user_id) || [])];
      const { data: responseUsers } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', responseUserIds);

      const responseUsersMap = new Map(responseUsers?.map(u => [u.id, u]) || []);

      // Agrupar respostas por notification_id
      const responsesMap = new Map<string, Array<any>>();
      responses?.forEach(resp => {
        if (!responsesMap.has(resp.notification_id)) {
          responsesMap.set(resp.notification_id, []);
        }
        const respUser = responseUsersMap.get(resp.user_id);
        responsesMap.get(resp.notification_id)?.push({
          id: resp.id,
          response_text: resp.response_text,
          created_at: resp.created_at,
          user_name: respUser?.full_name || respUser?.email || 'Usuário'
        });
      });

      const historyWithProfiles = data.map(notif => ({
        ...notif,
        profiles: profilesMap.get(notif.recipient_id!) || { full_name: 'Desconhecido', email: '' },
        responses: responsesMap.get(notif.id) || []
      }));

      setHistory(historyWithProfiles);
    }
    setLoadingHistory(false);
  };

  const handleSendTest = async () => {
    if (!user?.id) {
      toast.error('Usuário não autenticado');
      return;
    }

    setSendingTest(true);

    try {
      console.log('[Admin] Enviando notificação de teste para:', user.id);
      
      const { error } = await supabase.functions.invoke('send-push-notification', {
        body: {
          userId: user.id,
          title: '🧪 Teste de Notificação',
          body: 'Se você está vendo isso, as notificações estão funcionando! ✅'
        }
      });

      if (error) {
        console.error('[Admin] Erro ao enviar teste:', error);
        toast.error('Erro ao enviar teste: ' + error.message);
        throw error;
      }

      console.log('[Admin] Teste enviado com sucesso!');
      toast.success('Teste enviado! Verifique se a notificação apareceu.');
      loadHistory();
    } catch (error) {
      console.error('[Admin] Erro ao enviar teste:', error);
    } finally {
      setSendingTest(false);
    }
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

      if (error) {
        // Verificar se é erro de notificações não ativadas
        const errorMessage = error.message || '';
        if (errorMessage.includes('notificações ativadas') || errorMessage.includes('userHasNotifications')) {
          toast.error('Este usuário não ativou as notificações push no perfil');
        } else {
          toast.error('Erro ao enviar notificação: ' + errorMessage);
        }
        throw error;
      }

      toast.success('Notificação enviada com sucesso!');
      setTitle('');
      setBody('');
      setSelectedUserId('');
      loadHistory();
    } catch (error) {
      console.error('Erro ao enviar notificação:', error);
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

        <div className="mb-6 space-y-4">
          <div className="p-4 border rounded-lg bg-muted/50">
            <div className="flex items-start gap-2">
              <RefreshCw className="h-4 w-4 mt-0.5 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">
                  <strong>Notificações não chegando?</strong> Tente: 1) Verificar permissões no celular/navegador, 2) Desativar e reativar notificações no Perfil, 3) Limpar cache do app (Ctrl+Shift+R)
                </p>
              </div>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <TestTube className="h-4 w-4" />
                Teste de Notificação
              </CardTitle>
              <CardDescription>
                Envie uma notificação de teste para você mesmo para verificar se está funcionando
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={handleSendTest} 
                disabled={sendingTest}
                variant="outline"
                className="w-full"
              >
                {sendingTest ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando teste...
                  </>
                ) : (
                  <>
                    <TestTube className="mr-2 h-4 w-4" />
                    Enviar Notificação de Teste para Mim
                  </>
                )}
              </Button>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Após clicar, verifique o console do navegador (F12) para ver os logs do service worker
              </p>
            </CardContent>
          </Card>
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
                      <div className="flex items-center gap-2">
                        <span>{user.full_name || user.email}</span>
                        {!user.hasNotifications && (
                          <Badge variant="destructive" className="text-xs">
                            <BellOff className="h-3 w-3 mr-1" />
                            Sem notificações
                          </Badge>
                        )}
                      </div>
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
                    {notif.responses && notif.responses.length > 0 && (
                      <div className="mt-3 pt-3 border-t space-y-2">
                        <p className="text-xs font-semibold text-muted-foreground">
                          Respostas ({notif.responses.length}):
                        </p>
                        {notif.responses.map((resp) => (
                          <div key={resp.id} className="pl-3 border-l-2 border-primary/30">
                            <p className="text-xs font-medium">{resp.user_name}</p>
                            <p className="text-xs text-muted-foreground">{resp.response_text}</p>
                            <p className="text-xs text-muted-foreground/70 mt-1">
                              {new Date(resp.created_at).toLocaleString('pt-BR')}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
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
