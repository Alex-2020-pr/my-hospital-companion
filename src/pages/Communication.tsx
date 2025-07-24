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
import { useState } from "react";

export const Communication = () => {
  const [message, setMessage] = useState("");
  const [subject, setSubject] = useState("");

  const recentMessages = [
    {
      id: 1,
      subject: "Reagendamento de consulta",
      message: "Gostaria de reagendar minha consulta do dia 15/01",
      date: "10/01/2024",
      time: "14:30",
      status: "respondida",
      response: "Sua consulta foi reagendada para 18/01 às 14:30"
    },
    {
      id: 2,
      subject: "Dúvida sobre medicamento",
      message: "Posso tomar o medicamento com leite?",
      date: "08/01/2024",
      time: "09:15",
      status: "respondida",
      response: "Evite tomar com leite. Prefira água."
    },
    {
      id: 3,
      subject: "Resultado de exame",
      message: "Quando ficará pronto o resultado do hemograma?",
      date: "05/01/2024",
      time: "16:20",
      status: "pendente"
    }
  ];

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

  const handleSendMessage = () => {
    if (message.trim() && subject.trim()) {
      // Aqui você enviaria a mensagem
      setMessage("");
      setSubject("");
      // Toast de sucesso seria mostrado aqui
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
            {recentMessages.map((msg) => (
              <Card key={msg.id} className="w-full">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-base">{msg.subject}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={getStatusColor(msg.status)}>
                          {getStatusText(msg.status)}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {msg.date} às {msg.time}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <p className="text-sm font-medium mb-1">Sua mensagem:</p>
                    <p className="text-sm text-muted-foreground">{msg.message}</p>
                  </div>

                  {msg.response && (
                    <div className="bg-accent/10 p-3 rounded-lg border border-accent/20">
                      <div className="flex items-center mb-1">
                        <CheckCircle className="h-4 w-4 text-accent mr-2" />
                        <p className="text-sm font-medium text-accent-foreground">
                          Resposta da equipe:
                        </p>
                      </div>
                      <p className="text-sm text-muted-foreground">{msg.response}</p>
                    </div>
                  )}

                  {msg.status === 'pendente' && (
                    <div className="bg-secondary/50 p-3 rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        📝 Sua mensagem foi recebida e será respondida em breve.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};