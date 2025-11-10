-- Adicionar campos de storage na tabela organizations
ALTER TABLE organizations 
ADD COLUMN IF NOT EXISTS storage_plan TEXT DEFAULT 'trial',
ADD COLUMN IF NOT EXISTS storage_limit_bytes BIGINT DEFAULT 536870912,
ADD COLUMN IF NOT EXISTS storage_used_bytes BIGINT DEFAULT 0,
ADD COLUMN IF NOT EXISTS default_patient_storage_limit BIGINT DEFAULT 10485760;

-- Adicionar tabela de custos operacionais
CREATE TABLE IF NOT EXISTS operational_costs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  month_year TEXT NOT NULL UNIQUE,
  supabase_storage_gb NUMERIC NOT NULL DEFAULT 0,
  supabase_bandwidth_gb NUMERIC NOT NULL DEFAULT 0,
  supabase_db_size_gb NUMERIC NOT NULL DEFAULT 0,
  supabase_total_cost NUMERIC NOT NULL DEFAULT 0,
  lovable_hosting_cost NUMERIC NOT NULL DEFAULT 0,
  firebase_cost NUMERIC NOT NULL DEFAULT 0,
  total_cost NUMERIC GENERATED ALWAYS AS (supabase_total_cost + lovable_hosting_cost + firebase_cost) STORED,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Adicionar tabela de solicitações de storage
CREATE TABLE IF NOT EXISTS storage_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  organization_id UUID REFERENCES organizations(id),
  requested_bytes BIGINT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  request_type TEXT NOT NULL DEFAULT 'increase',
  amount_paid NUMERIC,
  notes TEXT,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- RLS para operational_costs
ALTER TABLE operational_costs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can manage costs"
ON operational_costs
FOR ALL
USING (has_role(auth.uid(), 'super_admin'))
WITH CHECK (has_role(auth.uid(), 'super_admin'));

-- RLS para storage_requests
ALTER TABLE storage_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create their own requests"
ON storage_requests
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own requests"
ON storage_requests
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Hospital admins can view their org requests"
ON storage_requests
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role = 'hospital_admin'
    AND organization_id = storage_requests.organization_id
  )
);

CREATE POLICY "Hospital admins can update their org requests"
ON storage_requests
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role = 'hospital_admin'
    AND organization_id = storage_requests.organization_id
  )
);

CREATE POLICY "Super admins can manage all requests"
ON storage_requests
FOR ALL
USING (has_role(auth.uid(), 'super_admin'))
WITH CHECK (has_role(auth.uid(), 'super_admin'));

-- Triggers
CREATE TRIGGER update_operational_costs_updated_at
BEFORE UPDATE ON operational_costs
FOR EACH ROW
EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER update_storage_requests_updated_at
BEFORE UPDATE ON storage_requests
FOR EACH ROW
EXECUTE FUNCTION handle_updated_at();

-- Função para calcular storage usado pela organização
CREATE OR REPLACE FUNCTION calculate_org_storage_usage(org_id UUID)
RETURNS BIGINT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  total_bytes BIGINT;
BEGIN
  SELECT COALESCE(SUM(storage_used_bytes), 0)
  INTO total_bytes
  FROM profiles
  WHERE organization_id = org_id;
  
  RETURN total_bytes;
END;
$$;