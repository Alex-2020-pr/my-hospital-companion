-- Remove a policy problemática
DROP POLICY IF EXISTS "Allow first super_admin creation" ON public.user_roles;

-- Cria função para verificar se existe super admin sem recursão
CREATE OR REPLACE FUNCTION public.super_admin_exists()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE role = 'super_admin'::app_role
  )
$$;

-- Cria policy que permite inserção apenas se não existir super admin
CREATE POLICY "Allow first super_admin creation"
ON public.user_roles
FOR INSERT
TO anon, authenticated
WITH CHECK (
  (role = 'super_admin'::app_role) AND 
  NOT public.super_admin_exists()
);