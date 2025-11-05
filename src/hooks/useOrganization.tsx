import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface Organization {
  id: string;
  name: string;
  type: string;
  logo_url?: string;
  logo_icon_url?: string;
  primary_color?: string;
  secondary_color?: string;
  theme_config?: any;
  website?: string;
  contact_email?: string;
  contact_phone?: string;
  address?: string;
}

export const useOrganization = () => {
  const { user } = useAuth();
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrganization = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Buscar o perfil do usuário para pegar o organization_id
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('organization_id')
          .eq('id', user.id)
          .single();

        if (profileError) throw profileError;

        if (!profile?.organization_id) {
          setOrganization(null);
          setLoading(false);
          return;
        }

        // Buscar os dados da organização
        const { data: org, error: orgError } = await supabase
          .from('organizations')
          .select('*')
          .eq('id', profile.organization_id)
          .single();

        if (orgError) throw orgError;

        setOrganization(org);
      } catch (error) {
        console.error('Error fetching organization:', error);
        setOrganization(null);
      } finally {
        setLoading(false);
      }
    };

    fetchOrganization();
  }, [user]);

  return { organization, loading };
};
