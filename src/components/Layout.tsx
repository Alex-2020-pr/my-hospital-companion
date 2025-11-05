import { ReactNode } from "react";
import { BottomNavigation } from "./BottomNavigation";
import { Button } from "@/components/ui/button";
import { Shield, MoreVertical, Users, Building2, Handshake, FileText, Key, Bell, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUserRole } from "@/hooks/useUserRole";
import { NotificationBell } from "./NotificationBell";
import { PushNotificationPrompt } from './PushNotificationPrompt';
import { useOrganization } from "@/hooks/useOrganization";
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
  const { isSuperAdmin, isHospitalAdmin } = useUserRole();
  const { organization } = useOrganization();

  const handleAdminClick = () => {
    if (isSuperAdmin) {
      navigate('/admin');
    } else if (isHospitalAdmin) {
      navigate('/hospital');
    }
  };

  return (
    <div 
      className="min-h-screen bg-background"
      style={{
        ...(organization?.primary_color && {
          '--primary': organization.primary_color,
        }),
        ...(organization?.secondary_color && {
          '--secondary': organization.secondary_color,
        }),
      } as React.CSSProperties}
    >
      {title && (
        <header 
          className="text-primary-foreground px-4 py-4 shadow-sm"
          style={{
            backgroundColor: organization?.primary_color || 'hsl(var(--primary))'
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
              <h1 className="text-xl font-semibold">{title}</h1>
            </div>
            <div className="flex items-center gap-2">
              <NotificationBell />
              {(isSuperAdmin || isHospitalAdmin) && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleAdminClick}
                  className="text-primary-foreground hover:bg-primary-foreground/10"
                >
                  <Shield className="h-5 w-5" />
                </Button>
              )}
              {(isSuperAdmin || isHospitalAdmin) && (
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
                  <DropdownMenuContent align="end" className="w-56">
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
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
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
