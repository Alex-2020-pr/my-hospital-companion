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
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
            <TabsTrigger value="medications">Medicamentos</TabsTrigger>
            <TabsTrigger value="appointments">Consultas</TabsTrigger>
            <TabsTrigger value="exams">Exames</TabsTrigger>
            <TabsTrigger value="documents">Documentos</TabsTrigger>
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