import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole, UserRole } from "@/hooks/useUserRole";

interface RoleProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  redirectTo?: string;
}

export const RoleProtectedRoute = ({ 
  children, 
  allowedRoles,
  redirectTo = "/portal"
}: RoleProtectedRouteProps) => {
  const { user, loading: authLoading } = useAuth();
  const { roles, loading: rolesLoading, isSuperAdmin } = useUserRole();
  const navigate = useNavigate();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);

  useEffect(() => {
    if (authLoading || rolesLoading) return;

    if (!user) {
      navigate("/auth");
      return;
    }

    // Super admin has access to everything
    if (isSuperAdmin) {
      setHasAccess(true);
      return;
    }

    // Check if user has any of the allowed roles
    const userRoleNames = roles.map(r => r.role);
    const hasAllowedRole = allowedRoles.some(role => userRoleNames.includes(role));

    if (!hasAllowedRole) {
      setHasAccess(false);
      navigate(redirectTo);
      return;
    }

    setHasAccess(true);
  }, [user, authLoading, rolesLoading, roles, isSuperAdmin, allowedRoles, navigate, redirectTo]);

  if (authLoading || rolesLoading || hasAccess === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Verificando permissões...</p>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return null;
  }

  return <>{children}</>;
};
