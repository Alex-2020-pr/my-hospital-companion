import { Button } from '@/components/ui/button';
import { useServiceWorkerUpdate } from '@/hooks/useServiceWorkerUpdate';
import { RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const CacheClearButton = () => {
  const { clearCacheAndReload } = useServiceWorkerUpdate();
  const { toast } = useToast();

  const handleClearCache = () => {
    toast({
      title: "Limpando cache...",
      description: "O aplicativo será recarregado em instantes.",
    });
    
    setTimeout(() => {
      clearCacheAndReload();
    }, 1000);
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleClearCache}
      className="gap-2"
    >
      <RefreshCw className="w-4 h-4" />
      Limpar Cache
    </Button>
  );
};
