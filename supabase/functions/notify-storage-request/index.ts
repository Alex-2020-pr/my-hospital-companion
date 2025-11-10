import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  requestId: string;
  requestType: 'hospital' | 'patient';
  userId: string;
  organizationId?: string;
  additionalGB?: number;
  monthlyAmount?: string;
  planName?: string;
  amount?: number;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { 
      requestId, 
      requestType, 
      userId, 
      organizationId, 
      additionalGB, 
      monthlyAmount,
      planName,
      amount 
    }: NotificationRequest = await req.json();

    // Buscar dados do usuário solicitante
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, email')
      .eq('id', userId)
      .single();

    // Buscar organização se aplicável
    let orgName = '';
    if (organizationId) {
      const { data: org } = await supabase
        .from('organizations')
        .select('name')
        .eq('id', organizationId)
        .single();
      orgName = org?.name || '';
    }

    // Buscar todos os super admins
    const { data: superAdmins } = await supabase
      .from('user_roles')
      .select('user_id, profiles(email)')
      .eq('role', 'super_admin');

    if (!superAdmins || superAdmins.length === 0) {
      throw new Error('Nenhum super admin encontrado');
    }

    // Criar mensagem
    let title = '';
    let body = '';
    let emailBody = '';

    if (requestType === 'hospital') {
      title = '🏥 Nova Solicitação de Armazenamento - Hospital';
      body = `${orgName} solicitou ${additionalGB} GB adicionais por R$ ${monthlyAmount}/mês`;
      emailBody = `
        <h2>Nova Solicitação de Armazenamento - Hospital</h2>
        <p><strong>Hospital:</strong> ${orgName}</p>
        <p><strong>Solicitante:</strong> ${profile?.full_name} (${profile?.email})</p>
        <p><strong>Espaço Adicional:</strong> ${additionalGB} GB</p>
        <p><strong>Valor Mensal:</strong> R$ ${monthlyAmount}</p>
        <p><strong>ID da Solicitação:</strong> ${requestId}</p>
        <br>
        <p>Acesse o painel administrativo para revisar esta solicitação.</p>
      `;
    } else {
      title = '👤 Nova Solicitação de Armazenamento - Paciente';
      body = `${profile?.full_name} solicitou ${planName} por R$ ${amount}`;
      emailBody = `
        <h2>Nova Solicitação de Armazenamento - Paciente</h2>
        <p><strong>Paciente:</strong> ${profile?.full_name}</p>
        <p><strong>Email:</strong> ${profile?.email}</p>
        ${orgName ? `<p><strong>Hospital:</strong> ${orgName}</p>` : ''}
        <p><strong>Plano:</strong> ${planName}</p>
        <p><strong>Valor:</strong> R$ ${amount}</p>
        <p><strong>ID da Solicitação:</strong> ${requestId}</p>
        <br>
        <p>Acesse o painel administrativo para revisar esta solicitação.</p>
      `;
    }

    // Criar notificações in-app para todos os super admins
    const notifications = superAdmins.map(admin => ({
      recipient_id: admin.user_id,
      sender_id: userId,
      title,
      body,
      data: {
        type: 'storage_request',
        requestId,
        requestType
      }
    }));

    await supabase.from('push_notifications').insert(notifications);

    // Enviar e-mails para todos os super admins (se RESEND_API_KEY estiver configurado)
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    
    if (resendApiKey) {
      const emailPromises = superAdmins.map(async (admin: any) => {
        const adminEmail = admin.profiles?.email;
        if (!adminEmail) return;

        try {
          const response = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${resendApiKey}`,
            },
            body: JSON.stringify({
              from: "AM2 Sistema <noreply@am2sistema.com>",
              to: [adminEmail],
              subject: title,
              html: emailBody,
            }),
          });

          if (!response.ok) {
            console.error(`Erro ao enviar e-mail para ${adminEmail}:`, await response.text());
          }
        } catch (error) {
          console.error(`Erro ao enviar e-mail para ${adminEmail}:`, error);
        }
      });

      await Promise.all(emailPromises);
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Notificações enviadas' }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error('Erro ao enviar notificações:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
