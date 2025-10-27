-- Add mode column to appointments table
ALTER TABLE public.appointments 
ADD COLUMN mode text NOT NULL DEFAULT 'manual' CHECK (mode IN ('manual', 'integrated'));

-- Add hospital_contact column to appointments table
ALTER TABLE public.appointments 
ADD COLUMN hospital_contact jsonb;

-- Add comment to describe the columns
COMMENT ON COLUMN public.appointments.mode IS 'Type of appointment: manual (reminder only) or integrated (via hospital system)';
COMMENT ON COLUMN public.appointments.hospital_contact IS 'Hospital contact information (phone, whatsapp, email) for integrated appointments';