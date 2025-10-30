-- Fix SECURITY DEFINER functions to add explicit search_path for security

-- 1. Fix generate_api_token
CREATE OR REPLACE FUNCTION public.generate_api_token()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  token_value TEXT;
BEGIN
  -- Generate a secure random token (32 bytes = 64 hex characters)
  token_value := encode(gen_random_bytes(32), 'hex');
  RETURN 'org_' || token_value;
END;
$function$;

-- 2. Fix validate_org_api_token
CREATE OR REPLACE FUNCTION public.validate_org_api_token(_token text)
RETURNS TABLE(organization_id uuid, organization_name text, token_id uuid, is_valid boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
$function$;

-- 3. Fix handle_new_user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$function$;

-- 4. Fix mark_first_admin_created
CREATE OR REPLACE FUNCTION public.mark_first_admin_created()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.role = 'super_admin'::app_role THEN
    UPDATE public.system_config SET first_admin_created = TRUE WHERE id = 1;
  END IF;
  RETURN NEW;
END;
$function$;

-- 5. Fix update_user_storage
CREATE OR REPLACE FUNCTION public.update_user_storage()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.profiles
    SET storage_used_bytes = storage_used_bytes + COALESCE(NEW.file_size, 0)
    WHERE id = NEW.user_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.profiles
    SET storage_used_bytes = GREATEST(0, storage_used_bytes - COALESCE(OLD.file_size, 0))
    WHERE id = OLD.user_id;
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE public.profiles
    SET storage_used_bytes = storage_used_bytes - COALESCE(OLD.file_size, 0) + COALESCE(NEW.file_size, 0)
    WHERE id = NEW.user_id;
    RETURN NEW;
  END IF;
END;
$function$;

-- Create table for API rate limiting
CREATE TABLE IF NOT EXISTS public.api_rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id uuid NOT NULL REFERENCES public.integration_partners(id) ON DELETE CASCADE,
  window_start timestamp with time zone NOT NULL DEFAULT now(),
  request_count integer NOT NULL DEFAULT 1,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create index for efficient rate limit lookups
CREATE INDEX IF NOT EXISTS idx_api_rate_limits_partner_window 
ON public.api_rate_limits(partner_id, window_start);

-- Add trigger for updated_at
CREATE TRIGGER update_api_rate_limits_updated_at
  BEFORE UPDATE ON public.api_rate_limits
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();