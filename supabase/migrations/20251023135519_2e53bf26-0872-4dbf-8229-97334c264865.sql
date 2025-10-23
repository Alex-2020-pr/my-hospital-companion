-- Create medications table
CREATE TABLE public.medications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  dosage TEXT NOT NULL,
  frequency TEXT NOT NULL,
  instructions TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create medication_schedules table
CREATE TABLE public.medication_schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  medication_id UUID NOT NULL REFERENCES public.medications(id) ON DELETE CASCADE,
  time TIME NOT NULL,
  taken BOOLEAN NOT NULL DEFAULT false,
  taken_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create telemedicine_appointments table
CREATE TABLE public.telemedicine_appointments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  doctor_name TEXT NOT NULL,
  specialty TEXT NOT NULL,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled',
  meeting_url TEXT,
  instructions TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medication_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.telemedicine_appointments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for medications
CREATE POLICY "Users can view their own medications"
ON public.medications FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own medications"
ON public.medications FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own medications"
ON public.medications FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own medications"
ON public.medications FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for medication_schedules
CREATE POLICY "Users can view schedules of their medications"
ON public.medication_schedules FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.medications
    WHERE medications.id = medication_schedules.medication_id
    AND medications.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create schedules for their medications"
ON public.medication_schedules FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.medications
    WHERE medications.id = medication_schedules.medication_id
    AND medications.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update schedules of their medications"
ON public.medication_schedules FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.medications
    WHERE medications.id = medication_schedules.medication_id
    AND medications.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete schedules of their medications"
ON public.medication_schedules FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.medications
    WHERE medications.id = medication_schedules.medication_id
    AND medications.user_id = auth.uid()
  )
);

-- RLS Policies for telemedicine_appointments
CREATE POLICY "Users can view their own telemedicine appointments"
ON public.telemedicine_appointments FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own telemedicine appointments"
ON public.telemedicine_appointments FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own telemedicine appointments"
ON public.telemedicine_appointments FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own telemedicine appointments"
ON public.telemedicine_appointments FOR DELETE
USING (auth.uid() = user_id);

-- Create triggers for updated_at
CREATE TRIGGER update_medications_updated_at
BEFORE UPDATE ON public.medications
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_medication_schedules_updated_at
BEFORE UPDATE ON public.medication_schedules
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_telemedicine_appointments_updated_at
BEFORE UPDATE ON public.telemedicine_appointments
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();