import { Home, Calendar, FileText, User, Stethoscope, Pill, Users, ClipboardList, Heart } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useUserRole } from "@/hooks/useUserRole";
import { useNurseRole } from "@/hooks/useNurseRole";

// Navegação para Pacientes
const patientNavigationItems = [
  { id: 'home', label: 'Início', icon: Home, path: '/dashboard' },
  { id: 'appointments', label: 'Consultas', icon: Calendar, path: '/consultas' },
  { id: 'exams', label: 'Exames', icon: Stethoscope, path: '/exames' },
  { id: 'medications', label: 'Medicações', icon: Pill, path: '/medicamentos' },
  { id: 'profile', label: 'Perfil', icon: User, path: '/perfil' }
];

// Navegação para Médicos
const doctorNavigationItems = [
  { id: 'home', label: 'Início', icon: Home, path: '/medico-dashboard' },
  { id: 'patients', label: 'Pacientes', icon: Users, path: '/doctor/patients' },
  { id: 'appointments', label: 'Agenda', icon: Calendar, path: '/doctor/schedule' },
  { id: 'exams', label: 'Exames', icon: ClipboardList, path: '/doctor/exam-request' },
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
  const { isDoctor, isPatient, isSuperAdmin, isHospitalAdmin } = useUserRole();
  const { isNurse, isNurseOnly, isTechOnly } = useNurseRole();

  // Determinar se é exclusivamente enfermagem (sem outros roles)
  const isOnlyNursing = (isNurseOnly || isTechOnly) && !isSuperAdmin && !isHospitalAdmin && !isDoctor && !isPatient;
  
  // Determinar se é exclusivamente médico
  const isOnlyDoctor = isDoctor && !isNurse && !isPatient;
  
  // Determinar qual conjunto de navegação usar baseado no role real
  let navigationItems = patientNavigationItems;
  
  // Prioridade: Enfermagem > Médico > Paciente
  if (isOnlyNursing || (isNurse && location.pathname.startsWith('/nursing'))) {
    navigationItems = nursingNavigationItems;
  } else if (isOnlyDoctor || (isDoctor && (location.pathname.startsWith('/doctor') || location.pathname.startsWith('/medico') || location.pathname.startsWith('/paciente/')))) {
    navigationItems = doctorNavigationItems;
  } else if (isPatient) {
    navigationItems = patientNavigationItems;
  }

  // Se está em rota de admin, não mostrar navegação
  if (location.pathname.startsWith('/admin') || location.pathname.startsWith('/hospital')) {
    return null;
  }

  // Se está na landing page ou auth, não mostrar navegação
  if (location.pathname === '/' || location.pathname === '/welcome' || location.pathname === '/auth' || location.pathname === '/portal') {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 pb-safe">
      <div className="flex items-center justify-around px-2 py-2">
        {navigationItems.map((item) => {
          // Verificar se a rota está ativa (considerando sub-rotas)
          const isActive = location.pathname === item.path || 
                          (item.path !== '/dashboard' && item.path !== '/medico-dashboard' && item.path !== '/nursing/dashboard-mobile' && location.pathname.startsWith(item.path));
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
