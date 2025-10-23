# Manual de Geração de Tokens - Digital Health API

## 📋 Índice
1. [Introdução](#introdução)
2. [Tipos de Tokens](#tipos-de-tokens)
3. [Como Gerar Token JWT](#como-gerar-token-jwt)
4. [Como Usar API Key](#como-usar-api-key)
5. [Testando as APIs](#testando-as-apis)
6. [Segurança e Boas Práticas](#segurança-e-boas-práticas)

---

## 🎯 Introdução

Este manual descreve como gerar e utilizar tokens para testar e integrar com as APIs do Digital Health. Existem três tipos principais de autenticação:

- **Token JWT**: Para usuários autenticados da aplicação
- **API Key**: Para sistemas externos (ERPs hospitalares)
- **Anon Key**: Para requisições públicas não autenticadas

---

## 🔑 Tipos de Tokens

### 1. Token JWT (Usuário Autenticado)

**Quando usar:**
- Testar endpoints que requerem autenticação de usuário
- Acessar dados do usuário logado
- Desenvolvimento e debugging

**Validade:** 1 hora (renovável)

**Como obter:** Use o Gerador de Tokens na aplicação (`/token-generator`)

---

### 2. API Key (Integração ERP)

**Quando usar:**
- Integração com sistemas externos (ERP hospitalar, clínicas)
- Sincronização automática de dados
- Produção

**Validade:** Permanente (até revogação)

**Como obter:** 
1. Cadastre um parceiro na tabela `integration_partners`
2. Gere uma API Key segura
3. Use no header `X-API-Key`

---

### 3. Anon Key (Chave Pública)

**Quando usar:**
- Requisições públicas
- Endpoints não autenticados
- Configuração inicial

**Validade:** Permanente

**Chave atual:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmcnB6ZnpvZmhpamd5Y3BkZmNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEwNzE4NDgsImV4cCI6MjA3NjY0Nzg0OH0.d91T0yASnL4g5KMxsxZu7B78-5kgyEMp_KQyQ1f6iAs
```

---

## 🚀 Como Gerar Token JWT

### Método 1: Usando a Aplicação (Recomendado)

1. **Faça login** na aplicação Digital Health
2. **Navegue** para `/token-generator`
3. **Clique** em "Gerar Token JWT"
4. **Copie** o token gerado
5. **Use** o token nas suas requisições

### Método 2: Via Código (Desenvolvimento)

```javascript
import { supabase } from '@/integrations/supabase/client';

// Obter token da sessão atual
const { data: { session } } = await supabase.auth.getSession();
const token = session?.access_token;

console.log('Token JWT:', token);
```

### Método 3: Via API (cURL)

```bash
# 1. Fazer login
curl -X POST https://jfrpzfzofhijgycpdfcj.supabase.co/auth/v1/token?grant_type=password \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "seu-email@exemplo.com",
    "password": "sua-senha"
  }'

# Resposta contém: access_token, refresh_token, expires_in
```

---

## 🔐 Como Usar API Key

### 1. Cadastrar Parceiro de Integração

Execute no banco de dados:

```sql
INSERT INTO integration_partners (
  name,
  description,
  api_key,
  is_active
) VALUES (
  'Hospital ABC',
  'Sistema ERP do Hospital ABC',
  'api_key_super_segura_gerada_aqui',
  true
);
```

**⚠️ Importante:** Gere uma API Key forte:
```bash
# Gerar API Key segura (Linux/Mac)
openssl rand -base64 32

# Ou use um gerador online confiável
```

### 2. Usar API Key nas Requisições

```bash
curl -X POST https://jfrpzfzofhijgycpdfcj.supabase.co/functions/v1/erp-sync-medications \
  -H "X-API-Key: sua-api-key-aqui" \
  -H "Content-Type: application/json" \
  -d '{
    "patient_cpf": "12345678900",
    "medications": [...]
  }'
```

---

## 🧪 Testando as APIs

### URL Base

```
https://jfrpzfzofhijgycpdfcj.supabase.co/functions/v1
```

### Endpoints Disponíveis

#### 1. Sincronizar Medicamentos

```bash
curl -X POST https://jfrpzfzofhijgycpdfcj.supabase.co/functions/v1/erp-sync-medications \
  -H "X-API-Key: sua-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "patient_cpf": "12345678900",
    "medications": [
      {
        "name": "Paracetamol 500mg",
        "dosage": "1 comprimido",
        "frequency": "A cada 8 horas",
        "start_date": "2025-01-15",
        "end_date": "2025-01-22",
        "instructions": "Tomar após as refeições"
      }
    ]
  }'
```

#### 2. Sincronizar Consultas

```bash
curl -X POST https://jfrpzfzofhijgycpdfcj.supabase.co/functions/v1/erp-sync-appointments \
  -H "X-API-Key: sua-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "patient_cpf": "12345678900",
    "appointments": [
      {
        "doctor_name": "Dr. João Silva",
        "specialty": "Cardiologia",
        "appointment_date": "2025-02-15",
        "appointment_time": "14:30",
        "location": "Clínica Central",
        "type": "consulta",
        "status": "scheduled"
      }
    ]
  }'
```

#### 3. Sincronizar Exames

```bash
curl -X POST https://jfrpzfzofhijgycpdfcj.supabase.co/functions/v1/erp-sync-exams \
  -H "X-API-Key: sua-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "patient_cpf": "12345678900",
    "exams": [
      {
        "name": "Hemograma Completo",
        "type": "laboratorio",
        "exam_date": "2025-01-20",
        "doctor_name": "Dr. Maria Santos",
        "status": "completed",
        "result_summary": "Resultados dentro da normalidade"
      }
    ]
  }'
```

#### 4. Sincronizar Documentos

```bash
curl -X POST https://jfrpzfzofhijgycpdfcj.supabase.co/functions/v1/erp-sync-documents \
  -H "X-API-Key: sua-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "patient_cpf": "12345678900",
    "documents": [
      {
        "title": "Receita Médica",
        "type": "receita",
        "document_date": "2025-01-15",
        "status": "available",
        "description": "Dr. João Silva - Cardiologia"
      }
    ]
  }'
```

---

## 🔒 Segurança e Boas Práticas

### ✅ FAÇA

- ✅ Use HTTPS em todas as requisições
- ✅ Armazene API Keys em variáveis de ambiente
- ✅ Gere API Keys fortes (mínimo 32 caracteres)
- ✅ Implemente rate limiting no seu lado
- ✅ Valide sempre o consentimento do paciente
- ✅ Faça log de todas as operações
- ✅ Renove tokens JWT antes da expiração

### ❌ NÃO FAÇA

- ❌ Não commite API Keys no código
- ❌ Não compartilhe tokens JWT
- ❌ Não use HTTP (sem SSL)
- ❌ Não ignore erros de autenticação
- ❌ Não armazene tokens no localStorage em produção
- ❌ Não reutilize API Keys entre ambientes

### 🛡️ Conformidade LGPD

Todas as requisições devem:

1. **Verificar consentimento** do paciente antes de inserir dados
2. **Registrar logs** de todas as operações
3. **Respeitar revogação** de consentimento
4. **Criptografar dados** em trânsito (HTTPS)
5. **Permitir exclusão** de dados mediante solicitação

---

## 📞 Suporte

Para dúvidas ou problemas:

1. Consulte a documentação completa em `/api-docs`
2. Use o gerador de tokens em `/token-generator`
3. Verifique os logs de erro nas requisições
4. Confirme que o consentimento do paciente está ativo

---

## 📚 Recursos Adicionais

- **Documentação da API**: `/api-docs` na aplicação
- **Gerador de Tokens**: `/token-generator` na aplicação
- **Exemplo de Integração**: `API_INTEGRATION_DOCUMENTATION.md`

---

**Última atualização:** Janeiro 2025  
**Versão da API:** 1.0
