import { ReactNode } from "react";
import { BottomNavigation } from "./BottomNavigation";
import { Button } from "@/components/ui/button";
import { Shield, MoreVertical, Users, Building2, Handshake, FileText, Key } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUserRole } from "@/hooks/useUserRole";
import { NotificationBell } from "./NotificationBell";
import { PushNotificationPrompt } from './PushNotificationPrompt';
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

  const handleAdminClick = () => {
    if (isSuperAdmin) {
      navigate('/admin');
    } else if (isHospitalAdmin) {
      navigate('/hospital');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {title && (
        <header className="bg-primary text-primary-foreground px-4 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold flex-1">{title}</h1>
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
