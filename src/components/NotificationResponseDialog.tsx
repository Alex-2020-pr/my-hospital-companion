import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";

interface NotificationResponseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  notificationId: string;
  notificationTitle: string;
}

export const NotificationResponseDialog = ({
  open,
  onOpenChange,
  notificationId,
  notificationTitle,
}: NotificationResponseDialogProps) => {
  const { user } = useAuth();
  const [response, setResponse] = useState("");
  const [sending, setSending] = useState(false);

  const handleSendResponse = async () => {
    if (!user || !response.trim()) return;

    setSending(true);
    try {
      // Buscar a notificação original para pegar o sender_id
      const { data: notification, error: notifError } = await supabase
        .from('push_notifications')
        .select('sender_id, title')
        .eq('id', notificationId)
        .single();

      if (notifError) throw notifError;

      // Salvar a resposta
      const { error: responseError } = await supabase
        .from('notification_responses')
        .insert({
          notification_id: notificationId,
          user_id: user.id,
          response_text: response.trim(),
        });

      if (responseError) throw responseError;

      // Buscar informações do usuário que está respondendo
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('id', user.id)
        .single();

      const senderName = profile?.full_name || profile?.email || 'Um usuário';

      // Enviar notificação push de volta para o sender
      if (notification.sender_id) {
        const { error: pushError } = await supabase
          .from('push_notifications')
          .insert({
            sender_id: user.id,
            recipient_id: notification.sender_id,
            title: `Resposta: ${notification.title}`,
            body: `${senderName} respondeu: ${response.trim()}`,
            is_read: false
          });

        if (pushError) {
          console.error('Error sending push notification:', pushError);
        }
      }

      toast.success('Resposta enviada com sucesso!');
      setResponse("");
      onOpenChange(false);
    } catch (error) {
      console.error('Error sending response:', error);
      toast.error('Erro ao enviar resposta');
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Responder Notificação</DialogTitle>
          <DialogDescription>
            Respondendo a: {notificationTitle}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Textarea
            placeholder="Digite sua resposta..."
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            rows={5}
            className="resize-none"
          />
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={sending}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSendResponse}
              disabled={!response.trim() || sending}
            >
              <Send className="h-4 w-4 mr-2" />
              {sending ? 'Enviando...' : 'Enviar Resposta'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};