import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, TrendingUp, Bug } from 'lucide-react';
import { formatBrazilDate } from '@/lib/timezone';

interface Version {
  id: string;
  version: string;
  release_date: string;
  title: string;
  description: string;
  category: string;
  isNew?: boolean;
}

export default function Changelog() {
  const { user } = useAuth();
  const [versions, setVersions] = useState<Version[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVersions();
  }, [user]);

  const fetchVersions = async () => {
    try {
      // Fetch all published versions
      const { data: versionsData, error: versionsError } = await supabase
        .from('app_versions')
        .select('*')
        .eq('is_published', true)
        .order('release_date', { ascending: false });

      if (versionsError) throw versionsError;

      if (user) {
        // Fetch which versions the user has already viewed
        const { data: viewedData, error: viewedError } = await supabase
          .from('user_version_views')
          .select('version_id')
          .eq('user_id', user.id);

        if (viewedError) throw viewedError;

        const viewedIds = new Set(viewedData?.map(v => v.version_id) || []);

        // Mark versions as new if not viewed
        const versionsWithNewFlag = versionsData?.map(v => ({
          ...v,
          isNew: !viewedIds.has(v.id)
        })) || [];

        setVersions(versionsWithNewFlag);

        // Mark all as viewed
        const unviewedVersions = versionsWithNewFlag.filter(v => v.isNew);
        if (unviewedVersions.length > 0) {
          const inserts = unviewedVersions.map(v => ({
            user_id: user.id,
            version_id: v.id
          }));

          await supabase
            .from('user_version_views')
            .insert(inserts);
        }
      } else {
        setVersions(versionsData || []);
      }
    } catch (error) {
      console.error('Error fetching versions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'new':
        return <Sparkles className="h-4 w-4" />;
      case 'improvement':
        return <TrendingUp className="h-4 w-4" />;
      case 'fix':
        return <Bug className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'new':
        return 'Novo';
      case 'improvement':
        return 'Melhoria';
      case 'fix':
        return 'Correção';
      default:
        return category;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'new':
        return 'bg-primary text-primary-foreground';
      case 'improvement':
        return 'bg-blue-500 text-white';
      case 'fix':
        return 'bg-orange-500 text-white';
      default:
        return 'bg-muted';
    }
  };

  if (loading) {
    return (
      <Layout title="Histórico de Versões">
        <div className="flex justify-center items-center min-h-[400px]">
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Histórico de Versões">
      <div className="space-y-6 pb-20">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Novidades e Atualizações</h1>
          <p className="text-muted-foreground">
            Acompanhe todas as melhorias e novas funcionalidades da plataforma
          </p>
        </div>

        <div className="space-y-4">
          {versions.map((version) => (
            <Card key={version.id} className="relative overflow-hidden">
              {version.isNew && (
                <div className="absolute top-2 right-2">
                  <Badge variant="destructive" className="animate-pulse">
                    Novo!
                  </Badge>
                </div>
              )}
              
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="font-mono">
                        v{version.version}
                      </Badge>
                      <Badge className={getCategoryColor(version.category)}>
                        <span className="mr-1">{getCategoryIcon(version.category)}</span>
                        {getCategoryLabel(version.category)}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl">{version.title}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {formatBrazilDate(new Date(version.release_date), {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                        timeZone: 'America/Sao_Paulo'
                      })}
                    </p>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <p className="text-muted-foreground">{version.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
}
