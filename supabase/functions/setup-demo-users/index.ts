import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  // Aceitar apenas POST
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { 
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 405 
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const demoUsers = [
      {
        email: "medico@demo.com",
        password: "medico123",
        role: "doctor" as const,
        fullName: "Dr. Carlos Silva",
        specialty: "Clínica Geral",
        crm: "12345",
      },
      {
        email: "enfermeiro@demo.com",
        password: "enfermeiro123",
        role: "nurse" as const,
        fullName: "Enf. Maria Santos",
        registrationNumber: "COREN-12345",
      },
      {
        email: "paciente@demo.com",
        password: "paciente123",
        role: "patient" as const,
        fullName: "João Oliveira",
      },
    ];

    const results = [];

    for (const demoUser of demoUsers) {
      // Verificar se usuário já existe
      const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
      const existingUser = existingUsers?.users?.find(u => u.email === demoUser.email);

      let userId: string;

      if (existingUser) {
        userId = existingUser.id;
        console.log(`Usuário ${demoUser.email} já existe, atualizando...`);
      } else {
        // Criar usuário
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
          email: demoUser.email,
          password: demoUser.password,
          email_confirm: true,
          user_metadata: {
            full_name: demoUser.fullName,
          },
        });

        if (authError) {
          results.push({ email: demoUser.email, error: authError.message });
          continue;
        }

        userId = authData.user.id;
        console.log(`Usuário ${demoUser.email} criado com sucesso`);
      }

      // Criar/atualizar profile
      const { error: profileError } = await supabaseAdmin
        .from("profiles")
        .upsert({
          id: userId,
          email: demoUser.email,
          full_name: demoUser.fullName,
        }, { onConflict: "id" });

      if (profileError) {
        console.error(`Erro ao criar profile para ${demoUser.email}:`, profileError);
      }

      // Criar/atualizar role
      const { error: roleError } = await supabaseAdmin
        .from("user_roles")
        .upsert({
          user_id: userId,
          role: demoUser.role,
        }, { onConflict: "user_id,role" });

      if (roleError) {
        console.error(`Erro ao criar role para ${demoUser.email}:`, roleError);
      }

      // Criar dados específicos por role
      if (demoUser.role === "doctor") {
        const { error: doctorError } = await supabaseAdmin
          .from("doctors")
          .upsert({
            user_id: userId,
            full_name: demoUser.fullName,
            email: demoUser.email,
            specialty: demoUser.specialty!,
            crm: demoUser.crm!,
            crm_state: "PR",
            is_active: true,
          }, { onConflict: "user_id" });

        if (doctorError) {
          console.error(`Erro ao criar doctor para ${demoUser.email}:`, doctorError);
        }
      }

      if (demoUser.role === "nurse") {
        const { error: nurseError } = await supabaseAdmin
          .from("doctors")
          .upsert({
            user_id: userId,
            full_name: demoUser.fullName,
            email: demoUser.email,
            specialty: "Enfermagem",
            crm: demoUser.registrationNumber!,
            crm_state: "PR",
            is_active: true,
            position: "Enfermeiro(a)",
          }, { onConflict: "user_id" });

        if (nurseError) {
          console.error(`Erro ao criar nurse para ${demoUser.email}:`, nurseError);
        }
      }

      if (demoUser.role === "patient") {
        const { error: patientError } = await supabaseAdmin
          .from("patients")
          .upsert({
            user_id: userId,
            full_name: demoUser.fullName,
            email: demoUser.email,
            is_active: true,
          }, { onConflict: "user_id" });

        if (patientError) {
          console.error(`Erro ao criar patient para ${demoUser.email}:`, patientError);
        }
      }

      results.push({
        email: demoUser.email,
        password: demoUser.password,
        role: demoUser.role,
        success: true,
      });
    }

    return new Response(
      JSON.stringify({
        message: "Usuários de demonstração configurados!",
        users: results,
        credentials: [
          { portal: "Médico", email: "medico@demo.com", senha: "medico123" },
          { portal: "Enfermagem", email: "enfermeiro@demo.com", senha: "enfermeiro123" },
          { portal: "Paciente", email: "paciente@demo.com", senha: "paciente123" },
        ],
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );
  } catch (error) {
    console.error("Erro:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500 
      }
    );
  }
});
