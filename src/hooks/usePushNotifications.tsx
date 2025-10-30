import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export const usePushNotifications = () => {
  const { user } = useAuth();
  const [isSupported, setIsSupported] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsSupported("serviceWorker" in navigator && "PushManager" in window);
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
      console.error("Erro ao verificar inscrição:", error);
    }
  };

  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/\-/g, "+").replace(/_/g, "/");

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  const subscribe = async () => {
    if (!isSupported || !user) {
      toast.error("Notificações push não são suportadas neste navegador");
      return;
    }

    setIsLoading(true);

    try {
      // Verificar se a permissão já foi negada
      if (Notification.permission === "denied") {
        toast.error("Notificações bloqueadas pelo navegador", {
          description: "Para ativar: clique no ícone de cadeado 🔒 ao lado da URL e permita notificações.",
          duration: 6000,
        });
        setIsLoading(false);
        return;
      }

      const permission = await Notification.requestPermission();

      if (permission !== "granted") {
        toast.error("Permissão de notificação negada", {
          description: "Para ativar: clique no ícone de cadeado 🔒 ao lado da URL e permita notificações.",
          duration: 6000,
        });
        setIsLoading(false);
        return;
      }

      const registration = await navigator.serviceWorker.ready;

      // VAPID public key - você precisará gerar isso
      const vapidPublicKey = "BFyGNXHWbGRf-SvkIiWEeU7jLJZkFZHlv_H5Nb_npjSHaK5sIZ-dbMlPQZ5umNIeyGowSMSsG4X_VNyt2aaEhh0";

      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });

      // Salvar subscription no banco
      const subscriptionJSON = sub.toJSON();

      // Primeiro, deletar qualquer subscription existente deste usuário para este endpoint
      await supabase
        .from("push_subscriptions")
        .delete()
        .eq("user_id", user.id)
        .eq("endpoint", subscriptionJSON.endpoint || "");

      // Depois inserir a nova subscription
      const { error } = await supabase.from("push_subscriptions").insert({
        user_id: user.id,
        endpoint: subscriptionJSON.endpoint || "",
        p256dh: subscriptionJSON.keys?.p256dh || "",
        auth: subscriptionJSON.keys?.auth || "",
      });

      if (error) throw error;

      setSubscription(sub);
      setIsSubscribed(true);
      toast.success("Notificações ativadas com sucesso!");
    } catch (error) {
      console.error("Erro ao inscrever:", error);
      toast.error("Erro ao ativar notificações. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const unsubscribe = async () => {
    if (!subscription || !user) return;

    setIsLoading(true);

    try {
      await subscription.unsubscribe();

      const subscriptionJSON = subscription.toJSON();

      const { error } = await supabase
        .from("push_subscriptions")
        .delete()
        .eq("user_id", user.id)
        .eq("endpoint", subscriptionJSON.endpoint || "");

      if (error) throw error;

      setSubscription(null);
      setIsSubscribed(false);
      toast.success("Notificações desativadas");
    } catch (error) {
      console.error("Erro ao cancelar inscrição:", error);
      toast.error("Erro ao desativar notificações. Tente novamente.");
    } finally {
      setIsLoading(false);
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
