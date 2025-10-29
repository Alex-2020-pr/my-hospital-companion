-- Create table for push notification subscriptions
CREATE TABLE public.push_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, endpoint)
);

-- Create table for push notifications history
CREATE TABLE public.push_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID NOT NULL REFERENCES auth.users(id),
  recipient_id UUID REFERENCES auth.users(id),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  icon TEXT,
  badge TEXT,
  data JSONB,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'sent',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for push_subscriptions
CREATE POLICY "Users can manage their own subscriptions"
ON public.push_subscriptions
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Super admins can view all subscriptions"
ON public.push_subscriptions
FOR SELECT
USING (has_role(auth.uid(), 'super_admin'));

-- RLS Policies for push_notifications
CREATE POLICY "Users can view notifications sent to them"
ON public.push_notifications
FOR SELECT
USING (auth.uid() = recipient_id OR auth.uid() = sender_id);

CREATE POLICY "Super admins can send notifications"
ON public.push_notifications
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can view all notifications"
ON public.push_notifications
FOR SELECT
USING (has_role(auth.uid(), 'super_admin'));

-- Trigger for updated_at
CREATE TRIGGER update_push_subscriptions_updated_at
BEFORE UPDATE ON public.push_subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();