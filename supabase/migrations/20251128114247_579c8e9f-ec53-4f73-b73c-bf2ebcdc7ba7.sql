-- Create nursing_incidents table
CREATE TABLE IF NOT EXISTS public.nursing_incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  reported_by UUID NOT NULL REFERENCES public.doctors(id),
  incident_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  incident_type TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  description TEXT NOT NULL,
  sector TEXT,
  actions_taken TEXT,
  resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create nursing_technicians table
CREATE TABLE IF NOT EXISTS public.nursing_technicians (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES public.organizations(id),
  full_name TEXT NOT NULL,
  registration_number TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  sector TEXT,
  is_active BOOLEAN DEFAULT true,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- Add sector field to existing tables if not exists
ALTER TABLE public.nursing_vital_signs ADD COLUMN IF NOT EXISTS sector TEXT;
ALTER TABLE public.nursing_evolutions ADD COLUMN IF NOT EXISTS sector TEXT;
ALTER TABLE public.nursing_procedures ADD COLUMN IF NOT EXISTS sector TEXT;

-- Enable RLS
ALTER TABLE public.nursing_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nursing_technicians ENABLE ROW LEVEL SECURITY;

-- RLS Policies for nursing_incidents
CREATE POLICY "Nurses can report incidents"
  ON public.nursing_incidents
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.doctors d
      WHERE d.id = nursing_incidents.reported_by
      AND d.user_id = auth.uid()
    )
  );

CREATE POLICY "Nurses can view incidents"
  ON public.nursing_incidents
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.doctors d
      JOIN public.patients p ON d.organization_id = p.organization_id
      WHERE p.id = nursing_incidents.patient_id
      AND d.user_id = auth.uid()
    )
    OR has_role(auth.uid(), 'super_admin')
  );

CREATE POLICY "Nurses can update incidents"
  ON public.nursing_incidents
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.doctors d
      JOIN public.patients p ON d.organization_id = p.organization_id
      WHERE p.id = nursing_incidents.patient_id
      AND d.user_id = auth.uid()
    )
    OR has_role(auth.uid(), 'super_admin')
  );

-- RLS Policies for nursing_technicians
CREATE POLICY "Technicians can view their own profile"
  ON public.nursing_technicians
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Technicians can update their own profile"
  ON public.nursing_technicians
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Hospital admins can manage technicians in their org"
  ON public.nursing_technicians
  FOR ALL
  USING (
    has_role(auth.uid(), 'super_admin')
    OR is_org_admin(auth.uid(), organization_id)
  );

CREATE POLICY "Nurses can view technicians in their org"
  ON public.nursing_technicians
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.doctors d
      WHERE d.user_id = auth.uid()
      AND d.organization_id = nursing_technicians.organization_id
    )
    OR has_role(auth.uid(), 'super_admin')
  );

-- Create triggers for updated_at
CREATE TRIGGER update_nursing_incidents_updated_at
  BEFORE UPDATE ON public.nursing_incidents
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_nursing_technicians_updated_at
  BEFORE UPDATE ON public.nursing_technicians
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();