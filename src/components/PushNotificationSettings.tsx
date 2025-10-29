import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, BellOff, Loader2 } from 'lucide-react';
import { usePushNotifications } from '@/hooks/usePushNotifications';

export const PushNotificationSettings = () => {
  const { isSupported, isSubscribed, subscribe, unsubscribe } = usePushNotifications();

  if (!isSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notificações Push
          </CardTitle>
          <CardDescription>
            Notificações push não são suportadas neste navegador
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notificações Push
        </CardTitle>
        <CardDescription>
          Receba alertas importantes sobre seus exames, consultas e medicações
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex-1">
            <h4 className="font-medium">
              {isSubscribed ? 'Notificações Ativadas' : 'Notificações Desativadas'}
            </h4>
            <p className="text-sm text-muted-foreground">
              {isSubscribed 
                ? 'Você receberá notificações push importantes'
                : 'Ative para receber notificações push importantes'}
            </p>
          </div>
          {isSubscribed ? (
            <Button onClick={unsubscribe} variant="outline" size="sm">
              <BellOff className="h-4 w-4 mr-2" />
              Desativar
            </Button>
          ) : (
            <Button onClick={subscribe} size="sm">
              <Bell className="h-4 w-4 mr-2" />
              Ativar
            </Button>
          )}
        </div>

        {isSubscribed && (
          <div className="bg-muted p-3 rounded-lg">
            <p className="text-sm text-muted-foreground">
              ✅ Você receberá notificações para:
            </p>
            <ul className="text-sm text-muted-foreground mt-2 space-y-1 ml-4">
              <li>• Resultados de exames disponíveis</li>
              <li>• Lembretes de consultas agendadas</li>
              <li>• Lembretes de medicamentos</li>
              <li>• Mensagens importantes da sua instituição</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
