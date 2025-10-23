-- Atualizar bucket para ser público
UPDATE storage.buckets 
SET public = true 
WHERE id = 'patient-documents';