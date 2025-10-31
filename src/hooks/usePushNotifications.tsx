import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';
import { getMessaging, getToken, deleteToken } from 'firebase/messaging';
import { initializeApp } from 'firebase/app';

const firebaseConfig = {
  apiKey: "AIzaSyCM4dZtxd7AA5daMjiRwoGKKpMgVWhLuOg",
  authDomain: "am2app.firebaseapp.com",
  projectId: "am2app",
  storageBucket: "am2app.firebasestorage.app",
  messagingSenderId: "99193179565",
  appId: "1:99193179565:web:1202f7b4873336e915e524",
  measurementId: "G-6FEGM33YZD"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

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
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        toast.error('Permissão para notificações negada');
        return;
      }

      const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      
      const token = await getToken(messaging, {
        vapidKey: 'BGwmZJGhdL2LpYfRXi6UR7TpvI8hjuQ1hEDZ6xiFee_bjTwk4vXUohgkG4GAC7f_cPqMNssdG1CpB3ID9ai2RZg',
        serviceWorkerRegistration: registration
      });

      if (token) {
        await supabase.from('push_subscriptions').upsert([{
          user_id: user?.id,
          subscription: token,
          endpoint: token,
          auth: token,
          p256dh: token
        }]);
        
        setIsSubscribed(true);
        toast.success('Notificações ativadas com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao ativar notificações:', error);
      toast.error('Erro ao ativar notificações');
    }
  };

  const unsubscribe = async () => {
    try {
      await deleteToken(messaging);
      
      await supabase
        .from('push_subscriptions')
        .delete()
        .eq('user_id', user?.id);
      
      setIsSubscribed(false);
      toast.success('Notificações desativadas');
    } catch (error) {
      console.error('Erro ao desativar notificações:', error);
      toast.error('Erro ao desativar notificações');
    }
  };

  return {
    isSupported,
    isSubscribed,
    isLoading,
    subscribe,
    unsubscribe,
  };
};