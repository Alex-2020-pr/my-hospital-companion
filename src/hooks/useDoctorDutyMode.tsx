import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useDoctorDutyMode = () => {
  const { user } = useAuth();
  const [onDutyMode, setOnDutyMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [doctorId, setDoctorId] = useState<string | null>(null);
  const { toast } = useToast();

  // Buscar o status atual do plantão
  useEffect(() => {
    const fetchDutyStatus = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('doctors')
          .select('id, on_duty')
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error('Error fetching duty status:', error);
          setLoading(false);
          return;
        }

        if (data) {
          setDoctorId(data.id);
          setOnDutyMode(data.on_duty || false);
        }
      } catch (error) {
        console.error('Error in fetchDutyStatus:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDutyStatus();
  }, [user]);

  // Função para alternar o modo plantão
  const toggleDutyMode = async (newValue: boolean) => {
    if (!doctorId) {
      toast({
        title: "Erro",
        description: "Perfil de médico não encontrado",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('doctors')
        .update({ on_duty: newValue })
        .eq('id', doctorId);

      if (error) throw error;

      setOnDutyMode(newValue);
      
      toast({
        title: newValue ? "Modo Plantão Ativado" : "Modo Plantão Desativado",
        description: newValue 
          ? "Você está agora visível como médico de plantão"
          : "Você não está mais em modo plantão",
        variant: newValue ? "default" : "default",
      });
    } catch (error) {
      console.error('Error toggling duty mode:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status de plantão",
        variant: "destructive",
      });
    }
  };

  return {
    onDutyMode,
    loading,
    toggleDutyMode,
  };
};
