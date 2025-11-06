import { Bell, Sparkles, Reply } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { NotificationResponseDialog } from "./NotificationResponseDialog";
import { PushNotificationDemo } from "./PushNotificationDemo";
import { formatBrazilDate } from "@/lib/timezone";

interface Message {
  id: string;
  title: string;
  message: string;
  priority: string;
  created_at: string;
  is_read: boolean;
  type: 'organization' | 'push';
  sender_name?: string;
}

export const NotificationBell = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [newVersionsCount, setNewVersionsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [responseDialogOpen, setResponseDialogOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<{ id: string; title: string } | null>(null);

  const fetchMessages = async () => {
    if (!user) return;

    try {
      // Buscar perfil do usuário para pegar a organization_id
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      // Buscar mensagens da organização do usuário
      let query = supabase
        .from('organization_messages')
        .select(`
          id,
          title,
          message,
          priority,
          created_at
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(10);

      // Aplicar filtro de organization_id corretamente
      if (profile.organization_id === null) {
        query = query.is('organization_id', null);
      } else {
        query = query.eq('organization_id', profile.organization_id);
      }

      const { data: orgMessages, error: msgError } = await query;

      if (msgError) throw msgError;

      // Buscar notificações push do usuário (enviadas e recebidas)
      const { data: pushNotifications, error: pushError } = await supabase
        .from('push_notifications')
        .select('id, title, body, created_at, is_read, sender_id, recipient_id')
        .or(`recipient_id.eq.${user.id},sender_id.eq.${user.id}`)
        .order('created_at', { ascending: false })
        .limit(10);

      if (pushError) throw pushError;

      // Buscar informações dos remetentes
      const senderIds = [...new Set(pushNotifications?.map(n => n.sender_id).filter(Boolean) || [])];
      const { data: senders } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', senderIds);

      const sendersMap = new Map(senders?.map(s => [s.id, s]) || []);

      // Buscar quais mensagens o usuário já leu
      const { data: reads, error: readsError } = await supabase
        .from('message_reads')
        .select('message_id')
        .eq('user_id', user.id);

      if (readsError) throw readsError;

      const readIds = new Set(reads?.map(r => r.message_id) || []);

      // Combinar mensagens de organização
      const orgMessagesWithReadStatus = (orgMessages || []).map(msg => ({
        ...msg,
        is_read: readIds.has(msg.id),
        type: 'organization' as const
      }));

      // Combinar notificações push com seu próprio estado de is_read
      const pushMessagesFormatted = (pushNotifications || []).map(notif => {
        const sender = sendersMap.get(notif.sender_id);
        return {
          id: notif.id,
          title: notif.title,
          message: notif.body,
          priority: 'normal',
          created_at: notif.created_at,
          is_read: notif.is_read,
          type: 'push' as const,
          sender_name: sender?.full_name || sender?.email || 'Sistema'
        };
      });

      // Combinar e ordenar todas as notificações
      const allMessages = [...orgMessagesWithReadStatus, ...pushMessagesFormatted]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 15);

      setMessages(allMessages);
      setUnreadCount(allMessages.filter(m => !m.is_read).length);

      // Check for new versions
      const { data: versionsData } = await supabase
        .from('app_versions')
        .select('id')
        .eq('is_published', true);

      const { data: viewedData } = await supabase
        .from('user_version_views')
        .select('version_id')
        .eq('user_id', user.id);

      const viewedIds = new Set(viewedData?.map(v => v.version_id) || []);
      const unviewedCount = versionsData?.filter(v => !viewedIds.has(v.id)).length || 0;
      
      setNewVersionsCount(unviewedCount);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();

    // Configurar realtime para novas mensagens e notificações push
    const channel = supabase
      .channel('notifications_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'organization_messages'
        },
        () => {
          fetchMessages();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'push_notifications',
          filter: `recipient_id=eq.${user?.id}`
        },
        () => {
          fetchMessages();
          toast.success('Nova notificação recebida!');
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const markAsRead = async (messageId: string, messageType: 'organization' | 'push') => {
    if (!user) return;

    try {
      if (messageType === 'organization') {
        // Mensagens de organização vão para message_reads
        const { error } = await supabase
          .from('message_reads')
          .insert({
            message_id: messageId,
            user_id: user.id
          });

        if (error && !error.message.includes('duplicate')) {
          throw error;
        }
      } else if (messageType === 'push') {
        // Notificações push atualizam seu próprio campo is_read
        // Buscar a notificação primeiro para verificar permissões
        const { data: notification } = await supabase
          .from('push_notifications')
          .select('recipient_id, sender_id')
          .eq('id', messageId)
          .single();

        // Só atualiza se o usuário for recipient ou sender
        if (notification && (notification.recipient_id === user.id || notification.sender_id === user.id)) {
          const { error } = await supabase
            .from('push_notifications')
            .update({ is_read: true })
            .eq('id', messageId);

          if (error) {
            throw error;
          }
        }
      }

      // Atualizar estado local
      setMessages(prev =>
        prev.map(msg =>
          msg.id === messageId ? { ...msg, is_read: true } : msg
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      // Refetch para garantir sincronização
      await fetchMessages();
    } catch (error) {
      console.error('Error marking message as read:', error);
      toast.error('Erro ao marcar mensagem como lida');
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

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {(unreadCount + newVersionsCount) > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {(unreadCount + newVersionsCount) > 9 ? '9+' : (unreadCount + newVersionsCount)}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold">Notificações</h4>
            {(unreadCount + newVersionsCount) > 0 && (
              <Badge variant="secondary">{unreadCount + newVersionsCount} não lida(s)</Badge>
            )}
          </div>
          <ScrollArea className="h-[400px]">
            {loading ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Carregando...
              </p>
            ) : (messages.length === 0 && newVersionsCount === 0) ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhuma notificação
              </p>
            ) : (
              <div className="space-y-2">
                {newVersionsCount > 0 && (
                  <div
                    className="p-3 rounded-lg border bg-primary/10 hover:bg-primary/20 cursor-pointer transition-colors"
                    onClick={() => navigate('/changelog')}
                  >
                    <div className="flex items-start gap-2">
                      <Sparkles className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <h5 className="font-medium text-sm">Novidades Disponíveis!</h5>
                        <p className="text-xs text-muted-foreground">
                          {newVersionsCount} nova{newVersionsCount > 1 ? 's' : ''} atualiza{newVersionsCount > 1 ? 'ções' : 'ção'}. Clique para ver.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`p-3 rounded-lg border transition-colors ${
                      msg.is_read
                        ? 'bg-background'
                        : 'bg-accent/50'
                    }`}
                  >
                    <div 
                      className="cursor-pointer"
                      onClick={() => !msg.is_read && markAsRead(msg.id, msg.type)}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h5 className="font-medium text-sm">{msg.title}</h5>
                        <Badge
                          className={`text-xs ${getPriorityColor(msg.priority)} text-white`}
                        >
                          {getPriorityLabel(msg.priority)}
                        </Badge>
                      </div>
                      {msg.sender_name && (
                        <p className="text-xs text-muted-foreground mb-1">
                          De: {msg.sender_name}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mb-2">
                        {msg.message}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatBrazilDate(msg.created_at)}
                      </p>
                    </div>
                    {msg.type === 'push' && (
                      <div className="mt-2 pt-2 border-t">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedNotification({ id: msg.id, title: msg.title });
                            setResponseDialogOpen(true);
                          }}
                        >
                          <Reply className="h-3 w-3 mr-1" />
                          Responder
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
          <PushNotificationDemo />
        </div>
      </PopoverContent>
      {selectedNotification && (
        <NotificationResponseDialog
          open={responseDialogOpen}
          onOpenChange={setResponseDialogOpen}
          notificationId={selectedNotification.id}
          notificationTitle={selectedNotification.title}
        />
      )}
    </Popover>
  );
};
