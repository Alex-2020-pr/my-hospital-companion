-- Adicionar coluna is_read na tabela push_notifications
ALTER TABLE push_notifications 
ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT false;

-- Criar índice para melhorar performance nas consultas
CREATE INDEX IF NOT EXISTS idx_push_notifications_recipient_read 
ON push_notifications(recipient_id, is_read);