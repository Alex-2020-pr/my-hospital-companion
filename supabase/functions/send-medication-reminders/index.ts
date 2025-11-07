import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const BRAZIL_TIMEZONE = 'America/Sao_Paulo';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('🔍 Buscando medicamentos ativos...');

    // Buscar todos os medicamentos ativos
    const { data: medications, error: medError } = await supabaseClient
      .from('medications')
      .select(`
        id,
        name,
        dosage,
        frequency,
        user_id,
        profiles!inner(
          id,
          full_name,
          notification_preferences
        )
      `)
      .eq('status', 'active');

    if (medError) {
      console.error('Erro ao buscar medicamentos:', medError);
      throw medError;
    }

    console.log(`📋 Encontrados ${medications?.length || 0} medicamentos ativos`);

    if (!medications || medications.length === 0) {
      return new Response(
        JSON.stringify({ message: 'Nenhum medicamento ativo encontrado' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const results = [];

    for (const med of medications) {
      const profile = med.profiles;
      
      // Verificar se o usuário tem preferência de notificações de medicação ativada
      const preferences = profile?.notification_preferences || {};
      if (preferences.medication_reminders === false) {
        console.log(`⏭️ Usuário ${profile.full_name} tem lembretes desativados`);
        continue;
      }

      // Buscar tokens FCM do usuário
      const { data: subscriptions, error: subError } = await supabaseClient
        .from('push_subscriptions')
        .select('endpoint')
        .eq('user_id', med.user_id);

      if (subError || !subscriptions || subscriptions.length === 0) {
        console.log(`⚠️ Usuário ${profile.full_name} não tem tokens FCM registrados`);
        continue;
      }

      // Enviar notificação via edge function send-push-notification
      try {
        const notificationPayload = {
          targetUserId: med.user_id,
          title: '💊 Lembrete de Medicação',
          body: `Hora de tomar ${med.name} - ${med.dosage}. Frequência: ${med.frequency}`,
          icon: '/favicon.png',
          data: {
            type: 'medication_reminder',
            medication_id: med.id
          }
        };

        const response = await fetch(
          `${Deno.env.get('SUPABASE_URL')}/functions/v1/send-push-notification`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
            },
            body: JSON.stringify(notificationPayload)
          }
        );

        if (!response.ok) {
          const error = await response.text();
          console.error(`❌ Erro ao enviar notificação para ${profile.full_name}:`, error);
          results.push({
            user: profile.full_name,
            medication: med.name,
            success: false,
            error
          });
        } else {
          console.log(`✅ Notificação enviada para ${profile.full_name} - ${med.name}`);
          results.push({
            user: profile.full_name,
            medication: med.name,
            success: true
          });
        }
      } catch (error) {
        console.error(`❌ Erro ao processar ${profile.full_name}:`, error);
        results.push({
          user: profile.full_name,
          medication: med.name,
          success: false,
          error: error.message
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    console.log(`✅ ${successCount}/${results.length} lembretes enviados com sucesso`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `${successCount}/${results.length} lembretes enviados`,
        results
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Erro:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
