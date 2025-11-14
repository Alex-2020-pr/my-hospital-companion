-- Adicionar role 'doctor' ao enum app_role
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'doctor';

-- Adicionar campo crm_state à tabela doctors (caso não exista)
ALTER TABLE doctors 
ADD COLUMN IF NOT EXISTS crm_state TEXT NOT NULL DEFAULT 'PR';

-- Criar função para verificar se usuário é médico
CREATE OR REPLACE FUNCTION public.is_doctor(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.doctors
    WHERE user_id = _user_id
      AND is_active = true
  )
$$;

-- Atualizar políticas RLS da tabela patients para permitir médicos visualizarem
DROP POLICY IF EXISTS "Doctors can view patients in their org" ON patients;
CREATE POLICY "Doctors can view patients in their org"
ON patients
FOR SELECT
USING (
  has_role(auth.uid(), 'super_admin') OR
  is_org_admin(auth.uid(), organization_id) OR
  (EXISTS (
    SELECT 1 FROM doctors
    WHERE doctors.user_id = auth.uid()
      AND doctors.organization_id = patients.organization_id
      AND doctors.is_active = true
  ))
);

-- Política para médicos atualizarem dados de pacientes
CREATE POLICY "Doctors can update patients in their org"
ON patients
FOR UPDATE
USING (
  has_role(auth.uid(), 'super_admin') OR
  is_org_admin(auth.uid(), organization_id) OR
  (EXISTS (
    SELECT 1 FROM doctors
    WHERE doctors.user_id = auth.uid()
      AND doctors.organization_id = patients.organization_id
      AND doctors.is_active = true
  ))
);

-- Permitir médicos visualizarem documentos dos pacientes da org
CREATE POLICY "Doctors can view patient documents"
ON documents
FOR SELECT
USING (
  auth.uid() = user_id OR
  (EXISTS (
    SELECT 1 FROM doctors d
    JOIN profiles p ON p.organization_id = d.organization_id
    WHERE d.user_id = auth.uid()
      AND p.id = documents.user_id
      AND d.is_active = true
  ))
);

-- Permitir médicos visualizarem exames dos pacientes
CREATE POLICY "Doctors can view patient exams"
ON exams
FOR SELECT
USING (
  auth.uid() = user_id OR
  (EXISTS (
    SELECT 1 FROM doctors d
    JOIN profiles p ON p.organization_id = d.organization_id
    WHERE d.user_id = auth.uid()
      AND p.id = exams.user_id
      AND d.is_active = true
  ))
);

-- Permitir médicos visualizarem medicamentos dos pacientes
CREATE POLICY "Doctors can view patient medications"
ON medications
FOR SELECT
USING (
  auth.uid() = user_id OR
  (EXISTS (
    SELECT 1 FROM doctors d
    JOIN profiles p ON p.organization_id = d.organization_id
    WHERE d.user_id = auth.uid()
      AND p.id = medications.user_id
      AND d.is_active = true
  ))
);