-- Tabela para gerenciar parceiros/sistemas integrados
CREATE TABLE public.integration_partners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  api_key TEXT NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela para consentimentos LGPD dos pacientes
CREATE TABLE public.patient_consents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  partner_id UUID NOT NULL REFERENCES public.integration_partners(id) ON DELETE CASCADE,
  consent_given BOOLEAN NOT NULL DEFAULT false,
  consent_date TIMESTAMP WITH TIME ZONE,
  consent_text TEXT NOT NULL,
  revoked_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, partner_id)
);

-- RLS para integration_partners (apenas leitura para usuários autenticados)
ALTER TABLE public.integration_partners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view active partners"
ON public.integration_partners
FOR SELECT
USING (auth.uid() IS NOT NULL AND is_active = true);

-- RLS para patient_consents
ALTER TABLE public.patient_consents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own consents"
ON public.patient_consents
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own consents"
ON public.patient_consents
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own consents"
ON public.patient_consents
FOR UPDATE
USING (auth.uid() = user_id);

-- Triggers para updated_at
CREATE TRIGGER update_integration_partners_updated_at
BEFORE UPDATE ON public.integration_partners
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_patient_consents_updated_at
BEFORE UPDATE ON public.patient_consents
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Índices para performance
CREATE INDEX idx_patient_consents_user_id ON public.patient_consents(user_id);
CREATE INDEX idx_patient_consents_partner_id ON public.patient_consents(partner_id);
CREATE INDEX idx_integration_partners_api_key ON public.integration_partners(api_key);