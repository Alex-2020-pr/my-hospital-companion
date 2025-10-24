-- Remove a restrição de apenas um super admin na política first_admin_setup
DROP POLICY IF EXISTS "First admin setup" ON public.user_roles;

-- Recria a política permitindo múltiplos super admins
CREATE POLICY "Super admins can insert roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'super_admin'));

-- Política especial para permitir o primeiro super admin quando não existe nenhum
CREATE POLICY "Allow first super admin creation"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (
  role = 'super_admin' AND
  NOT EXISTS (
    SELECT 1 FROM public.user_roles WHERE role = 'super_admin'
  )
);

-- Cria tabela de mensagens/alertas de organizações para pacientes
CREATE TABLE IF NOT EXISTS public.organization_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  target_type TEXT NOT NULL DEFAULT 'all' CHECK (target_type IN ('all', 'specific')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela de leitura de mensagens pelos pacientes
CREATE TABLE IF NOT EXISTS public.message_reads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES public.organization_messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  read_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(message_id, user_id)
);

-- Enable RLS
ALTER TABLE public.organization_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_reads ENABLE ROW LEVEL SECURITY;

-- Políticas para organization_messages
-- Hospital admins podem criar mensagens para sua organização
CREATE POLICY "Hospital admins can create messages for their org"
ON public.organization_messages
FOR INSERT
TO authenticated
WITH CHECK (
  is_org_admin(auth.uid(), organization_id)
);

-- Hospital admins podem ver mensagens da sua organização
CREATE POLICY "Hospital admins can view their org messages"
ON public.organization_messages
FOR SELECT
TO authenticated
USING (
  is_org_admin(auth.uid(), organization_id)
);

-- Hospital admins podem atualizar mensagens da sua organização
CREATE POLICY "Hospital admins can update their org messages"
ON public.organization_messages
FOR UPDATE
TO authenticated
USING (
  is_org_admin(auth.uid(), organization_id)
);

-- Pacientes podem ver mensagens ativas da sua organização
CREATE POLICY "Patients can view their org messages"
ON public.organization_messages
FOR SELECT
TO authenticated
USING (
  is_active = true AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.organization_id = organization_messages.organization_id
  )
);

-- Políticas para message_reads
-- Pacientes podem marcar mensagens como lidas
CREATE POLICY "Users can mark messages as read"
ON public.message_reads
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Pacientes podem ver suas próprias leituras
CREATE POLICY "Users can view their own reads"
ON public.message_reads
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Hospital admins podem ver leituras das mensagens da sua org
CREATE POLICY "Hospital admins can view reads for their org messages"
ON public.message_reads
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.organization_messages om
    WHERE om.id = message_reads.message_id
    AND is_org_admin(auth.uid(), om.organization_id)
  )
);

-- Trigger para updated_at
CREATE TRIGGER update_organization_messages_updated_at
BEFORE UPDATE ON public.organization_messages
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_org_messages_organization ON public.organization_messages(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_messages_active ON public.organization_messages(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_message_reads_user ON public.message_reads(user_id);
CREATE INDEX IF NOT EXISTS idx_message_reads_message ON public.message_reads(message_id);