import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { ShoppingCart } from 'lucide-react';

interface StoragePurchaseDialogProps {
  currentLimit: number;
  organizationId?: string;
}

export const StoragePurchaseDialog = ({ currentLimit, organizationId }: StoragePurchaseDialogProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('');
  const [loading, setLoading] = useState(false);

  // Custo base Supabase: $0.021/GB/mês
  // Margem de lucro: 200% (3x)
  const SUPABASE_COST_PER_GB = 0.021;
  const PROFIT_MARGIN = 3;
  const COST_PER_GB = SUPABASE_COST_PER_GB * PROFIT_MARGIN;

  // Planos baseados no custo do Supabase com margem de 200%
  const plans = [
    { 
      id: '1gb',
      name: '1 GB Extra',
      size: 1024, // MB
      cost: parseFloat((1 * COST_PER_GB * 5.5).toFixed(2)), // Convertido para BRL
      popular: false
    },
    { 
      id: '5gb',
      name: '5 GB Extra',
      size: 5120, // MB
      cost: parseFloat((5 * COST_PER_GB * 5.5).toFixed(2)),
      popular: true
    },
    { 
      id: '10gb',
      name: '10 GB Extra',
      size: 10240, // MB
      cost: parseFloat((10 * COST_PER_GB * 5.5).toFixed(2)),
      popular: false
    },
    { 
      id: '50gb',
      name: '50 GB Extra',
      size: 51200, // MB
      cost: parseFloat((50 * COST_PER_GB * 5.5).toFixed(2)),
      popular: false
    }
  ];

  const handlePurchase = async () => {
    if (!user || !selectedPlan) return;

    try {
      setLoading(true);
      const plan = plans.find(p => p.id === selectedPlan);
      if (!plan) return;

      const newLimitBytes = (currentLimit + (plan.size * 1024 * 1024));

      // Criar solicitação de compra
      const { data: insertData, error } = await supabase
        .from('storage_requests')
        .insert({
          user_id: user.id,
          organization_id: organizationId,
          requested_bytes: newLimitBytes,
          request_type: 'purchase',
          amount_paid: plan.cost,
          notes: `Compra de ${plan.name} - R$ ${plan.cost.toFixed(2)}`
        })
        .select()
        .single();

      if (error) throw error;

      // Notificar super admin
      await supabase.functions.invoke('notify-storage-request', {
        body: {
          requestId: insertData.id,
          requestType: 'patient',
          userId: user.id,
          organizationId,
          planName: plan.name,
          amount: plan.cost.toFixed(2)
        }
      });

      toast({
        title: 'Solicitação enviada!',
        description: 'Seu pedido foi enviado para análise. O administrador entrará em contato.'
      });

      setOpen(false);
      setSelectedPlan('');
    } catch (error) {
      console.error('Error purchasing storage:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível processar a compra.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">
          <ShoppingCart className="h-4 w-4 mr-2" />
          Comprar Mais Espaço
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Comprar Armazenamento Extra</DialogTitle>
          <DialogDescription>
            Escolha um plano de armazenamento adicional. Os valores são cobrados mensalmente.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <RadioGroup value={selectedPlan} onValueChange={setSelectedPlan}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className={`relative border rounded-lg p-4 cursor-pointer transition-all ${
                    selectedPlan === plan.id ? 'border-primary ring-2 ring-primary' : 'border-border'
                  } ${plan.popular ? 'border-primary' : ''}`}
                  onClick={() => setSelectedPlan(plan.id)}
                >
                  {plan.popular && (
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2">
                      <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                        Mais Popular
                      </span>
                    </div>
                  )}
                  <div className="flex items-start gap-3">
                    <RadioGroupItem value={plan.id} id={plan.id} />
                    <div className="flex-1">
                      <Label htmlFor={plan.id} className="cursor-pointer">
                        <div className="font-semibold text-lg">{plan.name}</div>
                        <div className="text-2xl font-bold text-primary mt-1">
                          R$ {plan.cost.toFixed(2)}
                          <span className="text-sm text-muted-foreground">/mês</span>
                        </div>
                        <div className="text-sm text-muted-foreground mt-2">
                          Seu novo limite: {((currentLimit + (plan.size * 1024 * 1024)) / (1024 * 1024)).toFixed(0)} MB
                        </div>
                      </Label>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </RadioGroup>

          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">
              • Cobrança mensal recorrente<br />
              • Você pode cancelar a qualquer momento<br />
              • O espaço adicional é ativado imediatamente após confirmação do pagamento
            </p>
          </div>

          <Button 
            onClick={handlePurchase} 
            disabled={loading || !selectedPlan} 
            className="w-full"
          >
            {loading ? 'Processando...' : 'Continuar para Pagamento'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
