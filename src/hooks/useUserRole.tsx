import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export type UserRole = 'super_admin' | 'hospital_admin' | 'patient';

interface UserRoleData {
  role: UserRole;
  organizationId?: string;
}

export const useUserRole = () => {
  const { user } = useAuth();
  const [roles, setRoles] = useState<UserRoleData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoles = async () => {
      if (!user) {
        setRoles([]);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role, organization_id')
          .eq('user_id', user.id);

        if (error) throw error;

        setRoles(data.map(r => ({
          role: r.role as UserRole,
          organizationId: r.organization_id || undefined
        })));
      } catch (error) {
        console.error('Error fetching roles:', error);
        setRoles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRoles();
  }, [user]);

  const hasRole = (role: UserRole) => roles.some(r => r.role === role);
  const isSuperAdmin = hasRole('super_admin');
  const isHospitalAdmin = hasRole('hospital_admin');
  const isPatient = hasRole('patient');

  return {
    roles,
    loading,
    hasRole,
    isSuperAdmin,
    isHospitalAdmin,
    isPatient
  };
};
