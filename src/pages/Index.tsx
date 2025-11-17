import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { useOrganizationBySlug } from "@/hooks/useOrganizationBySlug";

const Index = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { roles, loading: rolesLoading } = useUserRole();
  const { organization, loading: orgLoading } = useOrganizationBySlug();

  useEffect(() => {
    const redirectUser = () => {
      // Se ainda está carregando, aguardar
      if (authLoading || orgLoading || rolesLoading) return;

      // Se usuário não autenticado, redirecionar para login
      if (!user) {
        navigate("/auth");
        return;
      }

      // Verificar roles com ordem de prioridade
      const userRoles = roles.map(r => r.role);
      
      // Prioridade: super_admin > hospital_admin > doctor > patient
      if (userRoles.includes('super_admin')) {
        navigate("/admin");
      } else if (userRoles.includes('hospital_admin')) {
        navigate("/hospital");
      } else if (userRoles.includes('doctor')) {
        navigate("/doctor/patients");
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
