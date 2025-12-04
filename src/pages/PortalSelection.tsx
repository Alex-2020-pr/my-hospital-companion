import { useNavigate } from "react-router-dom";
import { useUserRole } from "@/hooks/useUserRole";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Stethoscope, Activity, Shield, LogOut } from "lucide-react";
import { useOrganization } from "@/hooks/useOrganization";

const PortalSelection = () => {
  const navigate = useNavigate();
  const { roles, loading: rolesLoading, isSuperAdmin } = useUserRole();
  const { user, loading: authLoading, signOut } = useAuth();
  const { organization } = useOrganization();

  if (authLoading || rolesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    navigate("/");
    return null;
  }

  const userRoles = roles.map(r => r.role);
  const hasPatient = userRoles.includes('patient');
  const hasDoctor = userRoles.includes('doctor');
  const hasNurse = userRoles.includes('nurse') || userRoles.includes('nursing_tech');
  const hasHospitalAdmin = userRoles.includes('hospital_admin');

  const handleLogout = async () => {
    await signOut();
    navigate("/auth");
  };

  const portals = [
    {
      id: 'patient',
      title: 'Portal do Paciente',
      description: 'Acesse consultas, exames, medicamentos e sinais vitais',
      icon: User,
      color: 'bg-blue-500',
      path: '/dashboard',
      available: hasPatient || isSuperAdmin
    },
    {
      id: 'doctor',
      title: 'Portal do Médico',
      description: 'Gerencie pacientes, prescrições e consultas',
      icon: Stethoscope,
      color: 'bg-green-500',
      path: '/medico-dashboard',
      available: hasDoctor || isSuperAdmin
    },
    {
      id: 'nursing',
      title: 'Portal da Enfermagem',
      description: 'Registre sinais vitais, evoluções e procedimentos',
      icon: Activity,
      color: 'bg-purple-500',
      path: '/nursing/dashboard-mobile',
      available: hasNurse || isSuperAdmin
    },
    {
      id: 'admin',
      title: 'Administração',
      description: 'Gerencie usuários, organizações e configurações',
      icon: Shield,
      color: 'bg-orange-500',
      path: '/admin',
      available: isSuperAdmin || hasHospitalAdmin
    }
  ];

  const availablePortals = portals.filter(p => p.available);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
      <div className="w-full max-w-4xl space-y-8">
        <div className="text-center space-y-2">
          {organization?.logo_url && (
            <img 
              src={organization.logo_url} 
              alt={organization.name} 
              className="h-16 mx-auto mb-4"
            />
          )}
          <h1 className="text-3xl font-bold text-foreground">
            Bem-vindo ao {organization?.name || 'Sistema de Saúde'}
          </h1>
          <p className="text-muted-foreground">
            Selecione o portal que deseja acessar
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {availablePortals.map((portal) => {
            const Icon = portal.icon;
            return (
              <Card 
                key={portal.id}
                className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02] border-2 hover:border-primary/50"
                onClick={() => navigate(portal.path)}
              >
                <CardHeader className="flex flex-row items-center gap-4">
                  <div className={`p-3 rounded-full ${portal.color} text-white`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{portal.title}</CardTitle>
                    <CardDescription>{portal.description}</CardDescription>
                  </div>
                </CardHeader>
              </Card>
            );
          })}
        </div>

        {availablePortals.length === 0 && (
          <Card className="text-center p-8">
            <CardContent>
              <p className="text-muted-foreground">
                Você não possui permissões de acesso a nenhum portal.
                Entre em contato com o administrador do sistema.
              </p>
            </CardContent>
          </Card>
        )}

        <div className="text-center">
          <Button variant="ghost" onClick={handleLogout} className="text-muted-foreground">
            <LogOut className="h-4 w-4 mr-2" />
            Sair da conta
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PortalSelection;
