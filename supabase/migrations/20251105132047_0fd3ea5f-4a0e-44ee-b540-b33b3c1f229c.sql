-- Adicionar coluna slug para URLs personalizadas
ALTER TABLE public.organizations
ADD COLUMN slug text UNIQUE;

-- Criar índice para busca rápida por slug
CREATE INDEX idx_organizations_slug ON public.organizations(slug);

-- Comentário explicativo
COMMENT ON COLUMN public.organizations.slug IS 'URL slug única para acesso personalizado da organização (ex: hospital-abc)';
