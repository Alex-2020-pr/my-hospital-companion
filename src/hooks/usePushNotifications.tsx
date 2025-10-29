import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export const usePushNotifications = () => {
  const { user } = useAuth();
  const [isSupported, setIsSupported] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    setIsSupported('serviceWorker' in navigator && 'PushManager' in window);
  }, []);

  useEffect(() => {
    if (isSupported && user) {
      checkSubscription();
    }
  }, [isSupported, user]);

  const checkSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const sub = await registration.pushManager.getSubscription();
      setSubscription(sub);
      setIsSubscribed(!!sub);
    } catch (error) {
      console.error('Erro ao verificar inscrição:', error);
    }
  };

  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  const subscribe = async () => {
    if (!isSupported || !user) {
      toast.error('Notificações push não são suportadas neste navegador');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      
      if (permission !== 'granted') {
        toast.error('Permissão para notificações negada');
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      
      // VAPID public key - você precisará gerar isso
      const vapidPublicKey = 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U';
      
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
      });

      // Salvar subscription no banco
      const subscriptionJSON = sub.toJSON();
      
      const { error } = await supabase
        .from('push_subscriptions')
        .upsert({
          user_id: user.id,
          endpoint: subscriptionJSON.endpoint || '',
          p256dh: subscriptionJSON.keys?.p256dh || '',
          auth: subscriptionJSON.keys?.auth || ''
        }, {
          onConflict: 'user_id,endpoint'
        });

      if (error) throw error;

      setSubscription(sub);
      setIsSubscribed(true);
      toast.success('Notificações ativadas com sucesso!');
    } catch (error) {
      console.error('Erro ao inscrever:', error);
      toast.error('Erro ao ativar notificações');
    }
  };

  const unsubscribe = async () => {
    if (!subscription || !user) return;

    try {
      await subscription.unsubscribe();

      const subscriptionJSON = subscription.toJSON();
      
      const { error } = await supabase
        .from('push_subscriptions')
        .delete()
        .eq('user_id', user.id)
        .eq('endpoint', subscriptionJSON.endpoint || '');

      if (error) throw error;

      setSubscription(null);
      setIsSubscribed(false);
      toast.success('Notificações desativadas');
    } catch (error) {
      console.error('Erro ao cancelar inscrição:', error);
      toast.error('Erro ao desativar notificações');
    }
  };

  return {
    isSupported,
    isSubscribed,
    subscribe,
    unsubscribe
  };
};
