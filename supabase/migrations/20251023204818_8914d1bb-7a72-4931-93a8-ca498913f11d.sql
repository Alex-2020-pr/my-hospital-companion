-- Habilita RLS na tabela system_config
ALTER TABLE public.system_config ENABLE ROW LEVEL SECURITY;

-- Permite leitura para todos (necessário para verificar se o primeiro admin foi criado)
CREATE POLICY "Allow read system config"
ON public.system_config
FOR SELECT
TO anon, authenticated
USING (true);

-- Apenas super admins podem atualizar (mas o trigger também pode via SECURITY DEFINER)
CREATE POLICY "Super admins can update system config"
ON public.system_config
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'super_admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));