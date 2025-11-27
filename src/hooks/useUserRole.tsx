import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export type UserRole = 'super_admin' | 'hospital_admin' | 'patient' | 'doctor' | 'nurse' | 'nursing_tech';

interface UserRoleData {
  role: UserRole;
  organizationId?: string;
}

export const useUserRole = () => {
  const { user, loading: authLoading } = useAuth();
  const [roles, setRoles] = useState<UserRoleData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoles = async () => {
      // Aguarda o auth terminar de carregar antes de continuar
      if (authLoading) {
        return;
      }
      
      if (!user) {
        console.log('useUserRole: sem usuário, setando loading false');
        setRoles([]);
        setLoading(false);
        return;
      }

      console.log('useUserRole: buscando roles para user.id:', user.id);

      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role, organization_id')
          .eq('user_id', user.id);

        if (error) throw error;

        const mappedRoles = data.map(r => ({
          role: r.role as UserRole,
          organizationId: r.organization_id || undefined
        }));

        console.log('useUserRole: roles encontrados:', mappedRoles);
        setRoles(mappedRoles);
      } catch (error) {
        console.error('Error fetching roles:', error);
        setRoles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRoles();
  }, [user, authLoading]);

  const hasRole = (role: UserRole) => roles.some(r => r.role === role);
  const isSuperAdmin = hasRole('super_admin');
  const isHospitalAdmin = hasRole('hospital_admin');
  const isPatient = hasRole('patient');
  const isDoctor = hasRole('doctor');

  return {
    roles,
    loading,
    hasRole,
    isSuperAdmin,
    isHospitalAdmin,
    isPatient,
    isDoctor
  };
};
