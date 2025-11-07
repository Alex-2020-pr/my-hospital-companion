import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, XCircle, AlertCircle, Smartphone } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface DiagnosticResult {
  name: string;
  status: 'success' | 'error' | 'warning';
  message: string;
}

export const PushNotificationDiagnostic = () => {
  const { user } = useAuth();
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [isSendingTest, setIsSendingTest] = useState(false);

  const runDiagnostic = async () => {
    setIsRunning(true);
    const diagnostics: DiagnosticResult[] = [];

    // 1. Verificar suporte do navegador
    const hasServiceWorker = 'serviceWorker' in navigator;
    const hasNotifications = 'Notification' in window;
    diagnostics.push({
      name: 'Suporte do Navegador',
      status: hasServiceWorker && hasNotifications ? 'success' : 'error',
      message: hasServiceWorker && hasNotifications 
        ? 'Navegador suporta notificações push' 
        : 'Navegador não suporta notificações push'
    });

    // 2. Verificar permissões
    if (hasNotifications) {
      const permission = Notification.permission;
      diagnostics.push({
        name: 'Permissão do Sistema',
        status: permission === 'granted' ? 'success' : permission === 'denied' ? 'error' : 'warning',
        message: permission === 'granted' 
          ? 'Permissão concedida' 
          : permission === 'denied'
          ? 'Permissão negada pelo sistema. Vá em Configurações do site e habilite notificações.'
          : 'Permissão não solicitada ainda'
      });
    }

    // 3. Verificar Service Worker
    try {
      const registration = await navigator.serviceWorker.getRegistration('/firebase-messaging-sw.js');
      diagnostics.push({
        name: 'Service Worker',
        status: registration ? 'success' : 'warning',
        message: registration?.active 
          ? `Service Worker ativo (escopo: ${registration.scope})` 
          : 'Service Worker não encontrado'
      });
    } catch (error) {
      diagnostics.push({
        name: 'Service Worker',
        status: 'error',
        message: `Erro ao verificar: ${error}`
      });
    }

    // 4. Verificar subscription no banco
    if (user) {
      try {
        const { data, error } = await supabase
          .from('push_subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          diagnostics.push({
            name: 'Subscription no Banco',
            status: 'error',
            message: `Erro: ${error.message}`
          });
        } else if (data) {
          const tokenLength = data.endpoint?.length || 0;
          const isValidToken = tokenLength > 100 && tokenLength < 300 && !data.endpoint?.includes('http');
          diagnostics.push({
            name: 'Token FCM',
            status: isValidToken ? 'success' : 'error',
            message: isValidToken 
              ? `Token válido (${tokenLength} caracteres)` 
              : `Token inválido ou mal formatado (${tokenLength} caracteres)`
          });
        } else {
          diagnostics.push({
            name: 'Subscription no Banco',
            status: 'warning',
            message: 'Nenhuma subscription encontrada. Ative as notificações primeiro.'
          });
        }
      } catch (error) {
        diagnostics.push({
          name: 'Subscription no Banco',
          status: 'error',
          message: `Erro ao verificar: ${error}`
        });
      }
    }

    // 5. Verificar se é PWA (importante para iOS)
    const isPWA = window.matchMedia('(display-mode: standalone)').matches || 
                  (window.navigator as any).standalone === true;
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);
    
    if (isIOS) {
      diagnostics.push({
        name: 'Instalação PWA (iOS)',
        status: isPWA ? 'success' : 'warning',
        message: isPWA 
          ? 'App instalado como PWA' 
          : 'No iOS, notificações só funcionam se o app estiver instalado na tela inicial (PWA)'
      });
    }

    // 6. Informações sobre plataforma
    diagnostics.push({
      name: 'Plataforma Detectada',
      status: 'success',
      message: `${isIOS ? 'iOS' : isAndroid ? 'Android' : 'Desktop'} | ${isPWA ? 'PWA' : 'Navegador'} | ${navigator.userAgent.includes('Chrome') ? 'Chrome' : navigator.userAgent.includes('Firefox') ? 'Firefox' : 'Outro'}`
    });

    // 7. Testar se consegue criar notificação local
    if (Notification.permission === 'granted') {
      try {
        const testNotification = new Notification('Teste Local', {
          body: 'Se você viu esta notificação, o navegador está funcionando',
          tag: 'test-local',
          silent: true
        });
        setTimeout(() => testNotification.close(), 2000);
        
        diagnostics.push({
          name: 'Notificação Local',
          status: 'success',
          message: 'Conseguiu exibir notificação local'
        });
      } catch (error) {
        diagnostics.push({
          name: 'Notificação Local',
          status: 'error',
          message: `Erro ao criar notificação local: ${error}`
        });
      }
    }

    setResults(diagnostics);
    setIsRunning(false);
  };

  const sendTestNotification = async () => {
    if (!user) {
      toast.error('Usuário não autenticado');
      return;
    }

    setIsSendingTest(true);
    try {
      const { error } = await supabase.functions.invoke('send-push-notification', {
        body: {
          targetUserId: user.id,
          title: '🧪 Teste de Notificação',
          body: `Enviado em ${new Date().toLocaleTimeString()}. Se você recebeu esta mensagem, as notificações estão funcionando!`
        }
      });

      if (error) {
        console.error('Erro ao enviar teste:', error);
        toast.error(`Erro ao enviar: ${error.message}`);
      } else {
        toast.success('Notificação de teste enviada! Verifique seu dispositivo.');
      }
    } catch (error: any) {
      console.error('Erro ao enviar teste:', error);
      toast.error(`Erro: ${error?.message || 'Erro desconhecido'}`);
    } finally {
      setIsSendingTest(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="h-5 w-5" />
          Diagnóstico de Notificações
        </CardTitle>
        <CardDescription>
          Verifique se seu dispositivo está configurado corretamente para receber notificações
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button 
            onClick={runDiagnostic} 
            disabled={isRunning}
            variant="outline"
          >
            {isRunning ? 'Verificando...' : 'Executar Diagnóstico'}
          </Button>
          
          <Button 
            onClick={sendTestNotification} 
            disabled={isSendingTest || !user}
            variant="default"
          >
            {isSendingTest ? 'Enviando...' : 'Enviar Teste'}
          </Button>
        </div>

        {results.length > 0 && (
          <div className="space-y-2 mt-4">
            {results.map((result, index) => (
              <Alert key={index} variant={result.status === 'error' ? 'destructive' : 'default'}>
                <div className="flex items-start gap-2">
                  {getStatusIcon(result.status)}
                  <div className="flex-1">
                    <strong>{result.name}:</strong>
                    <AlertDescription className="mt-1">
                      {result.message}
                    </AlertDescription>
                  </div>
                </div>
              </Alert>
            ))}
          </div>
        )}

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Importante:</strong> Se as notificações não chegam no seu celular:
            <ul className="list-disc ml-5 mt-2 space-y-1">
              <li><strong>Android Chrome:</strong> Configurações → Apps → Chrome → Notificações → Permitir tudo</li>
              <li><strong>Android Firefox:</strong> Configurações → Apps → Firefox → Notificações → Ativar</li>
              <li><strong>iOS Safari:</strong> Adicione o app à tela inicial (Compartilhar → Tela de Início), depois abra pelo ícone</li>
              <li>Desative o modo "Não Perturbe" ou "Foco" do celular</li>
              <li>Modo anônimo/privado pode bloquear notificações</li>
              <li>Limpe o cache do navegador e reative as notificações</li>
              <li>Certifique-se que o site tem permissão no sistema (não só no navegador)</li>
            </ul>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};
