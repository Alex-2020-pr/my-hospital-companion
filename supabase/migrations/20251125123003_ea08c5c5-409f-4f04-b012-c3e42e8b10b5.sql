-- Add on_duty column to doctors table
ALTER TABLE public.doctors ADD COLUMN on_duty boolean DEFAULT false;

-- Add index for better query performance
CREATE INDEX idx_doctors_on_duty ON public.doctors(on_duty) WHERE on_duty = true;

-- Update RLS policy to allow doctors to update their own on_duty status
CREATE POLICY "Doctors can update their own on_duty status"
ON public.doctors
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);