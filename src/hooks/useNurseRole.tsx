import { useUserRole } from './useUserRole';

export const useNurseRole = () => {
  const { roles, loading } = useUserRole();
  
  const isNurse = roles.some(r => r.role === 'nurse' || r.role === 'nursing_tech');
  const isNurseOnly = roles.some(r => r.role === 'nurse');
  const isTechOnly = roles.some(r => r.role === 'nursing_tech');
  
  return {
    isNurse,
    isNurseOnly,
    isTechOnly,
    loading
  };
};
