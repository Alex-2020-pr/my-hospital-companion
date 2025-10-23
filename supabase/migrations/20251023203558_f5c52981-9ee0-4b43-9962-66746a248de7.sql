-- Permitir inserção pública na tabela user_roles apenas durante o setup inicial
-- Esta policy permite criar o primeiro super_admin quando não existe nenhum

CREATE POLICY "Allow first super_admin creation"
ON public.user_roles
FOR INSERT
TO anon, authenticated
WITH CHECK (
  -- Permite inserir super_admin apenas se não existir nenhum outro super_admin
  (role = 'super_admin'::app_role) AND 
  NOT EXISTS (
    SELECT 1 FROM public.user_roles WHERE role = 'super_admin'::app_role
  )
);
