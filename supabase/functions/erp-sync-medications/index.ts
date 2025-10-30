import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const medicationSchema = z.object({
  name: z.string().min(1).max(200),
  dosage: z.string().min(1).max(100),
  frequency: z.string().min(1).max(100),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  instructions: z.string().max(1000).optional(),
  is_active: z.boolean().optional(),
});

const requestSchema = z.object({
  patient_cpf: z.string().min(11).max(14),
  medications: z.array(medicationSchema).min(1).max(100),
});

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

    // Rate limiting: 100 requests per minute per partner
    const RATE_LIMIT = 100;
    const WINDOW_MS = 60000; // 1 minute
    const now = new Date();
    const windowStart = new Date(now.getTime() - WINDOW_MS);

    // Clean up old rate limit records
    await supabase
      .from('api_rate_limits')
      .delete()
      .lt('window_start', windowStart.toISOString());

    // Check current rate limit
    const { data: rateLimitData } = await supabase
      .from('api_rate_limits')
      .select('request_count, window_start')
      .eq('partner_id', partner.id)
      .gte('window_start', windowStart.toISOString())
      .single();

    if (rateLimitData && rateLimitData.request_count >= RATE_LIMIT) {
      const retryAfter = Math.ceil((new Date(rateLimitData.window_start).getTime() + WINDOW_MS - now.getTime()) / 1000);
      return new Response(
        JSON.stringify({ 
          error: 'Limite de requisições excedido', 
          retryAfter: `${retryAfter} segundos`,
          limit: RATE_LIMIT,
          window: '1 minuto'
        }),
        { 
          status: 429, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json',
            'Retry-After': retryAfter.toString()
          } 
        }
      );
    }

    // Update or insert rate limit record
    if (rateLimitData) {
      await supabase
        .from('api_rate_limits')
        .update({ request_count: rateLimitData.request_count + 1 })
        .eq('partner_id', partner.id)
        .gte('window_start', windowStart.toISOString());
    } else {
      await supabase
        .from('api_rate_limits')
        .insert({
          partner_id: partner.id,
          window_start: now.toISOString(),
          request_count: 1
        });
    }

    const body = await req.json();
    
    // Validate input with zod
    const validationResult = requestSchema.safeParse(body);
    if (!validationResult.success) {
      return new Response(
        JSON.stringify({ 
          error: 'Dados inválidos', 
          details: validationResult.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join(', ')
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { patient_cpf, medications } = validationResult.data;

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

    // Inserir medicamentos
    const medicationsToInsert = medications.map((med: any) => ({
      user_id: profile.id,
      name: med.name,
      dosage: med.dosage,
      frequency: med.frequency,
      start_date: med.start_date || new Date().toISOString().split('T')[0],
      end_date: med.end_date || null,
      instructions: med.instructions || null,
      is_active: med.is_active !== undefined ? med.is_active : true,
    }));

    const { data: insertedMeds, error: insertError } = await supabase
      .from('medications')
      .insert(medicationsToInsert)
      .select();

    if (insertError) {
      console.error('Insert error:', insertError);
      return new Response(
        JSON.stringify({ error: 'Falha ao processar medicamentos', code: 'INSERT_FAILED' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Successfully synced ${insertedMeds.length} medications for patient ${patient_cpf} from partner ${partner.name}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `${insertedMeds.length} medicamentos sincronizados com sucesso`,
        medications: insertedMeds
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in erp-sync-medications:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
