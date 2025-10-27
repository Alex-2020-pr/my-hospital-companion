-- Add notification preferences to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS notification_preferences jsonb DEFAULT '{
  "exam_preparation": true,
  "scheduled_exams": true,
  "scheduled_appointments": true,
  "vital_signs": true,
  "physical_activity": true,
  "medication_reminders": true
}'::jsonb;