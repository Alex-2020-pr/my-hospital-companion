import { useNavigate } from "react-router-dom";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Stethoscope, Activity } from "lucide-react";
import am2LogoCompleto from "@/assets/am2-logo-completo-512.png";
import { getFormattedVersion } from "@/lib/version";

const LandingPortal = () => {
  const navigate = useNavigate();

  const portals = [
    {
      id: 'patient',
      title: 'Portal do Paciente',
      description: 'Acesse consultas, exames, medicamentos e sinais vitais',
      icon: User,
      color: 'bg-blue-500',
    },
    {
      id: 'doctor',
      title: 'Portal do Médico',
      description: 'Gerencie pacientes, prescrições e consultas',
      icon: Stethoscope,
      color: 'bg-green-500',
    },
    {
      id: 'nursing',
      title: 'Portal da Enfermagem',
      description: 'Registre sinais vitais, evoluções e procedimentos',
      icon: Activity,
      color: 'bg-purple-500',
    }
  ];

  const handleSelectPortal = (portalId: string) => {
    // Store selected portal in localStorage
    localStorage.setItem('selectedPortal', portalId);
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-primary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl space-y-8">
        <div className="text-center space-y-4">
          <img 
            src={am2LogoCompleto} 
            alt="AM2 Soluções"
            className="h-24 mx-auto"
          />
          <h1 className="text-3xl font-bold text-foreground">
            Sistema de Saúde AM2
          </h1>
          <p className="text-muted-foreground">
            Selecione o portal que deseja acessar
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {portals.map((portal, index) => {
            const Icon = portal.icon;
            return (
              <Card 
                key={portal.id}
                className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-[1.02] border-2 hover:border-primary/50 opacity-0 animate-fade-in"
                style={{ animationDelay: `${index * 150}ms`, animationFillMode: 'forwards' }}
                onClick={() => handleSelectPortal(portal.id)}
              >
                <CardHeader className="text-center space-y-4">
                  <div className={`p-4 rounded-full ${portal.color} text-white mx-auto transition-transform duration-300 group-hover:scale-110`}>
                    <Icon className="h-8 w-8" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{portal.title}</CardTitle>
                    <CardDescription className="mt-2">{portal.description}</CardDescription>
                  </div>
                </CardHeader>
              </Card>
            );
          })}
        </div>

        <p className="text-center text-xs text-muted-foreground">
          Versão {getFormattedVersion()}
        </p>
      </div>
    </div>
  );
};

export default LandingPortal;
