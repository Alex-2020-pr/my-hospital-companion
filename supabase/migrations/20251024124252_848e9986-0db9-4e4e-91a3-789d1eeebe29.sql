-- Create table for organization API tokens
CREATE TABLE IF NOT EXISTS organization_api_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMP WITH TIME ZONE,
  last_used_at TIMESTAMP WITH TIME ZONE,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  revoked_at TIMESTAMP WITH TIME ZONE,
  revoked_by UUID REFERENCES auth.users(id),
  revoke_reason TEXT
);

-- Enable RLS
ALTER TABLE organization_api_tokens ENABLE ROW LEVEL SECURITY;

-- Create index for faster lookups
CREATE INDEX idx_org_tokens_organization ON organization_api_tokens(organization_id);
CREATE INDEX idx_org_tokens_token ON organization_api_tokens(token) WHERE is_active = true;
CREATE INDEX idx_org_tokens_active ON organization_api_tokens(is_active);

-- Super admins can manage all tokens
CREATE POLICY "Super admins can manage all tokens"
ON organization_api_tokens
FOR ALL
USING (has_role(auth.uid(), 'super_admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

-- Hospital admins can view their organization tokens
CREATE POLICY "Hospital admins can view their org tokens"
ON organization_api_tokens
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'hospital_admin'::app_role
    AND user_roles.organization_id = organization_api_tokens.organization_id
  )
);

-- Function to generate secure API token
CREATE OR REPLACE FUNCTION generate_api_token()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  token_value TEXT;
BEGIN
  -- Generate a secure random token (32 bytes = 64 hex characters)
  token_value := encode(gen_random_bytes(32), 'hex');
  RETURN 'org_' || token_value;
END;
$$;

-- Function to validate API token
CREATE OR REPLACE FUNCTION validate_org_api_token(_token TEXT)
RETURNS TABLE (
  organization_id UUID,
  organization_name TEXT,
  token_id UUID,
  is_valid BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update last_used_at
  UPDATE organization_api_tokens
  SET last_used_at = now()
  WHERE token = _token
  AND is_active = true
  AND (expires_at IS NULL OR expires_at > now());

  -- Return validation result
  RETURN QUERY
  SELECT 
    oat.organization_id,
    o.name as organization_name,
    oat.id as token_id,
    (oat.is_active AND (oat.expires_at IS NULL OR oat.expires_at > now())) as is_valid
  FROM organization_api_tokens oat
  JOIN organizations o ON o.id = oat.organization_id
  WHERE oat.token = _token;
END;
$$;

COMMENT ON TABLE organization_api_tokens IS 'Tokens de API para integração de organizações (hospitais/clínicas)';
COMMENT ON COLUMN organization_api_tokens.token IS 'Token único para autenticação da API';
COMMENT ON COLUMN organization_api_tokens.name IS 'Nome descritivo do token (ex: Produção, Teste)';
COMMENT ON COLUMN organization_api_tokens.revoke_reason IS 'Motivo da revogação (ex: Inadimplência, Segurança)';