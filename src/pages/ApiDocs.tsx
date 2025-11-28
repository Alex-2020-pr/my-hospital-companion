import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Code, Server, Key, Shield, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export const ApiDocs = () => {
  const navigate = useNavigate();
  const baseUrl = "https://jfrpzfzofhijgycpdfcj.supabase.co/functions/v1";

  return (
    <Layout title="Documentação das APIs">
      <div className="p-4 space-y-6">
        {/* Header */}
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary rounded-lg">
                <Server className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <CardTitle>API de Integração Digital Health</CardTitle>
                <CardDescription>
                  Documentação completa para integração com sistemas ERP hospitalares
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Botão para Token Generator */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Key className="h-5 w-5 text-primary" />
                <div>
                  <h3 className="font-medium">Precisa de um Token de Teste?</h3>
                  <p className="text-sm text-muted-foreground">
                    Gere tokens JWT para testar as APIs
                  </p>
                </div>
              </div>
              <Button onClick={() => navigate('/token-generator')}>
                Gerar Token
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Informações Gerais */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Informações Gerais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-2">URL Base:</p>
              <code className="block bg-muted p-3 rounded-lg text-sm break-all">
                {baseUrl}
              </code>
            </div>
            <div>
              <p className="text-sm font-medium mb-2">Autenticação:</p>
              <Badge variant="outline">API Key via Header X-API-Key</Badge>
            </div>
            <div>
              <p className="text-sm font-medium mb-2">Formato:</p>
              <Badge variant="outline">JSON</Badge>
            </div>
            <div>
              <p className="text-sm font-medium mb-2">Protocolo:</p>
              <Badge variant="outline">HTTPS/REST</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Endpoints */}
        <Tabs defaultValue="medications" className="w-full">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
            <TabsTrigger value="medications">Medicamentos</TabsTrigger>
            <TabsTrigger value="appointments">Consultas</TabsTrigger>
            <TabsTrigger value="exams">Exames</TabsTrigger>
            <TabsTrigger value="documents">Documentos</TabsTrigger>
            <TabsTrigger value="doctors">Médicos</TabsTrigger>
            <TabsTrigger value="nursing">Enfermagem</TabsTrigger>
          </TabsList>

          {/* Medicamentos */}
          <TabsContent value="medications">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>POST /erp-sync-medications</CardTitle>
                  <Badge>POST</Badge>
                </div>
                <CardDescription>Sincroniza medicamentos do ERP</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium mb-2">Exemplo de Requisição:</p>
                  <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
{`curl -X POST ${baseUrl}/erp-sync-medications \\
  -H "X-API-Key: sua-api-key-aqui" \\
  -H "Content-Type: application/json" \\
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
  }'`}
                  </pre>
                </div>
                <div>
                  <p className="text-sm font-medium mb-2">Campos Obrigatórios:</p>
                  <ul className="text-sm space-y-1 list-disc list-inside">
                    <li><code>patient_cpf</code> - CPF do paciente</li>
                    <li><code>medications</code> - Array de medicamentos</li>
                    <li><code>name</code> - Nome do medicamento</li>
                    <li><code>dosage</code> - Dosagem</li>
                    <li><code>frequency</code> - Frequência</li>
                    <li><code>start_date</code> - Data início (YYYY-MM-DD)</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Consultas */}
          <TabsContent value="appointments">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>POST /erp-sync-appointments</CardTitle>
                  <Badge>POST</Badge>
                </div>
                <CardDescription>Sincroniza consultas do ERP</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium mb-2">Exemplo de Requisição:</p>
                  <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
{`curl -X POST ${baseUrl}/erp-sync-appointments \\
  -H "X-API-Key: sua-api-key-aqui" \\
  -H "Content-Type: application/json" \\
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
  }'`}
                  </pre>
                </div>
                <div>
                  <p className="text-sm font-medium mb-2">Campos Obrigatórios:</p>
                  <ul className="text-sm space-y-1 list-disc list-inside">
                    <li><code>patient_cpf</code> - CPF do paciente</li>
                    <li><code>appointments</code> - Array de consultas</li>
                    <li><code>doctor_name</code> - Nome do médico</li>
                    <li><code>appointment_date</code> - Data (YYYY-MM-DD)</li>
                    <li><code>appointment_time</code> - Hora (HH:MM)</li>
                    <li><code>type</code> - Tipo (consulta/retorno)</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Exames */}
          <TabsContent value="exams">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>POST /erp-sync-exams</CardTitle>
                  <Badge>POST</Badge>
                </div>
                <CardDescription>Sincroniza exames do ERP</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium mb-2">Exemplo de Requisição:</p>
                  <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
{`curl -X POST ${baseUrl}/erp-sync-exams \\
  -H "X-API-Key: sua-api-key-aqui" \\
  -H "Content-Type: application/json" \\
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
  }'`}
                  </pre>
                </div>
                <div>
                  <p className="text-sm font-medium mb-2">Campos Obrigatórios:</p>
                  <ul className="text-sm space-y-1 list-disc list-inside">
                    <li><code>patient_cpf</code> - CPF do paciente</li>
                    <li><code>exams</code> - Array de exames</li>
                    <li><code>name</code> - Nome do exame</li>
                    <li><code>type</code> - Tipo do exame</li>
                    <li><code>exam_date</code> - Data (YYYY-MM-DD)</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Documentos */}
          <TabsContent value="documents">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>POST /erp-sync-documents</CardTitle>
                  <Badge>POST</Badge>
                </div>
                <CardDescription>Sincroniza documentos do ERP</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium mb-2">Exemplo de Requisição:</p>
                  <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
{`curl -X POST ${baseUrl}/erp-sync-documents \\
  -H "X-API-Key: sua-api-key-aqui" \\
  -H "Content-Type: application/json" \\
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
  }'`}
                  </pre>
                </div>
                <div>
                  <p className="text-sm font-medium mb-2">Campos Obrigatórios:</p>
                  <ul className="text-sm space-y-1 list-disc list-inside">
                    <li><code>patient_cpf</code> - CPF do paciente</li>
                    <li><code>documents</code> - Array de documentos</li>
                    <li><code>title</code> - Título do documento</li>
                    <li><code>type</code> - Tipo (receita/atestado/laudo/relatorio)</li>
                    <li><code>document_date</code> - Data (YYYY-MM-DD)</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
              </TabsContent>

              {/* Tab Médicos - Nova seção de documentação */}
              <TabsContent value="doctors">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Integração de Médicos</CardTitle>
                      <Badge variant="secondary">Sistema Médico</Badge>
                    </div>
                    <CardDescription>
                      APIs para sincronização de dados médicos e prontuários
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    
                    {/* Endpoint: Visualizar Pacientes */}
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge>GET</Badge>
                          <code className="text-sm">/doctor/patients</code>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Lista todos os pacientes da organização do médico
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium mb-2">Headers Necessários:</p>
                        <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
{`Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json`}
                        </pre>
                      </div>

                      <div>
                        <p className="text-sm font-medium mb-2">Resposta de Sucesso (200):</p>
                        <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
{`{
  "patients": [
    {
      "id": "uuid",
      "full_name": "João Silva",
      "registry_number": "12345",
      "bed_number": "101-A",
      "birth_date": "1980-05-15",
      "allergies": ["Penicilina", "Dipirona"],
      "phone": "(45) 99999-9999",
      "email": "joao@email.com"
    }
  ]
}`}
                        </pre>
                      </div>
                    </div>

                    <div className="border-t pt-4"></div>

                    {/* Endpoint: Visualizar Prontuário */}
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge>GET</Badge>
                          <code className="text-sm">/doctor/patient/:patientId</code>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Retorna prontuário completo do paciente incluindo sinais vitais, medicamentos, exames e documentos
                        </p>
                      </div>

                      <div>
                        <p className="text-sm font-medium mb-2">Resposta de Sucesso (200):</p>
                        <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
{`{
  "patient": {
    "id": "uuid",
    "full_name": "João Silva",
    "registry_number": "12345",
    "birth_date": "1980-05-15",
    "allergies": ["Penicilina"]
  },
  "vital_signs": [
    {
      "measurement_date": "2025-01-15T10:30:00Z",
      "blood_pressure_systolic": 120,
      "blood_pressure_diastolic": 80,
      "heart_rate": 72,
      "temperature": 36.5,
      "oxygen_saturation": 98,
      "notes": "Paciente estável"
    }
  ],
  "medications": [
    {
      "name": "Losartana 50mg",
      "dosage": "1 comprimido",
      "frequency": "1x ao dia",
      "is_active": true
    }
  ],
  "exams": [
    {
      "name": "Hemograma Completo",
      "exam_date": "2025-01-10",
      "status": "completed",
      "result_summary": "Valores dentro da normalidade"
    }
  ],
  "documents": [
    {
      "title": "Laudo Cardiológico",
      "type": "Laudo",
      "document_date": "2025-01-05",
      "file_url": "https://..."
    }
  ]
}`}
                        </pre>
                      </div>
                    </div>

                    <div className="border-t pt-4"></div>

                    {/* Endpoint: Registrar Sinais Vitais */}
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge>POST</Badge>
                          <code className="text-sm">/doctor/vital-signs</code>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Registra novos sinais vitais para um paciente
                        </p>
                      </div>

                      <div>
                        <p className="text-sm font-medium mb-2">Corpo da Requisição:</p>
                        <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
{`{
  "patient_id": "uuid-do-paciente",
  "blood_pressure_systolic": 130,
  "blood_pressure_diastolic": 85,
  "heart_rate": 78,
  "temperature": 36.8,
  "respiratory_rate": 16,
  "oxygen_saturation": 97,
  "notes": "Observações adicionais"
}`}
                        </pre>
                      </div>

                      <div>
                        <p className="text-sm font-medium mb-2">Resposta de Sucesso (201):</p>
                        <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
{`{
  "success": true,
  "message": "Sinais vitais registrados com sucesso",
  "vital_sign_id": "uuid"
}`}
                        </pre>
                      </div>
                    </div>

                    <div className="border-t pt-4"></div>

                    {/* Endpoint: Registrar Diagnóstico */}
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge>POST</Badge>
                          <code className="text-sm">/doctor/diagnosis</code>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Registra um novo diagnóstico para o paciente
                        </p>
                      </div>

                      <div>
                        <p className="text-sm font-medium mb-2">Corpo da Requisição:</p>
                        <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
{`{
  "patient_id": "uuid-do-paciente",
  "diagnosis": "Hipertensão Arterial Sistêmica",
  "diagnosis_date": "2025-01-15",
  "notes": "Paciente apresenta pressão elevada. Prescrever anti-hipertensivo."
}`}
                        </pre>
                      </div>

                      <div>
                        <p className="text-sm font-medium mb-2">Resposta de Sucesso (201):</p>
                        <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
{`{
  "success": true,
  "message": "Diagnóstico registrado com sucesso",
  "diagnosis_id": "uuid"
}`}
                        </pre>
                      </div>
                    </div>

                    <div className="border-t pt-4"></div>

                    {/* Endpoint: Registrar Prescrição */}
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge>POST</Badge>
                          <code className="text-sm">/doctor/prescription</code>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Cria uma nova prescrição médica para o paciente
                        </p>
                      </div>

                      <div>
                        <p className="text-sm font-medium mb-2">Corpo da Requisição:</p>
                        <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
{`{
  "patient_id": "uuid-do-paciente",
  "medication_name": "Losartana Potássica",
  "dosage": "50mg",
  "frequency": "1x ao dia pela manhã",
  "start_date": "2025-01-15",
  "end_date": "2025-04-15",
  "instructions": "Tomar em jejum com água"
}`}
                        </pre>
                      </div>

                      <div>
                        <p className="text-sm font-medium mb-2">Resposta de Sucesso (201):</p>
                        <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
{`{
  "success": true,
  "message": "Prescrição criada com sucesso",
  "prescription_id": "uuid"
}`}
                        </pre>
                      </div>
                    </div>

                    {/* Observações Importantes */}
                    <Card className="bg-primary/5 border-primary/20">
                      <CardHeader>
                        <CardTitle className="text-base">🔒 Autenticação e Permissões</CardTitle>
                      </CardHeader>
                      <CardContent className="text-sm space-y-2">
                        <p>
                          <strong>Autenticação:</strong> Todas as rotas requerem JWT token válido no header Authorization
                        </p>
                        <p>
                          <strong>Permissões:</strong> Médicos só podem acessar dados de pacientes da mesma organização
                        </p>
                        <p>
                          <strong>RLS:</strong> Row-Level Security garante isolamento de dados entre organizações
                        </p>
                        <p>
                          <strong>Logs:</strong> Todas as operações são registradas para auditoria LGPD
                        </p>
                      </CardContent>
                    </Card>

                  </CardContent>
                </Card>
          </TabsContent>

          {/* Tab Enfermagem - Nova seção */}
          <TabsContent value="nursing">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Módulo de Enfermagem</CardTitle>
                  <Badge variant="secondary">Sistema de Enfermagem</Badge>
                </div>
                <CardDescription>
                  APIs para sincronização de dados de enfermagem e registros clínicos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                
                {/* Endpoint: Sincronizar Pacientes */}
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge>POST</Badge>
                      <code className="text-sm">/api/patients</code>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Cria ou atualiza paciente (sincronização do ERP)
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-2">Exemplo de Requisição:</p>
                    <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
{`curl -X POST ${baseUrl}/api/patients \\
  -H "Authorization: Bearer org_token_aqui" \\
  -H "Content-Type: application/json" \\
  -d '{
    "erp_patient_id": "ERP123456",
    "full_name": "João da Silva",
    "cpf": "12345678900",
    "birth_date": "1980-05-15",
    "gender": "M",
    "bed_number": "203",
    "registry_number": "12345",
    "allergies": ["Penicilina"],
    "phone": "(11) 98765-4321",
    "email": "joao@email.com"
  }'`}
                    </pre>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-2">Resposta de Sucesso (200):</p>
                    <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
{`{
  "success": true,
  "message": "Paciente sincronizado com sucesso",
  "patient_id": "uuid"
}`}
                    </pre>
                  </div>
                </div>

                <div className="border-t pt-6"></div>

                {/* Endpoint: Registrar Sinais Vitais */}
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge>POST</Badge>
                      <code className="text-sm">/api/vital-signs</code>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Registra sinais vitais do paciente
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-2">Exemplo de Requisição:</p>
                    <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
{`curl -X POST ${baseUrl}/api/vital-signs \\
  -H "Authorization: Bearer org_token_aqui" \\
  -H "Content-Type: application/json" \\
  -d '{
    "patient_erp_id": "ERP123456",
    "nurse_erp_id": "NURSE001",
    "temperature": 36.5,
    "blood_pressure_systolic": 120,
    "blood_pressure_diastolic": 80,
    "heart_rate": 75,
    "respiratory_rate": 16,
    "oxygen_saturation": 98,
    "pain_scale": 2,
    "notes": "Paciente em bom estado geral",
    "sector": "UTI"
  }'`}
                    </pre>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-2">Campos Obrigatórios:</p>
                    <ul className="text-sm space-y-1 list-disc list-inside">
                      <li><code>patient_erp_id</code> - ID do paciente no ERP</li>
                      <li><code>nurse_erp_id</code> - ID do enfermeiro no ERP</li>
                      <li>Pelo menos um sinal vital deve ser informado</li>
                    </ul>
                  </div>
                </div>

                <div className="border-t pt-6"></div>

                {/* Endpoint: Registrar Procedimentos */}
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge>POST</Badge>
                      <code className="text-sm">/api/procedures</code>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Registra procedimento de enfermagem
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-2">Exemplo de Requisição:</p>
                    <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
{`curl -X POST ${baseUrl}/api/procedures \\
  -H "Authorization: Bearer org_token_aqui" \\
  -H "Content-Type: application/json" \\
  -d '{
    "patient_erp_id": "ERP123456",
    "nurse_erp_id": "NURSE001",
    "procedure_type": "curativo",
    "description": "Curativo em ferida operatória",
    "location": "Abdômen",
    "observations": "Ferida limpa, sem sinais de infecção",
    "sector": "Clínica Cirúrgica"
  }'`}
                    </pre>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-2">Tipos de Procedimentos:</p>
                    <ul className="text-sm space-y-1 list-disc list-inside">
                      <li><code>medication</code> - Administração de medicação</li>
                      <li><code>curativo</code> - Curativos</li>
                      <li><code>higiene</code> - Higiene e conforto</li>
                      <li><code>sonda</code> - Sondagem</li>
                      <li><code>aspiracao</code> - Aspiração</li>
                      <li><code>coleta</code> - Coleta de exames</li>
                      <li><code>outros</code> - Outros procedimentos</li>
                    </ul>
                  </div>
                </div>

                <div className="border-t pt-6"></div>

                {/* Endpoint: Registrar Incidentes */}
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge>POST</Badge>
                      <code className="text-sm">/api/incidents</code>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Registra incidente/intercorrência
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-2">Exemplo de Requisição:</p>
                    <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
{`curl -X POST ${baseUrl}/api/incidents \\
  -H "Authorization: Bearer org_token_aqui" \\
  -H "Content-Type: application/json" \\
  -d '{
    "patient_erp_id": "ERP123456",
    "nurse_erp_id": "NURSE001",
    "incident_type": "medication_error",
    "severity": "medium",
    "description": "Medicação administrada com 30 minutos de atraso",
    "actions_taken": "Comunicado ao médico, paciente monitorado",
    "sector": "Enfermaria A"
  }'`}
                    </pre>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-2">Níveis de Severidade:</p>
                    <ul className="text-sm space-y-1 list-disc list-inside">
                      <li><code>low</code> - Baixo (sem dano ao paciente)</li>
                      <li><code>medium</code> - Médio (dano mínimo, sem sequelas)</li>
                      <li><code>high</code> - Alto (dano moderado, possíveis sequelas)</li>
                      <li><code>critical</code> - Crítico (dano grave ou morte)</li>
                    </ul>
                  </div>
                </div>

                <div className="border-t pt-6"></div>

                {/* Endpoint: Registrar Evoluções */}
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge>POST</Badge>
                      <code className="text-sm">/api/nursing-reports</code>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Registra evolução de enfermagem (método SOAP)
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-2">Exemplo de Requisição:</p>
                    <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
{`curl -X POST ${baseUrl}/api/nursing-reports \\
  -H "Authorization: Bearer org_token_aqui" \\
  -H "Content-Type: application/json" \\
  -d '{
    "patient_erp_id": "ERP123456",
    "nurse_erp_id": "NURSE001",
    "evolution_type": "daily",
    "subjective_data": "Paciente relata dor leve no local da incisão",
    "objective_data": "PA 120/80, FC 75, Tax 36.5°C, ferida limpa e seca",
    "assessment": "Paciente em recuperação pós-operatória estável",
    "plan": "Manter curativos, controlar sinais vitais 6/6h",
    "sector": "Clínica Cirúrgica"
  }'`}
                    </pre>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-2">Tipos de Evolução:</p>
                    <ul className="text-sm space-y-1 list-disc list-inside">
                      <li><code>admission</code> - Admissão</li>
                      <li><code>daily</code> - Evolução diária</li>
                      <li><code>discharge</code> - Alta</li>
                      <li><code>intercurrence</code> - Intercorrência</li>
                      <li><code>transfer</code> - Transferência</li>
                    </ul>
                  </div>
                </div>

                <div className="border-t pt-6"></div>

                {/* Sincronização */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold mb-3">Fluxo de Sincronização</h3>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg space-y-2">
                    <p className="text-sm font-medium text-blue-900">1. ERP → App (Pacientes)</p>
                    <p className="text-xs text-blue-700">
                      O ERP envia os dados dos pacientes para o app via POST /api/patients
                    </p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg space-y-2">
                    <p className="text-sm font-medium text-green-900">2. App → Registros Clínicos</p>
                    <p className="text-xs text-green-700">
                      Enfermeiros registram sinais vitais, procedimentos, evoluções e incidentes no app
                    </p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg space-y-2">
                    <p className="text-sm font-medium text-purple-900">3. App → ERP (Sincronização)</p>
                    <p className="text-xs text-purple-700">
                      Dados clínicos são sincronizados de volta para o ERP periodicamente (a cada 5-10 min)
                    </p>
                  </div>
                </div>

                <div className="border-t pt-6"></div>

                {/* Link para documentação completa */}
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm font-medium mb-2">📄 Documentação Completa</p>
                  <p className="text-xs text-muted-foreground mb-3">
                    Para informações detalhadas sobre modelos JSON, webhooks e exemplos de integração, consulte:
                  </p>
                  <code className="text-xs bg-background px-2 py-1 rounded">
                    NURSING_API_DOCUMENTATION.md
                  </code>
                </div>

              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Códigos de Resposta */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Códigos de Resposta
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-green-50 text-green-700">200</Badge>
                <span className="text-sm">Sucesso</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-red-50 text-red-700">400</Badge>
                <span className="text-sm">Requisição inválida</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-red-50 text-red-700">401</Badge>
                <span className="text-sm">API Key inválida</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-red-50 text-red-700">403</Badge>
                <span className="text-sm">Sem consentimento do paciente</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-red-50 text-red-700">404</Badge>
                <span className="text-sm">Paciente não encontrado</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-red-50 text-red-700">500</Badge>
                <span className="text-sm">Erro interno do servidor</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* LGPD */}
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Shield className="h-5 w-5" />
              Conformidade LGPD
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-sm space-y-2 list-disc list-inside">
              <li>Todas as requisições verificam consentimento do paciente</li>
              <li>Dados são criptografados em trânsito (HTTPS)</li>
              <li>Logs de auditoria são mantidos para todas as operações</li>
              <li>Pacientes podem revogar consentimento a qualquer momento</li>
              <li>Dados são retidos conforme política de privacidade</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};