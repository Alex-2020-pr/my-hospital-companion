-- Adicionar roles de enfermagem
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'nurse';
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'nursing_tech';

-- Tabela de sinais vitais da enfermagem
CREATE TABLE IF NOT EXISTS nursing_vital_signs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  nurse_id UUID NOT NULL REFERENCES doctors(id),
  measurement_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  temperature NUMERIC(4,1),
  blood_pressure_systolic INTEGER,
  blood_pressure_diastolic INTEGER,
  heart_rate INTEGER,
  respiratory_rate INTEGER,
  oxygen_saturation INTEGER,
  pain_scale INTEGER CHECK (pain_scale >= 0 AND pain_scale <= 10),
  notes TEXT,
  is_abnormal BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de evoluções de enfermagem
CREATE TABLE IF NOT EXISTS nursing_evolutions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  nurse_id UUID NOT NULL REFERENCES doctors(id),
  evolution_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  evolution_type TEXT NOT NULL CHECK (evolution_type IN ('DAE', 'SOAP')),
  subjective_data TEXT,
  objective_data TEXT,
  assessment TEXT,
  plan TEXT,
  adl_evaluation JSONB,
  wounds_evaluation JSONB,
  pain_evaluation JSONB,
  mobility_evaluation JSONB,
  free_text TEXT,
  ai_suggestions TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de procedimentos
CREATE TABLE IF NOT EXISTS nursing_procedures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  nurse_id UUID NOT NULL REFERENCES doctors(id),
  procedure_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  procedure_type TEXT NOT NULL,
  description TEXT,
  location TEXT,
  observations TEXT,
  digital_signature TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de alertas de enfermagem
CREATE TABLE IF NOT EXISTS nursing_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  message TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES doctors(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Índices para performance
CREATE INDEX idx_nursing_vital_signs_patient ON nursing_vital_signs(patient_id);
CREATE INDEX idx_nursing_vital_signs_date ON nursing_vital_signs(measurement_date DESC);
CREATE INDEX idx_nursing_evolutions_patient ON nursing_evolutions(patient_id);
CREATE INDEX idx_nursing_evolutions_date ON nursing_evolutions(evolution_date DESC);
CREATE INDEX idx_nursing_procedures_patient ON nursing_procedures(patient_id);
CREATE INDEX idx_nursing_procedures_date ON nursing_procedures(procedure_date DESC);
CREATE INDEX idx_nursing_alerts_patient ON nursing_alerts(patient_id);
CREATE INDEX idx_nursing_alerts_active ON nursing_alerts(is_active) WHERE is_active = true;

-- RLS Policies
ALTER TABLE nursing_vital_signs ENABLE ROW LEVEL SECURITY;
ALTER TABLE nursing_evolutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE nursing_procedures ENABLE ROW LEVEL SECURITY;
ALTER TABLE nursing_alerts ENABLE ROW LEVEL SECURITY;

-- Enfermeiros podem registrar e ver dados
CREATE POLICY "Nurses can insert vital signs" ON nursing_vital_signs
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM doctors d
      WHERE d.id = nurse_id 
      AND d.user_id = auth.uid()
    )
  );

CREATE POLICY "Nurses can view vital signs" ON nursing_vital_signs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM doctors d
      JOIN patients p ON d.organization_id = p.organization_id
      WHERE p.id = patient_id AND d.user_id = auth.uid()
    ) OR has_role(auth.uid(), 'super_admin')
  );

CREATE POLICY "Nurses can insert evolutions" ON nursing_evolutions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM doctors d
      WHERE d.id = nurse_id 
      AND d.user_id = auth.uid()
    )
  );

CREATE POLICY "Nurses can view evolutions" ON nursing_evolutions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM doctors d
      JOIN patients p ON d.organization_id = p.organization_id
      WHERE p.id = patient_id AND d.user_id = auth.uid()
    ) OR has_role(auth.uid(), 'super_admin')
  );

CREATE POLICY "Nurses can insert procedures" ON nursing_procedures
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM doctors d
      WHERE d.id = nurse_id 
      AND d.user_id = auth.uid()
    )
  );

CREATE POLICY "Nurses can view procedures" ON nursing_procedures
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM doctors d
      JOIN patients p ON d.organization_id = p.organization_id
      WHERE p.id = patient_id AND d.user_id = auth.uid()
    ) OR has_role(auth.uid(), 'super_admin')
  );

CREATE POLICY "Nurses can manage alerts" ON nursing_alerts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM doctors d
      JOIN patients p ON d.organization_id = p.organization_id
      WHERE p.id = patient_id AND d.user_id = auth.uid()
    ) OR has_role(auth.uid(), 'super_admin')
  );

-- Triggers para updated_at
CREATE TRIGGER update_nursing_vital_signs_updated_at
  BEFORE UPDATE ON nursing_vital_signs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_nursing_evolutions_updated_at
  BEFORE UPDATE ON nursing_evolutions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_nursing_procedures_updated_at
  BEFORE UPDATE ON nursing_procedures
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();