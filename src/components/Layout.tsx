import { ReactNode } from "react";
import { BottomNavigation } from "./BottomNavigation";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUserRole } from "@/hooks/useUserRole";
import { NotificationBell } from "./NotificationBell";

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
            </div>
          </div>
        </header>
      )}
      
      <main className="pb-20 min-h-screen">
        {children}
      </main>
      
      <BottomNavigation />
    </div>
  );
};
