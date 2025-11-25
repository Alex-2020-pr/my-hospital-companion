import { ReactNode } from "react";
import { BottomNavigation } from "./BottomNavigation";
import { Button } from "@/components/ui/button";
import { Shield, MoreVertical, Users, Building2, Handshake, FileText, Key, Bell, MessageSquare, Stethoscope } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUserRole } from "@/hooks/useUserRole";
import { NotificationBell } from "./NotificationBell";
import { PushNotificationPrompt } from './PushNotificationPrompt';
import { useOrganization } from "@/hooks/useOrganization";
import { DoctorMenu } from "./DoctorMenu";
import { useDoctorDutyMode } from "@/hooks/useDoctorDutyMode";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface LayoutProps {
  children: ReactNode;
  title?: string;
}

export const Layout = ({ children, title }: LayoutProps) => {
  const navigate = useNavigate();
  const { isSuperAdmin, isHospitalAdmin, isDoctor } = useUserRole();
  const { organization } = useOrganization();
  const { onDutyMode } = useDoctorDutyMode();

  const handleAdminClick = () => {
    if (isSuperAdmin) {
      navigate('/admin');
    } else if (isHospitalAdmin) {
      navigate('/hospital');
    }
  };

  // Converter cores hex para HSL se necessário
  const hexToHSL = (hex: string) => {
    // Remove # se existir
    hex = hex.replace('#', '');
    
    // Converte para RGB
    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }

    return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
  };

  const primaryColor = organization?.primary_color 
    ? (organization.primary_color.startsWith('#') 
      ? hexToHSL(organization.primary_color) 
      : organization.primary_color)
    : undefined;

  const secondaryColor = organization?.secondary_color 
    ? (organization.secondary_color.startsWith('#') 
      ? hexToHSL(organization.secondary_color) 
      : organization.secondary_color)
    : undefined;

  return (
    <div 
      className="min-h-screen bg-background"
      style={{
        ...(primaryColor && { '--primary': primaryColor }),
        ...(secondaryColor && { '--secondary': secondaryColor }),
      } as React.CSSProperties}
    >
      {title && (
        <header 
          className="px-4 py-4 shadow-sm"
          style={{
            backgroundColor: organization?.primary_color 
              ? (organization.primary_color.startsWith('#') 
                ? organization.primary_color 
                : `hsl(${organization.primary_color})`)
              : 'hsl(var(--primary))',
            color: 'white'
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              {organization?.logo_url && (
                <img 
                  src={organization.logo_url} 
                  alt={organization.name}
                  className="h-8 object-contain"
                />
              )}
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-semibold">{title}</h1>
                {isDoctor && onDutyMode && (
                  <Badge 
                    variant="outline" 
                    className="bg-green-500/20 text-green-100 border-green-400/50 font-semibold animate-pulse"
                  >
                    PLANTÃO
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <NotificationBell />
              {isDoctor && (
                <DoctorMenu />
              )}
              {(isSuperAdmin || isHospitalAdmin) && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleAdminClick}
                    className="text-primary-foreground hover:bg-primary-foreground/10"
                  >
                    <Shield className="h-5 w-5" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-primary-foreground hover:bg-primary-foreground/10"
                      >
                        <MoreVertical className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 bg-background z-50">
                      <DropdownMenuLabel>Acesso Rápido Admin</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {isHospitalAdmin && (
                        <>
                          <DropdownMenuItem onClick={() => navigate('/hospital')}>
                            <Building2 className="mr-2 h-4 w-4" />
                            <span>Hospital</span>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                        </>
                      )}
                      {isSuperAdmin && (
                        <>
                          <DropdownMenuItem onClick={() => navigate('/admin/users')}>
                            <Users className="mr-2 h-4 w-4" />
                            <span>Usuários</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => navigate('/admin/organizations')}>
                            <Building2 className="mr-2 h-4 w-4" />
                            <span>Organizações</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => navigate('/admin/partners')}>
                            <Handshake className="mr-2 h-4 w-4" />
                            <span>Parceiros</span>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => navigate('/api-docs')}>
                            <FileText className="mr-2 h-4 w-4" />
                            <span>API Docs</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => navigate('/token-generator')}>
                            <Key className="mr-2 h-4 w-4" />
                            <span>Gerar Tokens</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => navigate('/admin/push-notifications')}>
                            <Bell className="mr-2 h-4 w-4" />
                            <span>Notificações Push</span>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => navigate('/medico-dashboard')}>
                            <Stethoscope className="mr-2 h-4 w-4" />
                            <span>Dashboard Médico (MVP)</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => navigate('/paciente/p1')}>
                            <Users className="mr-2 h-4 w-4" />
                            <span>Ficha do Paciente (MVP)</span>
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              )}
            </div>
          </div>
        </header>
      )}
      
      <main className="pb-20 min-h-screen">
        {children}
      </main>
      
      <PushNotificationPrompt />
      <BottomNavigation />
    </div>
  );
};
