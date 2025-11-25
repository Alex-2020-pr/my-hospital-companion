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
      if (authLoading || orgLoading || rolesLoading) {
        console.log('Index: ainda carregando...', { authLoading, orgLoading, rolesLoading });
        return;
      }

      // Se usuário não autenticado, redirecionar para login
      if (!user) {
        console.log('Index: sem usuário, indo para /auth');
        navigate("/auth");
        return;
      }

      // Verificar roles com ordem de prioridade
      const userRoles = roles.map(r => r.role);
      console.log('Index: roles do usuário:', userRoles);

      const hasSuperAdmin = userRoles.includes('super_admin');
      const hasHospitalAdmin = userRoles.includes('hospital_admin');
      const hasDoctor = userRoles.includes('doctor');
      const hasPatient = userRoles.includes('patient');
      
      // Prioridade: hospital_admin > doctor-only > paciente/geral
      // Super admin vai para dashboard para ver exemplos
      if (hasHospitalAdmin && !hasSuperAdmin) {
        console.log('Index: redirecionando para /hospital');
        navigate("/hospital");
      } else if (hasDoctor && !hasPatient && !hasSuperAdmin) {
        console.log('Index: redirecionando para /medico-dashboard (apenas médico)');
        navigate("/medico-dashboard");
      } else {
        console.log('Index: redirecionando para /dashboard (padrão/paciente/super admin)');
        // Paciente, role padrão ou super admin (para ver exemplos)
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
