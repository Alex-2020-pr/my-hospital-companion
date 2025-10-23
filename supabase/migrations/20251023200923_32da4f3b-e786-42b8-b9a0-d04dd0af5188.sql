-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('super_admin', 'hospital_admin', 'patient');

-- Create organizations table for hospitals/clinics
CREATE TABLE public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('hospital', 'clinic')),
  contact_email TEXT,
  contact_phone TEXT,
  address TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, role, organization_id)
);

-- Add storage tracking to profiles
ALTER TABLE public.profiles 
ADD COLUMN storage_used_bytes BIGINT NOT NULL DEFAULT 0,
ADD COLUMN storage_limit_bytes BIGINT NOT NULL DEFAULT 10485760,
ADD COLUMN organization_id UUID REFERENCES public.organizations(id);

-- Add index for organization queries
CREATE INDEX idx_profiles_organization ON public.profiles(organization_id);
CREATE INDEX idx_user_roles_user ON public.user_roles(user_id);
CREATE INDEX idx_user_roles_org ON public.user_roles(organization_id);

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Function to check if user is admin of organization
CREATE OR REPLACE FUNCTION public.is_org_admin(_user_id UUID, _org_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = 'hospital_admin'
      AND organization_id = _org_id
  )
$$;

-- Enable RLS on organizations
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- RLS for organizations
CREATE POLICY "Super admins can manage organizations"
ON public.organizations
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Hospital admins can view their organization"
ON public.organizations
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'super_admin') OR
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
      AND organization_id = organizations.id
      AND role = 'hospital_admin'
  )
);

CREATE POLICY "Patients can view their organization"
ON public.organizations
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND organization_id = organizations.id
  )
);

-- RLS for user_roles
CREATE POLICY "Super admins can manage all roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Hospital admins can view roles in their org"
ON public.user_roles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur2
    WHERE ur2.user_id = auth.uid()
      AND ur2.role = 'hospital_admin'
      AND ur2.organization_id = user_roles.organization_id
  )
);

-- Update integration_partners RLS for admins
DROP POLICY IF EXISTS "Authenticated users can view active partners" ON public.integration_partners;

CREATE POLICY "Super admins can manage partners"
ON public.integration_partners
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Hospital admins can view active partners"
ON public.integration_partners
FOR SELECT
TO authenticated
USING (
  is_active = true AND
  (public.has_role(auth.uid(), 'hospital_admin') OR public.has_role(auth.uid(), 'patient'))
);

-- Update profiles RLS for hospital admins
CREATE POLICY "Hospital admins can view their patients"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  auth.uid() = id OR
  public.has_role(auth.uid(), 'super_admin') OR
  (
    public.has_role(auth.uid(), 'hospital_admin') AND
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
        AND ur.role = 'hospital_admin'
        AND ur.organization_id = profiles.organization_id
    )
  )
);

-- Function to calculate user storage
CREATE OR REPLACE FUNCTION public.update_user_storage()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

-- Trigger for storage tracking
CREATE TRIGGER update_storage_on_document_change
AFTER INSERT OR UPDATE OR DELETE ON public.documents
FOR EACH ROW
EXECUTE FUNCTION public.update_user_storage();

-- Create analytics table for dashboard
CREATE TABLE public.user_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  event_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_analytics_user ON public.user_analytics(user_id);
CREATE INDEX idx_analytics_org ON public.user_analytics(organization_id);
CREATE INDEX idx_analytics_date ON public.user_analytics(created_at);

ALTER TABLE public.user_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can view all analytics"
ON public.user_analytics
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Hospital admins can view their org analytics"
ON public.user_analytics
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role = 'hospital_admin'
      AND organization_id = user_analytics.organization_id
  )
);

-- Trigger updated_at for organizations
CREATE TRIGGER update_organizations_updated_at
BEFORE UPDATE ON public.organizations
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();