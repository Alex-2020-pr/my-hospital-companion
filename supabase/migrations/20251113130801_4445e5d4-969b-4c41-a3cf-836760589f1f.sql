-- Adicionar role de médico ao enum existente
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role' AND 'doctor' = ANY(enum_range(NULL::app_role)::text[])) THEN
    ALTER TYPE app_role ADD VALUE 'doctor';
  END IF;
END $$;

-- Criar tabela de médicos
CREATE TABLE IF NOT EXISTS public.doctors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  crm TEXT NOT NULL,
  crm_state TEXT NOT NULL,
  specialty TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(crm, crm_state)
);

-- Criar tabela de pacientes
CREATE TABLE IF NOT EXISTS public.patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  birth_date DATE,
  cpf TEXT,
  phone TEXT,
  email TEXT,
  bed_number TEXT,
  registry_number TEXT,
  allergies TEXT[],
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Criar tabela de diagnósticos
CREATE TABLE IF NOT EXISTS public.patient_diagnoses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES public.doctors(id),
  diagnosis TEXT NOT NULL,
  diagnosis_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Criar tabela de sinais vitais do paciente
CREATE TABLE IF NOT EXISTS public.patient_vital_signs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  measured_by UUID REFERENCES public.doctors(id),
  measurement_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  blood_pressure_systolic INTEGER,
  blood_pressure_diastolic INTEGER,
  heart_rate INTEGER,
  temperature NUMERIC(4,1),
  respiratory_rate INTEGER,
  oxygen_saturation INTEGER,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Criar tabela de prescrições
CREATE TABLE IF NOT EXISTS public.prescriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES public.doctors(id),
  medication_name TEXT NOT NULL,
  dosage TEXT NOT NULL,
  frequency TEXT NOT NULL,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  instructions TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Criar tabela de intercorrências
CREATE TABLE IF NOT EXISTS public.patient_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  recorded_by UUID REFERENCES public.doctors(id),
  event_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  event_type TEXT NOT NULL,
  description TEXT NOT NULL,
  severity TEXT DEFAULT 'normal',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_diagnoses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_vital_signs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_events ENABLE ROW LEVEL SECURITY;

-- Políticas para doctors
CREATE POLICY "Doctors can view their own profile"
  ON public.doctors FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Doctors can update their own profile"
  ON public.doctors FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Hospital admins can view doctors in their org"
  ON public.doctors FOR SELECT
  USING (
    has_role(auth.uid(), 'super_admin'::app_role) OR
    is_org_admin(auth.uid(), organization_id)
  );

CREATE POLICY "Hospital admins can manage doctors in their org"
  ON public.doctors FOR ALL
  USING (
    has_role(auth.uid(), 'super_admin'::app_role) OR
    is_org_admin(auth.uid(), organization_id)
  );

-- Políticas para patients
CREATE POLICY "Doctors can view patients in their org"
  ON public.patients FOR SELECT
  USING (
    has_role(auth.uid(), 'super_admin'::app_role) OR
    is_org_admin(auth.uid(), organization_id) OR
    EXISTS (
      SELECT 1 FROM public.doctors 
      WHERE doctors.user_id = auth.uid() 
      AND doctors.organization_id = patients.organization_id
    )
  );

CREATE POLICY "Hospital admins can manage patients"
  ON public.patients FOR ALL
  USING (
    has_role(auth.uid(), 'super_admin'::app_role) OR
    is_org_admin(auth.uid(), organization_id)
  );

-- Políticas para patient_diagnoses
CREATE POLICY "Doctors can view diagnoses of their org patients"
  ON public.patient_diagnoses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.patients p
      JOIN public.doctors d ON d.organization_id = p.organization_id
      WHERE p.id = patient_diagnoses.patient_id
      AND d.user_id = auth.uid()
    ) OR
    has_role(auth.uid(), 'super_admin'::app_role)
  );

CREATE POLICY "Doctors can create diagnoses"
  ON public.patient_diagnoses FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.doctors
      WHERE doctors.id = patient_diagnoses.doctor_id
      AND doctors.user_id = auth.uid()
    )
  );

-- Políticas para patient_vital_signs
CREATE POLICY "Doctors can view vital signs"
  ON public.patient_vital_signs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.patients p
      JOIN public.doctors d ON d.organization_id = p.organization_id
      WHERE p.id = patient_vital_signs.patient_id
      AND d.user_id = auth.uid()
    ) OR
    has_role(auth.uid(), 'super_admin'::app_role)
  );

CREATE POLICY "Doctors can record vital signs"
  ON public.patient_vital_signs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.doctors
      WHERE doctors.id = patient_vital_signs.measured_by
      AND doctors.user_id = auth.uid()
    )
  );

-- Políticas para prescriptions
CREATE POLICY "Doctors can view prescriptions"
  ON public.prescriptions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.patients p
      JOIN public.doctors d ON d.organization_id = p.organization_id
      WHERE p.id = prescriptions.patient_id
      AND d.user_id = auth.uid()
    ) OR
    has_role(auth.uid(), 'super_admin'::app_role)
  );

CREATE POLICY "Doctors can create prescriptions"
  ON public.prescriptions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.doctors
      WHERE doctors.id = prescriptions.doctor_id
      AND doctors.user_id = auth.uid()
    )
  );

-- Políticas para patient_events
CREATE POLICY "Doctors can view events"
  ON public.patient_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.patients p
      JOIN public.doctors d ON d.organization_id = p.organization_id
      WHERE p.id = patient_events.patient_id
      AND d.user_id = auth.uid()
    ) OR
    has_role(auth.uid(), 'super_admin'::app_role)
  );

CREATE POLICY "Doctors can record events"
  ON public.patient_events FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.doctors
      WHERE doctors.id = patient_events.recorded_by
      AND doctors.user_id = auth.uid()
    )
  );

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_doctors_updated_at BEFORE UPDATE ON public.doctors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON public.patients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_patient_diagnoses_updated_at BEFORE UPDATE ON public.patient_diagnoses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prescriptions_updated_at BEFORE UPDATE ON public.prescriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();