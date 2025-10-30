import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import webpush from 'npm:web-push@3.6.7';

const BRAZIL_TIMEZONE = 'America/Sao_Paulo';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PushSubscription {
  endpoint: string;
  p256dh: string;
  auth: string;
}

interface NotificationPayload {
  userId: string;
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  data?: any;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Criar cliente Supabase com autenticação do request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Não autorizado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    // Obter o usuário do JWT token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);

    if (userError || !user) {
      console.error('Erro de autenticação:', userError);
      return new Response(
        JSON.stringify({ error: 'Não autorizado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Usuário autenticado:', user.id);

    // Verificar se é super admin
    const { data: roles } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'super_admin');

    if (!roles || roles.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Apenas super admins podem enviar notificações' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const payload: NotificationPayload = await req.json();

    // Buscar subscriptions do usuário
    const { data: subscriptions, error: subError } = await supabaseClient
      .from('push_subscriptions')
      .select('*')
      .eq('user_id', payload.userId);

    if (subError) {
      console.error('Erro ao buscar subscriptions:', subError);
      throw subError;
    }

    if (!subscriptions || subscriptions.length === 0) {
      throw new Error('Usuário não possui notificações ativadas');
    }

    // Configurar VAPID keys
    const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY')!;
    const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY')!;
    const vapidSubject = Deno.env.get('VAPID_SUBJECT')!;

    // Garantir que o subject seja uma URL válida
    const validSubject = vapidSubject.startsWith('http') || vapidSubject.startsWith('mailto:') 
      ? vapidSubject 
      : `https://${vapidSubject}`;

    webpush.setVapidDetails(
      validSubject,
      vapidPublicKey,
      vapidPrivateKey
    );

    console.log('VAPID configurado, enviando notificações...');

    // Enviar notificação para todas as subscriptions do usuário
    const promises = subscriptions.map(async (sub: PushSubscription) => {
      try {
        const pushSubscription = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth,
          },
        };

        const notificationPayload = JSON.stringify({
          title: payload.title,
          body: payload.body,
          icon: payload.icon || '/favicon.png',
          badge: payload.badge || '/favicon.png',
          data: payload.data || {},
        });

        console.log('Enviando notificação para:', sub.endpoint.substring(0, 50));

        // Enviar notificação push real usando web-push
        const result = await webpush.sendNotification(pushSubscription, notificationPayload);
        
        console.log('Notificação enviada com sucesso. Status:', result.statusCode);

        return { success: true, endpoint: sub.endpoint, statusCode: result.statusCode };
      } catch (error) {
        console.error('Erro ao enviar push:', error);
        return { success: false, endpoint: sub.endpoint, error: error.message };
      }
    });

    const results = await Promise.all(promises);

    // Timestamp no horário de Brasília para histórico
    const brazilTimestamp = new Date().toLocaleString('en-US', { 
      timeZone: BRAZIL_TIMEZONE 
    });

    // Salvar no histórico com timestamp de Brasília
    const { error: historyError } = await supabaseClient
      .from('push_notifications')
      .insert({
        sender_id: user.id,
        recipient_id: payload.userId,
        title: payload.title,
        body: payload.body,
        icon: payload.icon,
        badge: payload.badge,
        data: payload.data,
        status: 'sent',
        sent_at: new Date(brazilTimestamp).toISOString(),
      });

    if (historyError) {
      console.error('Erro ao salvar histórico:', historyError);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Notificação enviada',
        results 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erro:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
