import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

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
  slug?: string;
}

export const useOrganizationBySlug = () => {
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrganizationBySlug = async () => {
      try {
        // Tentar detectar o slug da URL
        // Pode vir de: ?org=slug ou de um subdomínio
        const urlParams = new URLSearchParams(window.location.search);
        const slugParam = urlParams.get('org');
        
        // Tentar detectar do subdomínio
        const hostname = window.location.hostname;
        const parts = hostname.split('.');
        
        // Se for um subdomínio (ex: hospital-abc.seudominio.com)
        let slug = slugParam;
        if (!slug && parts.length > 2 && parts[0] !== 'www') {
          slug = parts[0];
        }

        if (!slug) {
          setOrganization(null);
          setLoading(false);
          return;
        }

        // Buscar organização pelo slug
        const { data: org, error: orgError } = await supabase
          .from('organizations')
          .select('*')
          .eq('slug', slug)
          .eq('is_active', true)
          .single();

        if (orgError) {
          console.log('Organização não encontrada para slug:', slug);
          setOrganization(null);
        } else {
          setOrganization(org);
        }
      } catch (error) {
        console.error('Error fetching organization by slug:', error);
        setOrganization(null);
      } finally {
        setLoading(false);
      }
    };

    fetchOrganizationBySlug();
  }, []);

  return { organization, loading };
};
