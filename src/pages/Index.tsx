import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { toast } from "sonner";

const Index = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { roles, loading: rolesLoading, isSuperAdmin } = useUserRole();

  useEffect(() => {
    const redirectUser = () => {
      if (authLoading || rolesLoading) return;

      if (!user) {
        // Not logged in - go to landing portal selection
        navigate("/welcome");
        return;
      }

      const userRoles = roles.map(r => r.role);
      const hasPatient = userRoles.includes('patient');
      const hasDoctor = userRoles.includes('doctor');
      const hasNurse = userRoles.includes('nurse') || userRoles.includes('nursing_tech');
      const hasHospitalAdmin = userRoles.includes('hospital_admin');

      // Check if user selected a portal before login
      const selectedPortal = localStorage.getItem('selectedPortal');
      
      if (selectedPortal) {
        localStorage.removeItem('selectedPortal');
        
        // Validate user has the role for selected portal
        if (selectedPortal === 'patient' && (hasPatient || isSuperAdmin)) {
          navigate("/dashboard");
          return;
        } else if (selectedPortal === 'doctor' && (hasDoctor || isSuperAdmin)) {
          navigate("/medico-dashboard");
          return;
        } else if (selectedPortal === 'nursing' && (hasNurse || isSuperAdmin)) {
          navigate("/nursing/dashboard-mobile");
          return;
        } else {
          // User doesn't have permission for selected portal
          toast.error("Você não tem permissão para acessar este portal");
        }
      }

      // Super admin always goes to portal selection
      if (isSuperAdmin) {
        navigate("/portal");
        return;
      }

      // Count how many distinct portal types the user has access to
      const portalCount = [hasPatient, hasDoctor, hasNurse, hasHospitalAdmin].filter(Boolean).length;

      // If user has multiple roles, show portal selection
      if (portalCount > 1) {
        navigate("/portal");
        return;
      }

      // Single role - redirect directly to appropriate portal
      if (hasHospitalAdmin) {
        navigate("/hospital");
      } else if (hasNurse) {
        navigate("/nursing/dashboard-mobile");
      } else if (hasDoctor) {
        navigate("/medico-dashboard");
      } else if (hasPatient) {
        navigate("/dashboard");
      } else {
        // No recognized role - show portal selection (will show no access message)
        navigate("/portal");
      }
    };

    redirectUser();
  }, [user, authLoading, rolesLoading, roles, isSuperAdmin, navigate]);

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
