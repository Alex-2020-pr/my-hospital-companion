import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Função para gerar JWT e obter access token do FCM
async function getAccessToken(): Promise<string> {
  const privateKey = Deno.env.get('FIREBASE_PRIVATE_KEY')?.replace(/\\n/g, '\n');
  const clientEmail = Deno.env.get('FIREBASE_CLIENT_EMAIL');
  const projectId = Deno.env.get('FIREBASE_PROJECT_ID');

  if (!privateKey || !clientEmail || !projectId) {
    throw new Error('Missing Firebase credentials');
  }

  const header = {
    alg: 'RS256',
    typ: 'JWT',
  };

  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: clientEmail,
    sub: clientEmail,
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
    scope: 'https://www.googleapis.com/auth/firebase.messaging',
  };

  const encodedHeader = btoa(JSON.stringify(header));
  const encodedPayload = btoa(JSON.stringify(payload));
  const unsignedToken = `${encodedHeader}.${encodedPayload}`;

  const privateKeyBuffer = await pemToArrayBuffer(privateKey);
  const key = await crypto.subtle.importKey(
    'pkcs8',
    privateKeyBuffer,
    {
      name: 'RSASSA-PKCS1-v1_5',
      hash: 'SHA-256',
    },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    key,
    new TextEncoder().encode(unsignedToken)
  );

  const encodedSignature = btoa(String.fromCharCode(...new Uint8Array(signature)));
  const jwt = `${unsignedToken}.${encodedSignature}`;

  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });

  if (!tokenResponse.ok) {
    throw new Error(`Failed to get access token: ${await tokenResponse.text()}`);
  }

  const tokenData = await tokenResponse.json();
  return tokenData.access_token;
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

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('🔍 Verificando medicações e consultas agendadas...');

    const now = new Date();
    const nowTime = now.toTimeString().slice(0, 5); // HH:MM
    const today = now.toISOString().split('T')[0]; // YYYY-MM-DD

    // Buscar medicações ativas com horários próximos (próximos 15 minutos)
    const { data: medications, error: medError } = await supabase
      .from('medications')
      .select(`
        *,
        medication_schedules (*)
      `)
      .eq('is_active', true)
      .gte('end_date', today);

    if (medError) throw medError;

    // Buscar consultas agendadas para hoje (que ainda não passaram)
    const { data: appointments, error: aptError } = await supabase
      .from('appointments')
      .select('*')
      .eq('appointment_date', today)
      .gte('appointment_time', nowTime)
      .eq('status', 'scheduled');

    if (aptError) throw aptError;

    console.log(`📋 Encontradas ${medications?.length || 0} medicações ativas`);
    console.log(`📅 Encontradas ${appointments?.length || 0} consultas agendadas hoje`);

    const notifications = [];
    const accessToken = await getAccessToken();
    const projectId = Deno.env.get('FIREBASE_PROJECT_ID');

    // Processar lembretes de medicação
    if (medications) {
      for (const med of medications) {
        const schedules = (med as any).medication_schedules || [];
        
        for (const schedule of schedules) {
          // Verificar se está próximo do horário (15 minutos de antecedência)
          const scheduleTime = schedule.time.slice(0, 5);
          const scheduleParts = scheduleTime.split(':');
          const scheduleMinutes = parseInt(scheduleParts[0]) * 60 + parseInt(scheduleParts[1]);
          const nowParts = nowTime.split(':');
          const nowMinutes = parseInt(nowParts[0]) * 60 + parseInt(nowParts[1]);
          
          const diff = scheduleMinutes - nowMinutes;
          
          // Se falta entre 0 e 15 minutos E ainda não foi tomado
          if (diff >= 0 && diff <= 15 && !schedule.taken) {
            // Buscar subscription do usuário
            const { data: subscriptions } = await supabase
              .from('push_subscriptions')
              .select('*')
              .eq('user_id', med.user_id);

            if (subscriptions && subscriptions.length > 0) {
              for (const sub of subscriptions) {
                const message = {
                  message: {
                    token: sub.endpoint,
                    notification: {
                      title: '💊 Lembrete de Medicação',
                      body: `Hora de tomar ${med.name} - ${med.dosage}`,
                    },
                    data: {
                      type: 'medication',
                      medicationId: med.id,
                      scheduleId: schedule.id,
                    },
                    android: {
                      priority: 'high',
                      notification: {
                        sound: 'default',
                        channelId: 'medication-reminders',
                      },
                    },
                    apns: {
                      payload: {
                        aps: {
                          sound: 'default',
                          badge: 1,
                        },
                      },
                    },
                  },
                };

                const response = await fetch(
                  `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`,
                  {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      Authorization: `Bearer ${accessToken}`,
                    },
                    body: JSON.stringify(message),
                  }
                );

                if (response.ok) {
                  notifications.push({ type: 'medication', userId: med.user_id, success: true });
                  console.log(`✅ Lembrete de medicação enviado para usuário ${med.user_id}`);
                }
              }
            }
          }
        }
      }
    }

    // Processar lembretes de consultas (1 hora antes)
    if (appointments) {
      for (const apt of appointments) {
        const aptTime = apt.appointment_time.slice(0, 5);
        const aptParts = aptTime.split(':');
        const aptMinutes = parseInt(aptParts[0]) * 60 + parseInt(aptParts[1]);
        const nowParts = nowTime.split(':');
        const nowMinutes = parseInt(nowParts[0]) * 60 + parseInt(nowParts[1]);
        
        const diff = aptMinutes - nowMinutes;
        
        // Se falta entre 50 e 70 minutos (janela de 1 hora de antecedência)
        if (diff >= 50 && diff <= 70) {
          const { data: subscriptions } = await supabase
            .from('push_subscriptions')
            .select('*')
            .eq('user_id', apt.user_id);

          if (subscriptions && subscriptions.length > 0) {
            for (const sub of subscriptions) {
              const message = {
                message: {
                  token: sub.endpoint,
                  notification: {
                    title: '🩺 Lembrete de Consulta',
                    body: `Sua consulta com ${apt.doctor_name} é em 1 hora!`,
                  },
                  data: {
                    type: 'appointment',
                    appointmentId: apt.id,
                  },
                  android: {
                    priority: 'high',
                    notification: {
                      sound: 'default',
                      channelId: 'appointment-reminders',
                    },
                  },
                  apns: {
                    payload: {
                      aps: {
                        sound: 'default',
                        badge: 1,
                      },
                    },
                  },
                },
              };

              const response = await fetch(
                `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`,
                {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`,
                  },
                  body: JSON.stringify(message),
                }
              );

              if (response.ok) {
                notifications.push({ type: 'appointment', userId: apt.user_id, success: true });
                console.log(`✅ Lembrete de consulta enviado para usuário ${apt.user_id}`);
              }
            }
          }
        }
      }
    }

    console.log(`📤 Total de notificações enviadas: ${notifications.length}`);

    return new Response(
      JSON.stringify({
        success: true,
        notificationsSent: notifications.length,
        details: notifications,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('❌ Erro ao enviar notificações agendadas:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
