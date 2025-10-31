import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export const usePushNotifications = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    setIsSupported('serviceWorker' in navigator && 'PushManager' in window);
    if (user) {
      checkSubscription();
    }
    setIsLoading(false);
  }, [user]);

  const checkSubscription = async () => {
    try {
      const { data } = await supabase
        .from('push_subscriptions')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();
      
      setIsSubscribed(!!data);
    } catch (error) {
      console.error('Erro ao verificar subscription:', error);
    }
  };

  const subscribe = async () => {
    toast.info('Firebase FCM em implementação - veja FIREBASE_SETUP.md para configurar');
  };

  const unsubscribe = async () => {
    toast.info('Firebase FCM em implementação');
  };

  return {
    isSupported,
    isSubscribed,
    isLoading,
    subscribe,
    unsubscribe,
  };
};