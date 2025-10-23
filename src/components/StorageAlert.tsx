import { useEffect, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Mail, Phone } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export const StorageAlert = () => {
  const { user } = useAuth();
  const [storageInfo, setStorageInfo] = useState<{
    used: number;
    limit: number;
    percentage: number;
    organization?: { name: string; contact_email?: string; contact_phone?: string };
  } | null>(null);

  useEffect(() => {
    const fetchStorageInfo = async () => {
      if (!user) return;

      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select(`
            storage_used_bytes,
            storage_limit_bytes,
            organization_id,
            organizations (
              name,
              contact_email,
              contact_phone
            )
          `)
          .eq('id', user.id)
          .single();

        if (error) throw error;

        const percentage = (profile.storage_used_bytes / profile.storage_limit_bytes) * 100;

        if (percentage >= 80) {
          setStorageInfo({
            used: profile.storage_used_bytes,
            limit: profile.storage_limit_bytes,
            percentage,
            organization: profile.organizations as any
          });
        }
      } catch (error) {
        console.error('Error fetching storage:', error);
      }
    };

    fetchStorageInfo();
  }, [user]);

  if (!storageInfo) return null;

  const formatBytes = (bytes: number) => {
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <Alert variant="destructive" className="mb-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Limite de Armazenamento Próximo</AlertTitle>
      <AlertDescription className="space-y-3">
        <p>
          Você está usando {formatBytes(storageInfo.used)} de {formatBytes(storageInfo.limit)} ({storageInfo.percentage.toFixed(1)}%)
        </p>
        <p className="text-sm">
          Entre em contato para contratar mais espaço:
        </p>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-sm">
            <Mail className="h-4 w-4" />
            <span>contato@saudedigital.com</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Phone className="h-4 w-4" />
            <span>(11) 1234-5678</span>
          </div>
          {storageInfo.organization && (
            <>
              <p className="text-sm font-semibold mt-2">Ou fale com seu hospital/clínica:</p>
              <p className="text-sm font-medium">{storageInfo.organization.name}</p>
              {storageInfo.organization.contact_email && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4" />
                  <span>{storageInfo.organization.contact_email}</span>
                </div>
              )}
              {storageInfo.organization.contact_phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4" />
                  <span>{storageInfo.organization.contact_phone}</span>
                </div>
              )}
            </>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
};
