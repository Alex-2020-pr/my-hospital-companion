import { Bell, Sparkles } from "lucide-react";
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

interface Message {
  id: string;
  title: string;
  message: string;
  priority: string;
  created_at: string;
  is_read: boolean;
}

export const NotificationBell = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [newVersionsCount, setNewVersionsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchMessages = async () => {
    if (!user) return;

    try {
      // Buscar mensagens da organização do usuário
      const { data: orgMessages, error: msgError } = await supabase
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

      if (msgError) throw msgError;

      // Buscar quais mensagens o usuário já leu
      const { data: reads, error: readsError } = await supabase
        .from('message_reads')
        .select('message_id')
        .eq('user_id', user.id);

      if (readsError) throw readsError;

      const readIds = new Set(reads?.map(r => r.message_id) || []);

      const messagesWithReadStatus = (orgMessages || []).map(msg => ({
        ...msg,
        is_read: readIds.has(msg.id)
      }));

      setMessages(messagesWithReadStatus);
      setUnreadCount(messagesWithReadStatus.filter(m => !m.is_read).length);

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

    // Configurar realtime para novas mensagens
    const channel = supabase
      .channel('organization_messages_changes')
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
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const markAsRead = async (messageId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('message_reads')
        .insert({
          message_id: messageId,
          user_id: user.id
        });

      if (error && !error.message.includes('duplicate')) {
        throw error;
      }

      // Atualizar estado local
      setMessages(prev =>
        prev.map(msg =>
          msg.id === messageId ? { ...msg, is_read: true } : msg
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
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
                          {newVersionsCount} nova{newVersionsCount > 1 ? 's' : ''} atualização{newVersionsCount > 1 ? 'ões' : ''}. Clique para ver.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      msg.is_read
                        ? 'bg-background'
                        : 'bg-accent/50 hover:bg-accent'
                    }`}
                    onClick={() => !msg.is_read && markAsRead(msg.id)}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h5 className="font-medium text-sm">{msg.title}</h5>
                      <Badge
                        className={`text-xs ${getPriorityColor(msg.priority)} text-white`}
                      >
                        {getPriorityLabel(msg.priority)}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      {msg.message}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(msg.created_at).toLocaleString('pt-BR')}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </PopoverContent>
    </Popover>
  );
};
