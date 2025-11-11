import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

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
    const { data: superAdminRoles, error: rolesError } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('role', 'super_admin');

    if (rolesError) {
      console.error('Erro ao buscar roles:', rolesError);
      throw new Error('Erro ao buscar super admins');
    }

    if (!superAdminRoles || superAdminRoles.length === 0) {
      throw new Error('Nenhum super admin encontrado');
    }

    const superAdminIds = superAdminRoles.map(r => r.user_id);
    
    // Buscar emails dos super admins
    const { data: superAdminProfiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email')
      .in('id', superAdminIds);

    if (profilesError) {
      console.error('Erro ao buscar perfis:', profilesError);
      throw new Error('Erro ao buscar perfis de super admins');
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

    // Criar UMA ÚNICA notificação in-app (não duplicar para cada admin)
    const { error: notifError } = await supabase
      .from('push_notifications')
      .insert({
        recipient_id: superAdminIds[0], // Apenas o primeiro super admin recebe a notificação
        sender_id: userId,
        title,
        body,
        data: {
          type: 'storage_request',
          requestId,
          requestType
        }
      });

    if (notifError) {
      console.error('Erro ao criar notificação:', notifError);
    }

    // Enviar e-mails para todos os super admins usando Gmail SMTP
    const gmailHost = Deno.env.get("GMAIL_SMTP_HOST");
    const gmailPort = Deno.env.get("GMAIL_SMTP_PORT");
    const gmailUsername = Deno.env.get("GMAIL_USERNAME");
    const gmailPassword = Deno.env.get("GMAIL_PASSWORD");
    const gmailFromName = Deno.env.get("GMAIL_FROM_NAME") || "AM2 Saúde";
    const gmailFromEmail = Deno.env.get("GMAIL_FROM_EMAIL");
    
    console.log('📧 Configuração SMTP:', {
      host: gmailHost,
      port: gmailPort,
      from: gmailFromEmail,
      adminCount: superAdminProfiles?.length || 0
    });

    if (!gmailHost || !gmailPort || !gmailUsername || !gmailPassword || !gmailFromEmail) {
      console.log('⚠️ Configuração SMTP incompleta, pulando envio de e-mails');
      console.log('Configure as variáveis: GMAIL_SMTP_HOST, GMAIL_SMTP_PORT, GMAIL_USERNAME, GMAIL_PASSWORD, GMAIL_FROM_EMAIL');
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Notificações criadas (e-mail desabilitado - configure SMTP)'
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    if (superAdminProfiles && superAdminProfiles.length > 0) {
      try {
        console.log(`📨 Iniciando envio de e-mails para ${superAdminProfiles.length} super admins`);
        
        const client = new SMTPClient({
          connection: {
            hostname: gmailHost,
            port: parseInt(gmailPort),
            tls: true,
            auth: {
              username: gmailUsername,
              password: gmailPassword,
            },
          },
        });

        for (const admin of superAdminProfiles) {
          const adminEmail = admin.email;
          if (!adminEmail) {
            console.log('⚠️ Admin sem e-mail, pulando...');
            continue;
          }

          try {
            await client.send({
              from: `${gmailFromName} <${gmailFromEmail}>`,
              to: adminEmail,
              subject: title,
              html: emailBody,
            });
            
            console.log(`✅ E-mail enviado para ${adminEmail}`);
          } catch (error) {
            console.error(`❌ Erro ao enviar e-mail para ${adminEmail}:`, error);
          }
        }

        await client.close();
        console.log('✅ Todos os e-mails processados');
      } catch (emailError) {
        console.error('❌ Erro geral ao enviar e-mails:', emailError);
      }
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
