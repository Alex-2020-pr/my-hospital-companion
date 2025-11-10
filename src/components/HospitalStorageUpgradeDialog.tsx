import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Package, TrendingUp, DollarSign } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

interface HospitalStorageUpgradeDialogProps {
  organizationId: string;
  currentLimit: number;
  currentUsed: number;
}

export const HospitalStorageUpgradeDialog = ({ 
  organizationId, 
  currentLimit, 
  currentUsed 
}: HospitalStorageUpgradeDialogProps) => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [additionalGB, setAdditionalGB] = useState<number>(10);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Custo base Supabase: $0.021/GB/mês
  // Margem de lucro: 200% (3x)
  const SUPABASE_COST_PER_GB = 0.021;
  const PROFIT_MARGIN = 3;
  const COST_PER_GB = SUPABASE_COST_PER_GB * PROFIT_MARGIN;

  const calculateMonthlyPrice = (gb: number) => {
    return (gb * COST_PER_GB).toFixed(2);
  };

  const handleSubmit = async () => {
    if (additionalGB < 1) {
      toast.error("Selecione pelo menos 1 GB adicional");
      return;
    }

    if (!user) {
      toast.error("Usuário não autenticado");
      return;
    }

    setSubmitting(true);
    try {
      const requestedBytes = additionalGB * 1073741824; // GB para bytes
      const monthlyAmount = parseFloat(calculateMonthlyPrice(additionalGB));

      const { data: insertData, error } = await supabase
        .from('storage_requests')
        .insert({
          user_id: user.id,
          organization_id: organizationId,
          request_type: 'increase',
          requested_bytes: requestedBytes,
          amount_paid: monthlyAmount,
          notes: notes || `Solicitação de ${additionalGB} GB adicionais. Valor mensal: R$ ${(monthlyAmount * 5.5).toFixed(2)}`,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      // Notificar super admin
      await supabase.functions.invoke('notify-storage-request', {
        body: {
          requestId: insertData.id,
          requestType: 'hospital',
          userId: user.id,
          organizationId: organizationId,
          additionalGB,
          monthlyAmount: (monthlyAmount * 5.5).toFixed(2)
        }
      });

      toast.success(
        "Solicitação enviada com sucesso! O administrador será notificado e entrará em contato para finalizar a contratação."
      );
      setOpen(false);
      setAdditionalGB(10);
      setNotes("");
    } catch (error) {
      console.error('Error submitting storage request:', error);
      toast.error("Erro ao enviar solicitação");
    } finally {
      setSubmitting(false);
    }
  };

  const currentGB = (currentLimit / 1073741824).toFixed(2);
  const usedGB = (currentUsed / 1073741824).toFixed(2);
  const newTotalGB = (parseFloat(currentGB) + additionalGB).toFixed(2);
  const monthlyPriceUSD = calculateMonthlyPrice(additionalGB);
  const monthlyPriceBRL = (parseFloat(monthlyPriceUSD) * 5.5).toFixed(2); // Conversão aproximada

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <TrendingUp className="h-4 w-4" />
          Contratar Mais Espaço
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Contratar Armazenamento Adicional
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Situação Atual */}
          <Card className="p-4 bg-muted">
            <h3 className="font-semibold mb-3">📊 Situação Atual</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Limite Atual:</span>
                <strong>{currentGB} GB</strong>
              </div>
              <div className="flex justify-between">
                <span>Em Uso:</span>
                <strong>{usedGB} GB ({((parseFloat(usedGB) / parseFloat(currentGB)) * 100).toFixed(1)}%)</strong>
              </div>
              <div className="flex justify-between">
                <span>Disponível:</span>
                <strong>{(parseFloat(currentGB) - parseFloat(usedGB)).toFixed(2)} GB</strong>
              </div>
            </div>
          </Card>

          {/* Seleção de Espaço */}
          <div>
            <Label htmlFor="additionalGB">Espaço Adicional (GB)</Label>
            <Input
              id="additionalGB"
              type="number"
              min="1"
              step="1"
              value={additionalGB}
              onChange={(e) => setAdditionalGB(parseInt(e.target.value) || 10)}
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Selecione quantos GB adicionais você deseja contratar
            </p>
          </div>

          {/* Cálculo de Preço */}
          <Card className="p-4 border-primary bg-primary/5">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Cálculo do Investimento
            </h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Espaço Adicional:</p>
                  <p className="text-2xl font-bold text-primary">+{additionalGB} GB</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Novo Total:</p>
                  <p className="text-2xl font-bold">{newTotalGB} GB</p>
                </div>
              </div>

              <div className="pt-3 border-t space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Valor Mensal:</span>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-600">R$ {monthlyPriceBRL}</p>
                    <p className="text-xs text-muted-foreground">(≈ ${monthlyPriceUSD} USD)</p>
                  </div>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Custo por GB:</span>
                  <span>R$ {(parseFloat(monthlyPriceBRL) / additionalGB).toFixed(2)}/GB/mês</span>
                </div>
              </div>

              <div className="pt-3 border-t bg-muted/50 -mx-4 -mb-4 px-4 py-3 rounded-b-lg">
                <p className="text-xs text-muted-foreground">
                  💡 <strong>Cobrança recorrente:</strong> Este valor será cobrado mensalmente enquanto o espaço adicional estiver ativo. 
                  Você pode cancelar ou ajustar a qualquer momento.
                </p>
              </div>
            </div>
          </Card>

          {/* Observações */}
          <div>
            <Label htmlFor="notes">Observações (Opcional)</Label>
            <Textarea
              id="notes"
              placeholder="Adicione informações adicionais sobre sua necessidade de armazenamento..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-2"
              rows={3}
            />
          </div>

          {/* Botões */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={submitting || additionalGB < 1}
              className="flex-1"
            >
              {submitting ? "Enviando..." : `Solicitar Contratação - R$ ${monthlyPriceBRL}/mês`}
            </Button>
          </div>

          <div className="text-xs text-muted-foreground bg-muted p-3 rounded-lg">
            <p className="font-semibold mb-1">ℹ️ Como funciona:</p>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>Você envia a solicitação com o espaço desejado</li>
              <li>Nossa equipe recebe a solicitação automaticamente</li>
              <li>Entraremos em contato para confirmar e processar o pagamento</li>
              <li>Após confirmação, o espaço é liberado imediatamente</li>
            </ol>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
