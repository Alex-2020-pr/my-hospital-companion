import { useUserRole } from './useUserRole';

export const useNurseRole = () => {
  const { roles, loading, isSuperAdmin } = useUserRole();
  
  // Super admin pode acessar tudo, incluindo módulo de enfermagem
  const isNurse = isSuperAdmin || roles.some(r => r.role === 'nurse' || r.role === 'nursing_tech');
  const isNurseOnly = roles.some(r => r.role === 'nurse');
  const isTechOnly = roles.some(r => r.role === 'nursing_tech');
  
  return {
    isNurse,
    isNurseOnly,
    isTechOnly,
    isSuperAdmin,
    loading
  };
};
