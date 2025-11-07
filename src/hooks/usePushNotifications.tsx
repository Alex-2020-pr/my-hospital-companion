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
      
      console.log('[Push] Verificando suporte:', { hasServiceWorker, hasNotifications });
      
      // Detect if running as PWA
      const isPWA = window.matchMedia('(display-mode: standalone)').matches || 
                    (window.navigator as any).standalone === true;
      
      // Detect mobile OS
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
      const isAndroid = /Android/.test(navigator.userAgent);
      
      console.log('[Push] Plataforma:', { isPWA, isIOS, isAndroid, userAgent: navigator.userAgent });
      
      // iOS only supports push notifications when installed as PWA
      if (isIOS && !isPWA) {
        console.log('[Push] iOS detectado mas não está como PWA - notificações não suportadas');
        setIsSupported(false);
        setIsLoading(false);
        return;
      }
      
      // Check if permission is denied
      let permissionDenied = false;
      if (hasNotifications) {
        try {
          permissionDenied = Notification.permission === 'denied';
          console.log('[Push] Permissão de notificações:', Notification.permission);
        } catch (e) {
          console.error('[Push] Erro ao verificar permissão:', e);
        }
      }
      
      const supported = hasServiceWorker && hasNotifications && !permissionDenied;
      console.log('[Push] Suporte final:', supported);
      setIsSupported(supported);
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
      console.log('Iniciando processo de ativação de notificações...');

      console.log('Solicitando permissão de notificações...');
      const permission = await Notification.requestPermission();
      console.log('Permissão concedida:', permission);
      
      if (permission !== 'granted') {
        toast.error('Permissão para notificações negada');
        return;
      }

      console.log('Verificando service worker do Firebase...');
      let registration = await navigator.serviceWorker.getRegistration('/firebase-messaging-sw.js');
      
      if (!registration) {
        console.log('Registrando service worker do Firebase...');
        registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
          scope: '/',
          updateViaCache: 'none'
        });
      } else {
        console.log('Service worker já registrado, forçando atualização...');
        await registration.update();
      }
      
      await navigator.serviceWorker.ready;
      console.log('Service worker pronto');
      
      console.log('Gerando token FCM...');
      const token = await getToken(messaging, {
        vapidKey: 'BGwmZJGhdL2LpYfRXi6UR7TpvI8hjuQ1hEDZ6xiFee_bjTwk4vXUohgkG4GAC7f_cPqMNssdG1CpB3ID9ai2RZg',
        serviceWorkerRegistration: registration
      });

      if (!token) {
        console.error('Token FCM não foi gerado');
        toast.error('Não foi possível gerar token de notificação. Verifique as configurações do Firebase.');
        return;
      }

      console.log('Token FCM gerado:', token.substring(0, 30) + '...');
      
      // Remove subscriptions antigas do usuário antes de criar uma nova
      console.log('Removendo subscriptions antigas...');
      await supabase
        .from('push_subscriptions')
        .delete()
        .eq('user_id', user.id);
      
      // Salva a nova subscription no banco (apenas o token FCM puro)
      console.log('Salvando subscription no banco...');
      const { error } = await supabase.from('push_subscriptions').insert({
        user_id: user.id,
        endpoint: token, // Salva o token FCM puro
        p256dh: token.substring(0, Math.min(87, token.length)),
        auth: token.substring(0, Math.min(24, token.length))
      });
      
      if (error) {
        console.error('Erro ao salvar subscription:', error);
        toast.error(`Erro ao salvar: ${error.message}`);
        return;
      }
      
      console.log('Subscription salva com sucesso!');
      setIsSubscribed(true);
      
      // Envia notificação de teste automática
      console.log('Enviando notificação de teste...');
      try {
        const { error: testError } = await supabase.functions.invoke('send-push-notification', {
          body: {
            targetUserId: user.id,
            title: '✅ Notificações Ativadas!',
            body: 'Seu dispositivo está pronto para receber notificações. Se você viu esta mensagem, tudo está funcionando perfeitamente!'
          }
        });
        
        if (testError) {
          console.error('Erro ao enviar teste:', testError);
          toast.success('Notificações ativadas! Aguarde alguns segundos para receber a mensagem de teste.');
        } else {
          toast.success('Notificações ativadas! Você receberá uma mensagem de teste em instantes.');
        }
      } catch (testError) {
        console.error('Erro ao enviar teste:', testError);
        toast.success('Notificações ativadas com sucesso!');
      }
      
      // Recarrega o status da subscription
      await checkSubscription();
    } catch (error: any) {
      console.error('Erro detalhado ao ativar notificações:', error);
      toast.error(`Erro: ${error?.message || 'Erro desconhecido ao ativar notificações'}`);
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