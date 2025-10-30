import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const documentSchema = z.object({
  title: z.string().min(1).max(200),
  type: z.string().min(1).max(100),
  document_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  description: z.string().max(2000).optional(),
  file_url: z.string().max(500).optional(),
  file_size: z.number().int().min(0).max(100000000).optional(),
  status: z.enum(['available', 'pending', 'archived']).optional(),
});

const requestSchema = z.object({
  patient_cpf: z.string().min(11).max(14),
  documents: z.array(documentSchema).min(1).max(100),
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

    const { patient_cpf, documents } = validationResult.data;

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

    // Inserir documentos
    const documentsToInsert = documents.map((doc: any) => ({
      user_id: profile.id,
      title: doc.title,
      type: doc.type,
      document_date: doc.document_date,
      description: doc.description || null,
      file_url: doc.file_url || null,
      file_size: doc.file_size || null,
      status: doc.status || 'available',
    }));

    const { data: insertedDocs, error: insertError } = await supabase
      .from('documents')
      .insert(documentsToInsert)
      .select();

    if (insertError) {
      console.error('Insert error:', insertError);
      return new Response(
        JSON.stringify({ error: 'Falha ao processar documentos', code: 'INSERT_FAILED' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Successfully synced ${insertedDocs.length} documents for patient ${patient_cpf} from partner ${partner.name}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `${insertedDocs.length} documentos sincronizados com sucesso`,
        documents: insertedDocs
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in erp-sync-documents:', error);
    return new Response(
      JSON.stringify({ error: 'Erro interno ao processar documentos', code: 'PROCESSING_ERROR' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
