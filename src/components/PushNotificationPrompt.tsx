import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, X } from 'lucide-react';
import { usePushNotifications } from '@/hooks/usePushNotifications';

export const PushNotificationPrompt = () => {
  const { isSupported, isSubscribed, subscribe } = usePushNotifications();
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Mostrar o prompt apenas se suportado e não inscrito
    const hasShown = localStorage.getItem('push-prompt-shown');
    if (isSupported && !isSubscribed && !hasShown) {
      // Aguardar 3 segundos antes de mostrar
      setTimeout(() => setShow(true), 3000);
    }
  }, [isSupported, isSubscribed]);

  const handleSubscribe = async () => {
    await subscribe();
    localStorage.setItem('push-prompt-shown', 'true');
    setShow(false);
  };

  const handleDismiss = () => {
    localStorage.setItem('push-prompt-shown', 'true');
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md animate-in slide-in-from-bottom-5">
      <Card>
        <CardHeader className="relative pb-3">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2 h-6 w-6"
            onClick={handleDismiss}
          >
            <X className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Ativar Notificações</CardTitle>
          </div>
          <CardDescription>
            Receba alertas importantes sobre seus exames, consultas e medicações
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button onClick={handleSubscribe} className="w-full">
            Ativar Notificações
          </Button>
          <Button onClick={handleDismiss} variant="ghost" className="w-full">
            Agora não
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
