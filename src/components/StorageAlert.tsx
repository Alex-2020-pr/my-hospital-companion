import { useEffect, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, Mail, Phone, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { StorageRequestDialog } from './StorageRequestDialog';
import { StoragePurchaseDialog } from './StoragePurchaseDialog';
import { useNavigate } from 'react-router-dom';

export const StorageAlert = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [storageInfo, setStorageInfo] = useState<{
    used: number;
    limit: number;
    percentage: number;
    organizationId?: string;
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
            organizationId: profile.organization_id,
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
      <AlertDescription className="space-y-4">
        <p>
          Você está usando {formatBytes(storageInfo.used)} de {formatBytes(storageInfo.limit)} ({storageInfo.percentage.toFixed(1)}%)
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <button
            onClick={() => navigate('/documents')}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-background text-foreground border border-border rounded-md hover:bg-muted transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            Gerenciar Documentos
          </button>
          
          <StorageRequestDialog 
            currentLimit={storageInfo.limit}
            organizationId={storageInfo.organizationId}
          />
          
          <StoragePurchaseDialog 
            currentLimit={storageInfo.limit}
            organizationId={storageInfo.organizationId}
          />
        </div>

        {storageInfo.organization && (
          <div className="pt-4 border-t">
            <p className="text-sm font-semibold mb-2">Contato do hospital/clínica:</p>
            <p className="text-sm font-medium mb-2">{storageInfo.organization.name}</p>
            <div className="flex flex-col gap-1">
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
            </div>
          </div>
        )}
      </AlertDescription>
    </Alert>
  );
};
