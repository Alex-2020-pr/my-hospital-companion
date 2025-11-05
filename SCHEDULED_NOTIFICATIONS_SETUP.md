# Configuração de Notificações Automáticas

## Visão Geral
O sistema de notificações automáticas envia lembretes para:
- 💊 **Medicações**: Alerta 15 minutos antes do horário agendado
- 🩺 **Consultas**: Alerta 1 hora antes do horário agendado
- 🔬 **Exames**: Alerta 1 dia antes da data agendada (futuro)

## Como Funciona

### 1. Edge Function: `send-scheduled-notifications`
Esta função verifica periodicamente:
- Medicações ativas com horários próximos (próximos 15 min)
- Consultas agendadas para hoje (próximas 1 hora)
- Envia notificações push via Firebase para usuários com notificações ativadas

### 2. Configuração do Cron Job

Para executar a função automaticamente a cada 15 minutos, execute este SQL no backend (Cloud → SQL Editor):

```sql
-- Habilitar extensões necessárias (se ainda não estiverem ativas)
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Criar o cron job para executar a cada 15 minutos
SELECT cron.schedule(
  'send-scheduled-notifications-job',
  '*/15 * * * *', -- A cada 15 minutos
  $$
  SELECT net.http_post(
    url := 'https://jfrpzfzofhijgycpdfcj.supabase.co/functions/v1/send-scheduled-notifications',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmcnB6ZnpvZmhpamd5Y3BkZmNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEwNzE4NDgsImV4cCI6MjA3NjY0Nzg0OH0.d91T0yASnL4g5KMxsxZu7B78-5kgyEMp_KQyQ1f6iAs"}'::jsonb,
    body := '{"scheduled": true}'::jsonb
  ) AS request_id;
  $$
);
```

### 3. Verificar se o Cron Job está Ativo

```sql
-- Listar todos os cron jobs
SELECT * FROM cron.job;

-- Ver histórico de execuções
SELECT * FROM cron.job_run_details 
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'send-scheduled-notifications-job')
ORDER BY start_time DESC 
LIMIT 10;
```

### 4. Remover o Cron Job (se necessário)

```sql
SELECT cron.unschedule('send-scheduled-notifications-job');
```

## Teste Manual

Para testar a função manualmente sem esperar o cron:

```bash
# Via API
curl -X POST \
  https://jfrpzfzofhijgycpdfcj.supabase.co/functions/v1/send-scheduled-notifications \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmcnB6ZnpvZmhpamd5Y3BkZmNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEwNzE4NDgsImV4cCI6MjA3NjY0Nzg0OH0.d91T0yASnL4g5KMxsxZu7B78-5kgyEMp_KQyQ1f6iAs" \
  -H "Content-Type: application/json" \
  -d '{"test": true}'
```

## Requisitos

✅ As extensões `pg_cron` e `pg_net` devem estar ativadas no Supabase
✅ O usuário deve ter notificações push ativadas no perfil
✅ Medicações devem estar cadastradas com horários no `medication_schedules`
✅ Consultas devem estar com status "scheduled" e data/hora futuras

## Customização

Para alterar os intervalos de notificação, edite a função `send-scheduled-notifications`:
- **Medicações**: Linha ~140 - `diff >= 0 && diff <= 15` (15 minutos)
- **Consultas**: Linha ~215 - `diff >= 50 && diff <= 70` (1 hora)

## Logs

Para visualizar os logs da função:
1. Acesse Cloud → Functions → send-scheduled-notifications
2. Ou use: `SELECT * FROM edge_logs WHERE function = 'send-scheduled-notifications'`
