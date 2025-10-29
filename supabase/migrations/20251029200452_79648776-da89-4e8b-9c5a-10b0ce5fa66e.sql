-- Adicionar política RLS para permitir usuários atualizarem suas próprias notificações
DROP POLICY IF EXISTS "Users can update their own push notifications" ON push_notifications;

CREATE POLICY "Users can update their own push notifications"
ON push_notifications
FOR UPDATE
TO authenticated
USING (auth.uid() = recipient_id)
WITH CHECK (auth.uid() = recipient_id);

-- Criar tabela para respostas de notificações
CREATE TABLE IF NOT EXISTS notification_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  notification_id UUID NOT NULL REFERENCES push_notifications(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  response_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS na tabela de respostas
ALTER TABLE notification_responses ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para respostas
CREATE POLICY "Users can view their own responses"
ON notification_responses
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own responses"
ON notification_responses
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_notification_responses_notification_id 
ON notification_responses(notification_id);

CREATE INDEX IF NOT EXISTS idx_notification_responses_user_id 
ON notification_responses(user_id);