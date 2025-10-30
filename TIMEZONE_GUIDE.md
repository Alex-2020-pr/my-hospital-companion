# 🌎 Guia de Timezone - AM2 App

## Horário Padrão: Brasília (America/Sao_Paulo)

Todo o sistema AM2 App utiliza **exclusivamente** o horário de Brasília (America/Sao_Paulo) para garantir consistência em todas as operações.

## 📚 Biblioteca de Timezone

Utilize as funções da biblioteca `src/lib/timezone.ts` em **TODAS** as operações de data/hora:

```typescript
import { 
  nowInBrazil,
  formatBrazilDate,
  toDateStringBrazil,
  toBrazilTime
} from "@/lib/timezone";
```

## ✅ Como Usar (Frontend)

### ❌ EVITE fazer assim:
```typescript
// ❌ ERRADO - não usa timezone de Brasília
const hoje = new Date();
const dataFormatada = data.toLocaleString('pt-BR');
const hoje = new Date().toISOString().split('T')[0];
```

### ✅ FAÇA assim:
```typescript
// ✅ CORRETO - usa timezone de Brasília
import { 
  nowInBrazil, 
  formatBrazilDate, 
  toDateStringBrazil 
} from "@/lib/timezone";

const hoje = nowInBrazil();
const dataFormatada = formatBrazilDate(minhaData);
const hoje = toDateStringBrazil();
```

## 🔌 Edge Functions e Integrações

### Enviando datas para APIs externas

Quando enviar datas para APIs externas (ERP, parceiros, etc), sempre use o timezone de Brasília:

```typescript
// Em edge functions
const now = new Date().toLocaleString('en-US', { 
  timeZone: 'America/Sao_Paulo' 
});

// Para ISO string no timezone de Brasília
const isoDate = new Date(now).toISOString();
```

### Recebendo datas de APIs externas

Ao receber datas de APIs externas, converta para Brasília:

```typescript
import { toBrazilTime, formatBrazilDate } from "@/lib/timezone";

// Data recebida da API
const apiDate = response.data.appointment_date; // "2025-01-30T10:00:00Z"

// Converter para Brasília
const brasilDate = toBrazilTime(apiDate);
const formatted = formatBrazilDate(brasilDate);
```

## 💾 Banco de Dados

### Salvando no Supabase

O Supabase armazena datas em UTC. Use as funções da biblioteca para garantir que as datas sejam interpretadas corretamente:

```typescript
import { toISOStringBrazil, toDateStringBrazil } from "@/lib/timezone";

// Para timestamp completo
await supabase.from('appointments').insert({
  appointment_date: toISOStringBrazil(),
  patient_id: userId
});

// Para apenas data (YYYY-MM-DD)
await supabase.from('vital_signs').insert({
  measurement_date: toDateStringBrazil(),
  systolic: 120
});
```

### Lendo do Supabase

Ao exibir datas do banco, sempre use formatação de Brasília:

```typescript
import { formatBrazilDate } from "@/lib/timezone";

const { data } = await supabase
  .from('appointments')
  .select('*');

data.forEach(apt => {
  console.log(formatBrazilDate(apt.appointment_date)); // 30/01/2025 14:30
});
```

## 🔄 Integrações ERP

Todas as edge functions de sincronização ERP (`erp-sync-*`) devem:

1. **Receber** datas das APIs do ERP
2. **Converter** para timezone de Brasília
3. **Salvar** no banco usando ISO string
4. **Retornar** datas formatadas em Brasília

Exemplo:

```typescript
// Em supabase/functions/erp-sync-appointments/index.ts

// 1. Receber do ERP
const erpAppointment = {
  data: "2025-01-30",
  hora: "14:30"
};

// 2. Combinar e converter para Brasília
const dateTimeStr = `${erpAppointment.data}T${erpAppointment.hora}:00`;
const brazilDate = new Date(dateTimeStr).toLocaleString('en-US', { 
  timeZone: 'America/Sao_Paulo' 
});

// 3. Salvar no banco
await supabaseAdmin
  .from('appointments')
  .insert({
    appointment_date: new Date(brazilDate).toISOString(),
    // ... outros campos
  });
```

## 📱 Push Notifications

As notificações push também usam horário de Brasília:

```typescript
// Ao enviar notificação
const timestamp = new Date().toLocaleString('pt-BR', {
  timeZone: 'America/Sao_Paulo',
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
});

await supabase.functions.invoke('send-push-notification', {
  body: {
    title: 'Lembrete de Consulta',
    body: `Sua consulta é hoje às ${timestamp}`,
    userId: patientId
  }
});
```

## 📊 Relatórios e Análises

Ao gerar relatórios, sempre especifique o timezone:

```typescript
import { formatBrazilDate, subDaysBrazil } from "@/lib/timezone";

// Últimos 7 dias no timezone de Brasília
const hoje = nowInBrazil();
const seteDiasAtras = subDaysBrazil(hoje, 7);

const { data } = await supabase
  .from('vital_signs')
  .select('*')
  .gte('measurement_date', seteDiasAtras.toISOString())
  .lte('measurement_date', hoje.toISOString());
```

## 🎯 Checklist de Implementação

Ao trabalhar com datas/horas no sistema, verifique:

- [ ] Importei as funções de `@/lib/timezone`
- [ ] Não usei `new Date()` diretamente sem conversão
- [ ] Formatei datas usando `formatBrazilDate()`
- [ ] Converti datas recebidas de APIs usando `toBrazilTime()`
- [ ] Salvei no banco usando `toISOStringBrazil()` ou `toDateStringBrazil()`
- [ ] Testei em diferentes horários do dia
- [ ] Documentei o uso do timezone no código (se necessário)

## 🆘 Problemas Comuns

### "A data está errada em 3 horas"
- **Causa**: Diferença entre UTC e Brasília (UTC-3)
- **Solução**: Use `toBrazilTime()` para converter

### "Data de amanhã aparece como hoje"
- **Causa**: Timezone do servidor diferente
- **Solução**: Use sempre `nowInBrazil()` em vez de `new Date()`

### "Horários de agendamento incorretos"
- **Causa**: Conversão automática do navegador
- **Solução**: Force timezone de Brasília em todos os formatos

## 📝 Exemplos Práticos

### Exemplo 1: Agendar Consulta
```typescript
import { toISOStringBrazil, formatBrazilDate } from "@/lib/timezone";

// Usuário seleciona: 30/01/2025 às 14:30
const selectedDate = "2025-01-30";
const selectedTime = "14:30";

const appointmentDateTime = `${selectedDate}T${selectedTime}:00`;
const brazilDateTime = new Date(appointmentDateTime).toLocaleString('en-US', {
  timeZone: 'America/Sao_Paulo'
});

await supabase.from('appointments').insert({
  appointment_date: new Date(brazilDateTime).toISOString(),
  patient_id: userId
});

toast.success(`Consulta agendada para ${formatBrazilDate(appointmentDateTime)}`);
```

### Exemplo 2: Verificar Consultas de Hoje
```typescript
import { toDateStringBrazil, isToday } from "@/lib/timezone";

const { data: appointments } = await supabase
  .from('appointments')
  .select('*')
  .eq('patient_id', userId);

const todayAppointments = appointments.filter(apt => 
  isToday(apt.appointment_date)
);

console.log(`Você tem ${todayAppointments.length} consulta(s) hoje`);
```

### Exemplo 3: Relatório de Sinais Vitais (7 dias)
```typescript
import { subDaysBrazil, formatBrazilDateOnly } from "@/lib/timezone";

const today = nowInBrazil();
const sevenDaysAgo = subDaysBrazil(today, 7);

const { data: vitalSigns } = await supabase
  .from('vital_signs')
  .select('*')
  .gte('measurement_date', sevenDaysAgo.toISOString())
  .order('measurement_date', { ascending: false });

vitalSigns.forEach(vs => {
  console.log(`${formatBrazilDateOnly(vs.measurement_date)}: PA ${vs.systolic}/${vs.diastolic}`);
});
```

## 🔄 Atualizando Código Existente

Se encontrar código que não usa a biblioteca de timezone:

1. Identifique todas as operações com `new Date()`
2. Importe as funções necessárias de `@/lib/timezone`
3. Substitua por equivalentes que usam Brasília
4. Teste com diferentes horários
5. Adicione comentário explicando o uso do timezone

---

**Lembre-se**: Timezone correto é crucial para aplicações de saúde. Horários errados podem causar problemas sérios com agendamentos, prescrições e registros médicos.
