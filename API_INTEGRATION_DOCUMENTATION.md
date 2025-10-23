# Documentação de Integração - API de Saúde Digital

## Versão 1.0.0
**Data:** Outubro 2025

---

## 1. Visão Geral

Esta documentação descreve a API REST para integração de sistemas ERP de hospitais e clínicas com o aplicativo de saúde digital dos pacientes.

### 1.1 Objetivo

Permitir que sistemas externos (ERPs hospitalares, sistemas de clínicas) enviem dados de saúde dos pacientes para o aplicativo, respeitando as normas da LGPD (Lei Geral de Proteção de Dados).

### 1.2 Arquitetura

- **Protocolo:** HTTPS/REST
- **Formato:** JSON
- **Autenticação:** API Key
- **Base URL:** `https://jfrpzfzofhijgycpdfcj.supabase.co/functions/v1`

---

## 2. Fluxo de Integração

### 2.1 Processo de Credenciamento

1. **Solicitação de Credenciamento**
   - O parceiro (hospital/clínica) solicita credenciamento à equipe técnica
   - É fornecido um API Key único e seguro

2. **Configuração no Sistema**
   - O parceiro é cadastrado na tabela `integration_partners`
   - Informações incluem: nome, descrição e API Key

3. **Consentimento do Paciente**
   - O paciente deve autorizar explicitamente o compartilhamento via app
   - Autorização conforme LGPD com termo de consentimento claro
   - Consentimento pode ser revogado a qualquer momento

### 2.2 Fluxo de Dados

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   ERP do    │  POST   │  Edge        │ Valida  │  Banco de   │
│   Hospital  │────────>│  Functions   │────────>│  Dados      │
└─────────────┘         └──────────────┘         └─────────────┘
                             │
                             │ Valida:
                             │ 1. API Key
                             │ 2. Consentimento LGPD
                             │ 3. Dados obrigatórios
```

---

## 3. Autenticação

### 3.1 API Key

Todas as requisições devem incluir o header de autenticação:

```http
X-API-Key: seu_api_key_aqui
```

### 3.2 Exemplo de Requisição

```bash
curl -X POST \
  https://jfrpzfzofhijgycpdfcj.supabase.co/functions/v1/erp-sync-medications \
  -H "X-API-Key: seu_api_key_aqui" \
  -H "Content-Type: application/json" \
  -d '{"cpf": "12345678900", "data": {...}}'
```

---

## 4. Endpoints Disponíveis

### 4.1 Sincronização de Medicamentos

**Endpoint:** `/erp-sync-medications`  
**Método:** POST

#### Payload

```json
{
  "cpf": "12345678900",
  "data": {
    "name": "Paracetamol 500mg",
    "dosage": "1 comprimido",
    "frequency": "A cada 8 horas",
    "instructions": "Tomar após as refeições",
    "start_date": "2025-10-23",
    "end_date": "2025-10-30",
    "is_active": true
  }
}
```

#### Campos Obrigatórios
- `cpf` (string): CPF do paciente (11 dígitos)
- `data.name` (string): Nome do medicamento
- `data.dosage` (string): Dosagem
- `data.frequency` (string): Frequência de uso
- `data.start_date` (date): Data de início

#### Campos Opcionais
- `data.instructions` (string): Instruções adicionais
- `data.end_date` (date): Data de término
- `data.is_active` (boolean): Status ativo (padrão: true)

#### Resposta de Sucesso (200)

```json
{
  "success": true,
  "message": "Medicamento sincronizado com sucesso",
  "data": {
    "id": "uuid-aqui",
    "name": "Paracetamol 500mg",
    "created_at": "2025-10-23T10:00:00Z"
  }
}
```

---

### 4.2 Sincronização de Consultas

**Endpoint:** `/erp-sync-appointments`  
**Método:** POST

#### Payload

```json
{
  "cpf": "12345678900",
  "data": {
    "type": "Consulta",
    "doctor_name": "Dr. João Silva",
    "specialty": "Cardiologia",
    "appointment_date": "2025-10-25",
    "appointment_time": "14:30",
    "location": "Hospital Central - Sala 205",
    "status": "scheduled",
    "notes": "Trazer exames anteriores"
  }
}
```

#### Campos Obrigatórios
- `cpf` (string): CPF do paciente
- `data.type` (string): Tipo (ex: "Consulta", "Retorno")
- `data.doctor_name` (string): Nome do médico
- `data.appointment_date` (date): Data da consulta
- `data.appointment_time` (time): Horário (formato HH:MM)

#### Campos Opcionais
- `data.specialty` (string): Especialidade médica
- `data.location` (string): Local da consulta
- `data.status` (string): Status (padrão: "scheduled")
- `data.notes` (string): Observações

#### Resposta de Sucesso (200)

```json
{
  "success": true,
  "message": "Consulta sincronizada com sucesso",
  "data": {
    "id": "uuid-aqui",
    "doctor_name": "Dr. João Silva",
    "appointment_date": "2025-10-25",
    "appointment_time": "14:30"
  }
}
```

---

### 4.3 Sincronização de Exames

**Endpoint:** `/erp-sync-exams`  
**Método:** POST

#### Payload

```json
{
  "cpf": "12345678900",
  "data": {
    "name": "Hemograma Completo",
    "type": "Laboratorial",
    "exam_date": "2025-10-20",
    "doctor_name": "Dr. Maria Santos",
    "status": "completed",
    "result_summary": "Resultados dentro da normalidade",
    "file_url": "https://storage.exemplo.com/exam123.pdf",
    "has_images": false,
    "preparation_instructions": "Jejum de 8 horas"
  }
}
```

#### Campos Obrigatórios
- `cpf` (string): CPF do paciente
- `data.name` (string): Nome do exame
- `data.type` (string): Tipo do exame
- `data.exam_date` (date): Data de realização

#### Campos Opcionais
- `data.doctor_name` (string): Médico solicitante
- `data.status` (string): Status (padrão: "pending")
- `data.result_summary` (string): Resumo dos resultados
- `data.file_url` (string): URL do arquivo PDF/imagem
- `data.has_images` (boolean): Se contém imagens
- `data.preparation_instructions` (string): Instruções de preparo

#### Resposta de Sucesso (200)

```json
{
  "success": true,
  "message": "Exame sincronizado com sucesso",
  "data": {
    "id": "uuid-aqui",
    "name": "Hemograma Completo",
    "exam_date": "2025-10-20"
  }
}
```

---

### 4.4 Sincronização de Documentos

**Endpoint:** `/erp-sync-documents`  
**Método:** POST

#### Payload

```json
{
  "cpf": "12345678900",
  "data": {
    "title": "Atestado Médico",
    "type": "Atestado",
    "description": "Atestado de comparecimento",
    "document_date": "2025-10-23",
    "file_url": "https://storage.exemplo.com/doc456.pdf",
    "file_size": 204800,
    "status": "available"
  }
}
```

#### Campos Obrigatórios
- `cpf` (string): CPF do paciente
- `data.title` (string): Título do documento
- `data.type` (string): Tipo do documento
- `data.document_date` (date): Data do documento

#### Campos Opcionais
- `data.description` (string): Descrição
- `data.file_url` (string): URL do arquivo
- `data.file_size` (integer): Tamanho em bytes
- `data.status` (string): Status (padrão: "available")

#### Resposta de Sucesso (200)

```json
{
  "success": true,
  "message": "Documento sincronizado com sucesso",
  "data": {
    "id": "uuid-aqui",
    "title": "Atestado Médico",
    "document_date": "2025-10-23"
  }
}
```

---

## 5. Tratamento de Erros

### 5.1 Códigos de Status HTTP

| Código | Descrição |
|--------|-----------|
| 200 | Sucesso |
| 400 | Requisição inválida |
| 401 | API Key inválida ou ausente |
| 403 | Sem autorização do paciente (LGPD) |
| 404 | Recurso não encontrado |
| 500 | Erro interno do servidor |

### 5.2 Formato de Erro

```json
{
  "success": false,
  "error": "Descrição do erro",
  "details": "Detalhes adicionais quando disponível"
}
```

### 5.3 Exemplos de Erros Comuns

#### API Key Inválida (401)
```json
{
  "success": false,
  "error": "API Key inválida ou inativa"
}
```

#### Sem Consentimento LGPD (403)
```json
{
  "success": false,
  "error": "Paciente não autorizou o compartilhamento de dados"
}
```

#### Dados Obrigatórios Ausentes (400)
```json
{
  "success": false,
  "error": "Campos obrigatórios ausentes",
  "details": "Os seguintes campos são obrigatórios: name, dosage, frequency"
}
```

#### Paciente Não Encontrado (404)
```json
{
  "success": false,
  "error": "Paciente não encontrado com o CPF fornecido"
}
```

---

## 6. Conformidade LGPD

### 6.1 Princípios

A integração segue rigorosamente os princípios da LGPD:

1. **Consentimento Explícito**
   - Paciente deve autorizar cada parceiro individualmente
   - Termo de consentimento claro e específico
   - Opção de revogação a qualquer momento

2. **Transparência**
   - Paciente visualiza quais dados são compartilhados
   - Histórico de autorizações disponível
   - Informações sobre uso dos dados

3. **Segurança**
   - Comunicação via HTTPS
   - Autenticação via API Key
   - Validação de consentimento em cada requisição
   - Dados criptografados

### 6.2 Gestão de Consentimento

O paciente gerencia consentimentos através do app:

1. Acessa "Integrações e Consentimentos"
2. Visualiza parceiros disponíveis
3. Ativa/desativa integrações com switch
4. Visualiza termo de consentimento antes de autorizar
5. Pode revogar autorização a qualquer momento

### 6.3 Dados Compartilhados

Quando o paciente autoriza, os seguintes dados podem ser enviados:

- ✅ Consultas e agendamentos
- ✅ Exames e resultados
- ✅ Prescrições médicas
- ✅ Documentos de saúde
- ✅ Medicamentos prescritos

**Não são compartilhados:**
- ❌ Dados cadastrais (exceto CPF para identificação)
- ❌ Informações de login
- ❌ Dados de outros parceiros

---

## 7. Boas Práticas

### 7.1 Segurança

1. **Proteja o API Key**
   - Nunca exponha em código cliente
   - Armazene em variáveis de ambiente
   - Rotacione periodicamente

2. **Validação de Dados**
   - Valide CPF antes de enviar
   - Formate datas corretamente (YYYY-MM-DD)
   - Sanitize strings para evitar injeções

3. **Tratamento de Erros**
   - Implemente retry para erros temporários
   - Logue erros para auditoria
   - Não exponha detalhes internos ao usuário

### 7.2 Performance

1. **Requisições Assíncronas**
   - Use requisições assíncronas quando possível
   - Implemente filas para grandes volumes

2. **Batch Processing**
   - Para múltiplos registros, considere processar em lotes
   - Aguarde intervalos entre requisições

3. **Timeout**
   - Configure timeout adequado (recomendado: 30s)
   - Implemente retry com backoff exponencial

### 7.3 Monitoramento

1. **Logs**
   - Registre todas as tentativas de sincronização
   - Inclua timestamps e identificadores únicos
   - Mantenha logs por no mínimo 6 meses (LGPD)

2. **Alertas**
   - Configure alertas para taxa de erro alta
   - Monitore tempo de resposta
   - Acompanhe volume de requisições

---

## 8. Exemplos de Implementação

### 8.1 JavaScript/Node.js

```javascript
const axios = require('axios');

const API_BASE_URL = 'https://jfrpzfzofhijgycpdfcj.supabase.co/functions/v1';
const API_KEY = process.env.ERP_API_KEY;

async function syncMedication(cpf, medicationData) {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/erp-sync-medications`,
      {
        cpf: cpf,
        data: medicationData
      },
      {
        headers: {
          'X-API-Key': API_KEY,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );
    
    console.log('Sucesso:', response.data);
    return response.data;
  } catch (error) {
    if (error.response) {
      console.error('Erro API:', error.response.data);
    } else {
      console.error('Erro de rede:', error.message);
    }
    throw error;
  }
}

// Exemplo de uso
syncMedication('12345678900', {
  name: 'Paracetamol 500mg',
  dosage: '1 comprimido',
  frequency: 'A cada 8 horas',
  start_date: '2025-10-23',
  is_active: true
});
```

### 8.2 Python

```python
import requests
import os
from datetime import datetime

API_BASE_URL = 'https://jfrpzfzofhijgycpdfcj.supabase.co/functions/v1'
API_KEY = os.getenv('ERP_API_KEY')

def sync_appointment(cpf, appointment_data):
    headers = {
        'X-API-Key': API_KEY,
        'Content-Type': 'application/json'
    }
    
    payload = {
        'cpf': cpf,
        'data': appointment_data
    }
    
    try:
        response = requests.post(
            f'{API_BASE_URL}/erp-sync-appointments',
            json=payload,
            headers=headers,
            timeout=30
        )
        response.raise_for_status()
        print('Sucesso:', response.json())
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f'Erro: {e}')
        if hasattr(e, 'response') and e.response is not None:
            print('Detalhes:', e.response.text)
        raise

# Exemplo de uso
sync_appointment('12345678900', {
    'type': 'Consulta',
    'doctor_name': 'Dr. João Silva',
    'specialty': 'Cardiologia',
    'appointment_date': '2025-10-25',
    'appointment_time': '14:30',
    'location': 'Hospital Central - Sala 205',
    'status': 'scheduled'
})
```

### 8.3 PHP

```php
<?php

class HealthAPIClient {
    private $apiBaseUrl = 'https://jfrpzfzofhijgycpdfcj.supabase.co/functions/v1';
    private $apiKey;
    
    public function __construct($apiKey) {
        $this->apiKey = $apiKey;
    }
    
    public function syncExam($cpf, $examData) {
        $url = $this->apiBaseUrl . '/erp-sync-exams';
        
        $payload = json_encode([
            'cpf' => $cpf,
            'data' => $examData
        ]);
        
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'X-API-Key: ' . $this->apiKey,
            'Content-Type: application/json'
        ]);
        curl_setopt($ch, CURLOPT_TIMEOUT, 30);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        if ($httpCode !== 200) {
            throw new Exception("Erro na API: " . $response);
        }
        
        return json_decode($response, true);
    }
}

// Exemplo de uso
$client = new HealthAPIClient(getenv('ERP_API_KEY'));

try {
    $result = $client->syncExam('12345678900', [
        'name' => 'Hemograma Completo',
        'type' => 'Laboratorial',
        'exam_date' => '2025-10-20',
        'doctor_name' => 'Dr. Maria Santos',
        'status' => 'completed',
        'result_summary' => 'Resultados dentro da normalidade'
    ]);
    
    echo "Sucesso: " . print_r($result, true);
} catch (Exception $e) {
    echo "Erro: " . $e->getMessage();
}
?>
```

---

## 9. Testes

### 9.1 Ambiente de Testes

Para testes, use dados fictícios e um API Key de teste fornecido pela equipe.

**Dados de Teste Sugeridos:**
- CPF: `00000000000` (paciente de teste)
- Datas: sempre usar datas futuras ou recentes
- URLs de arquivos: usar URLs de teste válidas

### 9.2 Checklist de Testes

- [ ] Autenticação com API Key válida
- [ ] Autenticação com API Key inválida (deve retornar 401)
- [ ] Envio com paciente sem consentimento (deve retornar 403)
- [ ] Envio com campos obrigatórios ausentes (deve retornar 400)
- [ ] Envio com CPF inválido (deve retornar 404)
- [ ] Envio de dados válidos (deve retornar 200)
- [ ] Timeout e retry
- [ ] Validação de formatos de data e hora

---

## 10. Suporte e Contato

### 10.1 Solicitação de Credenciamento

Para solicitar credenciamento como parceiro integrador:

1. Entre em contato com a equipe técnica
2. Forneça informações da instituição
3. Assine termo de responsabilidade LGPD
4. Receba seu API Key exclusivo

### 10.2 Suporte Técnico

- **Email:** suporte@healthapp.com.br
- **Horário:** Segunda a Sexta, 9h às 18h
- **SLA:** Resposta em até 24h úteis

### 10.3 Atualizações da API

Esta documentação refere-se à versão 1.0.0 da API. Atualizações serão comunicadas com antecedência mínima de 30 dias.

Para se inscrever em notificações de atualização, envie email para: api-updates@healthapp.com.br

---

## 11. Changelog

### Versão 1.0.0 (Outubro 2025)
- ✨ Lançamento inicial da API
- ✨ Endpoints para medicamentos, consultas, exames e documentos
- ✨ Sistema de consentimento LGPD
- ✨ Autenticação via API Key

---

## Anexo A: Glossário

| Termo | Definição |
|-------|-----------|
| API Key | Chave de autenticação única fornecida a cada parceiro |
| CPF | Cadastro de Pessoa Física, identificador único do paciente |
| ERP | Enterprise Resource Planning, sistema de gestão empresarial |
| LGPD | Lei Geral de Proteção de Dados (Lei nº 13.709/2018) |
| RLS | Row Level Security, segurança em nível de linha |
| UUID | Universally Unique Identifier, identificador único universal |

---

## Anexo B: Formatos de Data e Hora

Todos os endpoints utilizam os seguintes formatos:

- **Data:** `YYYY-MM-DD` (ISO 8601)
  - Exemplo: `2025-10-23`
  
- **Hora:** `HH:MM` (24 horas)
  - Exemplo: `14:30`
  
- **Timestamp:** `YYYY-MM-DDTHH:MM:SSZ` (ISO 8601 com timezone UTC)
  - Exemplo: `2025-10-23T14:30:00Z`

---

**Documento gerado em:** Outubro de 2025  
**Versão da API:** 1.0.0  
**Última atualização:** 23/10/2025
