-- Fix 1: Restrict API key access for integration_partners
-- Drop the policy that exposes API keys to hospital admins and patients
DROP POLICY IF EXISTS "Hospital admins can view active partners" ON public.integration_partners;

-- Super admins can still view all partner data (this policy already exists)
-- CREATE POLICY "Super admins can view all partner data" already exists

-- Create security definer function to get partner info without API keys
CREATE OR REPLACE FUNCTION public.get_active_partners()
RETURNS TABLE (
  id uuid,
  name text,
  description text,
  is_active boolean,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, name, description, is_active, created_at, updated_at
  FROM public.integration_partners
  WHERE is_active = true
  AND (
    has_role(auth.uid(), 'super_admin') OR
    has_role(auth.uid(), 'hospital_admin') OR
    has_role(auth.uid(), 'patient')
  )
$$;

-- Fix 2: Add column-level restrictions for profiles PII
-- Create security definer function to get masked profile data for hospital admins
CREATE OR REPLACE FUNCTION public.get_patient_profiles_masked(_org_id uuid)
RETURNS TABLE (
  id uuid,
  full_name text,
  organization_id uuid,
  created_at timestamptz,
  updated_at timestamptz,
  cpf_masked text,
  email_masked text
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    p.id,
    p.full_name,
    p.organization_id,
    p.created_at,
    p.updated_at,
    CASE 
      WHEN has_role(auth.uid(), 'super_admin') THEN p.cpf
      ELSE '***.' || SUBSTRING(COALESCE(p.cpf, '') FROM 10 FOR 6)
    END as cpf_masked,
    CASE 
      WHEN has_role(auth.uid(), 'super_admin') THEN p.email
      ELSE '***@' || SPLIT_PART(COALESCE(p.email, 'example.com'), '@', 2)
    END as email_masked
  FROM public.profiles p
  WHERE (
    has_role(auth.uid(), 'super_admin') OR
    (
      is_org_admin(auth.uid(), _org_id) AND
      p.organization_id = _org_id
    )
  )
$$;

-- Fix 3: Add audit table for admin creation attempts
CREATE TABLE IF NOT EXISTS public.admin_setup_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  attempted_email text NOT NULL,
  attempted_at timestamptz NOT NULL DEFAULT now(),
  success boolean NOT NULL DEFAULT false,
  ip_address text,
  user_agent text
);

ALTER TABLE public.admin_setup_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can view setup attempts"
ON public.admin_setup_attempts FOR SELECT
USING (has_role(auth.uid(), 'super_admin'));

-- Create security definer function for atomic admin setup validation
CREATE OR REPLACE FUNCTION public.can_create_first_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  has_admin boolean;
  config_flag boolean;
BEGIN
  -- Check if any super_admin exists
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE role = 'super_admin'
  ) INTO has_admin;
  
  -- Check system_config flag
  SELECT first_admin_created INTO config_flag
  FROM public.system_config
  WHERE id = 1;
  
  -- Return true only if no admin exists AND flag is false
  RETURN NOT has_admin AND NOT COALESCE(config_flag, false);
END;
$$;

-- Update RLS policy for user_roles to use atomic check
DROP POLICY IF EXISTS "Allow first super admin creation" ON public.user_roles;

CREATE POLICY "Allow first super admin creation atomic"
ON public.user_roles FOR INSERT
WITH CHECK (
  CASE 
    -- Super admin creation requires atomic check
    WHEN role = 'super_admin' THEN can_create_first_admin()
    -- Other roles require existing super admin to create
    ELSE has_role(auth.uid(), 'super_admin')
  END
);