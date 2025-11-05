-- Add white-label customization fields to organizations table
ALTER TABLE public.organizations
ADD COLUMN logo_url text,
ADD COLUMN logo_icon_url text,
ADD COLUMN primary_color text DEFAULT '#1E40AF',
ADD COLUMN secondary_color text DEFAULT '#10B981',
ADD COLUMN theme_config jsonb DEFAULT '{}'::jsonb;

-- Create storage bucket for organization logos
INSERT INTO storage.buckets (id, name, public)
VALUES ('organization-logos', 'organization-logos', true);

-- RLS policies for organization-logos bucket
CREATE POLICY "Public can view organization logos"
ON storage.objects FOR SELECT
USING (bucket_id = 'organization-logos');

CREATE POLICY "Super admins can upload organization logos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'organization-logos' AND
  has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY "Super admins can update organization logos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'organization-logos' AND
  has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY "Super admins can delete organization logos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'organization-logos' AND
  has_role(auth.uid(), 'super_admin'::app_role)
);