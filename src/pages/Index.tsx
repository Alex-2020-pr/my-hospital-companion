import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useOrganizationBySlug } from "@/hooks/useOrganizationBySlug";

const Index = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { organization, loading: orgLoading } = useOrganizationBySlug();

  useEffect(() => {
    // Se ainda está carregando, aguardar
    if (authLoading || orgLoading) return;

    // Se usuário não autenticado, redirecionar para login
    if (!user) {
      navigate("/auth");
      return;
    }

    // Se usuário autenticado, redirecionar para dashboard
    navigate("/dashboard");
  }, [user, authLoading, orgLoading, navigate]);

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
