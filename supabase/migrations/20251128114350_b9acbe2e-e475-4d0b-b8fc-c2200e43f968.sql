-- Add missing fields to patients table for ERP integration
ALTER TABLE public.patients 
  ADD COLUMN IF NOT EXISTS age INTEGER,
  ADD COLUMN IF NOT EXISTS gender TEXT CHECK (gender IN ('male', 'female', 'other'));

-- Add ERP integration fields to key tables
ALTER TABLE public.patients 
  ADD COLUMN IF NOT EXISTS erp_patient_id TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS last_sync_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE public.nursing_vital_signs 
  ADD COLUMN IF NOT EXISTS erp_id TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS last_sync_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE public.nursing_evolutions 
  ADD COLUMN IF NOT EXISTS erp_id TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS last_sync_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE public.nursing_procedures 
  ADD COLUMN IF NOT EXISTS erp_id TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS last_sync_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE public.nursing_incidents 
  ADD COLUMN IF NOT EXISTS erp_id TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS last_sync_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE public.doctors 
  ADD COLUMN IF NOT EXISTS erp_user_id TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS registration_number TEXT,
  ADD COLUMN IF NOT EXISTS position TEXT;

ALTER TABLE public.nursing_technicians 
  ADD COLUMN IF NOT EXISTS erp_user_id TEXT UNIQUE;

-- Create indexes for better performance on ERP integrations
CREATE INDEX IF NOT EXISTS idx_patients_erp_id ON public.patients(erp_patient_id);
CREATE INDEX IF NOT EXISTS idx_vital_signs_erp_id ON public.nursing_vital_signs(erp_id);
CREATE INDEX IF NOT EXISTS idx_evolutions_erp_id ON public.nursing_evolutions(erp_id);
CREATE INDEX IF NOT EXISTS idx_procedures_erp_id ON public.nursing_procedures(erp_id);
CREATE INDEX IF NOT EXISTS idx_incidents_erp_id ON public.nursing_incidents(erp_id);
CREATE INDEX IF NOT EXISTS idx_doctors_erp_id ON public.doctors(erp_user_id);
CREATE INDEX IF NOT EXISTS idx_technicians_erp_id ON public.nursing_technicians(erp_user_id);

-- Create API log table for tracking ERP integrations
CREATE TABLE IF NOT EXISTS public.erp_api_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL,
  request_body JSONB,
  response_status INTEGER,
  response_body JSONB,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  organization_id UUID REFERENCES public.organizations(id)
);

CREATE INDEX IF NOT EXISTS idx_erp_logs_created_at ON public.erp_api_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_erp_logs_org ON public.erp_api_logs(organization_id);

ALTER TABLE public.erp_api_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can view all API logs"
  ON public.erp_api_logs
  FOR SELECT
  USING (has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Hospital admins can view their org logs"
  ON public.erp_api_logs
  FOR SELECT
  USING (is_org_admin(auth.uid(), organization_id));