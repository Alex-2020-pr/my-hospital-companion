-- Create app_versions table to store version history
CREATE TABLE public.app_versions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  version text NOT NULL UNIQUE,
  release_date date NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL CHECK (category IN ('new', 'improvement', 'fix')),
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create user_version_views table to track which versions users have seen
CREATE TABLE public.user_version_views (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  version_id uuid NOT NULL REFERENCES public.app_versions(id) ON DELETE CASCADE,
  viewed_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, version_id)
);

-- Enable RLS
ALTER TABLE public.app_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_version_views ENABLE ROW LEVEL SECURITY;

-- RLS Policies for app_versions
CREATE POLICY "Anyone can view published versions"
  ON public.app_versions FOR SELECT
  USING (is_published = true);

CREATE POLICY "Super admins can manage versions"
  ON public.app_versions FOR ALL
  USING (has_role(auth.uid(), 'super_admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

-- RLS Policies for user_version_views
CREATE POLICY "Users can view their own version views"
  ON public.user_version_views FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can mark versions as viewed"
  ON public.user_version_views FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_app_versions_release_date ON public.app_versions(release_date DESC);
CREATE INDEX idx_user_version_views_user_id ON public.user_version_views(user_id);

-- Insert initial version data
INSERT INTO public.app_versions (version, release_date, title, description, category) VALUES
('1.0.0', '2025-01-15', 'Lançamento Inicial', 'Sistema completo de gestão de saúde com consultas, exames, medicações e telemedicina.', 'new'),
('1.1.0', '2025-02-01', 'Integração com Hospitais', 'Adiciona suporte para agendamento integrado com sistemas hospitalares.', 'new'),
('1.2.0', '2025-02-20', 'Modo Manual e Integrado', 'Agora você pode escolher entre lembretes manuais ou agendamentos integrados com hospitais.', 'improvement'),
('1.3.0', CURRENT_DATE, 'Histórico de Versões', 'Novo sistema para acompanhar todas as atualizações e melhorias da plataforma.', 'new');