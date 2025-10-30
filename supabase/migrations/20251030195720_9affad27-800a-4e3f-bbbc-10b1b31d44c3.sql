-- Enable RLS on api_rate_limits table
ALTER TABLE public.api_rate_limits ENABLE ROW LEVEL SECURITY;

-- Only super admins can view rate limit data
CREATE POLICY "Super admins can view rate limits"
ON public.api_rate_limits
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'super_admin'::app_role));

-- Only the system (via edge functions with service role) can manage rate limits
-- No user-facing policies needed since this is managed by edge functions