-- Remove TODAS as policies da tabela user_roles
DROP POLICY IF EXISTS "Super admins can manage all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Hospital admins can view roles in their org" ON public.user_roles;
DROP POLICY IF EXISTS "Allow first super_admin creation" ON public.user_roles;

-- Permite que usuários vejam suas próprias roles (sem recursão)
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Permite que super admins vejam e gerenciem todas as roles
-- Usa a função has_role que é SECURITY DEFINER e não causa recursão
CREATE POLICY "Super admins can view all roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Super admins can insert roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Super admins can update roles"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Super admins can delete roles"
ON public.user_roles
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'super_admin'::app_role));

-- Policy especial para o setup inicial
-- Permite inserção apenas se o sistema ainda não tem admin
CREATE POLICY "Allow first super_admin setup"
ON public.user_roles
FOR INSERT
TO anon, authenticated
WITH CHECK (
  role = 'super_admin'::app_role AND
  (SELECT first_admin_created FROM public.system_config WHERE id = 1) = FALSE
);

-- Permite que hospital admins vejam roles de sua organização
CREATE POLICY "Hospital admins can view org roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'hospital_admin'::app_role) AND
  organization_id IN (
    SELECT organization_id 
    FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'hospital_admin'::app_role
  )
);