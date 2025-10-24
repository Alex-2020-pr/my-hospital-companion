import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = req.headers.get('x-api-key');
    
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'API Key não fornecida' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Validar API Key do parceiro
    const { data: partner, error: partnerError } = await supabase
      .from('integration_partners')
      .select('id, name, is_active')
      .eq('api_key', apiKey)
      .eq('is_active', true)
      .single();

    if (partnerError || !partner) {
      console.error('Partner validation error:', partnerError);
      return new Response(
        JSON.stringify({ error: 'API Key inválida ou inativa' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { patient_cpf, appointments } = await req.json();

    if (!patient_cpf || !appointments || !Array.isArray(appointments)) {
      return new Response(
        JSON.stringify({ error: 'Dados inválidos. CPF do paciente e lista de consultas são obrigatórios.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Buscar usuário pelo CPF
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('cpf', patient_cpf)
      .single();

    if (profileError || !profile) {
      console.error('Profile not found:', profileError);
      return new Response(
        JSON.stringify({ error: 'Paciente não encontrado' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verificar consentimento do paciente
    const { data: consent, error: consentError } = await supabase
      .from('patient_consents')
      .select('consent_given, revoked_at')
      .eq('user_id', profile.id)
      .eq('partner_id', partner.id)
      .single();

    if (consentError || !consent || !consent.consent_given || consent.revoked_at) {
      console.error('Consent validation error:', consentError);
      return new Response(
        JSON.stringify({ error: 'Paciente não autorizou integração conforme LGPD' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Processar consultas evitando duplicatas
    const results = [];
    let insertedCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;

    for (const apt of appointments) {
      const dateStr = apt.appointment_date;
      
      // Verificar se já existe uma consulta com os mesmos dados
      const { data: existingApt, error: checkError } = await supabase
        .from('appointments')
        .select('id, status')
        .eq('user_id', profile.id)
        .eq('doctor_name', apt.doctor_name)
        .eq('appointment_date', dateStr)
        .eq('appointment_time', apt.appointment_time)
        .maybeSingle();

      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error checking existing appointment:', checkError);
        continue;
      }

      const appointmentData = {
        user_id: profile.id,
        doctor_name: apt.doctor_name,
        specialty: apt.specialty || null,
        appointment_date: dateStr,
        appointment_time: apt.appointment_time,
        type: apt.type || 'Consulta',
        location: apt.location || null,
        notes: apt.notes || null,
        status: apt.status || 'scheduled',
      };

      if (existingApt) {
        // Atualizar consulta existente
        const { data: updated, error: updateError } = await supabase
          .from('appointments')
          .update(appointmentData)
          .eq('id', existingApt.id)
          .select()
          .single();

        if (updateError) {
          console.error('Update error:', updateError);
          continue;
        }
        
        results.push(updated);
        updatedCount++;
      } else {
        // Inserir nova consulta
        const { data: inserted, error: insertError } = await supabase
          .from('appointments')
          .insert(appointmentData)
          .select()
          .single();

        if (insertError) {
          console.error('Insert error:', insertError);
          continue;
        }
        
        results.push(inserted);
        insertedCount++;
      }
    }

    const totalProcessed = insertedCount + updatedCount;
    console.log(`Successfully synced ${totalProcessed} appointments (${insertedCount} inserted, ${updatedCount} updated) for patient ${patient_cpf} from partner ${partner.name}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `${totalProcessed} consultas sincronizadas (${insertedCount} novas, ${updatedCount} atualizadas)`,
        inserted: insertedCount,
        updated: updatedCount,
        total: totalProcessed,
        appointments: results
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in erp-sync-appointments:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
