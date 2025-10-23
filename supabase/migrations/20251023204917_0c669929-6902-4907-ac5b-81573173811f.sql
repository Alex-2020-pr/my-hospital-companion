-- Remove a policy problemática
DROP POLICY IF EXISTS "Allow first super_admin creation" ON public.user_roles;
DROP FUNCTION IF EXISTS public.super_admin_exists();
DROP TRIGGER IF EXISTS after_first_admin_insert ON public.user_roles;
DROP FUNCTION IF EXISTS public.mark_first_admin_created();

-- Cria tabela para controlar o setup inicial (apenas uma linha)
CREATE TABLE IF NOT EXISTS public.system_config (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  first_admin_created BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insere o registro inicial
INSERT INTO public.system_config (id, first_admin_created)
VALUES (1, FALSE)
ON CONFLICT (id) DO NOTHING;

-- Policy simples que permite inserção apenas se first_admin_created = false
CREATE POLICY "Allow first super_admin creation"
ON public.user_roles
FOR INSERT
TO anon, authenticated
WITH CHECK (
  role = 'super_admin'::app_role AND
  (SELECT first_admin_created FROM public.system_config WHERE id = 1) = FALSE
);

-- Trigger para atualizar o flag após criar o primeiro super admin
CREATE OR REPLACE FUNCTION public.mark_first_admin_created()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.role = 'super_admin'::app_role THEN
    UPDATE public.system_config SET first_admin_created = TRUE WHERE id = 1;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER after_first_admin_insert
AFTER INSERT ON public.user_roles
FOR EACH ROW
WHEN (NEW.role = 'super_admin'::app_role)
EXECUTE FUNCTION public.mark_first_admin_created();