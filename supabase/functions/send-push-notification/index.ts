import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const BRAZIL_TIMEZONE = 'America/Sao_Paulo';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotificationPayload {
  userId: string;
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  data?: any;
}

// Função para obter o access token do Firebase usando as credenciais do service account
async function getAccessToken(): Promise<string> {
  const privateKey = Deno.env.get('FIREBASE_PRIVATE_KEY')!.replace(/\\n/g, '\n');
  const clientEmail = Deno.env.get('FIREBASE_CLIENT_EMAIL')!;
  
  const header = {
    alg: 'RS256',
    typ: 'JWT'
  };

  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: clientEmail,
    sub: clientEmail,
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
    scope: 'https://www.googleapis.com/auth/firebase.messaging'
  };

  // Criar JWT manualmente
  const encoder = new TextEncoder();
  const headerB64 = btoa(JSON.stringify(header)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const payloadB64 = btoa(JSON.stringify(payload)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const signInput = `${headerB64}.${payloadB64}`;

  // Importar chave privada
  const key = await crypto.subtle.importKey(
    'pkcs8',
    pemToArrayBuffer(privateKey),
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  );

  // Assinar
  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    key,
    encoder.encode(signInput)
  );

  const signatureB64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  const jwt = `${signInput}.${signatureB64}`;

  // Trocar JWT por access token
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`
  });

  const data = await response.json();
  return data.access_token;
}

function pemToArrayBuffer(pem: string): ArrayBuffer {
  const b64 = pem
    .replace(/-----BEGIN PRIVATE KEY-----/, '')
    .replace(/-----END PRIVATE KEY-----/, '')
    .replace(/\s/g, '');
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
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

    // Buscar FCM tokens do usuário
    const { data: subscriptions, error: subError } = await supabaseClient
      .from('push_subscriptions')
      .select('*')
      .eq('user_id', payload.userId);

    if (subError) {
      console.error('Erro ao buscar subscriptions:', subError);
      throw subError;
    }

    if (!subscriptions || subscriptions.length === 0) {
      return new Response(
        JSON.stringify({ 
          error: 'Usuário não possui notificações ativadas',
          userHasNotifications: false 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Encontradas ${subscriptions.length} subscriptions para o usuário`);

    // Obter access token do Firebase
    const accessToken = await getAccessToken();
    const projectId = Deno.env.get('FIREBASE_PROJECT_ID')!;

    // Enviar notificação para todos os tokens
    const promises = subscriptions.map(async (sub: any) => {
      try {
        const fcmEndpoint = `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`;
        
        // Usa o token diretamente (já está limpo no banco)
        const fcmToken = sub.endpoint;
        
        console.log('📤 Enviando notificação para token:', fcmToken.substring(0, 30) + '...');
        
        const message = {
          message: {
            token: fcmToken, // Usa apenas o token FCM puro
            notification: {
              title: payload.title,
              body: payload.body,
              image: payload.icon || '/favicon.png',
            },
            data: payload.data || {},
            android: {
              priority: 'high',
              notification: {
                icon: '/favicon.png',
                sound: 'default',
              }
            },
            apns: {
              payload: {
                aps: {
                  sound: 'default',
                  badge: 1,
                }
              }
            },
            webpush: {
              headers: {
                Urgency: 'high'
              },
              notification: {
                icon: payload.icon || '/favicon.png',
                badge: payload.badge || '/favicon.png',
                requireInteraction: true,
                tag: 'notification-' + Date.now(),
              }
            }
          }
        };

        console.log('Enviando notificação FCM para token:', sub.endpoint.substring(0, 20) + '...');

        const response = await fetch(fcmEndpoint, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(message)
        });

        const responseText = await response.text();
        
        if (!response.ok) {
          console.error('Erro FCM:', response.status, responseText);
          return { success: false, token: sub.endpoint.substring(0, 20), error: responseText };
        }

        console.log('Notificação FCM enviada com sucesso:', responseText);
        return { success: true, token: sub.endpoint.substring(0, 20) };

      } catch (error) {
        console.error('Erro ao enviar FCM:', error);
        return { success: false, token: sub.endpoint.substring(0, 20), error: error.message };
      }
    });

    const results = await Promise.all(promises);

    // Timestamp no horário de Brasília
    const brazilTimestamp = new Date().toLocaleString('en-US', { 
      timeZone: BRAZIL_TIMEZONE 
    });

    // Salvar no histórico
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

    const successCount = results.filter(r => r.success).length;
    console.log(`${successCount}/${results.length} notificações enviadas com sucesso`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `${successCount}/${results.length} notificações enviadas`,
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