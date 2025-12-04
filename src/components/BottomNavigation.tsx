import { Home, Calendar, FileText, User, Stethoscope, Pill, Activity, Users, ClipboardList, Heart } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useUserRole } from "@/hooks/useUserRole";
import { useNurseRole } from "@/hooks/useNurseRole";

// Navegação para Pacientes
const patientNavigationItems = [
  { id: 'home', label: 'Início', icon: Home, path: '/' },
  { id: 'appointments', label: 'Consultas', icon: Calendar, path: '/consultas' },
  { id: 'exams', label: 'Exames', icon: Stethoscope, path: '/exames' },
  { id: 'medications', label: 'Medicações', icon: Pill, path: '/medicamentos' },
  { id: 'profile', label: 'Perfil', icon: User, path: '/perfil' }
];

// Navegação para Médicos
const doctorNavigationItems = [
  { id: 'home', label: 'Início', icon: Home, path: '/medico-dashboard' },
  { id: 'patients', label: 'Pacientes', icon: Users, path: '/doctor/patients' },
  { id: 'appointments', label: 'Agenda', icon: Calendar, path: '/consultas' },
  { id: 'exams', label: 'Exames', icon: ClipboardList, path: '/exames' },
  { id: 'profile', label: 'Perfil', icon: User, path: '/perfil' }
];

// Navegação para Enfermagem
const nursingNavigationItems = [
  { id: 'home', label: 'Início', icon: Home, path: '/nursing/dashboard-mobile' },
  { id: 'patients', label: 'Pacientes', icon: Users, path: '/nursing' },
  { id: 'vitals', label: 'Sinais Vitais', icon: Heart, path: '/nursing/vital-signs-mobile' },
  { id: 'evolution', label: 'Evolução', icon: FileText, path: '/nursing/evolution-mobile' },
  { id: 'profile', label: 'Perfil', icon: User, path: '/perfil' }
];

export const BottomNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isDoctor } = useUserRole();
  const { isNurse } = useNurseRole();

  // Determinar qual conjunto de navegação usar baseado no role
  let navigationItems = patientNavigationItems;
  
  if (isDoctor) {
    navigationItems = doctorNavigationItems;
  } else if (isNurse) {
    navigationItems = nursingNavigationItems;
  }

  // Verificar se estamos em uma rota específica de médico ou enfermagem
  const isDoctorRoute = location.pathname.startsWith('/doctor') || 
                        location.pathname.startsWith('/medico') || 
                        location.pathname.startsWith('/paciente/');
  const isNursingRoute = location.pathname.startsWith('/nursing');

  // Ajustar navegação baseado na rota atual
  if (isDoctorRoute && !isNurse) {
    navigationItems = doctorNavigationItems;
  } else if (isNursingRoute) {
    navigationItems = nursingNavigationItems;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 pb-safe">
      <div className="flex items-center justify-around px-2 py-2">
        {navigationItems.map((item) => {
          // Verificar se a rota está ativa (considerando sub-rotas)
          const isActive = location.pathname === item.path || 
                          (item.path !== '/' && location.pathname.startsWith(item.path));
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
