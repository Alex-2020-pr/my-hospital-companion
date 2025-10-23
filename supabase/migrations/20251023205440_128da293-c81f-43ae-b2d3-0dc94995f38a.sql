-- Remove TODAS as policies existentes da tabela user_roles
DO $$ 
DECLARE
    pol record;
BEGIN
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'user_roles' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.user_roles', pol.policyname);
    END LOOP;
END $$;

-- Recria policies sem recursão

-- 1. Usuários podem ver suas próprias roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- 2. Super admins têm acesso total (usando has_role que é SECURITY DEFINER)
CREATE POLICY "Super admins can view all"
ON public.user_roles
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Super admins can insert"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Super admins can update"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Super admins can delete"
ON public.user_roles
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'super_admin'::app_role));

-- 3. Policy para setup inicial (consulta tabela separada, sem recursão)
CREATE POLICY "First admin setup"
ON public.user_roles
FOR INSERT
TO anon, authenticated
WITH CHECK (
  role = 'super_admin'::app_role AND
  (SELECT first_admin_created FROM public.system_config WHERE id = 1) = FALSE
);