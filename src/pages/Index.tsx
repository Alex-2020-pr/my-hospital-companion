import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { useOrganizationBySlug } from "@/hooks/useOrganizationBySlug";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { roles, loading: rolesLoading } = useUserRole();
  const { organization, loading: orgLoading } = useOrganizationBySlug();

  useEffect(() => {
    const redirectUser = async () => {
      // Se ainda está carregando, aguardar
      if (authLoading || orgLoading || rolesLoading) return;

      // Se usuário não autenticado, redirecionar para login
      if (!user) {
        navigate("/auth");
        return;
      }

      // Verificar se é médico (verificar na tabela doctors)
      const { data: doctorData } = await supabase
        .from('doctors')
        .select('id')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

      if (doctorData) {
        navigate("/doctor/patients");
        return;
      }

      // Verificar role no sistema
      const userRoles = roles.map(r => r.role);
      
      if (userRoles.includes('super_admin')) {
        navigate("/admin");
      } else if (userRoles.includes('hospital_admin')) {
        navigate("/hospital");
      } else {
        // Paciente ou role padrão
        navigate("/dashboard");
      }
    };

    redirectUser();
  }, [user, authLoading, orgLoading, rolesLoading, roles, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    </div>
  );
};

export default Index;
