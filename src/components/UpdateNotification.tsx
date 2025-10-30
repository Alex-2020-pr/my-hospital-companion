import { useServiceWorkerUpdate } from '@/hooks/useServiceWorkerUpdate';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { RefreshCw, X } from 'lucide-react';
import { useState } from 'react';

export const UpdateNotification = () => {
  const { updateAvailable, applyUpdate, clearCacheAndReload } = useServiceWorkerUpdate();
  const [dismissed, setDismissed] = useState(false);

  if (!updateAvailable || dismissed) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96 animate-in slide-in-from-bottom-5">
      <Card className="p-4 shadow-lg border-primary/20 bg-card">
        <div className="flex items-start gap-3">
          <RefreshCw className="w-5 h-5 text-primary mt-0.5 animate-spin" />
          <div className="flex-1 space-y-3">
            <div>
              <h3 className="font-semibold text-sm">Nova versão disponível</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Uma atualização está pronta para ser instalada.
              </p>
            </div>
            <div className="flex gap-2">
              <Button 
                size="sm" 
                onClick={applyUpdate}
                className="flex-1"
              >
                Atualizar
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => setDismissed(true)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <Button 
              size="sm" 
              variant="ghost"
              onClick={clearCacheAndReload}
              className="w-full text-xs"
            >
              Limpar cache e recarregar
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
