import { Home, Calendar, FileText, MessageCircle, User, Stethoscope } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

const navigationItems = [
  { id: 'home', label: 'Início', icon: Home, path: '/' },
  { id: 'appointments', label: 'Consultas', icon: Calendar, path: '/consultas' },
  { id: 'exams', label: 'Exames', icon: Stethoscope, path: '/exames' },
  { id: 'documents', label: 'Documentos', icon: FileText, path: '/documentos' },
  { id: 'communication', label: 'Contato', icon: MessageCircle, path: '/contato' },
  { id: 'profile', label: 'Perfil', icon: User, path: '/perfil' }
];

export const BottomNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
      <div className="flex items-center justify-around px-2 py-2">
        {navigationItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={cn(
                "flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-colors min-w-0 flex-1",
                isActive 
                  ? "text-primary bg-primary/10" 
                  : "text-muted-foreground hover:text-primary hover:bg-primary/5"
              )}
            >
              <Icon className="h-5 w-5 mb-1" />
              <span className="text-xs font-medium truncate">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};