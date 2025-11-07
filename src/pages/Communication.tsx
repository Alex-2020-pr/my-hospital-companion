import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MessageCircle, 
  Phone, 
  Mail, 
  Clock, 
  Send,
  HelpCircle,
  AlertTriangle,
  CheckCircle
} from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { formatBrazilDate } from "@/lib/timezone";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  title: string;
  body: string;
  created_at: string;
  is_read: boolean;
  sender_id: string;
  recipient_id: string;
}

export const Communication = () => {
  const [message, setMessage] = useState("");
  const [subject, setSubject] = useState("");
  const [recentMessages, setRecentMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchMessages();
    }
  }, [user]);

  const fetchMessages = async () => {
    if (!user) return;
    
    try {
      // Buscar mensagens push enviadas e recebidas pelo usuário
      const { data, error } = await supabase
        .from('push_notifications')
        .select('*')
        .or(`recipient_id.eq.${user.id},sender_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRecentMessages(data || []);
    } catch (error) {
      console.error('Erro ao buscar mensagens:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      id: "schedule",
      title: "Agendar/Reagendar Consulta",
      description: "Solicitar agendamento ou alteração",
      icon: Clock,
      category: "agendamento"
    },
    {
      id: "documents",
      title: "Segunda Via de Documentos",
      description: "Receitas, atestados e laudos",
      icon: Mail,
      category: "documentos"
    },
    {
      id: "results",
      title: "Status de Exames",
      description: "Consultar andamento dos resultados",
      icon: HelpCircle,
      category: "exames"
    },
    {
      id: "emergency",
      title: "Situação Urgente",
      description: "Para casos que precisam de atenção imediata",
      icon: AlertTriangle,
      category: "urgente"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'respondida':
        return 'default';
      case 'pendente':
        return 'secondary';
      case 'urgente':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'respondida':
        return 'Respondida';
      case 'pendente':
        return 'Pendente';
      case 'urgente':
        return 'Urgente';
      default:
        return status;
    }
  };

  const handleSendMessage = async () => {
    if (message.trim() && subject.trim()) {
      try {
        const { error } = await supabase
          .from('push_notifications')
          .insert({
            sender_id: user?.id,
            recipient_id: user?.id, // Por enquanto envia para si mesmo, pode ser alterado
            title: subject,
            body: message,
            is_read: false
          });

        if (error) throw error;

        toast({
          title: "Mensagem enviada!",
          description: "Sua mensagem foi registrada com sucesso."
        });

        setMessage("");
        setSubject("");
        fetchMessages();
      } catch (error) {
        console.error('Erro ao enviar mensagem:', error);
        toast({
          variant: "destructive",
          title: "Erro ao enviar",
          description: "Não foi possível enviar sua mensagem."
        });
      }
    }
  };

  return (
    <Layout title="Contato">
      <div className="p-4 space-y-4">
        <Tabs defaultValue="contact" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="contact">Nova Mensagem</TabsTrigger>
            <TabsTrigger value="history">Histórico</TabsTrigger>
          </TabsList>

          <TabsContent value="contact" className="space-y-4">
            {/* Ações Rápidas */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Ações Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {quickActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <div
                      key={action.id}
                      className="flex items-center p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                      onClick={() => setSubject(action.title)}
                    >
                      <div className={`p-2 rounded-lg mr-3 ${
                        action.category === 'urgente' 
                          ? 'bg-destructive/10 text-destructive'
                          : 'bg-primary/10 text-primary'
                      }`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{action.title}</h4>
                        <p className="text-xs text-muted-foreground">
                          {action.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Formulário de Contato */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Nova Mensagem</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Assunto</label>
                  <Input
                    placeholder="Digite o assunto da sua mensagem"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Mensagem</label>
                  <Textarea
                    placeholder="Descreva sua dúvida ou solicitação..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={4}
                  />
                </div>

                <Button 
                  onClick={handleSendMessage}
                  className="w-full"
                  disabled={!message.trim() || !subject.trim()}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Enviar Mensagem
                </Button>
              </CardContent>
            </Card>

            {/* Contatos de Emergência */}
            <Card className="border-destructive/20 bg-destructive/5">
              <CardHeader>
                <CardTitle className="text-base text-destructive flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Emergência
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  Para emergências médicas, ligue imediatamente:
                </p>
                <div className="space-y-2">
                  <Button variant="destructive" className="w-full">
                    <Phone className="h-4 w-4 mr-2" />
                    Pronto Socorro: (11) 3333-4444
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Phone className="h-4 w-4 mr-2" />
                    Central de Atendimento: (11) 3333-5555
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            {loading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Carregando mensagens...</p>
              </div>
            ) : recentMessages.length === 0 ? (
              <div className="text-center py-8">
                <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground/50 mb-2" />
                <p className="text-muted-foreground">Nenhuma mensagem encontrada</p>
              </div>
            ) : (
              recentMessages.map((msg) => {
                const isSender = msg.sender_id === user?.id;
                return (
                  <Card key={msg.id} className="w-full">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-base">{msg.title}</CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant={msg.is_read ? 'default' : 'secondary'}>
                              {msg.is_read ? 'Lida' : 'Não lida'}
                            </Badge>
                            <Badge variant={isSender ? 'outline' : 'default'}>
                              {isSender ? 'Enviada' : 'Recebida'}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {formatBrazilDate(msg.created_at)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="bg-muted/50 p-3 rounded-lg">
                        <p className="text-sm text-muted-foreground">{msg.body}</p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};