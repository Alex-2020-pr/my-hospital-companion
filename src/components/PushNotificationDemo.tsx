import { Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

/**
 * Componente educativo sobre push notifications
 * Mostra quando e como as notificações aparecem
 */
export const PushNotificationDemo = () => {
  return (
    <Alert className="mt-4">
      <Info className="h-4 w-4" />
      <AlertDescription className="text-sm space-y-2">
        <p className="font-medium">Como funcionam as notificações push:</p>
        <ul className="list-disc list-inside space-y-1 text-xs text-muted-foreground">
          <li>
            <strong>App aberto/em uso:</strong> Notificações aparecem no sininho 🔔 (acima)
          </li>
          <li>
            <strong>App minimizado/fechado:</strong> Notificações aparecem na tela de bloqueio e central de notificações do celular
          </li>
          <li>
            <strong>PWA instalado:</strong> Recebe notificações mesmo com navegador fechado
          </li>
        </ul>
        
        <div className="mt-3 p-3 bg-muted/50 rounded-lg border border-border">
          <p className="text-xs font-medium mb-2">Exemplo de notificação no celular:</p>
          <div className="bg-background rounded p-3 shadow-md border">
            <div className="flex items-start gap-2">
              <div className="w-8 h-8 bg-primary rounded flex items-center justify-center text-white text-lg">
                🔔
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold">AM2 App</p>
                <p className="text-xs font-medium mt-0.5">Nova Notificação</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Você tem uma nova mensagem
                </p>
                <div className="flex gap-2 mt-2">
                  <span className="text-[10px] text-primary font-medium">ABRIR</span>
                  <span className="text-[10px] text-muted-foreground font-medium">FECHAR</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
};
