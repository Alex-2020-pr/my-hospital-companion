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
    const checkSupport = async () => {
      const hasServiceWorker = 'serviceWorker' in navigator;
      const hasNotifications = 'Notification' in window;
      
      // Detect if running as PWA
      const isPWA = window.matchMedia('(display-mode: standalone)').matches || 
                    (window.navigator as any).standalone === true;
      
      // Detect iOS
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
      
      // iOS only supports push notifications when installed as PWA
      if (isIOS && !isPWA) {
        setIsSupported(false);
        setIsLoading(false);
        return;
      }
      
      // Check if permission is denied
      let permissionDenied = false;
      if (hasNotifications) {
        try {
          permissionDenied = Notification.permission === 'denied';
        } catch (e) {
          console.error('Erro ao verificar permissão:', e);
        }
      }
      
      setIsSupported(hasServiceWorker && hasNotifications && !permissionDenied);
    };
    
    checkSupport();
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
    if (!user?.id) {
      toast.error('Usuário não autenticado');
      return;
    }

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
        console.log('Token FCM gerado:', token.substring(0, 50) + '...');
        
        const { data, error } = await supabase.from('push_subscriptions').insert({
          user_id: user.id,
          endpoint: token,
          p256dh: token.substring(0, 87),
          auth: token.substring(0, 24)
        });
        
        if (error) {
          console.error('Erro ao salvar subscription:', error);
          toast.error(`Erro ao salvar notificação: ${error.message}`);
          return;
        }
        
        console.log('Subscription salva com sucesso');
        setIsSubscribed(true);
        toast.success('Notificações ativadas com sucesso!');
        
        // Recarrega o status da subscription
        await checkSubscription();
      } else {
        console.error('Token FCM não foi gerado');
        toast.error('Não foi possível gerar token de notificação');
      }
    } catch (error) {
      console.error('Erro ao ativar notificações:', error);
      toast.error('Erro ao ativar notificações');
    }
  };

  const unsubscribe = async () => {
    if (!user?.id) {
      toast.error('Usuário não autenticado');
      return;
    }

    try {
      await deleteToken(messaging);
      
      const { error } = await supabase
        .from('push_subscriptions')
        .delete()
        .eq('user_id', user.id);
      
      if (error) {
        console.error('Erro ao remover subscription:', error);
        toast.error('Erro ao desativar notificações');
        return;
      }
      
      setIsSubscribed(false);
      toast.success('Notificações desativadas');
      
      // Recarrega o status da subscription
      await checkSubscription();
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