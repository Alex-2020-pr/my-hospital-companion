import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { MessageSquare } from 'lucide-react';

interface StorageRequestDialogProps {
  currentLimit: number;
  organizationId?: string;
}

export const StorageRequestDialog = ({ currentLimit, organizationId }: StorageRequestDialogProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [requestedMB, setRequestedMB] = useState(currentLimit / (1024 * 1024));
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const requestedBytes = requestedMB * 1024 * 1024;

      const { error } = await supabase
        .from('storage_requests')
        .insert({
          user_id: user.id,
          organization_id: organizationId,
          requested_bytes: requestedBytes,
          request_type: 'increase',
          notes
        });

      if (error) throw error;

      toast({
        title: 'Solicitação enviada',
        description: 'Sua solicitação de aumento de armazenamento foi enviada para análise.'
      });

      setOpen(false);
      setNotes('');
    } catch (error) {
      console.error('Error submitting request:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível enviar a solicitação.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <MessageSquare className="h-4 w-4 mr-2" />
          Solicitar Mais Espaço
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Solicitar Mais Armazenamento</DialogTitle>
          <DialogDescription>
            Envie uma solicitação ao seu hospital/clínica para aumentar seu limite de armazenamento.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="requested">Novo Limite Desejado (MB)</Label>
            <Input
              id="requested"
              type="number"
              value={requestedMB}
              onChange={(e) => setRequestedMB(parseFloat(e.target.value))}
              min={currentLimit / (1024 * 1024)}
            />
            <p className="text-sm text-muted-foreground mt-1">
              Limite atual: {(currentLimit / (1024 * 1024)).toFixed(2)} MB
            </p>
          </div>
          <div>
            <Label htmlFor="notes">Justificativa (opcional)</Label>
            <Textarea
              id="notes"
              placeholder="Explique por que precisa de mais espaço..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
          <Button onClick={handleSubmit} disabled={loading} className="w-full">
            {loading ? 'Enviando...' : 'Enviar Solicitação'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
