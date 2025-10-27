import { ReactNode } from "react";
import { BottomNavigation } from "./BottomNavigation";
import { Button } from "@/components/ui/button";
import { Shield, MoreVertical, Users, Building2, Handshake, FileText, Key, Mail, Phone } from "lucide-react";
import am2Logo from "@/assets/am2-logo.jpg";
import { useNavigate } from "react-router-dom";
import { useUserRole } from "@/hooks/useUserRole";
import { NotificationBell } from "./NotificationBell";
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
              {isSuperAdmin && (
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
      
      <footer className="fixed bottom-16 left-0 right-0 bg-background/80 backdrop-blur-sm border-t py-2">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
            <a 
              href="https://www.am2solucoes.com.br" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:opacity-80 transition-opacity"
            >
              <img 
                src={am2Logo} 
                alt="AM2 Soluções" 
                className="h-8"
              />
            </a>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <a 
                href="tel:+5545999801802" 
                className="flex items-center gap-1 hover:text-primary transition-colors"
              >
                <Phone className="h-3 w-3" />
                (45) 99980-1802
              </a>
              <a 
                href="mailto:comercial@am2saude.com.br" 
                className="flex items-center gap-1 hover:text-primary transition-colors"
              >
                <Mail className="h-3 w-3" />
                comercial@am2saude.com.br
              </a>
            </div>
          </div>
        </div>
      </footer>
      
      <BottomNavigation />
    </div>
  );
};
