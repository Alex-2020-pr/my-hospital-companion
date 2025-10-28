import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, TrendingUp, Bug, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Version {
  id: string;
  version: string;
  release_date: string;
  title: string;
  description: string;
  category: string;
}

export const ChangelogPreview = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [latestVersions, setLatestVersions] = useState<Version[]>([]);
  const [newCount, setNewCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLatestVersions();
  }, [user]);

  const fetchLatestVersions = async () => {
    try {
      // Fetch latest 3 versions
      const { data: versionsData, error: versionsError } = await supabase
        .from('app_versions')
        .select('*')
        .eq('is_published', true)
        .order('release_date', { ascending: false })
        .limit(3);

      if (versionsError) throw versionsError;

      setLatestVersions(versionsData || []);

      if (user) {
        // Check how many unviewed versions
        const { data: viewedData, error: viewedError } = await supabase
          .from('user_version_views')
          .select('version_id')
          .eq('user_id', user.id);

        if (viewedError) throw viewedError;

        const viewedIds = new Set(viewedData?.map(v => v.version_id) || []);
        const unviewedCount = versionsData?.filter(v => !viewedIds.has(v.id)).length || 0;
        
        setNewCount(unviewedCount);
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
        return <Sparkles className="h-3 w-3" />;
      case 'improvement':
        return <TrendingUp className="h-3 w-3" />;
      case 'fix':
        return <Bug className="h-3 w-3" />;
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

  if (loading || latestVersions.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle>Novidades</CardTitle>
            {newCount > 0 && (
              <Badge variant="destructive" className="animate-pulse">
                {newCount} nova{newCount > 1 ? 's' : ''}
              </Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/changelog')}
            className="gap-1"
          >
            Ver todas
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {latestVersions.map((version) => (
          <div
            key={version.id}
            className="border-l-2 border-primary pl-3 py-1 hover:bg-muted/50 transition-colors cursor-pointer"
            onClick={() => navigate('/changelog')}
          >
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="text-xs font-mono">
                v{version.version}
              </Badge>
              <Badge className={`text-xs ${getCategoryColor(version.category)}`}>
                <span className="mr-1">{getCategoryIcon(version.category)}</span>
                {getCategoryLabel(version.category)}
              </Badge>
            </div>
            <p className="font-medium text-sm">{version.title}</p>
            <p className="text-xs text-muted-foreground">
              {format(new Date(version.release_date), "d 'de' MMM", { locale: ptBR })}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
